import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tag } from '../../types';
import {
  Compass,
  FileText,
  Star,
  Pin,
  Archive,
  Trash2,
  Settings,
  Plus,
  X,
  Tag as TagIcon,
  Calendar,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotelyLogo } from '../common/NotelyLogo';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  tags?: Tag[];
  onOpenTagManager: () => void;
}

export function MobileNav({
  isOpen,
  onClose,
  tags = [],
  onOpenTagManager,
}: MobileNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <Compass className="h-5 w-5" /> },
    { to: '/today', label: 'Today (Daily Note)', icon: <Calendar className="h-5 w-5" /> },
    { to: '/notes', label: 'All Notes', icon: <FileText className="h-5 w-5" /> },
    { to: '/favorites', label: 'Favorites', icon: <Star className="h-5 w-5" /> },
    { to: '/pinned', label: 'Pinned', icon: <Pin className="h-5 w-5" /> },
    { to: '/archive', label: 'Archive', icon: <Archive className="h-5 w-5" /> },
    { to: '/trash', label: 'Trash', icon: <Trash2 className="h-5 w-5" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-background text-sidebar-foreground p-5 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
            <NotelyLogo size="md" />
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Create Note */}
          <div className="py-4">
            <button
              type="button"
              onClick={() => {
                navigate('/notes/new');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Note</span>
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50'
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Tags list in mobile drawer */}
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Tags
              </span>
              <button
                type="button"
                onClick={() => {
                  onOpenTagManager();
                  onClose();
                }}
                className="text-xs text-primary font-medium"
              >
                Manage
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => {
                    navigate(`/notes?tag=${encodeURIComponent(tag.name)}`);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <TagIcon className="h-3 w-3" />
                    <span className="truncate">{tag.name}</span>
                  </div>
                  {tag.noteCount !== undefined && <span>{tag.noteCount}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-sidebar-border">
          Notely v1.0.0
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        type="button"
        onClick={() => navigate('/notes/new')}
        className="md:hidden fixed right-5 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95 transition-transform"
        aria-label="Create note"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}
