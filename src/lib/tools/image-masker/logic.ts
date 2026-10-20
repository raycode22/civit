/** [NEW] Lightweight image masking/redaction logic using Canvas 2D.
 *  Draws a semi-transparent redaction overlay over a user-selected region
 *  so sensitive content is covered. Kept free of DOM/browser APIs beyond
 *  Canvas, so it is unit-testable in Node.
 */

/** Output after applying the mask; tool renders the data URI and downloads. */
export interface MaskResult {
  /** Output image data URI (masked). */
  dataUri: string;
  /** Size of the masked result in bytes. */
  size: number;
}

/** Region to mask (in source-pixel coordinates). */
export interface MaskRegion {
  /** X of top-left corner (source pixels). */
  x: number;
  /** Y of top-left corner (source pixels). */
  y: number;
  /** Width of the region. */
  width: number;
  /** Height of the region. */
  height: number;
}

/**
 * Apply a redaction mask to an image file.
 * The region is filled with a dark semi-transparent colour so the covered
 * content is illegible, which is the standard privacy redaction look.
 */
export async function maskImage(
  file: File,
  region: MaskRegion,
  color = 'rgba(0, 0, 0, 0.75)'
): Promise<MaskResult> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');

  // Draw the source image, then overlay the mask.
  ctx.drawImage(bitmap, 0, 0);
  ctx.fillStyle = color;
  ctx.fillRect(region.x, region.y, region.width, region.height);

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  bitmap.close();
  const dataUri = await new Response(blob).text();
  return { dataUri, size: blob.size };
}

/** Clamp a value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Expand a region by `pad` pixels on every side. */
export function expandRegion(region: MaskRegion, pad = 8): MaskRegion {
  return {
    x: clamp(region.x - pad, 0, Infinity),
    y: clamp(region.y - pad, 0, Infinity),
    width: region.width + pad * 2,
    height: region.height + pad * 2
  };
}
