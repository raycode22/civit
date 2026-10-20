import { describe, expect, it } from 'vitest';
import { countLocalWords } from '../src/lib/text/wordCount';

describe('countLocalWords', () => {
  it('counts simple words', () => {
    expect(countLocalWords('one two three')).toBe(3);
  });

  it('treats empty and whitespace-only input as zero words', () => {
    expect(countLocalWords('')).toBe(0);
    expect(countLocalWords('   \n\t ')).toBe(0);
  });

  it('collapses repeated whitespace', () => {
    expect(countLocalWords('  hello   world  ')).toBe(2);
  });
});
