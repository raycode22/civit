import { describe, it, expect, vi } from 'vitest';
import { createTaskWorker, TaskCancelledError, type WorkerLike } from '$lib/workers/taskWorker';

/** A controllable fake Worker for exercising the client protocol. */
class FakeWorker implements WorkerLike {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;
  onmessageerror: ((event: { data: unknown }) => void) | null = null;
  terminated = false;
  posted: unknown[] = [];

  postMessage(message: unknown): void {
    this.posted.push(message);
  }
  terminate(): void {
    this.terminated = true;
  }
  // Test helpers to simulate the worker responding.
  emit(data: unknown): void {
    this.onmessage?.({ data });
  }
  emitError(message: string): void {
    this.onerror?.({ message });
  }
}

function makeClient() {
  const workers: FakeWorker[] = [];
  const client = createTaskWorker<number, number>(() => {
    const w = new FakeWorker();
    workers.push(w);
    return w;
  });
  return { client, workers };
}

describe('createTaskWorker', () => {
  it('resolves when the worker posts done', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    // Let run() post, then respond.
    await Promise.resolve();
    expect(workers[0].posted).toEqual([1]);
    workers[0].emit({ type: 'done', result: 42 });
    await expect(promise).resolves.toBe(42);
  });

  it('invokes onProgress with clamped fractions', async () => {
    const { client, workers } = makeClient();
    const progress: number[] = [];
    const promise = client.run({ payload: 1, onProgress: (f) => progress.push(f) });
    await Promise.resolve();
    workers[0].emit({ type: 'progress', fraction: -0.5 });
    workers[0].emit({ type: 'progress', fraction: 0.25 });
    workers[0].emit({ type: 'progress', fraction: 5 });
    workers[0].emit({ type: 'progress', fraction: Number.NaN }); // ignored
    workers[0].emit({ type: 'done', result: 'ok' });
    await promise;
    expect(progress).toEqual([0, 0.25, 1]);
  });

  it('rejects with an Error on an error message', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    await Promise.resolve();
    workers[0].emit({ type: 'error', message: 'boom' });
    await expect(promise).rejects.toThrow('boom');
  });

  it('rejects with an Error on a worker error event', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    await Promise.resolve();
    workers[0].emitError('script failed to load');
    await expect(promise).rejects.toThrow('script failed to load');
  });

  it('cancel() terminates the worker and rejects with AbortError', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    await Promise.resolve();
    client.cancel();
    expect(workers[0].terminated).toBe(true);
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    await expect(promise).rejects.toBeInstanceOf(TaskCancelledError);
  });

  it('a later run after cancel creates a fresh worker', async () => {
    const { client, workers } = makeClient();
    const first = client.run({ payload: 1 });
    await Promise.resolve();
    client.cancel();
    await first.catch(() => {});
    const second = client.run({ payload: 2 });
    await Promise.resolve();
    expect(workers).toHaveLength(2);
    expect(workers[1].posted).toEqual([2]);
    workers[1].emit({ type: 'done', result: 'second' });
    await expect(second).resolves.toBe('second');
  });

  it('starting a new run cancels the in-flight one', async () => {
    const { client, workers } = makeClient();
    const first = client.run({ payload: 1 });
    await Promise.resolve();
    const second = client.run({ payload: 2 }); // cancels first
    await expect(first).rejects.toBeInstanceOf(TaskCancelledError);
    await Promise.resolve();
    expect(workers[0].terminated).toBe(true);
    workers[workers.length - 1].emit({ type: 'done', result: 'b' });
    await expect(second).resolves.toBe('b');
  });

  it('ignores messages after the run settled', async () => {
    const { client, workers } = makeClient();
    const onProgress = vi.fn();
    const promise = client.run({ payload: 1, onProgress });
    await Promise.resolve();
    workers[0].emit({ type: 'done', result: 'first' });
    await promise;
    // Late progress/done must not throw or re-resolve.
    workers[0].emit({ type: 'progress', fraction: 0.5 });
    workers[0].emit({ type: 'done', result: 'second' });
    expect(onProgress).not.toHaveBeenCalled();
  });

  it('ignores non-protocol messages', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    await Promise.resolve();
    workers[0].emit('not-an-object');
    workers[0].emit({ something: 'else' });
    workers[0].emit({ type: 'done', result: 'finally' });
    await expect(promise).resolves.toBe('finally');
  });

  it('terminate() stops the worker without rejecting silently-settled state', async () => {
    const { client, workers } = makeClient();
    const promise = client.run({ payload: 1 });
    await Promise.resolve();
    client.terminate();
    expect(workers[0].terminated).toBe(true);
    await expect(promise).rejects.toBeInstanceOf(TaskCancelledError);
  });
});
