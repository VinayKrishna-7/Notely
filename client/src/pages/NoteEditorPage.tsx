import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNote } from '../hooks/useNote';
import { useTags } from '../hooks/useTags';
import { MarkdownEditor, EditorValue } from '../components/editor/MarkdownEditor';
import { useAutoSave } from '../hooks/useAutoSave';
import { PageSkeleton } from '../components/ui/skeleton';
import { VersionHistoryPanel } from '../components/versions/VersionHistoryPanel';
import { NoteColor } from '../types';

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const { note, isLoading, createNote, updateNote } = useNote(id);
  const { tags } = useTags();

  const [editorValue, setEditorValue] = useState<EditorValue>({
    title: '',
    content: '',
    tags: [],
    color: 'default' as NoteColor,
    isFavorite: false,
    isPinned: false,
    isArchived: false,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Sync loaded note into state
  useEffect(() => {
    if (note) {
      setEditorValue({
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        color: note.color || 'default',
        isFavorite: note.isFavorite,
        isPinned: note.isPinned,
        isArchived: note.isArchived,
      });
    }
  }, [note]);

  // Handle Save
  const handleSave = async (val: EditorValue) => {
    if (isNew) {
      // Create new note only if title or content has text
      if (!val.title.trim() && !val.content.trim()) return;
      const created = await createNote(val);
      if (created?._id) {
        navigate(`/notes/${created._id}`, { replace: true });
      }
    } else if (id) {
      await updateNote(val);
    }
  };

  // Auto-save engine
  const { status: autoSaveStatus, lastSavedAt, triggerSave } = useAutoSave({
    value: editorValue,
    onSave: handleSave,
    delay: 1000,
    enabled: true,
  });

  if (!isNew && isLoading) {
    return <PageSkeleton />;
  }

  const availableTagNames = tags.map((t) => t.name);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <MarkdownEditor
        initialValue={editorValue}
        availableTags={availableTagNames}
        saveStatus={autoSaveStatus}
        lastSavedAt={lastSavedAt}
        onChange={(val) => setEditorValue(val)}
        onManualSave={triggerSave}
        onCancel={() => navigate(-1)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        isNew={isNew}
      />

      <VersionHistoryPanel
        noteId={note?._id}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onVersionRestored={() => {
          setIsVersionHistoryOpen(false);
        }}
      />
    </div>
  );
}
