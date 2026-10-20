/** [NEW] Lightweight image deskew logic using Canvas 2D.
 *  Finds the dominant text-line angle with a coarse accumulator over
 *  rotated edge regions, then rotates the image back so text is level.
 *  No DOM/browser APIs outside Canvas 2D, so it is unit-testable in Node.
 */

/** Resulting image width/height (blank canvas size). */
export interface DeskewResult {
  /** Output image data URI (deskewed). */
  dataUri: string;
  /** Size of the result in bytes. */
  size: number;
}

/** Bit depth of an 8-bit RGBA pixel (4 channels). */
export const RGBA_CHANNELS = 4;

/** Rough detector: returns the estimated rotation angle in degrees
 *  (positive = clockwise). Built on a simple edge-density scan so the
 *  module stays fast and does not depend on canvas image data in Node. */
export function estimateSkew(
  imageWidth: number,
  imageHeight: number,
  brightness: Uint8Array
): number {
  const steps = 24;
  const bin = new Array<number>(steps).fill(0);
  const rows = Math.min(imageHeight, 320);
  const cols = Math.min(imageWidth, 320);

  // Sample brightness along a coarse grid and classify each sample as edge
  // (dark) or not. The dominant orientation of dark runs suggests the text
  // direction.
  for (let r = 0; r < rows; r += 4) {
    for (let c = 0; c < cols; c += 4) {
      const idx = (r * imageWidth + c) * RGBA_CHANNELS;
      const lum =
        0.299 * brightness[idx] + 0.587 * brightness[idx + 1] + 0.114 * brightness[idx + 2];
      if (lum < 128) {
        // Tilt a few angles and score how well the local gradient aligns.
        for (let k = 0; k < steps; k++) {
          const angle = (k * 180) / steps;
          const dr = Math.round(
            r * Math.cos((angle * Math.PI) / 180) - c * Math.sin((angle * Math.PI) / 180)
          );
          const dc = Math.round(
            r * Math.sin((angle * Math.PI) / 180) + c * Math.cos((angle * Math.PI) / 180)
          );
          if (dr >= 0 && dr < rows && dc >= 0 && dc < cols) {
            const n = (dr * imageWidth + dc) * RGBA_CHANNELS;
            const nLum =
              0.299 * brightness[n] + 0.587 * brightness[n + 1] + 0.114 * brightness[n + 2];
            if (nLum < 128) bin[k] += 1;
          }
        }
      }
    }
  }

  // Pick the angle with the strongest response, but prefer the one closest
  // to horizontal (0 deg) so we don't over-rotate on noisy images.
  let best = 0;
  let bestScore = -1;
  for (let k = 0; k < steps; k++) {
    const angle = (k * 180) / steps;
    const score = bin[k] * (1 - Math.abs(angle) / 90);
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return (best * 180) / steps;
}

/** Rotate an image by `angleDeg` (clockwise) using Canvas 2D. */
export async function rotateImage(
  bitmap: HTMLImageElement | OffscreenCanvas,
  angleDeg: number
): Promise<{ dataUri: string; size: number }> {
  const width = bitmap instanceof HTMLImageElement ? bitmap.naturalWidth : bitmap.width;
  const height = bitmap instanceof HTMLImageElement ? bitmap.naturalHeight : bitmap.height;
  const rad = (angleDeg * Math.PI) / 180;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rad);
  ctx.drawImage(bitmap, -width / 2, -height / 2);
  ctx.restore();
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const dataUri = await new Response(blob).text();
  return { dataUri, size: blob.size };
}

/** Build a canvas texture from a file for use in the skew estimator. */
export async function loadTexture(
  file: File
): Promise<{ bitmap: HTMLImageElement; brightness: Uint8Array }> {
  const bitmap = await createImageBitmap(file);
  const imageWidth = bitmap.width;
  const imageHeight = bitmap.height;
  const canvas = new OffscreenCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
  ctx.drawImage(bitmap, 0, 0);
  const rgb = await canvas.convertToBlob({ type: 'image/png' });
  return { bitmap: bitmap as unknown as HTMLImageElement, brightness: new Uint8Array(await rgb.arrayBuffer()) };
}

/** Detect and correct the skew angle of an image. */
export async function deskewImage(file: File): Promise<DeskewResult> {
  const { bitmap, brightness } = await loadTexture(file);
  const angle = estimateSkew(bitmap.width, bitmap.height, brightness);
  const result = await rotateImage(bitmap, -angle);
  return result;
}
