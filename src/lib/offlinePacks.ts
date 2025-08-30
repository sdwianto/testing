/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises */
import { get, set, del, keys } from 'idb-keyval';
import { useState, useEffect, useCallback } from 'react';

// ========================================
// OFFLINE PACKS (P1 - Offline Backbone)
// Per Implementation Guide: Package domain datasets for offline operations
// ========================================

export interface OfflinePack {
  id: string;
  name: string;
  type: 'job_cards' | 'inspections' | 'rental_handover' | 'maintenance' | 'inventory';
  version: string;
  createdAt: string;
  expiresAt: string;
  size: number;
  checksum: string;
  metadata: {
    tenantId: string;
    userId: string;
    siteId?: string;
    equipmentIds?: string[];
    itemIds?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  };
  data: {
    masterData: any;
    transactions: any[];
    lookups: any;
  };
}

export interface PackManifest {
  packs: OfflinePack[];
  lastUpdated: string;
  version: string;
}

export class OfflinePacksService {
  private static readonly PACK_STORAGE_KEY = 'offline-packs';
  private static readonly MANIFEST_KEY = 'offline-manifest';
  private static readonly PACK_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Create offline pack for specific domain
  static async createPack(
    type: OfflinePack['type'],
    metadata: OfflinePack['metadata'],
    data: OfflinePack['data']
  ): Promise<OfflinePack> {
    const pack: OfflinePack = {
      id: `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${type}_${new Date().toISOString().split('T')[0]}`,
      type,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.PACK_TTL).toISOString(),
      size: JSON.stringify(data).length,
      checksum: await this.calculateChecksum(data),
      metadata,
      data,
    };

    // Store pack in IndexedDB
    await set(`${this.PACK_STORAGE_KEY}:${pack.id}`, pack);

    // Update manifest
    await this.updateManifest(pack);

