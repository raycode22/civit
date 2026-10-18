/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { pxToRem, remToPx, formatNumber } from '$lib/tools/px-to-rem/logic';

describe('pxToRem', () => {
  it('converts pixels to rem using root size 16', () => {
    expect(pxToRem(16)).toBe(1);
    expect(pxToRem(32)).toBe(2);
    expect(pxToRem(12)).toBe(0.75);
  });

  it('handles zero', () => {
    expect(pxToRem(0)).toBe(0);
  });
});

describe('remToPx', () => {
  it('converts rem to pixels using root size 16', () => {
    expect(remToPx(1)).toBe(16);
    expect(remToPx(1.5)).toBe(24);
    expect(remToPx(2)).toBe(32);
  });

  it('handles zero', () => {
    expect(remToPx(0)).toBe(0);
  });
});

describe('formatNumber', () => {
  it('formats with two decimal places', () => {
    expect(formatNumber(1.333333)).toBe('1.33');
    expect(formatNumber(0.75)).toBe('0.75');
    expect(formatNumber(2)).toBe('2');
  });
});
