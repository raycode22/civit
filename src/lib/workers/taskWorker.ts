/**
 * [NEW] Shared Web Worker task client with progress reporting and
 * cancellation (PRD FR-25). Workers post a small tagged protocol:
 *
 *   { type: 'progress', fraction: number }   → onProgress callback
 *   { type: 'done', result: Res }            → promise resolves
 *   { type: 'error', message: string }       → promise rejects with Error
 *
 * The worker factory is injected so the client is unit-testable without a
 * real `Worker` and so tools control how their worker module is created.
 */

/** Message shapes a worker may post back. */
export type WorkerMessage<Res> =
  | { type: 'progress'; fraction: number }
  | { type: 'done'; result: Res }
  | { type: 'error'; message: string };

/** The minimal Worker surface this client relies on. */
export interface WorkerLike {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  terminate(): void;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: { message?: string }) => void) | null;
  onmessageerror: ((event: { data: unknown }) => void) | null;
}

export interface RunOptions<Req> {
  payload: Req;
  /** Transferables moved to the worker instead of copied. */
  transfer?: Transferable[];
  /** Progress callback; `fraction` is clamped to [0, 1]. */
  onProgress?: (fraction: number) => void;
}

/** Rejection reason used when a run is cancelled; `name` is 'AbortError'. */
export class TaskCancelledError extends Error {
  constructor() {
    super('Task cancelled');
    this.name = 'AbortError';
  }
}

export interface TaskWorkerClient<Req, Res> {
  /** Start a run. Cancels any in-flight run first. */
  run(options: RunOptions<Req>): Promise<Res>;
  /** Cancel the in-flight run (terminates the worker). */
  cancel(): void;
  /** Terminate the worker regardless of state (call on component destroy). */
  terminate(): void;
}

function isWorkerMessage<Res>(value: unknown): value is WorkerMessage<Res> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'progress' || value.type === 'done' || value.type === 'error')
  );
}

/**
 * Create a task client around a lazily constructed worker. The worker is
 * created on first `run()` and re-created after a cancel (a terminated
 * worker cannot be reused).
 */
export function createTaskWorker<Req, Res>(create: () => WorkerLike): TaskWorkerClient<Req, Res> {
  let worker: WorkerLike | null = null;
  let pending: {
    resolve: (value: Res) => void;
    reject: (reason: unknown) => void;
    onProgress?: (fraction: number) => void;
  } | null = null;

  function settle(reject: (reason: unknown) => void, reason: unknown): void {
    pending = null;
    reject(reason);
  }

  function ensureWorker(): WorkerLike {
    if (!worker) {
      worker = create();
      worker.onmessage = (event) => {
        if (!pending) return;
        const message = event.data;
        if (!isWorkerMessage<Res>(message)) return;
        if (message.type === 'progress') {
          const fraction = Number(message.fraction);
          if (Number.isFinite(fraction) && pending.onProgress) {
            pending.onProgress(Math.min(1, Math.max(0, fraction)));
          }
        } else if (message.type === 'done') {
          const { resolve } = pending;
          pending = null;
          resolve(message.result);
        } else {
          settle(pending.reject, new Error(message.message || 'Worker task failed'));
        }
      };
      worker.onerror = (event) => {
        if (!pending) return;
        settle(pending.reject, new Error(event.message || 'Worker task failed'));
      };
    }
    return worker;
  }

  function terminate(): void {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    // Never leave a caller awaiting a dead worker.
    if (pending) settle(pending.reject, new TaskCancelledError());
  }

  function cancel(): void {
    terminate(); // terminates the worker and settles any pending run
  }

  function run(options: RunOptions<Req>): Promise<Res> {
    cancel(); // one task at a time
    const w = ensureWorker();
    return new Promise<Res>((resolve, reject) => {
      pending = { resolve, reject, onProgress: options.onProgress };
      try {
        w.postMessage(options.payload, options.transfer);
      } catch (err) {
        settle(reject, err);
      }
    });
  }

  return { run, cancel, terminate };
}
