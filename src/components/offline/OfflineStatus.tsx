'use client';

import { useState, useEffect } from 'react';
import { useSSE } from '@/lib/sse';
import { useOfflineQueue } from '@/lib/offline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

// ========================================
// ENHANCED OFFLINE STATUS COMPONENT (P1 - Offline Backbone)
// Per Implementation Guide: Show queue status, sync metrics, and conflicts
// ========================================

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { isConnected, reconnect } = useSSE();
    const {
    queue,
    conflicts,
    syncStatus,
    clearQueue,
    syncNow
  } = useOfflineQueue();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800';
    if (!isConnected) return 'bg-yellow-100 text-yellow-800';
    if (conflicts.length > 0) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Disconnected';
    if (conflicts.length > 0) return 'Conflicts';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (!isConnected) return <AlertTriangle className="h-4 w-4" />;
    if (conflicts.length > 0) return <XCircle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getSyncProgress = () => {
    if (queue.length === 0) return 100;
    const completed = queue.filter(m => m.status === 'completed').length;
    return (completed / queue.length) * 100;
  };

  const handleSyncNow = async () => {
    try {
      await syncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };



  // Don't show if everything is clean
  if (isOnline && isConnected && queue.length === 0 && conflicts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getStatusIcon()}
            Connection Status: {getStatusText()}
          </CardTitle>
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>Network: {isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>SSE: {isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          
          {!isConnected && (
            <Button variant="outline" size="sm" onClick={reconnect}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reconnect
            </Button>
          )}
        </div>

        {/* Queue Status */}
        {queue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Changes: {queue.length}
              </span>
              <span className="text-gray-500">
                {syncStatus.isSyncing ? 'Syncing...' : 'Waiting'}
              </span>
            </div>
            
            <Progress value={getSyncProgress()} className="h-2" />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncNow}
                disabled={syncStatus.isSyncing || !isOnline}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncNow}
                disabled={syncStatus.isSyncing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry All
              </Button>
            </div>
          </div>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} require{conflicts.length === 1 ? 's' : ''} your attention.
              <Button variant="link" className="p-0 h-auto ml-2">
                Review Conflicts
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Errors */}
        {syncStatus.syncErrors.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Sync Errors:</div>
                {syncStatus.syncErrors.map((error, index) => (
                  <div key={index} className="text-sm">{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Last Sync */}
        {syncStatus.lastSyncAt && (
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Last sync: {format(new Date(syncStatus.lastSyncAt), 'MMM dd, HH:mm:ss')}
          </div>
        )}

        {/* Queue Details */}
        {queue.length > 0 && (
          <div className="text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                Pending: {queue.filter(m => m.status === 'pending').length}
              </div>
              <div>
                Syncing: {queue.filter(m => m.status === 'syncing').length}
              </div>
              <div>
                Failed: {queue.filter(m => m.status === 'failed').length}
              </div>
              <div>
                Conflicts: {queue.filter(m => m.status === 'conflict').length}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}