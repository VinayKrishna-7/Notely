import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrlOrMeta = shortcut.ctrlOrMeta ? e.ctrlKey || e.metaKey : true;
        const matchesShift = shortcut.shift ? e.shiftKey : !e.shiftKey || shortcut.shift === undefined;
        const matchesAlt = shortcut.alt ? e.altKey : !e.altKey || shortcut.alt === undefined;

        if (matchesKey && matchesCtrlOrMeta && (shortcut.shift === undefined || matchesShift) && (shortcut.alt === undefined || matchesAlt)) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
