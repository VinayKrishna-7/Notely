import { ClockStyle, ClockTimeFormat } from '../types';

export interface FormattedTimeParts {
  hours: string;
  minutes: string;
  seconds: string;
  period: string; // 'AM' | 'PM' | ''
  timeString: string;
}

/**
 * Format hours, minutes, seconds and period for a given date and time format
 */
export function formatTimeParts(
  date: Date,
  timeFormat: ClockTimeFormat = '12h',
  includeSeconds: boolean = false
): FormattedTimeParts {
  const hoursRaw = date.getHours();
  const minutesRaw = date.getMinutes();
  const secondsRaw = date.getSeconds();

  const minutes = minutesRaw.toString().padStart(2, '0');
  const seconds = secondsRaw.toString().padStart(2, '0');

  let hours: string;
  let period = '';

  if (timeFormat === '24h') {
    hours = hoursRaw.toString().padStart(2, '0');
    period = '';
  } else {
    const isPM = hoursRaw >= 12;
    const h12 = hoursRaw % 12 || 12;
    hours = h12.toString();
    period = isPM ? 'PM' : 'AM';
  }

  const timeWithoutPeriod = includeSeconds
    ? `${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}`;

  const timeString = period ? `${timeWithoutPeriod} ${period}` : timeWithoutPeriod;

  return {
    hours,
    minutes,
    seconds,
    period,
    timeString,
  };
}

/**
 * Formats date in short (e.g. 'Fri, Sep 12') or full (e.g. 'Friday, September 12') style
 */
export function formatDateString(date: Date, type: 'short' | 'full' | 'dayOnly' = 'short'): string {
  if (type === 'dayOnly') {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  }
  if (type === 'full') {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Style metadata and display names
 */
export interface StyleMetadata {
  id: ClockStyle;
  name: string;
  description: string;
  category: 'simple' | 'detailed' | 'focus';
}

export const CLOCK_STYLES_METADATA: StyleMetadata[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and distraction-free time display',
    category: 'simple',
  },
  {
    id: 'dateTime',
    name: 'Date + Time',
    description: 'Balanced date and time layout',
    category: 'detailed',
  },
  {
    id: 'digital',
    name: 'Digital',
    description: 'High-visibility digital monospace clock',
    category: 'simple',
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Single-line time with day badge',
    category: 'simple',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Full calendar date with clear timestamp',
    category: 'detailed',
  },
  {
    id: 'seconds',
    name: 'Minimal Seconds',
    description: 'Precise time display with live seconds',
    category: 'simple',
  },
  {
    id: 'focus',
    name: 'Focus Mode',
    description: 'Minimal time with active productivity badge',
    category: 'focus',
  },
  {
    id: 'analog',
    name: 'Analog Dial',
    description: 'Elegant SVG analog timepiece dial',
    category: 'detailed',
  },
];
