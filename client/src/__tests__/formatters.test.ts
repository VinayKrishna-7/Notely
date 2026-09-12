import { describe, it, expect } from 'vitest';
import { generateExcerpt, calculateReadingTime, formatRelativeTime } from '../utils/formatters';

describe('Frontend Formatter Utilities', () => {
  it('generateExcerpt strips markdown headings, links, and bold formatting', () => {
    const rawMarkdown = '# My Header\n\nThis is **bold text** and a [link](https://example.com) with `inline code`.';
    const excerpt = generateExcerpt(rawMarkdown, 100);
    expect(excerpt).not.toContain('#');
    expect(excerpt).not.toContain('**');
    expect(excerpt).not.toContain('[');
    expect(excerpt).toContain('This is bold text and a link with .');
  });

  it('calculateReadingTime computes reading duration properly', () => {
    const shortText = 'Short note with ten words in total for quick reading test.';
    expect(calculateReadingTime(shortText)).toBe(1);

    const longText = Array(450).fill('word').join(' ');
    expect(calculateReadingTime(longText)).toBe(3);
  });

  it('formatRelativeTime returns valid relative time string', () => {
    const now = new Date().toISOString();
    const formatted = formatRelativeTime(now);
    expect(formatted).toMatch(/ago|just now|less than a minute/i);
  });
});
