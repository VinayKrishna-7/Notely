import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteFilterBar } from '../components/notes/NoteFilterBar';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NoteFilterState } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Archive } from 'lucide-react';

export function ArchivePage() {
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
  } = useNotes({
    search: debouncedSearch,
    tag: filter.tag || undefined,
    color: filter.color || undefined,
    sort: filter.sort,
    isArchived: true,
    isDeleted: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Archive className="h-6 w-6 text-sky-500" />
          <span>Archive</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Archived notes are kept out of your active workspace but preserved for reference.
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
        emptyTitle="Archive is empty"
        emptyDescription="You can archive notes to declutter your workspace without deleting them."
        emptyActionLabel="Browse all notes"
        onEmptyAction={() => navigate('/notes')}
        onSelect={(n) => navigate(`/notes/${n._id}`)}
        onEdit={(n) => navigate(`/notes/${n._id}`)}
        onToggleFavorite={toggleFavorite}
        onTogglePin={togglePin}
        onToggleArchive={toggleArchive}
        onDelete={deleteNote}
        onDuplicate={duplicateNote}
      />
    </div>
  );
}
