import React from 'react';
import { Dialog, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { section: 'Global', items: [
      { keys: ['Ctrl', 'K'], desc: 'Open Omnisearch / Command Palette' },
      { keys: ['Ctrl', 'N'], desc: 'Create a new note' },
      { keys: ['Esc'], desc: 'Close open dialogs & menus' },
    ]},
    { section: 'Markdown Editor', items: [
      { keys: ['Ctrl', 'B'], desc: 'Toggle bold formatting' },
      { keys: ['Ctrl', 'I'], desc: 'Toggle italic formatting' },
      { keys: ['Ctrl', 'S'], desc: 'Save note immediately' },
    ]},
    { section: 'Navigation', items: [
      { keys: ['↑', '↓'], desc: 'Navigate search results' },
      { keys: ['Enter'], desc: 'Open highlighted note / tag' },
    ]}
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-primary" />
          Keyboard Shortcuts
        </span>
      }
      description="Quickly navigate and edit notes using your keyboard."
      maxWidth="md"
    >
      <div className="space-y-4 pt-2">
        {shortcuts.map((group) => (
          <div key={group.section} className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {group.section}
            </h4>
            <div className="rounded-lg border border-border divide-y divide-border bg-card">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 text-xs"
                >
                  <span className="text-foreground">{item.desc}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Got it
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
