/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { clamp, expandRegion } from '$lib/tools/image-masker/logic';

describe('clamp', () => {
  it('returns the value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('clamps above the maximum', () => {
    expect(clamp(17, 0, 10)).toBe(10);
  });
});

describe('expandRegion', () => {
  it('expands a region by the given padding on every side', () => {
    const region = { x: 10, y: 20, width: 120, height: 80 };
    const expanded = expandRegion(region, 8);
    expect(expanded).toEqual({ x: 2, y: 12, width: 136, height: 96 });
  });

  it('does not expand below zero', () => {
    const region = { x: 2, y: 2, width: 100, height: 100 };
    const expanded = expandRegion(region, 10);
    expect(expanded.x).toBe(0);
    expect(expanded.y).toBe(0);
  });
});
