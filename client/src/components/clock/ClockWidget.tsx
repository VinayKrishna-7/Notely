import React from 'react';
import { useClock } from '../../hooks/useClock';
import { useAuth } from '../../contexts/AuthContext';
import {
  ClockPreferences,
  ClockStyle,
  ClockTimeFormat,
  DEFAULT_CLOCK_PREFERENCES,
} from '../../types';
import { formatDateString, formatTimeParts } from '../../utils/clockFormatters';

export interface ClockWidgetProps {
  preferences?: Partial<ClockPreferences>;
  size?: 'header' | 'dashboard' | 'preview' | 'compact';
  className?: string;
  staticDate?: Date; // For testing or fixed previews
}

export function ClockWidget({
  preferences: propPreferences,
  size = 'header',
  className = '',
  staticDate,
}: ClockWidgetProps) {
  const { user } = useAuth();
  const date = useClock(staticDate);

  // Merge user preferences from auth context with any overrides and defaults
  const userClockPrefs = user?.clockPreferences;
  const config: ClockPreferences = {
    ...DEFAULT_CLOCK_PREFERENCES,
    ...(userClockPrefs || {}),
    ...(propPreferences || {}),
  };

  if (!config.enabled) {
    return null;
  }

  const { style, timeFormat, showSeconds, showDate, accent } = config;

  // Compute formatted components
  const isSecondsActive = style === 'seconds' || style === 'digital' || showSeconds;
  const time = formatTimeParts(date, timeFormat, isSecondsActive);
  const shortDate = formatDateString(date, 'short');
  const fullDate = formatDateString(date, 'full');
  const dayName = formatDateString(date, 'dayOnly');

  // Accent color class mappings
  const accentClass =
    accent === 'accent'
      ? 'text-primary'
      : accent === 'muted'
      ? 'text-muted-foreground'
      : 'text-foreground';

  const badgeAccentClass =
    accent === 'accent'
      ? 'bg-primary/10 text-primary border-primary/30'
      : accent === 'muted'
      ? 'bg-muted/80 text-muted-foreground border-border'
      : 'bg-muted text-foreground border-border';

  // Analog Clock Render Helper
  if (style === 'analog') {
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hourDeg = (hours + minutes / 60) * 30;
    const minDeg = (minutes + seconds / 60) * 6;
    const secDeg = seconds * 6;

    const dialSize = size === 'dashboard' ? 64 : size === 'preview' ? 56 : 36;
    const center = dialSize / 2;

    return (
      <div
        className={`inline-flex items-center gap-2 select-none ${className}`}
        aria-label={`Current time: ${time.timeString}`}
        role="timer"
      >
        <div
          className="relative rounded-full border border-border bg-card shadow-2xs flex items-center justify-center"
          style={{ width: dialSize, height: dialSize }}
        >
          <svg
            width={dialSize}
            height={dialSize}
            viewBox={`0 0 ${dialSize} ${dialSize}`}
            className="overflow-visible"
          >
            {/* Hour markers at 12, 3, 6, 9 */}
            {[0, 90, 180, 270].map((deg) => (
              <line
                key={deg}
                x1={center}
                y1={4}
                x2={center}
                y2={7}
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-muted-foreground/50"
                transform={`rotate(${deg} ${center} ${center})`}
              />
            ))}

            {/* Hour hand */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={dialSize * 0.26}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className={accentClass}
              transform={`rotate(${hourDeg} ${center} ${center})`}
            />

            {/* Minute hand */}
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={dialSize * 0.16}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              className={accentClass}
              transform={`rotate(${minDeg} ${center} ${center})`}
            />

            {/* Second hand */}
            <line
              x1={center}
              y1={center + dialSize * 0.08}
              x2={center}
              y2={dialSize * 0.12}
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="round"
              className={accent === 'neutral' ? 'text-foreground/80' : 'text-primary'}
              transform={`rotate(${secDeg} ${center} ${center})`}
            />

            {/* Center pinion dot */}
            <circle
              cx={center}
              cy={center}
              r={2}
              fill="currentColor"
              className={accentClass}
            />
          </svg>
        </div>

        {/* Optional companion digital time / date */}
        {(showDate || size === 'dashboard' || size === 'preview') && (
          <div className="flex flex-col text-left">
            <span
              className={`font-semibold tabular-nums leading-tight ${
                size === 'dashboard' ? 'text-base' : 'text-xs'
              } ${accentClass}`}
            >
              {time.timeString}
            </span>
            {(showDate || size === 'dashboard') && (
              <span className="text-[11px] text-muted-foreground leading-tight">
                {shortDate}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Focus Style
  if (style === 'focus') {
    return (
      <div
        className={`inline-flex items-center gap-2 select-none ${className}`}
        aria-label={`Focus Clock: ${time.hours}:${time.minutes} ${time.period}`}
        role="timer"
      >
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${badgeAccentClass}`}
        >
          <span className="tabular-nums font-semibold tracking-tight">
            {time.hours}:{time.minutes}
            {isSecondsActive && `:${time.seconds}`}
            {time.period && <span className="ml-1 text-[10px] font-sans font-normal opacity-80">{time.period}</span>}
          </span>
          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-background/80 font-sans font-bold border border-border/50 text-foreground">
            Focus
          </span>
        </div>
        {showDate && (
          <span className="hidden sm:inline text-xs text-muted-foreground">
            {shortDate}
          </span>
        )}
      </div>
    );
  }

  // Digital Style (High visibility monospace)
  if (style === 'digital') {
    return (
      <div
        className={`inline-flex items-baseline gap-1.5 font-mono select-none ${accentClass} ${className}`}
        aria-label={`Digital time: ${time.timeString}`}
        role="timer"
      >
        <span
          className={`font-bold tabular-nums tracking-widest ${
            size === 'dashboard'
              ? 'text-2xl sm:text-3xl'
              : size === 'preview'
              ? 'text-xl'
              : 'text-sm'
          }`}
        >
          {time.hours}:{time.minutes}
          <span className="opacity-80">:{time.seconds}</span>
        </span>
        {time.period && (
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-muted-foreground">
            {time.period}
          </span>
        )}
        {showDate && (
          <span className="hidden sm:inline text-xs font-sans text-muted-foreground ml-1.5 font-normal">
            • {shortDate}
          </span>
        )}
      </div>
    );
  }

  // Date + Time Style (Stacked layout)
  if (style === 'dateTime') {
    return (
      <div
        className={`inline-flex flex-col text-right sm:text-left select-none leading-none ${className}`}
        aria-label={`Date and time: ${shortDate}, ${time.timeString}`}
        role="timer"
      >
        <span className="text-[11px] font-medium text-muted-foreground tracking-tight mb-0.5">
          {shortDate}
        </span>
        <span
          className={`font-semibold tabular-nums ${
            size === 'dashboard'
              ? 'text-xl sm:text-2xl'
              : size === 'preview'
              ? 'text-base'
              : 'text-xs sm:text-sm'
          } ${accentClass}`}
        >
          {time.timeString}
        </span>
      </div>
    );
  }

  // Productivity Style (Full date with clear time)
  if (style === 'productivity') {
    return (
      <div
        className={`inline-flex flex-col select-none leading-tight ${className}`}
        aria-label={`Productivity clock: ${fullDate}, ${time.timeString}`}
        role="timer"
      >
        <span
          className={`font-medium text-muted-foreground ${
            size === 'dashboard' ? 'text-xs sm:text-sm' : 'text-[11px]'
          }`}
        >
          {fullDate}
        </span>
        <span
          className={`font-bold tabular-nums tracking-tight ${
            size === 'dashboard'
              ? 'text-2xl sm:text-3xl'
              : size === 'preview'
              ? 'text-lg'
              : 'text-sm sm:text-base'
          } ${accentClass}`}
        >
          {time.timeString}
        </span>
      </div>
    );
  }

  // Compact Style (Time • Day / Short Date)
  if (style === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs select-none ${accentClass} ${className}`}
        aria-label={`Compact time: ${time.timeString} on ${dayName}`}
        role="timer"
      >
        <span className="font-semibold tabular-nums">{time.timeString}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground font-medium">
          {showDate ? shortDate : dayName}
        </span>
      </div>
    );
  }

  // Minimal Style / Default / Seconds
  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${accentClass} ${className}`}
      aria-label={`Current time: ${time.timeString}`}
      role="timer"
    >
      <span
        className={`font-medium tabular-nums tracking-tight ${
          size === 'dashboard'
            ? 'text-2xl sm:text-3xl font-bold'
            : size === 'preview'
            ? 'text-base font-semibold'
            : 'text-xs sm:text-sm'
        }`}
      >
        {time.timeString}
      </span>
      {showDate && (
        <span className="hidden sm:inline text-xs text-muted-foreground font-normal">
          • {shortDate}
        </span>
      )}
    </div>
  );
}
