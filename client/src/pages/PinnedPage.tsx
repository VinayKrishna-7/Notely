import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteFilterBar } from '../components/notes/NoteFilterBar';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NoteFilterState } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Pin } from 'lucide-react';

export function PinnedPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NoteFilterState>({
    search: '',
    tag: null,
    color: null,
    sort: 'updated_desc',
    viewMode: 'grid',
  });

  const debouncedSearch = useDebounce(filter.search, 300);

  const {
    notes,
    isLoading,
    toggleFavorite,
    togglePin,
    toggleArchive,
    deleteNote,
    duplicateNote,
    reorderNotes,
  } = useNotes({
    search: debouncedSearch,
    tag: filter.tag || undefined,
    color: filter.color || undefined,
    sort: filter.sort,
    isPinned: true,
    isDeleted: false,
    isArchived: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Pin className="h-6 w-6 text-primary fill-primary" />
          <span>Pinned Notes</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Priority notes kept top-of-mind.
        </p>
      </div>

      <NoteFilterBar
        filter={filter}
        onChange={(updates) => setFilter((prev) => ({ ...prev, ...updates }))}
      />

      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        searchQuery={debouncedSearch}
        viewMode={filter.viewMode}
        emptyTitle="No pinned notes"
        emptyDescription="Pin notes that you want to keep at the top of your workspace."
        emptyActionLabel="Browse all notes"
        onEmptyAction={() => navigate('/notes')}
        onSelect={(n) => navigate(`/notes/${n._id}`)}
        onEdit={(n) => navigate(`/notes/${n._id}`)}
        onToggleFavorite={toggleFavorite}
        onTogglePin={togglePin}
        onToggleArchive={toggleArchive}
        onDelete={deleteNote}
        onDuplicate={duplicateNote}
        onReorder={reorderNotes}
      />
    </div>
  );
}
