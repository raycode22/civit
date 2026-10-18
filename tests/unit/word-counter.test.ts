/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import {
  countWords,
  countCharacters,
  countSentences,
  countParagraphs,
  countText,
  formatCount
} from '$lib/tools/word-counter/logic';

describe('countWords', () => {
  it('counts words separated by whitespace', () => {
    expect(countWords('hello world')).toBe(2);
    expect(countWords('a b c d e')).toBe(5);
  });

  it('returns zero for empty or whitespace-only text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('trims leading/trailing whitespace before splitting', () => {
    expect(countWords('  hello  world  ')).toBe(2);
  });
});

describe('countCharacters', () => {
  it('counts all characters including spaces', () => {
    expect(countCharacters('hello world').withSpaces).toBe(11);
  });

  it('excludes spaces', () => {
    expect(countCharacters('hello world').withoutSpaces).toBe(10);
  });

  it('handles empty string', () => {
    expect(countCharacters('').withSpaces).toBe(0);
    expect(countCharacters('').withoutSpaces).toBe(0);
  });
});

describe('countSentences', () => {
  it('counts sentences ending with . ! or ?', () => {
    expect(countSentences('Hello world. How are you?')).toBe(2);
    expect(countSentences('One. Two. Three.')).toBe(3);
  });

  it('returns 1 for a single sentence', () => {
    expect(countSentences('Hello world')).toBe(1);
    expect(countSentences('')).toBe(0);
  });

  it('ignores trailing whitespace', () => {
    expect(countSentences('Hi. ')).toBe(1);
  });
});

describe('countParagraphs', () => {
  it('counts paragraphs separated by blank lines', () => {
    expect(countParagraphs('Para one.\n\nPara two.')).toBe(2);
    expect(countParagraphs('One\n\n\n\nTwo')).toBe(2);
  });

  it('returns 0 for empty text', () => {
    expect(countParagraphs('')).toBe(0);
    expect(countParagraphs('   ')).toBe(0);
  });

  it('handles CRLF line endings', () => {
    expect(countParagraphs('Para one.\r\n\r\nPara two.')).toBe(2);
  });
});

describe('countText', () => {
  const sample = 'This is one sentence.\n\nThis is another one!  How are you?  Yes.';
  it('returns a non-null result', () => {
    expect(countText(sample)).toBeDefined();
  });
  it('counts words correctly', () => {
    expect(countWords(sample)).toBe(12);
  });
  it('counts characters', () => {
    expect(countCharacters(sample).withSpaces).toBeGreaterThan(0);
  });
  it('counts sentences', () => {
    expect(countSentences(sample)).toBe(4);
  });
  it('counts paragraphs', () => {
    expect(countParagraphs(sample)).toBe(2);
  });
});

describe('formatCount', () => {
  it('formats with thousands separators', () => {
    expect(formatCount(1234)).toBe('1,234');
    expect(formatCount(0)).toBe('0');
  });
});
