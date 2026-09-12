import { describe, it, expect } from 'vitest';
import { highlightText } from '../utils/highlight';

describe('highlightText Utility', () => {
  it('returns unmodified string when search query is empty', () => {
    expect(highlightText('Hello World', '')).toBe('Hello World');
    expect(highlightText('Hello World', '   ')).toBe('Hello World');
  });

  it('splits text into highlighted pieces', () => {
    const result = highlightText('React for beginners', 'React');
    expect(Array.isArray(result)).toBe(true);
  });
});
