import React, { useState, useMemo } from 'react';
import { NoteVersion } from '../../types';
import { useNoteVersions } from '../../hooks/useNoteVersions';
import { VersionItem } from './VersionItem';
import { VersionPreviewModal } from './VersionPreviewModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { History, X, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { isToday, isYesterday } from 'date-fns';

interface VersionHistoryPanelProps {
  noteId?: string;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestored?: () => void;
}

export function VersionHistoryPanel({
  noteId,
  isOpen,
  onClose,
  onVersionRestored,
}: VersionHistoryPanelProps) {
  const { versions, isLoading, isError, restoreVersion, isRestoring } = useNoteVersions(noteId);
  const [selectedPreviewVersion, setSelectedPreviewVersion] = useState<NoteVersion | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<NoteVersion | null>(null);

  // Group versions by Day (Today, Yesterday, Older)
  const groupedVersions = useMemo(() => {
    const todayList: NoteVersion[] = [];
    const yesterdayList: NoteVersion[] = [];
    const olderList: NoteVersion[] = [];

    versions.forEach((v) => {
      const d = new Date(v.createdAt);
      if (isToday(d)) todayList.push(v);
      else if (isYesterday(d)) yesterdayList.push(v);
      else olderList.push(v);
    });

    return {
      today: todayList,
      yesterday: yesterdayList,
      older: olderList,
    };
  }, [versions]);

  const handleConfirmRestore = async () => {
    if (!versionToRestore) return;
    try {
      await restoreVersion(versionToRestore._id);
      setVersionToRestore(null);
      setSelectedPreviewVersion(null);
      if (onVersionRestored) onVersionRestored();
      onClose();
    } catch (err) {
      // Toast handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Slide-over Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Note Version History"
          className="relative flex flex-col w-full max-w-md h-full bg-card border-l border-border shadow-2xl z-10 animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Version History</h2>
                <p className="text-[11px] text-muted-foreground">
                  {versions.length} saved snapshot{versions.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Versions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full rounded-xl bg-muted/60 animate-pulse"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="py-12 text-center text-xs text-rose-500 flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                <span>Failed to load version history for this note.</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                <Clock className="h-8 w-8 mx-auto opacity-40 text-muted-foreground" />
                <p className="font-semibold text-foreground">No version history yet</p>
                <p className="max-w-[220px] mx-auto text-muted-foreground">
                  Versions are saved automatically as you make meaningful edits to your notes.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Today */}
                {groupedVersions.today.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Today
                    </div>
                    <div className="space-y-2">
                      {groupedVersions.today.map((v, idx) => (
                        <VersionItem
                          key={v._id}
                          version={v}
                          isLatest={idx === 0}
                          onPreview={(ver) => setSelectedPreviewVersion(ver)}
                          onRestore={(ver) => setVersionToRestore(ver)}
                          isRestoring={isRestoring}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {groupedVersions.yesterday.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Yesterday
                    </div>
                    <div className="space-y-2">
                      {groupedVersions.yesterday.map((v) => (
                        <VersionItem
                          key={v._id}
                          version={v}
                          isLatest={false}
                          onPreview={(ver) => setSelectedPreviewVersion(ver)}
                          onRestore={(ver) => setVersionToRestore(ver)}
                          isRestoring={isRestoring}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Older */}
                {groupedVersions.older.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Previous Days
                    </div>
                    <div className="space-y-2">
                      {groupedVersions.older.map((v) => (
                        <VersionItem
                          key={v._id}
                          version={v}
                          isLatest={false}
                          onPreview={(ver) => setSelectedPreviewVersion(ver)}
                          onRestore={(ver) => setVersionToRestore(ver)}
                          isRestoring={isRestoring}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground text-center">
            Restoring a version creates a new snapshot without deleting history.
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <VersionPreviewModal
        version={selectedPreviewVersion}
        isOpen={Boolean(selectedPreviewVersion)}
        onClose={() => setSelectedPreviewVersion(null)}
        onRestore={(ver) => {
          setSelectedPreviewVersion(null);
          setVersionToRestore(ver);
        }}
        isRestoring={isRestoring}
      />

      {/* Confirmation Dialog before restore */}
      <ConfirmDialog
        isOpen={Boolean(versionToRestore)}
        title="Restore Note Version"
        description="Are you sure you want to restore this version? Your current note content will be saved into version history and replaced with the selected version."
        confirmLabel="Restore Version"
        cancelLabel="Cancel"
        variant="default"
        isLoading={isRestoring}
        onConfirm={handleConfirmRestore}
        onClose={() => setVersionToRestore(null)}
      />
    </>
  );
}
