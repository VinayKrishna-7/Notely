import { NoteColor } from '../types';

export interface NoteColorConfig {
  name: string;
  bg: string;
  darkBg: string;
  border: string;
  darkBorder: string;
  accent: string;
  badge: string;
}

export const NOTE_COLORS: Record<NoteColor, NoteColorConfig> = {
  default: {
    name: 'Default',
    bg: 'bg-card',
    darkBg: 'dark:bg-card',
    border: 'border-border',
    darkBorder: 'dark:border-border',
    accent: 'text-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
  rose: {
    name: 'Rose',
    bg: 'bg-rose-50/60',
    darkBg: 'dark:bg-rose-950/20',
    border: 'border-rose-200/80',
    darkBorder: 'dark:border-rose-900/50',
    accent: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
  amber: {
    name: 'Amber',
    bg: 'bg-amber-50/60',
    darkBg: 'dark:bg-amber-950/20',
    border: 'border-amber-200/80',
    darkBorder: 'dark:border-amber-900/50',
    accent: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  emerald: {
    name: 'Emerald',
    bg: 'bg-emerald-50/60',
    darkBg: 'dark:bg-emerald-950/20',
    border: 'border-emerald-200/80',
    darkBorder: 'dark:border-emerald-900/50',
    accent: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  sky: {
    name: 'Sky',
    bg: 'bg-sky-50/60',
    darkBg: 'dark:bg-sky-950/20',
    border: 'border-sky-200/80',
    darkBorder: 'dark:border-sky-900/50',
    accent: 'text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  },
  indigo: {
    name: 'Indigo',
    bg: 'bg-indigo-50/60',
    darkBg: 'dark:bg-indigo-950/20',
    border: 'border-indigo-200/80',
    darkBorder: 'dark:border-indigo-900/50',
    accent: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  violet: {
    name: 'Violet',
    bg: 'bg-violet-50/60',
    darkBg: 'dark:bg-violet-950/20',
    border: 'border-violet-200/80',
    darkBorder: 'dark:border-violet-900/50',
    accent: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  },
};
