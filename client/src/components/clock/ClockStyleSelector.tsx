import React from 'react';
import { ClockPreferences, ClockStyle } from '../../types';
import { CLOCK_STYLES_METADATA } from '../../utils/clockFormatters';
import { ClockWidget } from './ClockWidget';
import { Check } from 'lucide-react';

interface ClockStyleSelectorProps {
  selectedStyle: ClockStyle;
  preferences: ClockPreferences;
  onSelectStyle: (style: ClockStyle) => void;
  disabled?: boolean;
}

export function ClockStyleSelector({
  selectedStyle,
  preferences,
  onSelectStyle,
  disabled = false,
}: ClockStyleSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select Clock Style"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
    >
      {CLOCK_STYLES_METADATA.map((item) => {
        const isSelected = selectedStyle === item.id;
        const cardPrefs: ClockPreferences = {
          ...preferences,
          style: item.id,
        };

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${item.name} clock style`}
            disabled={disabled}
            onClick={() => onSelectStyle(item.id)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onSelectStyle(item.id);
              }
            }}
            className={`relative group flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-border bg-muted/20'
                : isSelected
                ? 'border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/40'
                : 'border-border bg-card hover:bg-muted/40 hover:border-border/80'
            }`}
          >
            {/* Top Selection Status & Name */}
            <div className="flex items-center justify-between gap-2 mb-2 w-full">
              <span className="text-xs font-semibold text-foreground truncate">
                {item.name}
              </span>
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-background'
                }`}
              >
                {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
            </div>

            {/* Live Visual Card Mini-Widget */}
            <div className="h-14 w-full rounded-lg bg-muted/40 flex items-center justify-center p-2 border border-border/40 overflow-hidden">
              <ClockWidget
                preferences={cardPrefs}
                size="compact"
                className="transform scale-95 transition-transform group-hover:scale-100"
              />
            </div>

            {/* Description */}
            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1 leading-snug">
              {item.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
