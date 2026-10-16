/**
 * Pure logic for the Base64 image encoder tool.
 * Kept free of DOM/browser APIs so it is unit-testable in Node.
 */

/** Maximum accepted image size (10 MiB) to keep encoding responsive. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** MIME types this encoder accepts. */
export const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
  'image/bmp'
] as const;

export interface EncodeResult {
  dataUri: string;
  sizeBase64: number;
}

export type ValidationError =
  | { code: 'empty' }
  | { code: 'too-large'; bytes: number }
  | { code: 'unsupported-type'; mime: string };

/** Validate an image candidate before reading it. */
export function validateImage(file: { size: number; type: string }): ValidationError | null {
  if (file.size === 0) return { code: 'empty' };
  if (file.size > MAX_FILE_BYTES) return { code: 'too-large', bytes: file.size };
  const mime = file.type || inferMimeFromName('');
  if (!mime || !(ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)) {
    return { code: 'unsupported-type', mime: file.type || 'unknown' };
  }
  return null;
}

/** Best-effort MIME inference from a data URI prefix (used by tests/Node). */
export function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'bmp':
      return 'image/bmp';
    default:
      return '';
  }
}

/**
 * Convert raw Base64 payload plus MIME type into a data URI.
 * Input must be Base64 without whitespace or a data-URI prefix.
 */
export function buildDataUri(mime: string, base64: string): EncodeResult {
  const cleaned = base64.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('Invalid Base64 payload');
  }
  const dataUri = `data:${mime};base64,${cleaned}`;
  return { dataUri, sizeBase64: cleaned.length };
}

/**
 * Encode binary content (Node Buffer / Uint8Array / ArrayBuffer) into a
 * Base64 data URI. Used by the UI via FileReader results and by tests.
 */
export function encodeBytes(mime: string, bytes: Uint8Array | ArrayBuffer): EncodeResult {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < view.length; i += chunk) {
    binary += String.fromCharCode(...view.subarray(i, i + chunk));
  }
  // btoa is a global in browsers and Node >=16; no Buffer fallback needed.
  const base64 = btoa(binary);
  return buildDataUri(mime, base64);
}

/** Human-readable byte size, e.g. `1.2 MB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 'B';
  for (const u of units) {
    value = value / 1024;
    unit = u;
    if (value < 1024) break;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${unit}`;
}
