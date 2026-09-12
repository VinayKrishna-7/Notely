import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNote } from '../hooks/useNote';
import { useNotes } from '../hooks/useNotes';
import { useTags } from '../hooks/useTags';
import { EditorPreview } from '../components/editor/EditorPreview';
import { MarkdownEditor, EditorValue } from '../components/editor/MarkdownEditor';
import { TagBadge } from '../components/tags/TagBadge';
import { NOTE_COLORS } from '../utils/colors';
import { formatNoteDate, calculateReadingTime } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { PageSkeleton } from '../components/ui/skeleton';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { VersionHistoryPanel } from '../components/versions/VersionHistoryPanel';
import { BacklinksPanel } from '../components/notes/BacklinksPanel';
import {
  ArrowLeft,
  Edit,
  Star,
  Pin,
  Archive,
  Trash,
  Clock,
  BookOpen,
  History,
} from 'lucide-react';
import { cn } from '../utils/cn';

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { note, isLoading, updateNote } = useNote(id);
  const {
    toggleFavorite,
    togglePin,
    toggleArchive,
    deleteNote,
  } = useNotes();
  const { tags } = useTags();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!note) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Note not found</h2>
        <p className="text-sm text-muted-foreground">
          The requested note may have been deleted or moved.
        </p>
        <Button onClick={() => navigate('/notes')} size="sm">
          Return to All Notes
        </Button>
      </div>
    );
  }

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.default;
  const readingTime = calculateReadingTime(note.content);
  const availableTagNames = tags.map((t) => t.name);

  if (isEditing) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <MarkdownEditor
          initialValue={{
            title: note.title,
            content: note.content,
            tags: note.tags || [],
            color: note.color || 'default',
            isFavorite: note.isFavorite,
            isPinned: note.isPinned,
            isArchived: note.isArchived,
          }}
          availableTags={availableTagNames}
          onChange={async (val) => {
            await updateNote(val);
          }}
          onCancel={() => setIsEditing(false)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleFavorite(note)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isFavorite
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={note.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
          >
            <Star
              className={cn('h-4 w-4', note.isFavorite && 'fill-amber-500')}
            />
          </button>

          <button
            type="button"
            onClick={() => togglePin(note)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isPinned
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={cn('h-4 w-4', note.isPinned && 'fill-primary')} />
          </button>

          <button
            type="button"
            onClick={() => toggleArchive(note)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.isArchived
                ? 'text-sky-500 bg-sky-500/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={note.isArchived ? 'Unarchive Note' : 'Archive Note'}
          >
            <Archive className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsVersionHistoryOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Version History"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Move to Trash"
          >
            <Trash className="h-4 w-4" />
          </button>

          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit className="h-4 w-4" />}
            className="ml-2"
          >
            Edit Note
          </Button>
        </div>
      </div>

      {/* Note Reader Card */}
      <article
        className={cn(
          'rounded-2xl border p-6 sm:p-10 shadow-sm transition-all',
          colorConfig.bg,
          colorConfig.darkBg,
          colorConfig.border,
          colorConfig.darkBorder
        )}
      >
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug mb-3">
          {note.title || 'Untitled Note'}
        </h1>

        {/* Metadata & Tag row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatNoteDate(note.updatedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {note.tags.map((tag) => (
                <TagBadge
                  key={tag}
                  name={tag}
                  onClick={() => navigate(`/notes?tag=${encodeURIComponent(tag)}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Markdown Rendered Body */}
        <div className="mt-6">
          <EditorPreview content={note.content} />
        </div>
      </article>

      {/* Backlinks Section */}
      <BacklinksPanel noteId={note._id} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          await deleteNote(note);
          setIsDeleteDialogOpen(false);
          navigate('/notes');
        }}
        title="Move to Trash?"
        description="This note will be moved to the trash. You can restore it later if needed."
        confirmLabel="Move to Trash"
      />

      <VersionHistoryPanel
        noteId={note._id}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onVersionRestored={() => {
          setIsVersionHistoryOpen(false);
        }}
      />
    </div>
  );
}
