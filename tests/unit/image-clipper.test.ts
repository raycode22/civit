/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { computeClipRect, formatBytes } from '$lib/tools/image-clipper/logic';

describe('computeClipRect', () => {
  it('centers the image when it fits the container', () => {
    const img = { width: 800, height: 600 } as HTMLImageElement;
    const rect = computeClipRect(img, 400, 300);
    // scale = min(400/800, 300/600) = 0.5; display = 400x300
    expect(rect.sx).toBe(0);
    expect(rect.sy).toBe(0);
    expect(rect.sw).toBe(400);
    expect(rect.sh).toBe(300);
  });

  it('centers when the image is larger than the container', () => {
    const img = { width: 1600, height: 1200 } as HTMLImageElement;
    const rect = computeClipRect(img, 400, 300);
    // scale = min(400/1600, 300/1200) = 0.25; display = 400x300
    expect(rect.sx).toBe(0);
    expect(rect.sy).toBe(0);
    expect(rect.sw).toBe(400);
    expect(rect.sh).toBe(300);
  });

  it('supports non-square images', () => {
    const img = { width: 1000, height: 600 } as HTMLImageElement;
    const rect = computeClipRect(img, 400, 300);
    // scale = min(400/1000, 300/600) = 0.4; display = 400x240
    expect(rect.sw).toBe(400);
    expect(rect.sh).toBe(240);
    expect(rect.sx).toBe(0);
    expect(rect.sy).toBe((300 - 240) / 2);
  });
});

describe('formatBytes', () => {
  it('formats human readable sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });
});
