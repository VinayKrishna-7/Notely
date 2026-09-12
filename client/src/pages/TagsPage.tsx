import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTags } from '../hooks/useTags';
import { TagBadge } from '../components/tags/TagBadge';
import { TagManagerModal } from '../components/tags/TagManagerModal';
import { Button } from '../components/ui/button';
import { Tag as TagIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export function TagsPage() {
  const navigate = useNavigate();
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTags();
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-primary" />
            <span>Tags</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organize and categorize your notes with reusable tags.
          </p>
        </div>

        <Button
          onClick={() => setIsManagerOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          size="sm"
        >
          Manage Tags
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border">
          <TagIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-base mb-1">No tags yet</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Create tags to group your notes by project, category, or workflow.
          </p>
          <Button onClick={() => setIsManagerOpen(true)} size="sm">
            Create your first tag
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <div
              key={tag._id}
              onClick={() => navigate(`/notes?tag=${encodeURIComponent(tag.name)}`)}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <TagBadge name={tag.name} size="default" />
                <p className="text-xs text-muted-foreground pl-1">
                  {tag.noteCount || 0} {tag.noteCount === 1 ? 'note' : 'notes'}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManagerOpen(true);
                  }}
                  title="Edit tag"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TagManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        tags={tags}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
      />
    </div>
  );
}
