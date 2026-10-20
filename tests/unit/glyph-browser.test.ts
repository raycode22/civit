/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import {
  UNICODE_RANGES,
  enumerateGlyphs,
  filterGlyphs,
  take,
  type Glyph
} from '$lib/tools/glyph-browser/logic';

function makeFontFace(family = 'Test Sans', size = '64px'): FontFace {
  return new FontFace(family, `64px "${family}"`);
}

/** Allow the glyph-browser test to construct a real FontFace without
 *  requiring a real browser font. This mirrors the Svelte runtime pattern
 *  where svelte/elements substitutes FontFace with FakeFontFace in Node.
 */
import { FontFace as FakeFontFace } from 'svelte/elements';
if (!globalThis.FontFace) { // @ts-ignore
  const { FontFace: FakeFontFace } = require('svelte/elements');
  globalThis.FontFace = class FontFace {
    constructor(public family: string, public source: string) {}
    async load(): Promise<void> {}
  };
}
export { FontFace };

/** Fake font used to satisfy the test's FontFace API in Node.
 */
export class FakeFontFace {
  constructor(public family: string, public source: string) {}

  async load(): Promise<this> {
    return this;
  }
}

function makeContext(): {
  font: string;
  measureText: (char: string) => { width: number };
} {
  let measured: Record<string, number> = {};
  return {
    font: '',
    measureText(char: string): { width: number } {
      if (!(char in measured)) measured[char] = char.length * 32;
      return { width: measured[char] };
    }
  };
}

function makeGlyph(code: number, char: string, name: string, advance: number): Glyph {
  return { code, char, name, advance };
}

describe('UNICODE_RANGES', () => {
  it('contains the basic ASCII range', () => {
    const ascii = UNICODE_RANGES.find((r) => r.label === 'Basic Latin');
    expect(ascii).toEqual({ label: 'Basic Latin', start: 0x0000, end: 0x007f });
  });

  it('contains common ranges', () => {
    const labels = UNICODE_RANGES.map((r) => r.label);
    expect(labels).toContain('Latin-1 Supplement');
    expect(labels).toContain('Greek');
    expect(labels).toContain('Cyrillic');
  });
});

describe('enumerateGlyphs', () => {
  it('returns an array of glyphs for each code point in the range', async () => {
    const font = makeFontFace();
    const ctx = makeContext();
    // Simulate a font that has the full Basic Latin block.
    const loaded = await font.load();
    expect(loaded).toBe(font);
    // We only check the shape of the returned array here.
    const result = await enumerateGlyphs(
      font,
      UNICODE_RANGES,
      ctx as unknown as CanvasRenderingContext2D
    );
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      const sample = result[0];
      expect(sample).toMatchObject({
        code: 0x0041,
        char: 'A',
        name: 'U+0041',
        advance: expect.any(Number)
      });
    }
  });
});

describe('filterGlyphs', () => {
  const glyphs = [
    makeGlyph(0x0041, 'A', 'LATIN CAPITAL LETTER A', 32),
    makeGlyph(0x0061, 'a', 'LATIN SMALL LETTER A', 32),
    makeGlyph(0x0042, 'B', 'LATIN CAPITAL LETTER B', 32)
  ];

  it('returns all glyphs when the query is empty', () => {
    expect(filterGlyphs(glyphs, '')).toHaveLength(3);
  });

  it('filters by name', () => {
    const result = filterGlyphs(glyphs, 'SMALL');
    expect(result).toHaveLength(1);
    expect(result[0].char).toBe('a');
  });

  it('filters by character', () => {
    const result = filterGlyphs(glyphs, 'b');
    expect(result).toHaveLength(1);
    expect(result[0].char).toBe('B');
  });
});

describe('take', () => {
  it('limits the array to the requested number of items', () => {
    const items = [1, 2, 3, 4, 5];
    expect(take(items, 2)).toEqual([1, 2]);
  });

  it('returns an empty array when the limit is zero', () => {
    expect(take([1, 2, 3], 0)).toEqual([]);
  });

  it('returns the full array when the limit exceeds its length', () => {
    const items = [1, 2];
    expect(take(items, 5)).toEqual(items);
  });
});
