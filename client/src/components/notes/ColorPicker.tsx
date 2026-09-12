import React from 'react';
import { NoteColor } from '../../types';
import { NOTE_COLORS } from '../../utils/colors';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ColorPickerProps {
  selectedColor: NoteColor;
  onChange: (color: NoteColor) => void;
  className?: string;
}

export function ColorPicker({
  selectedColor,
  onChange,
  className,
}: ColorPickerProps) {
  const colors: NoteColor[] = ['default', 'rose', 'amber', 'emerald', 'sky', 'indigo', 'violet'];

  const colorBgMap: Record<NoteColor, string> = {
    default: 'bg-card border-border',
    rose: 'bg-rose-400 dark:bg-rose-600 border-rose-500',
    amber: 'bg-amber-400 dark:bg-amber-600 border-amber-500',
    emerald: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500',
    sky: 'bg-sky-400 dark:bg-sky-600 border-sky-500',
    indigo: 'bg-indigo-400 dark:bg-indigo-600 border-indigo-500',
    violet: 'bg-purple-400 dark:bg-purple-600 border-purple-500',
  };

  return (
    <div className={cn('flex items-center gap-1.5 p-1', className)}>
      {colors.map((c) => {
        const isSelected = selectedColor === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={NOTE_COLORS[c].name}
            className={cn(
              'relative h-6 w-6 rounded-full border transition-all duration-150 flex items-center justify-center hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              colorBgMap[c],
              isSelected && 'ring-2 ring-primary ring-offset-1 scale-105'
            )}
          >
            {isSelected && (
              <Check
                className={cn(
                  'h-3.5 w-3.5',
                  c === 'default' ? 'text-foreground' : 'text-white'
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
