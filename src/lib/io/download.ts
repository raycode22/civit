/**
 * [NEW] Shared download helpers (PRD FR-26). Files are saved locally via a
 * temporary object URL; nothing is uploaded (Constitution §13).
 */

/** Strip path separators and control characters; fall back to a default. */
export function sanitizeFilename(name: string): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = name.replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, '_').trim();
  return cleaned || 'download';
}

/** Trigger a browser download of a Blob under the given filename. */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeFilename(filename);
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke after the download has had a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Convenience wrapper for text outputs (e.g. subtitles, diffs, converted docs). */
export function downloadText(
  filename: string,
  text: string,
  mime = 'text/plain;charset=utf-8'
): void {
  downloadBlob(filename, new Blob([text], { type: mime }));
}
