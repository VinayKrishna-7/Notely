import React from 'react';

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !query.trim() || !text) {
    return text;
  }

  const cleanQuery = query.trim();
  // Escape regex special characters
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, index) => {
    if (part.toLowerCase() === cleanQuery.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-amber-200 dark:bg-amber-500/30 text-foreground rounded-sm px-0.5 font-medium transition-colors"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}
