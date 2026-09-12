import React from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { Cloud, CloudOff, RefreshCw, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SyncIndicatorProps {
  className?: string;
  showText?: boolean;
}

export function SyncIndicator({ className, showText = true }: SyncIndicatorProps) {
  const { isOnline, syncState, pendingCount, sync } = useSyncStatus();

  if (!isOnline) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground',
          className
        )}
        title="Offline - Changes are saved locally"
      >
        <CloudOff className="h-3 w-3 text-amber-500" />
        {showText && <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>}
      </div>
    );
  }

  if (syncState === 'syncing') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-primary/10 text-primary',
          className
        )}
      >
        <RefreshCw className="h-3 w-3 animate-spin" />
        {showText && <span>Syncing...</span>}
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={() => sync()}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors',
          className
        )}
        title="Click to sync changes"
      >
        <Cloud className="h-3 w-3" />
        {showText && <span>{pendingCount} unsynced</span>}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground/80 hover:text-foreground transition-colors',
        className
      )}
      title="All changes saved to cloud"
    >
      <Check className="h-3 w-3 text-emerald-500" />
      {showText && <span>Synced</span>}
    </div>
  );
}
