import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useTags } from '../hooks/useTags';
import { NoteFilterBar } from '../components/notes/NoteFilterBar';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NoteFilterState, NoteSortOption } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export function AllNotes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || null;

  const [filter, setFilter] = useState<NoteFilterState>({
    search: searchParams.get('search') || '',
    tag: initialTag,
    color: null,
    sort: 'updated_desc',
    viewMode: 'grid',
  });

  // Keep state in sync whenever searchParams in URL change (e.g. clicking tag in sidebar)
  React.useEffect(() => {
    const urlTag = searchParams.get('tag');
    const urlSearch = searchParams.get('search');
    setFilter((prev) => ({
      ...prev,
      tag: urlTag || null,
      search: urlSearch !== null && urlSearch !== undefined ? urlSearch : prev.search,
    }));
  }, [searchParams]);

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
    isArchived: false,
    isDeleted: false,
  });

  const { tags } = useTags();

  const handleFilterChange = (updates: Partial<NoteFilterState>) => {
    setFilter((prev) => {
      const next = { ...prev, ...updates };
      // Sync tag parameter to URL
      if (updates.tag !== undefined) {
        if (updates.tag) {
          searchParams.set('tag', updates.tag);
        } else {
          searchParams.delete('tag');
        }
        setSearchParams(searchParams, { replace: true });
      }
      return next;
    });
  };

  const availableTagNames = useMemo(() => tags.map((t) => t.name), [tags]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            All Notes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage and organize all your active workspace notes.
          </p>
        </div>

        <Button
          onClick={() => navigate('/notes/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          size="sm"
        >
          New Note
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <NoteFilterBar
        filter={filter}
        onChange={handleFilterChange}
        availableTags={availableTagNames}
      />

      {/* Note Grid / List */}
      <NoteGrid
        notes={notes}
        isLoading={isLoading}
        searchQuery={debouncedSearch}
        viewMode={filter.viewMode}
        emptyTitle={
          filter.search || filter.tag || filter.color
            ? 'No matching notes'
            : 'No notes created yet'
        }
        emptyDescription={
          filter.search || filter.tag || filter.color
            ? 'Try adjusting your search criteria or clearing active filters.'
            : 'Capture thoughts, checklists, ideas, or documentation.'
        }
        emptyActionLabel="Create your first note"
        onEmptyAction={() => navigate('/notes/new')}
        onSelect={(n) => navigate(`/notes/${n._id}`)}
        onEdit={(n) => navigate(`/notes/${n._id}`)}
        onToggleFavorite={toggleFavorite}
        onTogglePin={togglePin}
        onToggleArchive={toggleArchive}
        onDelete={deleteNote}
        onDuplicate={duplicateNote}
        onTagClick={(tag) => handleFilterChange({ tag })}
        onReorder={reorderNotes}
      />
    </div>
  );
}
