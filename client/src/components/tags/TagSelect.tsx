import React, { useState, useRef, useEffect } from 'react';
import { TagBadge } from './TagBadge';
import { Plus, Check, Tag as TagIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TagSelectProps {
  selectedTags: string[];
  availableTags?: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagSelect({
  selectedTags = [],
  availableTags = [],
  onChange,
  className,
}: TagSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInputOpen) {
      inputRef.current?.focus();
    }
  }, [isInputOpen]);

  // Click outside listener to close input and save pending tag
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (inputValue.trim()) {
          handleAddTag(inputValue);
        }
        setIsInputOpen(false);
      }
    }
    if (isInputOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInputOpen, inputValue, selectedTags]);

  const handleAddTag = (tagToAdd: string) => {
    const formatted = tagToAdd.trim().toLowerCase().replace(/\s+/g, '-').replace(/^#+/, '');
    if (formatted && !selectedTags.includes(formatted)) {
      onChange([...selectedTags, formatted]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setIsInputOpen(false);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Filter available suggestions
  const suggestions = availableTags.filter(
    (tag) =>
      tag &&
      !selectedTags.includes(tag.toLowerCase()) &&
      (!inputValue.trim() || tag.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <div ref={containerRef} className={cn('relative flex flex-wrap items-center gap-1.5', className)}>
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag}
          name={tag}
          onRemove={() => handleRemoveTag(tag)}
          size="sm"
        />
      ))}

      {isInputOpen ? (
        <div className="relative inline-flex items-center">
          <div className="flex items-center rounded-full border border-primary bg-background pl-2 pr-1 py-0.5 shadow-2xs">
            <TagIcon className="h-3 w-3 text-muted-foreground mr-1" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tag name..."
              className="h-5 w-24 sm:w-28 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => handleAddTag(inputValue)}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                title="Add tag"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[140px] max-h-40 overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Existing Tags
              </div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddTag(s)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-popover-foreground hover:bg-accent transition-colors text-left"
                >
                  <span>#{s}</span>
                  <Check className="h-3 w-3 opacity-60 text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsInputOpen(true)}
          className="inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-border px-2 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          <span>Add Tag</span>
        </button>
      )}
    </div>
  );
}
