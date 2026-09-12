import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Note } from '../../types';
import { SortableNoteCard } from './SortableNoteCard';
import { NoteCard } from './NoteCard';
import { cn } from '../../utils/cn';

interface SortableNoteListProps {
  notes: Note[];
  viewMode?: 'grid' | 'list';
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
  onReorder: (orderedIds: string[]) => void;
}

export function SortableNoteList({
  notes,
  viewMode = 'grid',
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
  onReorder,
}: SortableNoteListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeNote = activeId ? notes.find((n) => n._id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((n) => n._id === active.id);
      const newIndex = notes.findIndex((n) => n._id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(notes, oldIndex, newIndex);
        onReorder(reordered.map((n) => n._id));
      }
    }
  };

  const strategy = viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={notes.map((n) => n._id)} strategy={strategy}>
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          )}
        >
          {notes.map((note) => (
            <SortableNoteCard
              key={note._id}
              note={note}
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
              viewMode={viewMode}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeNote ? (
          <div className="rotate-2 scale-105 shadow-2xl ring-2 ring-primary/80 rounded-xl pointer-events-none opacity-90">
            <NoteCard note={activeNote} viewMode={viewMode} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
