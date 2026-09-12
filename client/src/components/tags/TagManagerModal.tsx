import React, { useState } from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tag } from '../../types';
import { TagBadge } from './TagBadge';
import { Plus, Edit2, Trash2, Check, X, Tag as TagIcon } from 'lucide-react';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (name: string) => Promise<any>;
  onUpdateTag: (id: string, name: string) => Promise<any>;
  onDeleteTag: (id: string) => Promise<any>;
}

export function TagManagerModal({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagerModalProps) {
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateTag(newTagName.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewTagName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag._id);
    setEditName(tag.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateTag(id, editName.trim().toLowerCase().replace(/\s+/g, '-'));
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-primary" />
          Manage Tags
        </span>
      }
      description="Create, rename, or delete tags across all your notes."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {/* Create new tag form */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name (e.g. work, design)..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newTagName.trim() || isSubmitting}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add
          </Button>
        </form>

        {/* Tags list */}
        <div className="rounded-lg border border-border divide-y divide-border max-h-64 overflow-y-auto">
          {tags.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No tags yet. Add your first tag above.
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag._id}
                className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors"
              >
                {editingId === tag._id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tag._id)}
                      className="p-1 text-primary hover:bg-primary/10 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-muted-foreground hover:bg-muted rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TagBadge name={tag.name} count={tag.noteCount || 0} />
                  </div>
                )}

                {editingId !== tag._id && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      title="Rename tag"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTag(tag._id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
