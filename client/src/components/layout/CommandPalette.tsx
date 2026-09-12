import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note, Tag } from '../../types';
import { highlightText } from '../../utils/highlight';
import { formatRelativeTime } from '../../utils/formatters';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  FileText,
  Tag as TagIcon,
  Clock,
  ArrowRight,
  Plus,
  Calendar,
  Star,
  Pin,
  Archive,
  Trash2,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  Command,
  X,
  Filter,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  tags: Tag[];
  onOpenShortcuts?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  notes,
  tags,
  onOpenShortcuts,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('notely_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveFilter(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Command items definitions
  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'cmd-new',
        title: 'Create New Note',
        subtitle: 'Start a blank note with Markdown editor',
        icon: <Plus className="h-4 w-4 text-emerald-500" />,
        shortcut: 'Ctrl+N',
        action: () => {
          onClose();
          navigate('/notes/new');
        },
      },
      {
        id: 'cmd-today',
        title: "Open Today's Daily Note",
        subtitle: 'Daily journal, tasks & thoughts',
        icon: <Calendar className="h-4 w-4 text-primary" />,
        shortcut: 'Ctrl+T',
        action: () => {
          onClose();
          navigate('/today');
        },
      },
      {
        id: 'cmd-all',
        title: 'Go to All Notes',
        subtitle: 'View entire workspace notes',
        icon: <FileText className="h-4 w-4" />,
        action: () => {
          onClose();
          navigate('/notes');
        },
      },
      {
        id: 'cmd-favorites',
        title: 'Go to Favorites',
        subtitle: 'Quick access to starred notes',
        icon: <Star className="h-4 w-4 text-amber-500" />,
        action: () => {
          onClose();
          navigate('/favorites');
        },
      },
      {
        id: 'cmd-pinned',
        title: 'Go to Pinned Notes',
        subtitle: 'High priority workspace notes',
        icon: <Pin className="h-4 w-4 text-indigo-500" />,
        action: () => {
          onClose();
          navigate('/pinned');
        },
      },
      {
        id: 'cmd-archive',
        title: 'Go to Archive',
        subtitle: 'Archived notes kept outside main view',
        icon: <Archive className="h-4 w-4 text-muted-foreground" />,
        action: () => {
          onClose();
          navigate('/archive');
        },
      },
      {
        id: 'cmd-trash',
        title: 'Go to Trash',
        subtitle: 'Soft-deleted notes',
        icon: <Trash2 className="h-4 w-4 text-rose-500" />,
        action: () => {
          onClose();
          navigate('/trash');
        },
      },
      {
        id: 'cmd-theme',
        title: `Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle theme color mode',
        icon: resolvedTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-600" />,
        shortcut: 'Ctrl+J',
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'cmd-settings',
        title: 'Open Settings',
        subtitle: 'Profile & preferences',
        icon: <Settings className="h-4 w-4" />,
        action: () => {
          onClose();
          navigate('/settings');
        },
      },
      {
        id: 'cmd-shortcuts',
        title: 'Keyboard Shortcuts',
        subtitle: 'View all keyboard navigation shortcuts',
        icon: <HelpCircle className="h-4 w-4" />,
        shortcut: 'Ctrl+/',
        action: () => {
          onClose();
          if (onOpenShortcuts) onOpenShortcuts();
        },
      },
    ],
    [navigate, onClose, onOpenShortcuts, resolvedTheme, toggleTheme]
  );

  // Advanced query filter parser
  const { isCommandMode, cleanTextQuery, activeFilterTokens } = useMemo(() => {
    const raw = (activeFilter ? `${activeFilter} ${query}` : query).trim();
    const isCommand = raw.startsWith('>');
    const searchString = isCommand ? raw.slice(1).trim() : raw;

    const parts = searchString.split(/\s+/).filter(Boolean);
    const textParts: string[] = [];
    const filterObj: {
      tag?: string;
      isFavorite?: boolean;
      isPinned?: boolean;
      isArchived?: boolean;
      isDeleted?: boolean;
      created?: string;
    } = {};

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (lower.startsWith('tag:')) {
        filterObj.tag = lower.slice(4);
      } else if (lower === 'is:favorite' || lower === 'is:starred') {
        filterObj.isFavorite = true;
      } else if (lower === 'is:pinned') {
        filterObj.isPinned = true;
      } else if (lower === 'is:archived') {
        filterObj.isArchived = true;
      } else if (lower === 'is:deleted' || lower === 'is:trash') {
        filterObj.isDeleted = true;
      } else if (lower.startsWith('created:')) {
        filterObj.created = lower.slice(8);
      } else {
        textParts.push(part);
      }
    }

    return {
      isCommandMode: isCommand,
      cleanTextQuery: textParts.join(' ').toLowerCase(),
      activeFilterTokens: filterObj,
    };
  }, [query, activeFilter]);

  // Filter matching commands
  const matchingCommands = useMemo(() => {
    if (!query && !isCommandMode) return [];
    const term = isCommandMode ? cleanTextQuery : query.trim().toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(term))
    );
  }, [commands, query, isCommandMode, cleanTextQuery]);

  // Filter matching notes
  const matchingNotes = useMemo(() => {
    if (isCommandMode) return [];
    if (!query.trim() && !activeFilter) return [];

    let filtered = notes;

    // Apply token filters
    if (activeFilterTokens.isDeleted) {
      filtered = filtered.filter((n) => n.isDeleted);
    } else {
      filtered = filtered.filter((n) => !n.isDeleted);
    }

    if (activeFilterTokens.isArchived) {
      filtered = filtered.filter((n) => n.isArchived);
    } else if (!activeFilterTokens.isDeleted) {
      filtered = filtered.filter((n) => !n.isArchived);
    }

    if (activeFilterTokens.isFavorite) {
      filtered = filtered.filter((n) => n.isFavorite);
    }

    if (activeFilterTokens.isPinned) {
      filtered = filtered.filter((n) => n.isPinned);
    }

    if (activeFilterTokens.tag) {
      const tagLower = activeFilterTokens.tag.toLowerCase();
      filtered = filtered.filter((n) =>
        n.tags.some((t) => t.toLowerCase().includes(tagLower))
      );
    }

    if (activeFilterTokens.created === 'today') {
      const todayStr = new Date().toDateString();
      filtered = filtered.filter((n) => new Date(n.createdAt).toDateString() === todayStr);
    }

    // Apply text search
    if (cleanTextQuery) {
      filtered = filtered.filter((n) => {
        const matchTitle = (n.title || '').toLowerCase().includes(cleanTextQuery);
        const matchContent = (n.content || '').toLowerCase().includes(cleanTextQuery);
        const matchTag = n.tags.some((t) => t.toLowerCase().includes(cleanTextQuery));
        return matchTitle || matchContent || matchTag;
      });

      // Smart Ranking
      filtered = [...filtered].sort((a, b) => {
        const aTitle = (a.title || '').toLowerCase();
        const bTitle = (b.title || '').toLowerCase();
        const aExact = aTitle === cleanTextQuery ? 100 : aTitle.startsWith(cleanTextQuery) ? 50 : aTitle.includes(cleanTextQuery) ? 30 : 0;
        const bExact = bTitle === cleanTextQuery ? 100 : bTitle.startsWith(cleanTextQuery) ? 50 : bTitle.includes(cleanTextQuery) ? 30 : 0;
        const aTag = a.tags.some((t) => t.toLowerCase() === cleanTextQuery) ? 20 : 0;
        const bTag = b.tags.some((t) => t.toLowerCase() === cleanTextQuery) ? 20 : 0;
        return (bExact + bTag) - (aExact + aTag);
      });
    }

    return filtered.slice(0, 8);
  }, [notes, isCommandMode, query, activeFilter, activeFilterTokens, cleanTextQuery]);

  // Filter matching tags
  const matchingTags = useMemo(() => {
    if (isCommandMode) return [];
    if (!cleanTextQuery) return [];
    return tags
      .filter((t) => t.name.toLowerCase().includes(cleanTextQuery))
      .slice(0, 4);
  }, [tags, isCommandMode, cleanTextQuery]);

  // Total results for keyboard navigation index calculation
  const allResultsCount = useMemo(() => {
    if (isCommandMode) return matchingCommands.length;
    return matchingCommands.length + matchingNotes.length + matchingTags.length;
  }, [isCommandMode, matchingCommands.length, matchingNotes.length, matchingTags.length]);

  // Save recent search term
  const addRecentSearch = (term: string) => {
    if (!term.trim() || term.startsWith('>')) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('notely_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectNote = (noteId: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    onClose();
    navigate(`/notes/${noteId}`);
  };

  const handleSelectTag = (tagName: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    onClose();
    navigate(`/notes?tag=${encodeURIComponent(tagName)}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResultsCount > 0 ? (prev + 1) % allResultsCount : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (allResultsCount > 0 ? (prev - 1 + allResultsCount) % allResultsCount : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResultsCount === 0) return;

      if (isCommandMode) {
        if (matchingCommands[selectedIndex]) {
          matchingCommands[selectedIndex].action();
        }
        return;
      }

      let currentIdx = selectedIndex;

      // Check commands first
      if (currentIdx < matchingCommands.length) {
        matchingCommands[currentIdx].action();
        return;
      }
      currentIdx -= matchingCommands.length;

      // Check notes
      if (currentIdx < matchingNotes.length) {
        handleSelectNote(matchingNotes[currentIdx]._id);
        return;
      }
      currentIdx -= matchingNotes.length;

      // Check tags
      if (currentIdx < matchingTags.length) {
        handleSelectTag(matchingTags[currentIdx].name);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-[10vh] sm:pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Command dialog panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Omnisearch Command Center"
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          {isCommandMode ? (
            <Command className="h-5 w-5 text-primary shrink-0 animate-pulse" />
          ) : (
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isCommandMode
                ? 'Type a command (e.g. create, today, theme)...'
                : 'Search notes, tags, or type ">" for commands...'
            }
            className="w-full bg-transparent text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveFilter(null);
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Chips Bar */}
        {!isCommandMode && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/50 bg-muted/20 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {[
              { label: 'All', value: null },
              { label: 'Favorites', value: 'is:favorite' },
              { label: 'Pinned', value: 'is:pinned' },
              { label: 'Today', value: 'created:today' },
              { label: 'Archive', value: 'is:archived' },
              { label: 'Trash', value: 'is:deleted' },
            ].map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => {
                    setActiveFilter(isActive ? null : f.value);
                    setSelectedIndex(0);
                  }}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {!query && !activeFilter && !isCommandMode ? (
            /* Empty State: Quick Commands & Recent Searches */
            <div className="p-3 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <Clock className="h-3 w-3 opacity-60" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Actions & Commands
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {commands.slice(0, 6).map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={cmd.action}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground text-left transition-colors border border-transparent hover:border-border/60"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {cmd.icon}
                        <div className="truncate">
                          <div className="text-xs font-medium truncate">{cmd.title}</div>
                          {cmd.subtitle && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : allResultsCount === 0 ? (
            /* No results */
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching notes, tags, or commands found for{' '}
              <span className="font-semibold text-foreground">"{query}"</span>
            </div>
          ) : (
            /* Search Results */
            <div className="space-y-3 p-1">
              {/* Commands section if matching */}
              {matchingCommands.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                    Commands ({matchingCommands.length})
                  </div>
                  <div className="space-y-1">
                    {matchingCommands.map((cmd, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <div
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {cmd.icon}
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-medium">
                                {highlightText(cmd.title, cleanTextQuery)}
                              </div>
                              {cmd.subtitle && (
                                <div className="text-[10px] text-muted-foreground truncate">
                                  {cmd.subtitle}
                                </div>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shrink-0">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Notes */}
              {matchingNotes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                    Notes ({matchingNotes.length})
                  </div>
                  <div className="space-y-1">
                    {matchingNotes.map((note, index) => {
                      const globalIdx = matchingCommands.length + index;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <div
                          key={note._id}
                          onClick={() => handleSelectNote(note._id)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-medium truncate flex items-center gap-1.5">
                                <span>{highlightText(note.title || 'Untitled Note', cleanTextQuery)}</span>
                                {note.isPinned && <Pin className="h-3 w-3 text-indigo-500 shrink-0" />}
                                {note.isFavorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {highlightText(note.content.substring(0, 70), cleanTextQuery)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0 ml-2">
                            <span>{formatRelativeTime(note.updatedAt)}</span>
                            {isSelected && <ArrowRight className="h-3.5 w-3.5 text-primary" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matching Tags */}
              {matchingTags.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                    Tags ({matchingTags.length})
                  </div>
                  <div className="space-y-1">
                    {matchingTags.map((tag, i) => {
                      const globalIdx = matchingCommands.length + matchingNotes.length + i;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <div
                          key={tag._id}
                          onClick={() => handleSelectTag(tag.name)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">
                              {highlightText(tag.name, cleanTextQuery)}
                            </span>
                          </div>
                          {tag.noteCount !== undefined && (
                            <span className="text-[11px] text-muted-foreground">
                              {tag.noteCount} notes
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono">↵</kbd> select
            </span>
            <span>
              <kbd className="rounded border bg-background px-1 py-0.5 font-mono">esc</kbd> close
            </span>
          </div>
          <span className="hidden sm:inline">Type <kbd className="rounded border bg-background px-1 py-0.5 font-mono">&gt;</kbd> for command mode</span>
        </div>
      </div>
    </div>
  );
}

