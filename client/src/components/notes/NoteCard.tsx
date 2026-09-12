import React from 'react';
import { Note } from '../../types';
import { useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../../api/notesApi';
import { NOTE_COLORS } from '../../utils/colors';
import { formatRelativeTime, generateExcerpt, calculateReadingTime } from '../../utils/formatters';
import { highlightText } from '../../utils/highlight';
import { TagBadge } from '../tags/TagBadge';
import { NoteActionsMenu } from './NoteActionsMenu';
import { Star, Pin, Clock, Archive } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NoteCardProps {
  note: Note;
  searchQuery?: string;
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
  viewMode?: 'grid' | 'list';
}

export function NoteCard({
  note,
  searchQuery = '',
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
  viewMode = 'grid',
}: NoteCardProps) {
  const queryClient = useQueryClient();
  const colorTheme = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const excerpt = generateExcerpt(note.content, viewMode === 'list' ? 220 : 150);
  const readingTime = calculateReadingTime(note.content);

  const handleMouseEnter = () => {
    if (note._id) {
      queryClient.prefetchQuery({
        queryKey: ['note', note._id],
        queryFn: () => notesApi.getNote(note._id),
        staleTime: 1000 * 60 * 2,
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering on button/link clicks
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onSelect?.(note);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:border-foreground/20',
          colorTheme.bg,
          colorTheme.darkBg,
          colorTheme.border,
          colorTheme.darkBorder,
          note.isPinned && 'ring-1 ring-primary/40'
        )}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <Pin className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
            )}
            {note.isFavorite && (
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
            {note.isArchived && (
              <Archive className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
              {highlightText(note.title || 'Untitled Note', searchQuery)}
            </h4>
          </div>

          {excerpt && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 leading-relaxed">
              {highlightText(excerpt, searchQuery)}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {note.tags.map((tag) => (
              <TagBadge
                key={tag}
                name={tag}
                size="sm"
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {!note.isDeleted && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(note);
                  }}
                  className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star
                    className={`h-4 w-4 ${
                      note.isFavorite ? 'text-amber-500 fill-amber-500' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin?.(note);
                  }}
                  className="p-1.5 rounded-md hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin
                    className={`h-4 w-4 ${
                      note.isPinned ? 'text-primary fill-primary' : ''
                    }`}
                  />
                </button>
              </>
            )}

            <NoteActionsMenu
              note={note}
              onEdit={onEdit}
              onToggleFavorite={onToggleFavorite}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 min-h-[190px]',
        colorTheme.bg,
        colorTheme.darkBg,
        colorTheme.border,
        colorTheme.darkBorder,
        note.isPinned && 'ring-1 ring-primary/40'
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h4 className="font-semibold text-base text-foreground line-clamp-2 leading-tight flex-1">
            {highlightText(note.title || 'Untitled Note', searchQuery)}
          </h4>
          <div className="flex items-center gap-1 shrink-0 -mr-1">
            {!note.isDeleted && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin?.(note);
                  }}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    note.isPinned
                      ? 'text-primary'
                      : 'text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-foreground/10'
                  )}
                  title={note.isPinned ? 'Unpin note' : 'Pin note'}
                  aria-label="Pin note"
                >
                  <Pin
                    className={`h-3.5 w-3.5 ${
                      note.isPinned ? 'fill-primary' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.(note);
                  }}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    note.isFavorite
                      ? 'text-amber-500'
                      : 'text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-foreground/10'
                  )}
                  title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                  aria-label="Favorite note"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      note.isFavorite ? 'fill-amber-500' : ''
                    }`}
                  />
                </button>
              </>
            )}

            <NoteActionsMenu
              note={note}
              onEdit={onEdit}
              onToggleFavorite={onToggleFavorite}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          </div>
        </div>

        {/* Content Excerpt */}
        {excerpt ? (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
            {highlightText(excerpt, searchQuery)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic mb-4">
            Empty note...
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-2.5 pt-3 border-t border-border/40">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {note.tags.map((tag) => (
              <TagBadge
                key={tag}
                name={tag}
                size="sm"
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{formatRelativeTime(note.updatedAt)}</span>
          <span>{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
}
