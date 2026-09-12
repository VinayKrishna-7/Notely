import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileNav } from '../components/layout/MobileNav';
import { CommandPalette } from '../components/layout/CommandPalette';
import { KeyboardShortcutsModal } from '../components/layout/KeyboardShortcutsModal';
import { TagManagerModal } from '../components/tags/TagManagerModal';
import { OfflineIndicator } from '../components/common/OfflineIndicator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSidebar } from '../contexts/SidebarContext';
import { useTags } from '../hooks/useTags';
import { useNotes } from '../hooks/useNotes';
import { useStats } from '../hooks/useStats';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isCollapsed, toggleCollapse, isMobileOpen, openMobile, closeMobile } = useSidebar();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const { tags, createTag, updateTag, deleteTag } = useTags();
  const { notes } = useNotes();
  const { stats } = useStats();

  // Global keyboard shortcuts (Ctrl+K, Ctrl+N)
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlOrMeta: true,
      handler: () => setIsCommandPaletteOpen((prev) => !prev),
    },
    {
      key: 'n',
      ctrlOrMeta: true,
      handler: () => navigate('/notes/new'),
    },
  ]);

  const counts = {
    all: stats?.totalNotes ?? notes.filter((n) => !n.isDeleted && !n.isArchived).length,
    favorites: stats?.favoritesCount ?? notes.filter((n) => n.isFavorite && !n.isDeleted).length,
    pinned: stats?.pinnedCount ?? notes.filter((n) => n.isPinned && !n.isDeleted).length,
    archive: stats?.archivedCount ?? notes.filter((n) => n.isArchived && !n.isDeleted).length,
    trash: stats?.trashCount ?? notes.filter((n) => n.isDeleted).length,
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop & Tablet */}
      <Sidebar
        counts={counts}
        tags={tags}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onOpenTagManager={() => setIsTagManagerOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        className="hidden md:flex"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <OfflineIndicator />
        <Header
          user={user}
          theme={theme}
          onThemeChange={setTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={openMobile}
          onLogout={logout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer & FAB */}
      <MobileNav
        isOpen={isMobileOpen}
        onClose={closeMobile}
        tags={tags}
        onOpenTagManager={() => setIsTagManagerOpen(true)}
      />

      {/* Global Command Palette Omnisearch */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        tags={tags}
      />

      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tags}
        onCreateTag={createTag}
        onUpdateTag={updateTag}
        onDeleteTag={deleteTag}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
