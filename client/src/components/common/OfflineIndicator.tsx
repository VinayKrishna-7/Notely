import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { pendingCount } = useOfflineQueue();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900',
        'px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 border-b border-border/40 shadow-sm z-50'
      )}
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      <span>
        You are currently offline. Working in offline mode
        {pendingCount > 0 ? ` (${pendingCount} pending change${pendingCount > 1 ? 's' : ''} queued)` : ''}.
      </span>
    </div>
  );
}
