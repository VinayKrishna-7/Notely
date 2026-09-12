import React, { useRef, useState, useEffect, useMemo } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';
import { EditorPreview } from './EditorPreview';
import { AutoSaveIndicator, SaveStatus } from './AutoSaveIndicator';
import { ColorPicker } from '../notes/ColorPicker';
import { TagSelect } from '../tags/TagSelect';
import { NoteLinkAutocomplete } from './NoteLinkAutocomplete';
import { useNotes } from '../../hooks/useNotes';
import { NoteColor, Note } from '../../types';
import { Tabs } from '../ui/tabs';
import { Button } from '../ui/button';
import { NOTE_COLORS } from '../../utils/colors';
import {
  Edit3,
  Columns,
  Eye,
  Save,
  Trash,
  ArrowLeft,
  Star,
  Pin,
  Archive,
  History,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface EditorValue {
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

interface MarkdownEditorProps {
  initialValue: EditorValue;
  availableTags?: string[];
  saveStatus?: SaveStatus;
  lastSavedAt?: Date | null;
  onChange: (value: EditorValue) => void;
  onManualSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onOpenVersionHistory?: () => void;
  isNew?: boolean;
  className?: string;
}

export function MarkdownEditor({
  initialValue,
  availableTags = [],
  saveStatus = 'idle',
  lastSavedAt,
  onChange,
  onManualSave,
  onCancel,
  onDelete,
  onOpenVersionHistory,
  isNew = false,
  className,
}: MarkdownEditorProps) {
  const [value, setValue] = useState<EditorValue>(initialValue);
  const [mode, setMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Wiki-link autocomplete state
  const { notes: workspaceNotes } = useNotes();
  const [isLinkAutocompleteOpen, setIsLinkAutocompleteOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [linkSelectedIndex, setLinkSelectedIndex] = useState(0);

  // Matching notes for autocomplete
  const matchingNotes = useMemo(() => {
    const q = linkSearchQuery.toLowerCase().trim();
    return workspaceNotes
      .filter((n) => !n.isDeleted && (n.title || '').trim() !== '')
      .filter((n) => (n.title || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [workspaceNotes, linkSearchQuery]);

  // Sync state if initialValue changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue.title, initialValue.content, initialValue.color, JSON.stringify(initialValue.tags)]);

  const updateField = <K extends keyof EditorValue>(key: K, val: EditorValue[K]) => {
    const updated = { ...value, [key]: val };
    setValue(updated);
    onChange(updated);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    updateField('content', newContent);

    // Check for [[ trigger
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lastOpen = textBeforeCursor.lastIndexOf('[[');
    const lastClose = textBeforeCursor.lastIndexOf(']]');

    if (lastOpen !== -1 && lastOpen > lastClose) {
      const query = textBeforeCursor.substring(lastOpen + 2);
      if (!query.includes('\n')) {
        setIsLinkAutocompleteOpen(true);
        setLinkSearchQuery(query);
        setLinkSelectedIndex(0);
        return;
      }
    }
    setIsLinkAutocompleteOpen(false);
  };

  const handleSelectNoteLink = (noteTitle: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.content.substring(0, cursorPos);
    const lastOpen = textBeforeCursor.lastIndexOf('[[');

    if (lastOpen !== -1) {
      const before = value.content.substring(0, lastOpen);
      const after = value.content.substring(cursorPos);
      const inserted = `[[${noteTitle}]] `;
      const newContent = before + inserted + after;

      updateField('content', newContent);
      setIsLinkAutocompleteOpen(false);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = before.length + inserted.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // Insert markdown helpers around selection
  const handleInsert = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = value.content;
    const selectedText = currentText.substring(start, end) || defaultText;

    const newContent =
      currentText.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      currentText.substring(end);

    updateField('content', newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Keyboard shortcut listener (Ctrl+B, Ctrl+I, Ctrl+S) & Autocomplete navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLinkAutocompleteOpen && matchingNotes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setLinkSelectedIndex((prev) => (prev + 1) % matchingNotes.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setLinkSelectedIndex((prev) => (prev - 1 + matchingNotes.length) % matchingNotes.length);
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (matchingNotes[linkSelectedIndex]) {
          handleSelectNoteLink(matchingNotes[linkSelectedIndex].title);
        }
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsLinkAutocompleteOpen(false);
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleInsert('**', '**', 'bold text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleInsert('*', '*', 'italic text');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onManualSave?.();
    }
  };

  const colorConfig = NOTE_COLORS[value.color] || NOTE_COLORS.default;

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all',
        colorConfig.bg,
        colorConfig.darkBg,
        colorConfig.border,
        colorConfig.darkBorder,
        className
      )}
    >
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/60 bg-background/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          <AutoSaveIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            onRetry={onManualSave}
          />
        </div>

        {/* Action icons & Mode tabs */}
        <div className="flex items-center gap-3">
          <Tabs
            size="sm"
            tabs={[
              { id: 'edit', label: 'Edit', icon: <Edit3 className="h-3.5 w-3.5" /> },
              {
                id: 'split',
                label: 'Split',
                icon: <Columns className="h-3.5 w-3.5" />,
              },
              { id: 'preview', label: 'Preview', icon: <Eye className="h-3.5 w-3.5" /> },
            ]}
            activeTab={mode}
            onChange={(m) => setMode(m as any)}
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateField('isFavorite', !value.isFavorite)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                value.isFavorite
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={value.isFavorite ? 'Favorited' : 'Favorite'}
            >
              <Star
                className={cn('h-4 w-4', value.isFavorite && 'fill-amber-500')}
              />
            </button>

            <button
              type="button"
              onClick={() => updateField('isPinned', !value.isPinned)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                value.isPinned
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={value.isPinned ? 'Pinned' : 'Pin'}
            >
              <Pin className={cn('h-4 w-4', value.isPinned && 'fill-primary')} />
            </button>

            <button
              type="button"
              onClick={() => updateField('isArchived', !value.isArchived)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                value.isArchived
                  ? 'text-sky-500 hover:bg-sky-500/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={value.isArchived ? 'Archived' : 'Archive'}
            >
              <Archive className="h-4 w-4" />
            </button>

            {onOpenVersionHistory && !isNew && (
              <button
                type="button"
                onClick={onOpenVersionHistory}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Version History"
              >
                <History className="h-4 w-4" />
              </button>
            )}

            {onDelete && !isNew && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete note"
              >
                <Trash className="h-4 w-4" />
              </button>
            )}

            {onManualSave && (
              <Button
                size="sm"
                onClick={onManualSave}
                leftIcon={<Save className="h-3.5 w-3.5" />}
                className="ml-2"
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Title & Metadata bar */}
      <div className="p-5 pb-3 space-y-3">
        <input
          type="text"
          value={value.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Note title..."
          className="w-full bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />

        {/* Tag selection & Color palette */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          <TagSelect
            selectedTags={value.tags}
            availableTags={availableTags}
            onChange={(tags) => updateField('tags', tags)}
          />

          <ColorPicker
            selectedColor={value.color}
            onChange={(color) => updateField('color', color)}
          />
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col min-h-[360px] border-t border-border/60 bg-background/60">
        {mode !== 'preview' && (
          <MarkdownToolbar onInsert={handleInsert} />
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
          {/* Textarea Editor */}
          {mode !== 'preview' && (
            <div
              className={cn(
                'relative h-full overflow-y-auto p-5',
                mode === 'edit' ? 'col-span-full' : 'border-r border-border/60'
              )}
            >
              <textarea
                ref={textareaRef}
                value={value.content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your note in markdown... (Type [[ to link notes, Ctrl+B bold, Ctrl+I italic, Ctrl+S save)"
                className="w-full h-full min-h-[300px] resize-none bg-transparent font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />

              <NoteLinkAutocomplete
                isOpen={isLinkAutocompleteOpen}
                notes={workspaceNotes}
                searchQuery={linkSearchQuery}
                selectedIndex={linkSelectedIndex}
                onSelectNote={handleSelectNoteLink}
                onClose={() => setIsLinkAutocompleteOpen(false)}
              />
            </div>
          )}

          {/* Preview Panel */}
          {mode !== 'edit' && (
            <div
              className={cn(
                'h-full overflow-y-auto bg-muted/20',
                mode === 'preview' ? 'col-span-full' : ''
              )}
            >
              <EditorPreview content={value.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
