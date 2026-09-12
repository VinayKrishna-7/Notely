import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { NoteGrid } from '../components/notes/NoteGrid';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Note } from '../types';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function TrashPage() {
  const {
    notes,
    isLoading,
    restoreNote,
    permanentDelete,
  } = useNotes({
    isDeleted: true,
    sort: 'updated_desc',
  });

  const [selectedNoteForDelete, setSelectedNoteForDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePermanentDelete = async () => {
    if (!selectedNoteForDelete) return;
    setIsDeleting(true);
    try {
      await permanentDelete(selectedNoteForDelete);
      setSelectedNoteForDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-destructive" />
            <span>Trash</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Deleted notes stay here until permanently purged.
          </p>
        </div>
      </div>

      {/* Trash Warning Banner */}
      {notes.length > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Items in the trash can be restored back to your workspace or deleted permanently. Permanent deletion cannot be undone.
          </span>
        </div>
      )}

      {/* Deleted Notes Grid */}
      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        emptyTitle="Your trash is empty"
        emptyDescription="Items moved to trash will appear here."
        onRestore={restoreNote}
        onPermanentDelete={(note) => setSelectedNoteForDelete(note)}
      />

      {/* Confirmation Dialog for Permanent Deletion */}
      <ConfirmDialog
        isOpen={Boolean(selectedNoteForDelete)}
        onClose={() => setSelectedNoteForDelete(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Note?"
        description={`Are you sure you want to permanently delete "${
          selectedNoteForDelete?.title || 'Untitled Note'
        }"? This action cannot be reversed.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
