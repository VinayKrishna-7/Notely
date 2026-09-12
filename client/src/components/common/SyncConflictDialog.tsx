import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { GitMerge, Server, Laptop } from 'lucide-react';
import { Note } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface SyncConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serverNote: Partial<Note>;
  localNote: Partial<Note>;
  onResolve: (resolution: 'local' | 'server' | 'both') => void;
}

export function SyncConflictDialog({
  isOpen,
  onClose,
  serverNote,
  localNote,
  onResolve,
}: SyncConflictDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Sync Conflict Detected</h3>
            <p className="text-xs text-muted-foreground">
              This note was updated remotely while you made offline edits. Choose how you would like to resolve it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Local Version */}
          <div className="border border-border/60 rounded-lg p-3 bg-background/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Laptop className="h-3.5 w-3.5 text-primary" />
              <span>Your Offline Edits</span>
            </div>
            <div className="p-2 rounded bg-muted/40 text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
              <div className="font-bold text-foreground mb-1">{localNote.title || 'Untitled'}</div>
              <div className="text-muted-foreground">{localNote.content || '(empty)'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onResolve('local')}
            >
              Keep My Offline Edits
            </Button>
          </div>

          {/* Server Version */}
          <div className="border border-border/60 rounded-lg p-3 bg-background/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Server className="h-3.5 w-3.5 text-primary" />
              <span>Server Version</span>
            </div>
            <div className="p-2 rounded bg-muted/40 text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
              <div className="font-bold text-foreground mb-1">{serverNote.title || 'Untitled'}</div>
              <div className="text-muted-foreground">{serverNote.content || '(empty)'}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => onResolve('server')}
            >
              Keep Server Version
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onResolve('both')}
            className="w-full sm:w-auto"
          >
            Keep Both (Create Copy)
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
