/**
 * [NEW] Lightweight image clipping logic using Canvas 2D.
 * Pure JS + Canvas — no worker, no WASM, no ML.
 */

/** Result of a clip operation. */ export interface ClipResult {
  /** Output image data URI. */ dataUri: string;
  /** Size of the clipped result in bytes. */ size: number;
}

/**
 * Clip an image to a rectangle and return a data URI of the clipped region.
 * Uses Canvas 2D directly (L, lightweight).
 */ export async function clipImage(
  file: File,
  { sx, sy, sw, sh }: { sx: number; sy: number; sw: number; sh: number },
  width = 800,
  height = 600
): Promise<ClipResult> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  bitmap.close();
  const dataUri = await new Response(blob).text();
  return { dataUri, size: blob.size };
}

/** Compute the visible rectangle within the source image. */ export function computeClipRect(
  img: HTMLImageElement,
  containerWidth: number,
  containerHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
  const displayW = img.width * scale;
  const displayH = img.height * scale;
  const sx = (containerWidth - displayW) / 2;
  const sy = (containerHeight - displayH) / 2;
  return { sx, sy, sw: displayW, sh: displayH };
}

/** Format bytes into human readable string. */ export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
