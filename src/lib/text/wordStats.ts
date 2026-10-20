// Civit Word Counter core — Phase 3, Prompt 3C.
// Pure, browser-free logic so it is unit-testable without hydration.
// Constitution Article I: counting happens in-memory on the user's machine;
// nothing is sent anywhere and nothing is persisted.
//
// Documented word-count rule (build guide 3C: do NOT claim language-perfect
// tokenization): a "word" is a maximal run of non-whitespace characters,
// where whitespace is any Unicode whitespace (\\s with the u flag). This is
// correct for space-separated scripts but counts CJK text without spaces as
// single words — an accepted, documented limitation, not a bug to hide.

/** Maximum counted input size in characters (input guardrail, like JSON Formatter). */
export const MAX_WORD_INPUT_CHARS = 2_000_000;

export interface WordStats {
  /** Total characters, including whitespace and line endings. */
  characters: number;
  /** Characters excluding all Unicode whitespace. */
  charactersExcludingWhitespace: number;
  /** Words per the documented rule above. */
  words: number;
  /** Lines counted by line terminators (LF, CRLF, CR, and Unicode equivalents), +1 for content. Empty input → 0 lines. */
  lines: number;
  /** Sentences: runs terminated by . ! ? … (possibly followed by closing quotes/brackets). Approximate; documented as such. */
  sentences: number;
  /** Paragraphs: blocks separated by one or more blank lines. Empty input → 0. */
  paragraphs: number;
  /** Approximate reading time at ~200 wpm, rounded up to whole minutes (0 when no words). */
  readingMinutes: number;
}

/** Words-only helper used by live UI and tests. See file header for the rule. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/u).length;
}

/** Count Unicode code points (not UTF-16 units) so emoji/astral chars count once. */
function codePoints(str: string): number {
  // Array.from iterates by code point; combining marks still count separately
  // (documented grapheme-cluster limitation).
  let n = 0;
  for (const _ of str) n++;
  return n;
}

export function computeWordStats(text: string): WordStats {
  const characters = codePoints(text);
  const charactersExcludingWhitespace = codePoints(text.replace(/\s/gu, ''));
  const words = countWords(text);

  // Lines: count line terminators; empty input has zero lines. \r\n counted once.
  let lines = 0;
  if (text.length > 0) {
    lines = 1 + (text.match(/\r\n|[\n\r\u2028\u2029]/g)?.length ?? 0);
  }

  // Sentences: approximate — count runs of terminator punctuation (. ! ? …),
  // optionally followed by closing quotes/brackets. Decimal numbers like
  // "3.14" are counted as sentence ends; documented approximation.
  const sentences = (text.match(/[.!?…]+["'”’)\]]*/gu) ?? []).length;

  // Paragraphs: non-empty blocks separated by one or more blank lines.
  // A blank line is empty OR contains only spaces/tabs; a lone \r (old-Mac
  // terminator) also splits blocks. Blocks joined by soft breaks stay one
  // paragraph ("second\nthird" = same block).
  const paragraphs = text
    .split(/\r\n|\n|\r/gu)
    .reduce<{ blocks: number; inBlock: boolean }>(
      (acc, line) => {
        if (line.trim() === '') {
          acc.inBlock = false;
        } else if (!acc.inBlock) {
          acc.inBlock = true;
          acc.blocks++;
        }
        return acc;
      },
      { blocks: 0, inBlock: false },
    ).blocks;

  const readingMinutes = words === 0 ? 0 : Math.ceil(words / 200);

  return {
    characters,
    charactersExcludingWhitespace,
    words,
    lines,
    sentences,
    paragraphs,
    readingMinutes,
  };
}
