/**
 * [NEW] Pure-JS favicon generation logic using Canvas 2D.
 * Draws text initials on a square canvas and exports as PNG / ICO data URI.
 */

/** Canvas size (favicons are typically 16x16 to 64x64). */ export const SIZE = 64;

/** Fallback font stack for drawing favicons. */ export const FONT_STACK =
  '"Segoe UI", "Roboto", "Arial", sans-serif';

/** Generate a data URI (PNG) of a square favicon from a name. */ export function generateFavicon(
  name: string,
  size = SIZE
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');

  // Background with a saturated accent.
  const hue = 210 + ((name.length * 13) % 60);
  ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
  ctx.fillRect(0, 0, size, size);

  // Character to render (first character of name).
  const char = name.trim().charAt(0).toUpperCase() || '?';
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.55}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const x = size / 2;
  const y = size / 2 + size * 0.04;
  ctx.fillText(char, x, y);

  // Add a subtle border.
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);

  return canvas.toDataURL('image/png');
}

/** Download name as a PNG data URI. */ export function downloadFavicon(name: string): void {
  const dataUri = generateFavicon(name);
  const link = document.createElement('a');
  link.download = `${name.trim().replace(/\s+/g, '-').toLowerCase()}.png`;
  link.href = dataUri;
  link.click();
  link.remove();
}

/** Format a data URI size for display. */ export function formatDataUriSize(
  dataUri: string
): string {
  const bytes = new Blob([dataUri]).size;
  return formatBytes(bytes);
}

/** Format bytes into human readable string. */ export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
