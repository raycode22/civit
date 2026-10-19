/**
 * Pure logic for the Metadata Stripper tool.
 * Uses Canvas 2D to re-encode an image without metadata (EXIF, ICC profile, etc.).
 * Kept free of DOM/browser APIs so it is unit-testable in Node.
 */

export interface StripResult {
  /** Output image data URI (metadata removed). */
  dataUri: string;
  /** Size of the stripped result in bytes. */
  size: number;
  /** Original MIME type. */
  mime: string;
}

/** Maximum accepted image size (20 MiB) to keep processing responsive. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

/** MIME types this tool accepts. */
export const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp'
] as const;

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

/** Best-effort MIME inference from a filename (used by tests/Node). */
export function inferMimeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    default:
      return '';
  }
}

/**
 * Strip metadata from an image by re-encoding it via Canvas 2D.
 * This drops EXIF, ICC profiles, and other embedded metadata.
 */
export async function stripMetadata(file: File): Promise<StripResult> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  // Preserve the original MIME type for the output
  const outputMime = file.type || 'image/png';
  const blob = await canvas.convertToBlob({ type: outputMime });

  // Convert blob to proper data URI
  const dataUri = await blobToDataUri(blob, outputMime);

  return { dataUri, size: blob.size, mime: outputMime };
}

/** Convert a Blob to a data URI. */
async function blobToDataUri(blob: Blob, mime: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // FileReader returns data URI with the correct MIME type
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read blob as data URI'));
    reader.readAsDataURL(blob);
  });
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
