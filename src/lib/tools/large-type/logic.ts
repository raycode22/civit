/** [NEW] Pure-JS logic for the Large Type tool.
 *  Pure functions only (no DOM). The UI draws the preview with Canvas 2D;
 *  this module owns text sizing, measurement and output formatting.
 */

/** Size of the output canvas, in CSS pixels. */
export const CANVAS_SIZE = 1024;

/** Recommended number of characters per line so the preview stays legible. */
export const CHARS_PER_LINE = 64;

/** Scale factor that maps the measured text width to the canvas width. */
export function computeScale(text: string, ctx: CanvasRenderingContext2D): number {
  const measured = ctx.measureText(text).width;
  if (measured <= 0) return 1;
  return CANVAS_SIZE / measured;
}

/** Fully qualified font stack for large legible previews. */
export const FONT_STACK = '"Segoe UI", "Roboto", "Arial", "Helvetica", sans-serif';

/** Return the largest font size (in px) that fits `text` within the canvas. */
export function computeFontSize(text: string, ctx: CanvasRenderingContext2D): number {
  const maxSize = 400;
  const minSize = 24;
  let lo = minSize;
  let hi = maxSize;
  while (lo < hi) {
    const mid = (lo + hi + 1) / 2;
    ctx.font = `bold ${mid}px ${FONT_STACK}`;
    if (ctx.measureText(text).width <= CANVAS_SIZE) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Format a very large font size as a human-readable string. */
export function formatSize(size: number): string {
  if (size >= 100) {
    const inEm = size / 16;
    return `${size} px (${inEm.toFixed(1)} em)`;
  }
  return `${size} px`;
}
