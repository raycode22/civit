/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { formatBytes, formatDataUriSize } from '$lib/tools/favicon-generator/logic';

describe('formatBytes', () => {
  it('formats zero', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024 * 2)).toBe('2 MB');
  });
});

describe('formatDataUriSize', () => {
  it('returns a human readable size', () => {
    const uri = 'data:image/png;base64,AAAAAQ';
    expect(formatDataUriSize(uri)).toMatch(/\d+(\.\d+)? (B|KB|MB|GB)/);
  });
});
