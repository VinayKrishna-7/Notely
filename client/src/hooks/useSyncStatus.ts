import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOnlineStatus } from './useOnlineStatus';
import { useOfflineQueue } from './useOfflineQueue';
import { offlineQueue } from '../utils/offlineQueue';
import { toast } from 'sonner';

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export function useSyncStatus() {
  const isOnline = useOnlineStatus();
  const { queue, pendingCount } = useOfflineQueue();
  const [syncState, setSyncState] = useState<SyncState>(isOnline ? 'idle' : 'offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const sync = useCallback(async () => {
    if (!isOnline || queue.length === 0) return;

    setSyncState('syncing');
    try {
      const { processed, failed } = await offlineQueue.processQueue();
      if (processed > 0) {
        toast.success(`Synced ${processed} offline change${processed > 1 ? 's' : ''}`);
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        setLastSyncedAt(new Date());
      }
      if (failed > 0) {
        setSyncState('error');
      } else {
        setSyncState('idle');
      }
    } catch {
      setSyncState('error');
    }
  }, [isOnline, queue.length, queryClient]);

  // Sync automatically when online status recovers or new items in queue while online
  useEffect(() => {
    if (!isOnline) {
      setSyncState('offline');
    } else if (pendingCount > 0) {
      sync();
    } else {
      setSyncState('idle');
    }
  }, [isOnline, pendingCount, sync]);

  return {
    isOnline,
    syncState,
    pendingCount,
    lastSyncedAt,
    sync,
  };
}
