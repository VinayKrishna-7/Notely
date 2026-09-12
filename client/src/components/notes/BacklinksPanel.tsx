import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBacklinks } from '../../hooks/useBacklinks';
import { Link2, ArrowUpRight, Clock, FileText } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';
import { TagBadge } from '../tags/TagBadge';

interface BacklinksPanelProps {
  noteId?: string;
  className?: string;
}

export function BacklinksPanel({ noteId, className }: BacklinksPanelProps) {
  const navigate = useNavigate();
  const { backlinks, isLoading } = useBacklinks(noteId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-14 w-full rounded-xl bg-muted/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs ${className || ''}`}>
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Backlinks ({backlinks.length})
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Notes that reference this document
        </span>
      </div>

      {backlinks.length === 0 ? (
        <div className="py-4 text-center text-xs text-muted-foreground/80">
          <p className="italic">No other notes link to this note yet.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            Type <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] text-primary">[[Note Title]]</code> in any note to link here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {backlinks.map((link) => (
            <div
              key={link._id}
              onClick={() => navigate(`/notes/${link._id}`)}
              className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/60 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(link.updatedAt)}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              {link.snippet && (
                <p className="text-[11px] text-muted-foreground/90 font-mono bg-background/50 px-2 py-1 rounded border border-border/40 truncate">
                  {link.snippet}
                </p>
              )}

              {link.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {link.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
