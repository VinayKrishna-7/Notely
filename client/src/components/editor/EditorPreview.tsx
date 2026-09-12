import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { Note } from '../../types';
import { cn } from '../../utils/cn';

interface EditorPreviewProps {
  content: string;
  notes?: Note[];
  className?: string;
  placeholder?: string;
}

export function EditorPreview({
  content,
  notes: customNotes,
  className,
  placeholder = 'Nothing to preview yet...',
}: EditorPreviewProps) {
  // Fetch notes for wiki-link resolution if not provided
  const { notes: fetchedNotes } = useNotes();
  const allNotes = customNotes || fetchedNotes;

  // Pre-process content replacing [[Note Title]] with notely-link custom hrefs
  const processedContent = useMemo(() => {
    if (!content) return '';
    return content.replace(/\[\[(.*?)\]\]/g, (_match, title) => {
      const clean = title.trim();
      return `[__WIKI_LINK__:${clean}](notely-link:${encodeURIComponent(clean)})`;
    });
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <div className={cn('p-6 text-sm text-muted-foreground/60 italic', className)}>
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none p-6 text-sm sm:text-base leading-relaxed break-words',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, children, ...props }) => {
            if (href?.startsWith('notely-link:')) {
              const rawTitle = decodeURIComponent(href.replace('notely-link:', ''));
              const matchedNote = allNotes.find(
                (n) =>
                  (n.title || '').trim().toLowerCase() === rawTitle.toLowerCase() &&
                  !n.isDeleted
              );

              if (matchedNote) {
                return (
                  <Link
                    to={`/notes/${matchedNote._id}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
                  >
                    [[{matchedNote.title}]]
                  </Link>
                );
              }

              return (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground line-through text-xs font-mono"
                  title="Referenced note was deleted or does not exist"
                >
                  [[{rawTitle || 'Deleted note'}]]
                </span>
              );
            }

            return (
              <a
                href={href}
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {children}
              </a>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                {...props}
                className="w-full border-collapse border border-border text-xs sm:text-sm"
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              {...props}
              className="border border-border bg-muted/60 px-3 py-2 text-left font-semibold text-foreground"
            />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-border px-3 py-2 text-foreground" />
          ),
          input: ({ node, ...props }) => (
            <input
              {...props}
              className="mr-2 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-primary/60 bg-muted/30 py-1 px-4 my-3 italic text-muted-foreground rounded-r"
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
