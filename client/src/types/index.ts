export type NoteColor = 'default' | 'rose' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'violet';

export interface Note {
  _id: string;
  id?: string; // alias if needed
  user: string;
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  sortOrder?: number;
  isDaily?: boolean;
  dailyDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteVersion {
  _id: string;
  note: string;
  user: string;
  title: string;
  content: string;
  tags: string[];
  color: NoteColor;
  changeSummary?: string;
  createdAt: string;
}

export interface Backlink {
  _id: string;
  title: string;
  snippet: string;
  color: NoteColor;
  tags: string[];
  updatedAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  color?: string;
  noteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ClockStyle =
  | 'minimal'
  | 'dateTime'
  | 'digital'
  | 'compact'
  | 'productivity'
  | 'seconds'
  | 'focus'
  | 'analog';

export type ClockTimeFormat = '12h' | '24h';
export type ClockAccent = 'neutral' | 'accent' | 'muted';

export interface ClockPreferences {
  enabled: boolean;
  style: ClockStyle;
  timeFormat: ClockTimeFormat;
  showSeconds: boolean;
  showDate: boolean;
  accent: ClockAccent;
}

export const DEFAULT_CLOCK_PREFERENCES: ClockPreferences = {
  enabled: true,
  style: 'minimal',
  timeFormat: '12h',
  showSeconds: false,
  showDate: false,
  accent: 'neutral',
};

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  themePreference?: 'light' | 'dark' | 'system';
  editorPreferences?: {
    defaultMode?: 'edit' | 'split' | 'preview';
    autoSaveDelay?: number;
    density?: 'comfortable' | 'compact';
  };
  clockPreferences?: ClockPreferences;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'updatedAt' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export type NoteSortOption = 
  | 'updated_desc'
  | 'updated_asc'
  | 'created_desc'
  | 'created_asc'
  | 'title_asc'
  | 'title_desc'
  | 'order_asc';

export interface NoteFilterState {
  search: string;
  tag: string | null;
  color: NoteColor | null;
  sort: NoteSortOption;
  viewMode: 'grid' | 'list';
}

export interface DashboardStats {
  totalNotes: number;
  favoritesCount: number;
  pinnedCount: number;
  archivedCount: number;
  trashCount: number;
  createdThisWeek: number;
  tagStats: { name: string; count: number }[];
  recentlyUpdated: Note[];
  activityByDay?: { day: string; date: string; count: number }[];
  writingStreak?: number;
  totalWords?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
