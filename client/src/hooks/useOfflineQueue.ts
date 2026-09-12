import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, QueuedAction, ActionType } from '../utils/offlineQueue';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>(() => offlineQueue.getQueue());

  const refreshQueue = useCallback(() => {
    setQueue(offlineQueue.getQueue());
  }, []);

  useEffect(() => {
    window.addEventListener('notely_offline_queue_change', refreshQueue);
    return () => {
      window.removeEventListener('notely_offline_queue_change', refreshQueue);
    };
  }, [refreshQueue]);

  const addAction = useCallback((type: ActionType, payload: any, entityId?: string) => {
    return offlineQueue.addAction(type, payload, entityId);
  }, []);

  const removeAction = useCallback((id: string) => {
    offlineQueue.removeAction(id);
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueue.clearQueue();
  }, []);

  return {
    queue,
    pendingCount: queue.length,
    hasPendingActions: queue.length > 0,
    addAction,
    removeAction,
    clearQueue,
    refreshQueue,
  };
}
