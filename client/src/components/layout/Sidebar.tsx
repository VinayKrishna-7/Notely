import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tag } from '../../types';
import { TagBadge } from '../tags/TagBadge';
import {
  FileText,
  Star,
  Pin,
  Archive,
  Trash2,
  Tag as TagIcon,
  Settings,
  Plus,
  Compass,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotelyLogo } from '../common/NotelyLogo';

interface SidebarProps {
  counts?: {
    all?: number;
    favorites?: number;
    pinned?: number;
    archive?: number;
    trash?: number;
  };
  tags?: Tag[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenTagManager: () => void;
  onOpenShortcuts: () => void;
  className?: string;
}

export function Sidebar({
  counts = {},
  tags = [],
  isCollapsed,
  onToggleCollapse,
  onOpenTagManager,
  onOpenShortcuts,
  className,
}: SidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <Compass className="h-4 w-4" />,
      exact: true,
    },
    {
      to: '/today',
      label: 'Today',
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
    {
      to: '/notes',
      label: 'All Notes',
      icon: <FileText className="h-4 w-4" />,
      count: counts.all,
    },
    {
      to: '/favorites',
      label: 'Favorites',
      icon: <Star className="h-4 w-4" />,
      count: counts.favorites,
    },
    {
      to: '/pinned',
      label: 'Pinned',
      icon: <Pin className="h-4 w-4" />,
      count: counts.pinned,
    },
    {
      to: '/archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      count: counts.archive,
    },
    {
      to: '/trash',
      label: 'Trash',
      icon: <Trash2 className="h-4 w-4" />,
      count: counts.trash,
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-all duration-300 select-none h-screen sticky top-0',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <NotelyLogo size={isCollapsed ? 'sm' : 'md'} showText={!isCollapsed} />
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Quick New Note Action Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => navigate('/notes/new')}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg bg-primary font-medium text-xs text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98]',
              isCollapsed ? 'h-9 px-0' : 'h-9 px-3'
            )}
            title="Create New Note (Ctrl+N)"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>New Note</span>}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 px-2 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors group',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                  isCollapsed && 'justify-center px-0'
                )
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span className="ml-auto rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Tags section */}
        {!isCollapsed && (
          <div className="mt-6 px-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </span>
              <button
                type="button"
                onClick={onOpenTagManager}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Manage
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {tags.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 italic py-1">
                  No tags yet
                </p>
              ) : (
                tags.slice(0, 8).map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => navigate(`/notes?tag=${encodeURIComponent(tag.name)}`)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors text-left group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <TagIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    {tag.noteCount !== undefined && tag.noteCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {tag.noteCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!isCollapsed && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <Command className="h-3.5 w-3.5" />
            <span>Shortcuts</span>
            <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
              Ctrl+K
            </span>
          </button>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
              isCollapsed && 'justify-center px-0'
            )
          }
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
