/**
 * [NEW] Web Worker that performs the Base64 encoding for the Base64 image
 * encoder (PRD FR-25). Runs the chunked encode loop here so the UI thread
 * stays responsive and can show real progress; errors are reported back
 * through the shared task protocol.
 *
 * Note: this file runs inside a dedicated worker, not the page.
 */
import { buildDataUri } from './logic';

export interface EncodeRequest {
  mime: string;
  bytes: ArrayBuffer;
}

const CHUNK = 0x8000;

const worker = self as unknown as {
  postMessage(message: unknown): void;
  onmessage: ((event: { data: EncodeRequest }) => void) | null;
};

worker.onmessage = (event) => {
  const { mime, bytes } = event.data;
  try {
    const view = new Uint8Array(bytes);
    let binary = '';
    for (let i = 0; i < view.length; i += CHUNK) {
      binary += String.fromCharCode(...view.subarray(i, i + CHUNK));
      worker.postMessage({
        type: 'progress',
        fraction: Math.min(1, (i + CHUNK) / view.length)
      });
    }
    const base64 = btoa(binary);
    worker.postMessage({ type: 'done', result: buildDataUri(mime, base64) });
  } catch (err) {
    worker.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Encoding failed.'
    });
  }
};
