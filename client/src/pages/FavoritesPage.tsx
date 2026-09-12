import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { NoteFilterBar } from '../components/notes/NoteFilterBar';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NoteFilterState } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Star } from 'lucide-react';

export function FavoritesPage() {
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
    isFavorite: true,
    isDeleted: false,
    isArchived: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          <span>Favorite Notes</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Quickly access your most important starred ideas and documents.
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
        emptyTitle="No favorite notes yet"
        emptyDescription="Star any note to quickly find it here whenever you need it."
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
