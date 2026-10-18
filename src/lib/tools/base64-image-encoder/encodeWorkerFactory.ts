/**
 * [NEW] Factory for the encoder worker. Wraps the Vite-supported
 * `new Worker(new URL(...), { type: 'module' })` pattern so the worker chunk
 * is content-hashed by the build and loaded only when the tool runs
 * (PRD FR-24, FR-25).
 */
import type { WorkerLike } from '$lib/workers/taskWorker';

export function createEncodeWorker(): WorkerLike {
  return new Worker(new URL('./encode.worker.ts', import.meta.url), {
    name: 'civit-base64-encoder',
    type: 'module'
  }) as unknown as WorkerLike;
}
