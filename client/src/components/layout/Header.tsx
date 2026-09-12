import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import { Dropdown } from '../ui/dropdown';
import { Button } from '../ui/button';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Laptop,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
} from 'lucide-react';
import { SyncIndicator } from '../common/SyncIndicator';
import { ClockWidget } from '../clock/ClockWidget';

interface HeaderProps {
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  className?: string;
}

export function Header({
  user,
  theme,
  onThemeChange,
  onOpenCommandPalette,
  onOpenMobileMenu,
  onLogout,
  className,
}: HeaderProps) {
  const navigate = useNavigate();

  const themeIcon =
    theme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : theme === 'light' ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Laptop className="h-4 w-4" />
    );

  const themeMenuItems = [
    {
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      onClick: () => onThemeChange('light'),
    },
    {
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      onClick: () => onThemeChange('dark'),
    },
    {
      label: 'System',
      icon: <Laptop className="h-4 w-4" />,
      onClick: () => onThemeChange('system'),
    },
  ];

  const userMenuItems = [
    {
      label: user?.name || 'My Account',
      icon: <UserIcon className="h-4 w-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => navigate('/settings'),
    },
    'separator' as const,
    {
      label: 'Sign Out',
      icon: <LogOut className="h-4 w-4 text-destructive" />,
      variant: 'destructive' as const,
      onClick: onLogout,
    },
  ];

  return (
    <header className={`h-16 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 ${className || ''}`}>
      {/* Mobile Hamburger & Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Palette Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between rounded-lg border border-input bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
            <span>Search notes, tags, content...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <SyncIndicator className="hidden xs:inline-flex" />

        <ClockWidget
          size="header"
          className="hidden md:inline-flex px-2 py-1 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors"
        />

        <Button
          size="sm"
          onClick={() => navigate('/notes/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="hidden sm:inline-flex"
        >
          Create Note
        </Button>

        {/* Theme Switcher Dropdown */}
        <Dropdown
          trigger={
            <button
              type="button"
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {themeIcon}
            </button>
          }
          items={themeMenuItems}
        />

        {/* User Profile Avatar / Menu */}
        <Dropdown
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-ring focus:outline-none transition-all"
              aria-label="User account"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs border border-primary/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
