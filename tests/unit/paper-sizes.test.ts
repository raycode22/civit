/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import {
  PAPER_SIZES,
  findPaperSize,
  formatDimensions,
  ISO_PAPER_SIZES,
  NORTH_AMERICAN_SIZES
} from '$lib/tools/paper-sizes/logic';

describe('PAPER_SIZES', () => {
  it('contains the common ISO sizes', () => {
    expect(PAPER_SIZES.some((s) => s.id === 'A4')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'B5')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'C5')).toBe(true);
  });

  it('contains the common North American sizes', () => {
    expect(PAPER_SIZES.some((s) => s.id === 'Letter')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'Legal')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'Tabloid')).toBe(true);
  });

  it('contains custom sizes', () => {
    expect(PAPER_SIZES.some((s) => s.id === 'A3+ (A3 Extra)')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'A4+ (Extra Large)')).toBe(true);
    expect(PAPER_SIZES.some((s) => s.id === 'Super A3')).toBe(true);
  });

  it('is ordered and unique by id', () => {
    const ids = PAPER_SIZES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('findPaperSize', () => {
  it('finds a paper size case-insensitively', () => {
    expect(findPaperSize('a4')?.id).toBe('A4');
    expect(findPaperSize('letter')?.id).toBe('Letter');
    expect(findPaperSize('super a3')?.id).toBe('Super A3');
  });

  it('returns undefined for an unknown id', () => {
    expect(findPaperSize('not-a-paper')).toBeUndefined();
  });
});

describe('formatDimensions', () => {
  it('formats width × height mm', () => {
    expect(formatDimensions(210, 297)).toBe('210 × 297 mm');
  });

  it('formats decimals', () => {
    expect(formatDimensions(215.9, 279.4)).toBe('215.9 × 279.4 mm');
  });
});

describe('ISO_PAPER_SIZES', () => {
  it('includes the base A-series', () => {
    expect(ISO_PAPER_SIZES.some((s) => s.id === 'A0')).toBe(true);
    expect(ISO_PAPER_SIZES.some((s) => s.id === 'A6')).toBe(true);
  });
});

describe('NORTH_AMERICAN_SIZES', () => {
  it('includes Letter, Legal and Tabloid', () => {
    expect(NORTH_AMERICAN_SIZES.some((s) => s.id === 'Letter')).toBe(true);
    expect(NORTH_AMERICAN_SIZES.some((s) => s.id === 'Legal')).toBe(true);
    expect(NORTH_AMERICAN_SIZES.some((s) => s.id === 'Tabloid')).toBe(true);
  });
});
