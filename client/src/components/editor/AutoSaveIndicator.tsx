import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date | null;
  onRetry?: () => void;
  className?: string;
}

export function AutoSaveIndicator({
  status,
  lastSavedAt,
  onRetry,
  className,
}: AutoSaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium animate-pulse',
          className
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium transition-opacity duration-300',
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Saved just now</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 text-xs text-destructive font-medium',
          className
        )}
      >
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Unable to save</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('text-xs text-muted-foreground/70', className)}>
      {lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Draft ready'}
    </div>
  );
}
