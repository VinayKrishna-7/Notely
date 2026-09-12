import React from 'react';
import { NoteFilterState, NoteSortOption, NoteColor } from '../../types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { TagBadge } from '../tags/TagBadge';
import { NOTE_COLORS } from '../../utils/colors';
import {
  Search,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Tag as TagIcon,
} from 'lucide-react';

interface NoteFilterBarProps {
  filter: NoteFilterState;
  onChange: (updates: Partial<NoteFilterState>) => void;
  availableTags?: string[];
  totalNotesCount?: number;
  className?: string;
}

export function NoteFilterBar({
  filter,
  onChange,
  availableTags = [],
  totalNotesCount,
  className,
}: NoteFilterBarProps) {
  const sortOptions: { label: string; value: NoteSortOption }[] = [
    { label: 'Recently Updated', value: 'updated_desc' },
    { label: 'Recently Created', value: 'created_desc' },
    { label: 'Oldest First', value: 'created_asc' },
    { label: 'Title: A to Z', value: 'title_asc' },
    { label: 'Title: Z to A', value: 'title_desc' },
    { label: 'Custom Order', value: 'order_asc' },
  ];

  const colors: NoteColor[] = ['rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'];

  const hasActiveFilters = Boolean(filter.search || filter.tag || filter.color);

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Input
            value={filter.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search in title, content, or tags..."
            leftIcon={<Search className="h-4 w-4" />}
            rightIcon={
              filter.search ? (
                <button
                  type="button"
                  onClick={() => onChange({ search: '' })}
                  className="hover:text-foreground p-0.5 rounded"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        {/* Controls: Sorting & View mode */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={filter.sort}
              onChange={(e) => onChange({ sort: e.target.value as NoteSortOption })}
              className="h-9 appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-xs font-medium shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded-md border border-input bg-background p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => onChange({ viewMode: 'grid' })}
              className={`p-1.5 rounded transition-colors ${
                filter.viewMode === 'grid'
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ viewMode: 'list' })}
              className={`p-1.5 rounded transition-colors ${
                filter.viewMode === 'list'
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter pills: Tags & Color filters */}
      {(availableTags.length > 0 || hasActiveFilters) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TagIcon className="h-3 w-3" />
            Tags:
          </span>

          <TagBadge
            name="All"
            isSelected={!filter.tag}
            onClick={() => onChange({ tag: null })}
            size="sm"
          />

          {availableTags.map((tagName) => (
            <TagBadge
              key={tagName}
              name={tagName}
              isSelected={filter.tag === tagName}
              onClick={() => onChange({ tag: filter.tag === tagName ? null : tagName })}
              size="sm"
            />
          ))}

          {/* Color filter dots */}
          <div className="h-4 w-px bg-border mx-1" />
          <span className="text-xs font-medium text-muted-foreground">Color:</span>
          {colors.map((c) => {
            const isSelected = filter.color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ color: isSelected ? null : c })}
                className={`h-4 w-4 rounded-full transition-transform ${
                  NOTE_COLORS[c].badge
                } ${isSelected ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100'}`}
                title={`Filter by ${NOTE_COLORS[c].name}`}
              />
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ search: '', tag: null, color: null })}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
