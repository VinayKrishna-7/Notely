import React from 'react';
import { cn } from '../../utils/cn';

interface NotelyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function NotelyLogo({
  size = 'md',
  showText = true,
  className,
}: NotelyLogoProps) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-black',
  };

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Modern Note Book & Pen Logo Graphic */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm border border-zinc-800/80 dark:border-zinc-200 transition-transform duration-200 group-hover:scale-105',
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3/5 w-3/5"
        >
          {/* Folded corner notebook with pencil accent */}
          <path d="M16 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('tracking-tight text-foreground leading-none font-bold', textSizes[size])}>
            Notely
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase mt-0.5">
              Workspace
            </span>
          )}
        </div>
      )}
    </div>
  );
}
