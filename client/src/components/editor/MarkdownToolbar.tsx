import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  FileCode,
  Quote,
  Link as LinkIcon,
  Minus,
} from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

type ToolItem =
  | {
      name: string;
      shortcut: string;
      icon: React.ReactNode;
      action: () => void;
    }
  | 'separator';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  disabled?: boolean;
}

export function MarkdownToolbar({ onInsert, disabled }: MarkdownToolbarProps) {
  const tools: ToolItem[] = [
    {
      name: 'Bold',
      shortcut: 'Ctrl+B',
      icon: <Bold className="h-4 w-4" />,
      action: () => onInsert('**', '**', 'bold text'),
    },
    {
      name: 'Italic',
      shortcut: 'Ctrl+I',
      icon: <Italic className="h-4 w-4" />,
      action: () => onInsert('*', '*', 'italic text'),
    },
    {
      name: 'Strikethrough',
      shortcut: '',
      icon: <Strikethrough className="h-4 w-4" />,
      action: () => onInsert('~~', '~~', 'strikethrough text'),
    },
    'separator',
    {
      name: 'Heading 1',
      shortcut: '',
      icon: <Heading1 className="h-4 w-4" />,
      action: () => onInsert('# ', '', 'Heading 1'),
    },
    {
      name: 'Heading 2',
      shortcut: '',
      icon: <Heading2 className="h-4 w-4" />,
      action: () => onInsert('## ', '', 'Heading 2'),
    },
    {
      name: 'Heading 3',
      shortcut: '',
      icon: <Heading3 className="h-4 w-4" />,
      action: () => onInsert('### ', '', 'Heading 3'),
    },
    'separator',
    {
      name: 'Checklist',
      shortcut: '',
      icon: <CheckSquare className="h-4 w-4" />,
      action: () => onInsert('- [ ] ', '', 'Task item'),
    },
    {
      name: 'Bullet List',
      shortcut: '',
      icon: <List className="h-4 w-4" />,
      action: () => onInsert('- ', '', 'List item'),
    },
    {
      name: 'Numbered List',
      shortcut: '',
      icon: <ListOrdered className="h-4 w-4" />,
      action: () => onInsert('1. ', '', 'Numbered item'),
    },
    'separator',
    {
      name: 'Inline Code',
      shortcut: '',
      icon: <Code className="h-4 w-4" />,
      action: () => onInsert('`', '`', 'code'),
    },
    {
      name: 'Code Block',
      shortcut: '',
      icon: <FileCode className="h-4 w-4" />,
      action: () => onInsert('```javascript\n', '\n```', '// code here'),
    },
    {
      name: 'Blockquote',
      shortcut: '',
      icon: <Quote className="h-4 w-4" />,
      action: () => onInsert('> ', '', 'Quote text'),
    },
    {
      name: 'Link',
      shortcut: '',
      icon: <LinkIcon className="h-4 w-4" />,
      action: () => onInsert('[', '](https://example.com)', 'Link title'),
    },
    {
      name: 'Horizontal Rule',
      shortcut: '',
      icon: <Minus className="h-4 w-4" />,
      action: () => onInsert('\n---\n', '', ''),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border bg-muted/40 rounded-t-lg">
      {tools.map((tool, index) => {
        if (tool === 'separator') {
          return (
            <div key={index} className="h-4 w-px bg-border/80 mx-1 shrink-0" />
          );
        }

        return (
          <Tooltip
            key={tool.name}
            content={`${tool.name}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            position="top"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={tool.action}
              className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground hover:shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={tool.name}
            >
              {tool.icon}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
