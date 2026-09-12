import React from 'react';
import { Note } from '../../types';
import { NoteCard } from './NoteCard';
import { SortableNoteList } from './SortableNoteList';
import { NoteCardSkeleton } from '../ui/skeleton';
import { EmptyState } from '../common/EmptyState';
import { Plus, StickyNote } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NoteGridProps {
  notes: Note[];
  isLoading?: boolean;
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onSelect?: (note: Note) => void;
  onEdit?: (note: Note) => void;
  onToggleFavorite?: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  onToggleArchive?: (note: Note) => void;
  onDuplicate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onRestore?: (note: Note) => void;
  onPermanentDelete?: (note: Note) => void;
  onTagClick?: (tag: string) => void;
  onReorder?: (orderedIds: string[]) => void;
  className?: string;
}

export function NoteGrid({
  notes,
  isLoading,
  searchQuery = '',
  viewMode = 'grid',
  emptyTitle = 'No notes found',
  emptyDescription = 'Get started by creating your first note.',
  emptyActionLabel = 'Create note',
  onEmptyAction,
  onSelect,
  onEdit,
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onDuplicate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onTagClick,
  onReorder,
  className,
}: NoteGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        actionIcon={<Plus className="h-4 w-4" />}
        icon={<StickyNote className="h-7 w-7 text-muted-foreground" />}
        className="my-8"
      />
    );
  }

  // Pinned vs Others separation if not in Trash/Archive
  const pinnedNotes = notes.filter((n) => n.isPinned && !n.isDeleted && !n.isArchived);
  const otherNotes = notes.filter((n) => !n.isPinned || n.isDeleted || n.isArchived);

  // If all notes are pinned or on a single flat view with reorder support
  if (onReorder && pinnedNotes.length === notes.length) {
    return (
      <div className={className}>
        <SortableNoteList
          notes={notes}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSelect={onSelect}
          onEdit={onEdit}
          onToggleFavorite={onToggleFavorite}
          onTogglePin={onTogglePin}
          onToggleArchive={onToggleArchive}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          onTagClick={onTagClick}
          onReorder={onReorder}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pinned section if present */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Pinned</span>
            <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px]">
              {pinnedNotes.length}
            </span>
          </div>

          {onReorder ? (
            <SortableNoteList
              notes={pinnedNotes}
              viewMode={viewMode}
              searchQuery={searchQuery}
              onSelect={onSelect}
              onEdit={onEdit}
              onToggleFavorite={onToggleFavorite}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
              onTagClick={onTagClick}
              onReorder={(reorderedPinnedIds) => {
                const otherIds = otherNotes.map((n) => n._id);
                onReorder([...reorderedPinnedIds, ...otherIds]);
              }}
            />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  searchQuery={searchQuery}
                  viewMode={viewMode}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onToggleFavorite={onToggleFavorite}
                  onTogglePin={onTogglePin}
                  onToggleArchive={onToggleArchive}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                  onTagClick={onTagClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Others section */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
              <span>Other Notes</span>
              <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px]">
                {otherNotes.length}
              </span>
            </div>
          )}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {otherNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                searchQuery={searchQuery}
                viewMode={viewMode}
                onSelect={onSelect}
                onEdit={onEdit}
                onToggleFavorite={onToggleFavorite}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
