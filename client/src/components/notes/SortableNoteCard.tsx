import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Note } from '../../types';
import { NoteCard } from './NoteCard';
import { GripVertical } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SortableNoteCardProps {
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

export function SortableNoteCard(props: SortableNoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.note._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        'relative group/sortable touch-none transition-shadow',
        isDragging && 'shadow-2xl ring-2 ring-primary/80 rounded-xl'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="position absolute top-2 left-2 z-10 p-1 rounded bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground opacity-0 group-hover/sortable:opacity-100 cursor-grab active:cursor-grabbing transition-opacity shadow-xs"
        title="Drag to reorder"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      <NoteCard {...props} />
    </div>
  );
}
