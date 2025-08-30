/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, @typescript-eslint/consistent-generic-constructors */
import { get, set, del, keys, clear } from 'idb-keyval';
import { useState, useEffect, useCallback } from 'react';

// ========================================
// ENHANCED OFFLINE QUEUE & CONFLICT RESOLUTION (P1 - Offline Backbone)
// Per Implementation Guide: Capture-and-Forward with idempotency keys
// ========================================

export interface OfflineMutation {
  id: string;
  kind: string; // 'ops.logUsage'|'mnt.closeWO'|'inv.createPR'|string
  payload: any;
  idempotencyKey: string; // UUID v4
  baseVersion?: number; // client's last-known record version
  createdAt: string; // ISO-8601
  retries: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
}

export interface ConflictData {
  id: string;
  type: string;
  entity: string;
  entityId: string;
  localData: any;
  serverData: any;
  conflictType: 'version_mismatch' | 'field_conflict' | 'deletion_conflict';
  createdAt: string;
  lastAttempt: string;
  retryCount: number;
  description: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  conflictsCount: number;
  lastSyncAt: string | null;
  syncErrors: string[];
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: OfflineMutation[] = [];
  private conflicts: ConflictData[] = [];
  private listeners: Set<() => void> = new Set();
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    queueLength: 0,
    conflictsCount: 0,
    lastSyncAt: null,
    syncErrors: [],
  };

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private constructor() {
    this.loadFromStorage();
    this.setupNetworkListeners();
    this.startBackgroundSync();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  private async loadFromStorage() {
    try {
      const storedQueue = await get('offline-mutations');
      const storedConflicts = await get('offline-conflicts');
      const storedStatus = await get('offline-sync-status');
      
      if (storedQueue) {
        this.queue = storedQueue;
      }
      
      if (storedConflicts) {
        this.conflicts = storedConflicts;
      }
      
      if (storedStatus) {
        this.syncStatus = { ...this.syncStatus, ...storedStatus };
      }
      
      this.updateSyncStatus();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
    }
  }

  private async saveToStorage() {
    try {
      await set('offline-mutations', this.queue);
      await set('offline-conflicts', this.conflicts);
      await set('offline-sync-status', this.syncStatus);
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }

  private updateSyncStatus() {
    this.syncStatus.queueLength = this.queue.length;
    this.syncStatus.conflictsCount = this.conflicts.length;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Enhanced mutation management per Implementation Guide
  async addMutation(mutation: Omit<OfflineMutation, 'id' | 'createdAt' | 'retries' | 'status'>) {
    const newMutation: OfflineMutation = {
      ...mutation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    };

    this.queue.push(newMutation);
    this.updateSyncStatus();
    await this.saveToStorage();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.syncStatus.isOnline) {
      this.flushQueue();
    }
  }

  async removeMutation(id: string) {
    this.queue = this.queue.filter(m => m.id !== id);
    this.updateSyncStatus();
    await this.saveToStorage();
    this.notifyListeners();
  }

  async clearQueue() {
    this.queue = [];
    this.updateSyncStatus();
    await this.saveToStorage();
    this.notifyListeners();
  }

  // Enhanced conflict management
  async addConflict(conflict: Omit<ConflictData, 'id' | 'createdAt' | 'lastAttempt' | 'retryCount'>) {
    const newConflict: ConflictData = {
      ...conflict,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
      retryCount: 0,
    };

    this.conflicts.push(newConflict);
    this.updateSyncStatus();
    await this.saveToStorage();
    this.notifyListeners();
  }

  async resolveConflict(id: string, action: 'accept_server' | 'override_server' | 'merge_fields' | 'create_adjustment', data?: any) {
    const conflict = this.conflicts.find(c => c.id === id);
    if (!conflict) return null;

    try {
      // Handle different resolution actions
      switch (action) {
        case 'accept_server':
          // Use server data, remove from conflicts
          this.conflicts = this.conflicts.filter(c => c.id !== id);
          break;
          
        case 'override_server':
          // Retry with local data
          await this.addMutation({
            kind: conflict.type,
            payload: conflict.localData,
            idempotencyKey: crypto.randomUUID(),
            baseVersion: conflict.serverData.version,
            maxRetries: 3,
          });
          this.conflicts = this.conflicts.filter(c => c.id !== id);
          break;
          
        case 'merge_fields':
          // Merge data and retry
          const mergedData = { ...conflict.serverData, ...conflict.localData };
          await this.addMutation({
            kind: conflict.type,
            payload: mergedData,
            idempotencyKey: crypto.randomUUID(),
            baseVersion: conflict.serverData.version,
            maxRetries: 3,
          });
          this.conflicts = this.conflicts.filter(c => c.id !== id);
          break;
          
        case 'create_adjustment':
          // Create adjustment record (for sensitive data like inventory/finance)
          await this.addMutation({
            kind: `${conflict.type}.adjustment`,
            payload: {
              originalData: conflict.localData,
              serverData: conflict.serverData,
              reason: 'Conflict resolution adjustment',
              ...data,
            },
            idempotencyKey: crypto.randomUUID(),
            maxRetries: 3,
          });
          this.conflicts = this.conflicts.filter(c => c.id !== id);
          break;
      }

      this.updateSyncStatus();
      await this.saveToStorage();
      this.notifyListeners();
      
      return { conflict, action, data };
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  // Enhanced sync with exponential backoff and jitter
  private async flushQueue() {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing || this.queue.length === 0) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.syncErrors = [];
    this.notifyListeners();

    try {
      const pendingMutations = this.queue.filter(m => m.status === 'pending');
      const batchSize = Math.min(100, pendingMutations.length); // Batch size per Implementation Guide
      const batch = pendingMutations.slice(0, batchSize);

      // Mark mutations as syncing
      batch.forEach(mutation => {
        mutation.status = 'syncing';
      });
      await this.saveToStorage();

      // Send batch to server
      const response = await fetch('/api/sync/mutate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mutations: batch }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();

      // Process results
      for (let i = 0; i < batch.length; i++) {
        const mutation = batch[i];
        const result = results.results[i];

        if (!mutation || !result) continue;

        if (result.status === 'applied') {
          // Success - remove from queue
          await this.removeMutation(mutation.id);
        } else if (result.status === 'conflict') {
          // Conflict - add to conflicts
          mutation.status = 'conflict';
          await this.addConflict({
            type: mutation.kind,
            entity: result.entity ?? 'Unknown',
            entityId: result.entityId ?? mutation.id,
            localData: mutation.payload,
            serverData: result.serverData,
            conflictType: 'version_mismatch',
            description: result.message ?? 'Version mismatch detected',
          });
        } else if (result.status === 'error') {
          // Error - increment retry count
          mutation.retries++;
          mutation.status = 'failed';
          
          if (mutation.retries >= mutation.maxRetries) {
            // Max retries reached - remove from queue
            await this.removeMutation(mutation.id);
            this.syncStatus.syncErrors.push(`Max retries reached for ${mutation.kind}`);
          }
        }
      }

      this.syncStatus.lastSyncAt = new Date().toISOString();
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : 'Unknown error');
      
      // Mark failed mutations for retry
      this.queue.forEach(mutation => {
        if (mutation.status === 'syncing') {
          mutation.status = 'failed';
          mutation.retries++;
        }
      });
    } finally {
      this.syncStatus.isSyncing = false;
      this.updateSyncStatus();
      await this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Background sync with exponential backoff
  private startBackgroundSync() {
    let retryDelay = 1000; // Start with 1 second
    
    const syncLoop = async () => {
      if (this.syncStatus.isOnline && this.queue.length > 0) {
        await this.flushQueue();
        retryDelay = 1000; // Reset delay on success
      } else if (this.queue.length > 0) {
        // Exponential backoff with jitter
        retryDelay = Math.min(retryDelay * 2, 30000); // Max 30 seconds
        const jitter = Math.random() * 1000; // Add up to 1 second jitter
        retryDelay += jitter;
      }
      
      setTimeout(() => void syncLoop(), retryDelay);
    };

    syncLoop();
  }

  // Getters
  getQueue(): OfflineMutation[] {
    return [...this.queue];
  }

  getConflicts(): ConflictData[] {
    return [...this.conflicts];
  }

  getUnresolvedConflicts(): ConflictData[] {
    return this.conflicts;
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getConflictsLength(): number {
    return this.conflicts.length;
  }

  // Manual sync trigger
  async syncNow() {
    await this.flushQueue();
  }
}

// Enhanced React hook for using offline queue
export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineMutation[]>([]);
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    queueLength: 0,
    conflictsCount: 0,
    lastSyncAt: null,
    syncErrors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const offlineQueue = OfflineQueue.getInstance();
    
    const updateState = () => {
      setQueue(offlineQueue.getQueue());
      setConflicts(offlineQueue.getConflicts());
      setSyncStatus(offlineQueue.getSyncStatus());
      setIsLoading(false);
    };

    updateState();
    const unsubscribe = offlineQueue.subscribe(updateState);

    return () => {
      unsubscribe();
    };
  }, []);

  const addMutation = useCallback(async (mutation: Omit<OfflineMutation, 'id' | 'createdAt' | 'retries' | 'status'>) => {
    const offlineQueue = OfflineQueue.getInstance();
    await offlineQueue.addMutation(mutation);
  }, []);

  const removeMutation = useCallback(async (id: string) => {
    const offlineQueue = OfflineQueue.getInstance();
    await offlineQueue.removeMutation(id);
  }, []);

  const clearQueue = useCallback(async () => {
    const offlineQueue = OfflineQueue.getInstance();
    await offlineQueue.clearQueue();
  }, []);

  const addConflict = useCallback(async (conflict: Omit<ConflictData, 'id' | 'createdAt' | 'lastAttempt' | 'retryCount'>) => {
    const offlineQueue = OfflineQueue.getInstance();
    await offlineQueue.addConflict(conflict);
  }, []);

  const resolveConflict = useCallback(async (id: string, action: 'accept_server' | 'override_server' | 'merge_fields' | 'create_adjustment', data?: any) => {
    const offlineQueue = OfflineQueue.getInstance();
    return await offlineQueue.resolveConflict(id, action, data);
  }, []);

  const syncNow = useCallback(async () => {
    const offlineQueue = OfflineQueue.getInstance();
    await offlineQueue.syncNow();
  }, []);

  return {
    queue,
    conflicts,
    syncStatus,
    isLoading,
    addMutation,
    removeMutation,
    clearQueue,
    addConflict,
    resolveConflict,
    syncNow,
  };
}

// Conflict resolution utilities
export function resolveConflict(
  localData: any,
  serverData: any,
  action: 'accept_server' | 'override_server' | 'merge_fields' | 'create_adjustment'
): any {
  switch (action) {
    case 'accept_server':
      return serverData;
    case 'override_server':
      return localData;
    case 'merge_fields':
      return { ...serverData, ...localData };
    case 'create_adjustment':
      return {
        originalData: localData,
        serverData: serverData,
        resolvedAt: new Date().toISOString(),
        action: 'adjustment_created',
      };
    default:
      return serverData;
  }
}