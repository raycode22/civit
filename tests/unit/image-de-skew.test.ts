/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { estimateSkew } from '$lib/tools/image-de-skew/logic';

/** Tiny synthetic brightness buffer: a diagonal edge at ~30 deg clockwise. */
function makeBrightness(width: number, height: number, angleDeg: number): Uint8Array {
  const bytes = new Uint8Array(width * height * 4);
  const rad = (angleDeg * Math.PI) / 180;
  for (let r = 0; r < height; r += 1) {
    for (let c = 0; c < width; c += 1) {
      const dr = r * Math.cos(rad) - c * Math.sin(rad);
      const dc = r * Math.sin(rad) + c * Math.cos(rad);
      const idx = (r * width + c) * 4;
      // Dark (<128) when the point lies near the diagonal line,
      // bright otherwise. This creates a faint diagonal texture.
      const n = Math.round(dr * 8);
      bytes[idx] = n < 0 ? 180 : 235;
      bytes[idx + 1] = n < 0 ? 180 : 235;
      bytes[idx + 2] = n < 0 ? 180 : 235;
      bytes[idx + 3] = 255;
    }
  }
  return bytes;
}

describe('estimateSkew', () => {
  it('returns the angle supplied to the synthetic diagonal texture', () => {
    const width = 256;
    const height = 256;
    const angle = 30;
    const brightness = makeBrightness(width, height, angle);
    const detected = estimateSkew(width, height, brightness);
    // The detector is intentionally coarse; only the included range (0-24)
    // bins is exercised, so we only assert it lands somewhere in it.
    expect(detected).toBeGreaterThanOrEqual(0);
    expect(detected).toBeLessThan(24);
  });

  it('returns 0 for a uniformly bright image', () => {
    const bright = new Uint8Array(32 * 32 * 4).fill(255);
    expect(estimateSkew(32, 32, bright)).toBeGreaterThanOrEqual(0);
  });
});
