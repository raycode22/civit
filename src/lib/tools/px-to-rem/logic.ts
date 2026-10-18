/**
 * [NEW] Pure-JS conversion logic for the PX to REM tool.
 * No DOM, no external dependencies — pure functions with a fixed root size.
 */

/** Root font size in pixels (CSS default). */ export const ROOT_PX = 16;

/** Convert pixels to rem using the root font size. */ export function pxToRem(px: number): number {
  if (!Number.isFinite(px)) return 0;
  return px / ROOT_PX;
}

/** Convert rem to pixels using the root font size. */ export function remToPx(
  rem: number
): number {
  if (!Number.isFinite(rem)) return 0;
  return rem * ROOT_PX;
}

/** Format a number for display (trimmed, non-negative). */ export function formatNumber(
  n: number
): string {
  const trimmed = Math.round(n * 100) / 100;
  return trimmed.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
