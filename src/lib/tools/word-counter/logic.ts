/**
 * [NEW] Pure-JS text analysis for the Word Counter tool.
 * No DOM, no external dependencies — pure functions.
 */

/** Split text into words on whitespace. */ export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

/** Count all characters, including and excluding spaces. */ export function countCharacters(
  text: string
): { withSpaces: number; withoutSpaces: number } {
  return {
    withSpaces: text.length,
    withoutSpaces: text.replace(/\s/g, '').length
  };
}

/** Count sentences by splitting on sentence-ending punctuation. */ export function countSentences(
  text: string
): number {
  if (text.trim() === '') return 0;
  // Split on ., !, or ? followed by whitespace or end of string.
  const matches = text.match(/[.!?]+(?:\s|$)/g);
  return matches ? matches.length : 1;
}

/** Count paragraphs by splitting on blank lines. */ export function countParagraphs(
  text: string
): number {
  const lines = text.split(/\r?\n/);
  let paragraphs = 0;
  let inParagraph = false;
  for (const line of lines) {
    if (line.trim() !== '') {
      if (!inParagraph) {
        paragraphs++;
        inParagraph = true;
      }
    } else {
      inParagraph = false;
    }
  }
  return paragraphs;
}

/** Run all counters and return a result object. */ export interface TextCount {
  words: number;
  characters: { withSpaces: number; withoutSpaces: number };
  sentences: number;
  paragraphs: number;
}

export function countText(text: string): TextCount {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text)
  };
}

/** Format a number with thousands separators for display. */ export function formatCount(
  n: number
): string {
  return n.toLocaleString('en-US');
}
