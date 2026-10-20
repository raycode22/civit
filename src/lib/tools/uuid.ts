// Civit UUID Generator core — Phase 3, Prompt 3B.
// Pure, browser-free logic so it is unit-testable without hydration.
// Constitution Article I: generation happens entirely on the user's machine;
// nothing is sent anywhere and nothing is persisted.
//
// Randomness rule (build guide Prompt 3B): NEVER use Math.random. Values come
// from crypto.randomUUID() where supported, otherwise from a correct Web Crypto
// fallback built on crypto.getRandomValues (RFC 4122 version-4 layout with
// variant bits set).

/** Upper bound on one batch — prevents UI/memory abuse (Prompt 3B requirement). */
export const MAX_BATCH_SIZE = 1000;

/** Canonical lowercase UUID v4 text form. */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Minimal structural contract for a random-source object (testable + defensive). */
export interface RandomSource {
  randomUUID?: () => string;
  // ArrayBufferView<ArrayBuffer> matches the TypeScript DOM lib's Crypto contract
  // (Exclude<BufferSource, ArrayBuffer>); the broad ArrayBufferView default also
  // admits SharedArrayBuffer-backed views, which Web Crypto does not accept.
  getRandomValues?: <T extends ArrayBufferView<ArrayBuffer>>(array: T) => T;
}

/** The shape this module accepts as "a generator"; kept permissive on purpose. */
type MaybeCrypto = RandomSource | undefined;

/**
 * Generate one RFC 4122 version-4 UUID from a Web-Crypto-like source.
 * Prefers `randomUUID()`; falls back to `getRandomValues` filling 16 bytes and
 * setting the version (4) and variant (10xx) nibbles. Throws when no secure
 * entropy source is available — callers must surface that honestly rather than
 * silently degrading to Math.random.
 */
export function generateUuidV4(source: MaybeCrypto = globalThis.crypto): string {
  if (source && typeof source.randomUUID === 'function') {
    return source.randomUUID();
  }
  if (source && typeof source.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    source.getRandomValues(bytes);
    // Version 4: high nibble of byte 6 = 0b0100.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Variant RFC 4122: high bits of byte 8 = 0b10.
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex: string[] = [];
    for (let i = 0; i < 16; i += 1) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }
    return (
      hex.slice(0, 4).join('') +
      '-' +
      hex.slice(4, 6).join('') +
      '-' +
      hex.slice(6, 8).join('') +
      '-' +
      hex.slice(8, 10).join('') +
      '-' +
      hex.slice(10, 16).join('')
    );
  }
  throw new Error(
    'No secure random source available: this browser must support crypto.randomUUID or crypto.getRandomValues.',
  );
}

/** Validate a requested batch size. Returns an error message or null. */
export function validateBatchSize(count: number): string | null {
  if (!Number.isInteger(count)) return 'Batch size must be a whole number.';
  if (count < 1) return 'Batch size must be at least 1.';
  if (count > MAX_BATCH_SIZE) return `Batch size cannot exceed ${MAX_BATCH_SIZE} per request.`;
  return null;
}

export type UuidBatchResult =
  | { ok: true; uuids: string[] }
  | { ok: false; error: string };

/**
 * Generate a validated batch of UUID v4 values. Never partially succeeds:
 * any invalid size or missing entropy source yields a clean error result.
 */
export function generateUuidBatch(
  count: number,
  source: MaybeCrypto = globalThis.crypto,
): UuidBatchResult {
  const sizeError = validateBatchSize(count);
  if (sizeError) return { ok: false, error: sizeError };
  try {
    const uuids: string[] = [];
    for (let i = 0; i < count; i += 1) {
      uuids.push(generateUuidV4(source));
    }
    return { ok: true, uuids };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'UUID generation failed.' };
  }
}

/** True when the string matches the canonical lowercase UUID v4 shape. */
export function isUuidV4(value: string): boolean {
  return UUID_V4_PATTERN.test(value);
}

/** Join generated UUIDs into plain-text output (one per line) for copy/download. */
export function uuidsToPlainText(uuids: readonly string[]): string {
  return uuids.join('\n');
}
