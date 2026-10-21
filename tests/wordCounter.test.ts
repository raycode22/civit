// Prompt 3C — Word Counter core tests (build guide: "unit tests for all edge
// cases": empty, whitespace-only, emoji, combining characters, punctuation,
// line endings).
import { describe, expect, it } from 'vitest';
import { computeWordStats, countWords } from '../src/lib/text/wordStats';

describe('countWords (documented rule: runs separated by Unicode whitespace)', () => {
  it('counts simple words and collapses repeated whitespace', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  hello   world  ')).toBe(2);
  });

  it('treats empty and whitespace-only input as zero words', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n\t ')).toBe(0);
  });

  it('counts punctuation-attached tokens as one word each', () => {
    expect(countWords('"Hello," she said!')).toBe(3);
  });

  it('treats emoji as word characters', () => {
    expect(countWords('🎉 party 🚀 time')).toBe(4);
  });

  it('does not segment CJK text without spaces (documented limitation)', () => {
    expect(countWords('你好世界')).toBe(1);
  });
});

describe('computeWordStats', () => {
  it('returns all-zero stats for empty input', () => {
    const s = computeWordStats('');
    expect(s).toEqual({
      characters: 0,
      charactersExcludingWhitespace: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
      readingMinutes: 0,
    });
  });

  it('counts characters with and without whitespace', () => {
    const s = computeWordStats('ab cd\nef');
    expect(s.characters).toBe(8); // a b _ c d \n e f
    expect(s.charactersExcludingWhitespace).toBe(6);
  });

  it('counts code points, so astral emoji count once per character', () => {
    const s = computeWordStats('😀😀');
    expect(s.characters).toBe(2); // UTF-16 length would be 4 — we count code points
  });

  it('handles Unicode space separators as whitespace', () => {
    // U+2003 EM SPACE and U+00A0 NBSP are Unicode whitespace (\s with u flag).
    expect(countWords('a\u2003b')).toBe(2);
    expect(countWords('a\u00a0b')).toBe(2);
    const s = computeWordStats('a\u00a0b');
    expect(s.charactersExcludingWhitespace).toBe(2);
  });

  it('counts combining marks separately (documented grapheme limitation)', () => {
    // 'é' as e + U+0301 combining acute = 2 code points.
    const s = computeWordStats('e\u0301');
    expect(s.characters).toBe(2);
  });

  it('handles LF, CRLF, and lone CR line endings', () => {
    expect(computeWordStats('a\nb\nc').lines).toBe(3);
    expect(computeWordStats('a\r\nb\r\nc').lines).toBe(3);
    expect(computeWordStats('a\rb\rc').lines).toBe(3);
    expect(computeWordStats('single line').lines).toBe(1);
  });

  it('counts paragraphs separated by blank lines (including whitespace-only blanks)', () => {
    expect(computeWordStats('first\n\nsecond').paragraphs).toBe(2);
    // Documented rule: a paragraph is a block of lines separated by BLANK
    // lines. 'second\nthird' has no blank line between them, so they form one
    // block → two blocks total.
    expect(computeWordStats('first\n   \nsecond\nthird').paragraphs).toBe(2);
    expect(computeWordStats('\n\n  \n').paragraphs).toBe(0);
  });

  it('approximates sentence counts', () => {
    expect(computeWordStats('Hello world. How are you? Fine!').sentences).toBe(3);
    expect(computeWordStats('No terminator here').sentences).toBe(0);
    // Documented approximation: decimals also end a "sentence".
    expect(computeWordStats('Pi is 3.14 today').sentences).toBe(1);
  });

  it('computes approximate reading time at ~200 wpm, rounded up', () => {
    expect(computeWordStats(Array(200).fill('word').join(' ')).readingMinutes).toBe(1);
    expect(computeWordStats(Array(201).fill('word').join(' ')).readingMinutes).toBe(2);
    expect(computeWordStats('one').readingMinutes).toBe(1);
    expect(computeWordStats('').readingMinutes).toBe(0);
  });
});
