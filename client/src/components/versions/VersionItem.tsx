import React from 'react';
import { NoteVersion } from '../../types';
import { format } from 'date-fns';
import { Clock, History, Eye, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

interface VersionItemProps {
  version: NoteVersion;
  isLatest: boolean;
  onPreview: (version: NoteVersion) => void;
  onRestore: (version: NoteVersion) => void;
  isRestoring?: boolean;
}

export function VersionItem({
  version,
  isLatest,
  onPreview,
  onRestore,
  isRestoring,
}: VersionItemProps) {
  const versionDate = new Date(version.createdAt);
  const timeStr = format(versionDate, 'h:mm a');
  const dateStr = format(versionDate, 'MMM d, yyyy');

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors group">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
          <History className="h-4 w-4" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{timeStr}</span>
            {isLatest ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Current version
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">{dateStr}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {version.changeSummary || (version.title ? `"${version.title}"` : 'Snapshot')}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/80">
            <span>{(version.content || '').length} characters</span>
            {version.tags && version.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{version.tags.length} tags</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPreview(version)}
          className="h-8 px-2 text-xs"
          title="Preview version content"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          <span>View</span>
        </Button>
        {!isLatest && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRestore(version)}
            disabled={isRestoring}
            className="h-8 px-2 text-xs hover:bg-primary hover:text-primary-foreground"
            title="Restore this version"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Restore</span>
          </Button>
        )}
      </div>
    </div>
  );
}
