import { apiClient } from '../api/client';

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'FAVORITE' | 'PIN' | 'ARCHIVE' | 'REORDER';

export interface QueuedAction {
  id: string;
  type: ActionType;
  entityId?: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = 'notely_offline_queue';
let memoryStore: Record<string, string> = {};

function emitQueueChangeEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notely_offline_queue_change'));
  }
}

export const offlineQueue = {
  getQueue(): QueuedAction[] {
    try {
      const stored = typeof localStorage !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : memoryStore[STORAGE_KEY];
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveQueue(queue: QueuedAction[]): void {
    try {
      const serialized = JSON.stringify(queue);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        memoryStore[STORAGE_KEY] = serialized;
      }
      emitQueueChangeEvent();
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  },

  addAction(type: ActionType, payload: any, entityId?: string): QueuedAction {
    const queue = this.getQueue();
    const action: QueuedAction = {
      id: 'queue_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      type,
      entityId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    // If there is an existing pending update for the same entity, merge or replace
    if (entityId && (type === 'UPDATE' || type === 'FAVORITE' || type === 'PIN' || type === 'ARCHIVE')) {
      const existingIdx = queue.findIndex((a) => a.entityId === entityId && a.type === type);
      if (existingIdx !== -1) {
        queue[existingIdx] = {
          ...queue[existingIdx],
          payload: { ...queue[existingIdx].payload, ...payload },
          timestamp: Date.now(),
        };
        this.saveQueue(queue);
        return queue[existingIdx];
      }
    }

    queue.push(action);
    this.saveQueue(queue);
    return action;
  },

  removeAction(id: string): void {
    const queue = this.getQueue().filter((a) => a.id !== id);
    this.saveQueue(queue);
  },

  clearQueue(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    delete memoryStore[STORAGE_KEY];
    emitQueueChangeEvent();
  },

  async processQueue(onSuccessItem?: (action: QueuedAction) => void): Promise<{ processed: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;
    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        switch (action.type) {
          case 'CREATE':
            await apiClient.post('/notes', action.payload);
            break;
          case 'UPDATE':
            if (action.entityId) {
              await apiClient.put(`/notes/${action.entityId}`, action.payload);
            }
            break;
          case 'DELETE':
            if (action.entityId) {
              await apiClient.delete(`/notes/${action.entityId}`);
            }
            break;
          case 'FAVORITE':
            if (action.entityId) {
              await apiClient.patch(`/notes/${action.entityId}/favorite`);
            }
            break;
          case 'PIN':
            if (action.entityId) {
              await apiClient.patch(`/notes/${action.entityId}/pin`);
            }
            break;
          case 'ARCHIVE':
            if (action.entityId) {
              await apiClient.patch(`/notes/${action.entityId}/archive`);
            }
            break;
          case 'REORDER':
            await apiClient.patch('/notes/reorder', action.payload);
            break;
        }
        processed++;
        onSuccessItem?.(action);
      } catch (err: any) {
        console.error('Failed to sync queued action:', action, err);
        action.retryCount = (action.retryCount || 0) + 1;
        // Keep in queue if retryCount < 5 unless 4xx non-recoverable error
        if (action.retryCount < 5 && (!err.response || err.response.status >= 500)) {
          remaining.push(action);
        }
        failed++;
      }
    }

    this.saveQueue(remaining);
    return { processed, failed };
  },
};
