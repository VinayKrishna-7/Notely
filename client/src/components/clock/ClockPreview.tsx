import React from 'react';
import { ClockPreferences } from '../../types';
import { ClockWidget } from './ClockWidget';
import { Sparkles } from 'lucide-react';

interface ClockPreviewProps {
  preferences: ClockPreferences;
  className?: string;
}

export function ClockPreview({ preferences, className = '' }: ClockPreviewProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card/80 to-muted/30 p-6 flex flex-col items-center justify-center min-h-[140px] text-center shadow-2xs ${className}`}
      aria-live="polite"
    >
      {/* Background subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>Live Preview</span>
      </div>

      {preferences.enabled ? (
        <div className="py-2 transform transition-all duration-200">
          <ClockWidget
            preferences={preferences}
            size="preview"
          />
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            Clock is currently disabled.
          </p>
          <span className="text-[11px] text-muted-foreground/70 mt-0.5 block">
            Toggle "Enable Live Clock" below to activate.
          </span>
        </div>
      )}
    </div>
  );
}
