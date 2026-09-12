import { describe, it, expect } from 'vitest';
import {
  formatTimeParts,
  formatDateString,
  CLOCK_STYLES_METADATA,
} from '../utils/clockFormatters';

describe('Clock Formatter Utilities', () => {
  // Fixed test date: September 12, 2026, 14:42:37 (2:42:37 PM)
  const fixedDate = new Date(2026, 8, 12, 14, 42, 37);

  it('formats 12-hour time correctly with AM/PM', () => {
    const formatted = formatTimeParts(fixedDate, '12h', false);
    expect(formatted.hours).toBe('2');
    expect(formatted.minutes).toBe('42');
    expect(formatted.period).toBe('PM');
    expect(formatted.timeString).toBe('2:42 PM');
  });

  it('formats 12-hour time with seconds', () => {
    const formatted = formatTimeParts(fixedDate, '12h', true);
    expect(formatted.seconds).toBe('37');
    expect(formatted.timeString).toBe('2:42:37 PM');
  });

  it('formats 24-hour time correctly', () => {
    const formatted = formatTimeParts(fixedDate, '24h', false);
    expect(formatted.hours).toBe('14');
    expect(formatted.minutes).toBe('42');
    expect(formatted.period).toBe('');
    expect(formatted.timeString).toBe('14:42');
  });

  it('formats 24-hour time with seconds', () => {
    const formatted = formatTimeParts(fixedDate, '24h', true);
    expect(formatted.hours).toBe('14');
    expect(formatted.minutes).toBe('42');
    expect(formatted.seconds).toBe('37');
    expect(formatted.timeString).toBe('14:42:37');
  });

  it('handles midnight (00:00:00) in 12h and 24h format', () => {
    const midnight = new Date(2026, 8, 12, 0, 5, 9);
    const h12 = formatTimeParts(midnight, '12h', true);
    expect(h12.hours).toBe('12');
    expect(h12.minutes).toBe('05');
    expect(h12.seconds).toBe('09');
    expect(h12.period).toBe('AM');
    expect(h12.timeString).toBe('12:05:09 AM');

    const h24 = formatTimeParts(midnight, '24h', true);
    expect(h24.hours).toBe('00');
    expect(h24.minutes).toBe('05');
    expect(h24.seconds).toBe('09');
    expect(h24.timeString).toBe('00:05:09');
  });

  it('handles noon (12:00:00) in 12h format', () => {
    const noon = new Date(2026, 8, 12, 12, 0, 0);
    const h12 = formatTimeParts(noon, '12h', false);
    expect(h12.hours).toBe('12');
    expect(h12.period).toBe('PM');
  });

  it('formats date strings in short, full, and dayOnly modes', () => {
    const shortDate = formatDateString(fixedDate, 'short');
    expect(shortDate).toMatch(/Sep 12/);

    const fullDate = formatDateString(fixedDate, 'full');
    expect(fullDate).toMatch(/September 12/);

    const dayOnly = formatDateString(fixedDate, 'dayOnly');
    expect(dayOnly).toMatch(/Sat/i);
  });

  it('includes all 8 clock styles in metadata', () => {
    const ids = CLOCK_STYLES_METADATA.map((s) => s.id);
    expect(ids).toContain('minimal');
    expect(ids).toContain('dateTime');
    expect(ids).toContain('digital');
    expect(ids).toContain('compact');
    expect(ids).toContain('productivity');
    expect(ids).toContain('seconds');
    expect(ids).toContain('focus');
    expect(ids).toContain('analog');
  });
});