    console.log(`📦 Created offline pack: ${pack.name} (${pack.size} bytes)`);
    return pack;
  }

  // Get pack by ID
  static async getPack(packId: string): Promise<OfflinePack | null> {
    try {
      const pack = await get(`${this.PACK_STORAGE_KEY}:${packId}`);
      return pack ?? null;
    } catch (error) {
      console.error('Failed to get offline pack:', error);
      return null;
    }
  }

  // Get all packs
  static async getAllPacks(): Promise<OfflinePack[]> {
    try {
      const manifest = await this.getManifest();
      return manifest.packs || [];
    } catch (error) {
      console.error('Failed to get offline packs:', error);
      return [];
    }
  }

  // Get packs by type
  static async getPacksByType(type: OfflinePack['type']): Promise<OfflinePack[]> {
    const packs = await this.getAllPacks();
    return packs.filter(pack => pack.type === type);
  }

  // Get valid (non-expired) packs
  static async getValidPacks(): Promise<OfflinePack[]> {
    const packs = await this.getAllPacks();
    const now = new Date();
    return packs.filter(pack => new Date(pack.expiresAt) > now);
  }

  // Delete pack
  static async deletePack(packId: string): Promise<void> {
    try {
      await del(`${this.PACK_STORAGE_KEY}:${packId}`);
      await this.removeFromManifest(packId);
      console.log(`🗑️ Deleted offline pack: ${packId}`);
    } catch (error) {
      console.error('Failed to delete offline pack:', error);
    }
  }

  // Clean expired packs
  static async cleanExpiredPacks(): Promise<number> {
    const packs = await this.getAllPacks();
    const now = new Date();
    const expiredPacks = packs.filter(pack => new Date(pack.expiresAt) <= now);

    for (const pack of expiredPacks) {
      await this.deletePack(pack.id);
    }

    console.log(`🧹 Cleaned ${expiredPacks.length} expired offline packs`);
    return expiredPacks.length;
  }

  // Create job cards pack
  static async createJobCardsPack(
    tenantId: string,
    userId: string,
    siteId?: string,
    equipmentIds?: string[]
  ): Promise<OfflinePack> {
    // Fetch job card data from API
    const response = await fetch('/api/offline-packs/job-cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, siteId, equipmentIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job cards data');
    }

    const data = await response.json();

    return this.createPack('job_cards', {
      tenantId,
      userId,
      siteId,
      equipmentIds,
    }, data);
  }

  // Create maintenance pack
  static async createMaintenancePack(
    tenantId: string,
    userId: string,
    equipmentIds?: string[]
  ): Promise<OfflinePack> {
    const response = await fetch('/api/offline-packs/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, equipmentIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch maintenance data');
    }

    const data = await response.json();

    return this.createPack('maintenance', {
      tenantId,
      userId,
      equipmentIds,
    }, data);
  }

  // Create inventory pack
  static async createInventoryPack(
    tenantId: string,
    userId: string,
    siteId?: string,
    itemIds?: string[]
  ): Promise<OfflinePack> {
    const response = await fetch('/api/offline-packs/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, siteId, itemIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inventory data');
    }

    const data = await response.json();

    return this.createPack('inventory', {
      tenantId,
      userId,
      siteId,
      itemIds,
    }, data);
  }

  // Validate pack integrity
  static async validatePack(packId: string): Promise<boolean> {
    const pack = await this.getPack(packId);
    if (!pack) return false;

    const currentChecksum = await this.calculateChecksum(pack.data);
    return currentChecksum === pack.checksum;
  }

  // Get pack statistics
  static async getPackStats(): Promise<{
    totalPacks: number;
    totalSize: number;
    packsByType: Record<string, number>;
    expiredPacks: number;
  }> {
    const packs = await this.getAllPacks();
    const now = new Date();

    const stats = {
      totalPacks: packs.length,
      totalSize: packs.reduce((sum, pack) => sum + pack.size, 0),
      packsByType: {} as Record<string, number>,
      expiredPacks: packs.filter(pack => new Date(pack.expiresAt) <= now).length,
    };

    // Count by type
    packs.forEach(pack => {
      stats.packsByType[pack.type] = (stats.packsByType[pack.type] ?? 0) + 1;
    });

    return stats;
  }

  // Private methods
  private static async calculateChecksum(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async getManifest(): Promise<PackManifest> {
    try {
      const manifest = await get(this.MANIFEST_KEY);
      return manifest ?? { packs: [], lastUpdated: new Date().toISOString(), version: '1.0.0' };
    } catch (error) {
      console.error('Failed to get manifest:', error);
      return { packs: [], lastUpdated: new Date().toISOString(), version: '1.0.0' };
    }
  }

  private static async updateManifest(pack: OfflinePack): Promise<void> {
    try {
      const manifest = await this.getManifest();
      const existingIndex = manifest.packs.findIndex(p => p.id === pack.id);
      
      if (existingIndex >= 0) {
        manifest.packs[existingIndex] = pack;
      } else {
        manifest.packs.push(pack);
      }
      
      manifest.lastUpdated = new Date().toISOString();
      await set(this.MANIFEST_KEY, manifest);
    } catch (error) {
      console.error('Failed to update manifest:', error);
    }
  }

  private static async removeFromManifest(packId: string): Promise<void> {
    try {
      const manifest = await this.getManifest();
      manifest.packs = manifest.packs.filter(p => p.id !== packId);
      manifest.lastUpdated = new Date().toISOString();
      await set(this.MANIFEST_KEY, manifest);
    } catch (error) {
      console.error('Failed to remove from manifest:', error);
    }
  }
}

// React hook for offline packs
export function useOfflinePacks() {
  const [packs, setPacks] = useState<OfflinePack[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPacks = useCallback(async () => {
    try {
      const [packsData, statsData] = await Promise.all([
        OfflinePacksService.getAllPacks(),
        OfflinePacksService.getPackStats(),
      ]);
      
      setPacks(packsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load offline packs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const createPack = useCallback(async (
    type: OfflinePack['type'],
    metadata: OfflinePack['metadata'],
    data: OfflinePack['data']
  ) => {
    const pack = await OfflinePacksService.createPack(type, metadata, data);
    await loadPacks();
    return pack;
  }, [loadPacks]);

  const deletePack = useCallback(async (packId: string) => {
    await OfflinePacksService.deletePack(packId);
    await loadPacks();
  }, [loadPacks]);

  const cleanExpiredPacks = useCallback(async () => {
    const cleaned = await OfflinePacksService.cleanExpiredPacks();
    await loadPacks();
    return cleaned;
  }, [loadPacks]);

  return {
    packs,
    stats,
    isLoading,
    createPack,
    deletePack,
    cleanExpiredPacks,
    refresh: loadPacks,
  };
}
