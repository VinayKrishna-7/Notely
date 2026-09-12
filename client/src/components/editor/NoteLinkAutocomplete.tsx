import React, { useEffect, useRef } from 'react';
import { Note } from '../../types';
import { FileText, Link2, Plus } from 'lucide-react';

interface NoteLinkAutocompleteProps {
  isOpen: boolean;
  notes: Note[];
  searchQuery: string;
  selectedIndex: number;
  onSelectNote: (noteTitle: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function NoteLinkAutocomplete({
  isOpen,
  notes,
  searchQuery,
  selectedIndex,
  onSelectNote,
  onClose,
  position,
}: NoteLinkAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notes
  const cleanSearch = searchQuery.toLowerCase().trim();
  const matchingNotes = notes
    .filter((n) => !n.isDeleted && (n.title || '').trim() !== '')
    .filter((n) => (n.title || '').toLowerCase().includes(cleanSearch))
    .slice(0, 6);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || matchingNotes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Link to note"
      style={
        position
          ? {
              top: `${Math.min(position.top + 24, window.innerHeight - 250)}px`,
              left: `${Math.min(position.left, window.innerWidth - 280)}px`,
            }
          : undefined
      }
      className="absolute z-50 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95"
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Link2 className="h-3 w-3 text-primary" /> Link to Note
        </span>
        <span className="text-[10px] lowercase font-normal">↵ to insert</span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1 p-1">
        {matchingNotes.map((note, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={note._id}
              type="button"
              onClick={() => onSelectNote(note.title)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                isSelected
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{note.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">
                [[{note.title}]]
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
