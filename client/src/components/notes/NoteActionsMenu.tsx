import React from 'react';
import { Dropdown, DropdownItem } from '../ui/dropdown';
import { Note } from '../../types';
import {
  MoreVertical,
  Edit,
  Star,
  Pin,
  Archive,
  ArchiveRestore,
  Copy,
  Trash,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface NoteActionsMenuProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onToggleFavorite?: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  onToggleArchive?: (note: Note) => void;
  onDuplicate?: (note: Note) => void;
  onDelete?: (note: Note) => void;
  onRestore?: (note: Note) => void;
  onPermanentDelete?: (note: Note) => void;
}

export function NoteActionsMenu({
  note,
  onEdit,
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onDuplicate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: NoteActionsMenuProps) {
  const isDeleted = note.isDeleted;

  const items: (DropdownItem | 'separator')[] = isDeleted
    ? [
        {
          label: 'Restore Note',
          icon: <RotateCcw className="h-4 w-4 text-emerald-500" />,
          onClick: () => onRestore?.(note),
        },
        'separator',
        {
          label: 'Delete Permanently',
          icon: <Trash2 className="h-4 w-4 text-destructive" />,
          variant: 'destructive',
          onClick: () => onPermanentDelete?.(note),
        },
      ]
    : [
        ...(onEdit
          ? [
              {
                label: 'Edit Note',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onEdit(note),
              },
            ]
          : []),
        {
          label: note.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          icon: (
            <Star
              className={`h-4 w-4 ${
                note.isFavorite ? 'text-amber-500 fill-amber-500' : ''
              }`}
            />
          ),
          onClick: () => onToggleFavorite?.(note),
        },
        {
          label: note.isPinned ? 'Unpin Note' : 'Pin Note',
          icon: (
            <Pin
              className={`h-4 w-4 ${
                note.isPinned ? 'text-primary fill-primary' : ''
              }`}
            />
          ),
          onClick: () => onTogglePin?.(note),
        },
        {
          label: note.isArchived ? 'Unarchive Note' : 'Archive Note',
          icon: note.isArchived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          ),
          onClick: () => onToggleArchive?.(note),
        },
        ...(onDuplicate
          ? [
              {
                label: 'Duplicate',
                icon: <Copy className="h-4 w-4" />,
                onClick: () => onDuplicate(note),
              },
            ]
          : []),
        'separator',
        ...(onDelete
          ? [
              {
                label: 'Move to Trash',
                icon: <Trash className="h-4 w-4 text-destructive" />,
                variant: 'destructive' as const,
                onClick: () => onDelete(note),
              },
            ]
          : []),
      ];

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          aria-label="Note actions"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
      items={items}
    />
  );
}
