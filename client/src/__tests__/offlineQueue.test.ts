import { describe, it, expect, beforeEach } from 'vitest';
import { offlineQueue } from '../utils/offlineQueue';

describe('Offline Queue Utility', () => {
  beforeEach(() => {
    offlineQueue.clearQueue();
  });

  it('adds actions to the offline queue and persists them', () => {
    const action = offlineQueue.addAction('CREATE', { title: 'Offline Note', content: 'Saved offline' });
    expect(action.id).toBeDefined();
    expect(action.type).toBe('CREATE');
    expect(action.payload.title).toBe('Offline Note');

    const queue = offlineQueue.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(action.id);
  });

  it('merges subsequent updates for the same entity', () => {
    offlineQueue.addAction('UPDATE', { title: 'First Edit' }, 'note-123');
    offlineQueue.addAction('UPDATE', { content: 'Second Edit Content' }, 'note-123');

    const queue = offlineQueue.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].payload.title).toBe('First Edit');
    expect(queue[0].payload.content).toBe('Second Edit Content');
  });

  it('removes actions from the queue by ID', () => {
    const a1 = offlineQueue.addAction('FAVORITE', {}, 'note-1');
    const a2 = offlineQueue.addAction('PIN', {}, 'note-2');

    expect(offlineQueue.getQueue().length).toBe(2);

    offlineQueue.removeAction(a1.id);
    const queue = offlineQueue.getQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].id).toBe(a2.id);
  });

  it('clears all actions from the queue', () => {
    offlineQueue.addAction('CREATE', { title: 'Note 1' });
    offlineQueue.addAction('CREATE', { title: 'Note 2' });

    expect(offlineQueue.getQueue().length).toBe(2);
    offlineQueue.clearQueue();
    expect(offlineQueue.getQueue().length).toBe(0);
  });
});
