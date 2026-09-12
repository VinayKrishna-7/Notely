import React from 'react';
import { NoteVersion } from '../../types';
import { format } from 'date-fns';
import { EditorPreview } from '../editor/EditorPreview';
import { Button } from '../ui/button';
import { TagBadge } from '../tags/TagBadge';
import { X, RotateCcw, Clock, ArrowLeft } from 'lucide-react';

interface VersionPreviewModalProps {
  version: NoteVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: NoteVersion) => void;
  isRestoring?: boolean;
}

export function VersionPreviewModal({
  version,
  isOpen,
  onClose,
  onRestore,
  isRestoring,
}: VersionPreviewModalProps) {
  if (!isOpen || !version) return null;

  const versionDate = new Date(version.createdAt);
  const formattedDate = format(versionDate, 'EEEE, MMMM d, yyyy · h:mm a');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex flex-col w-full max-w-3xl h-[85vh] max-h-[700px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-xs font-semibold text-foreground">
                Version Snapshot
              </span>
              <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onRestore(version)}
              disabled={isRestoring}
              className="h-8 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Restore this version
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Note Content Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2 border-b border-border/60 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {version.title || 'Untitled Note'}
            </h1>
            {version.tags && version.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {version.tags.map((tag) => (
                  <TagBadge key={tag} name={tag} />
                ))}
              </div>
            )}
          </div>

          <div className="min-h-[250px] rounded-xl border border-border/40 bg-background/50">
            <EditorPreview
              content={version.content}
              placeholder="This version has no content."
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground shrink-0">
          <span>Read-only preview. Restoring will preserve existing history and create a new version.</span>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
