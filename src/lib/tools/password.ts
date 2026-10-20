// Civit Password Generator core — Phase 3, Prompt 3B.
// Pure, browser-free logic so it is unit-testable without hydration.
// Privacy rules (build guide Prompt 3B / Constitution Art. I): generated
// passwords are never logged, persisted, uploaded, or stored automatically.
//
// Randomness rule: Web Crypto only, with UNBIASED bounded sampling via
// rejection sampling (no modulo bias — we never do `random % range` over a
// non-divisible range).

import type { RandomSource } from './uuid';

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
}

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 128;

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?';

/** Validate options. Returns an error message, or null when valid. */
export function validatePasswordOptions(options: PasswordOptions): string | null {
  const { length, lowercase, uppercase, digits, symbols } = options;
  if (!Number.isInteger(length)) return 'Length must be a whole number.';
  if (length < MIN_LENGTH) return `Length must be at least ${MIN_LENGTH} characters.`;
  if (length > MAX_LENGTH) return `Length must be at most ${MAX_LENGTH} characters.`;
  if (!lowercase && !uppercase && !digits && !symbols) {
    return 'Enable at least one character set (lowercase, uppercase, digits, or symbols).';
  }
  return null;
}

/** Character sets enabled by the options, in deterministic order. */
export function enabledCharsets(options: PasswordOptions): string[] {
  const sets: string[] = [];
  if (options.lowercase) sets.push(LOWERCASE);
  if (options.uppercase) sets.push(UPPERCASE);
  if (options.digits) sets.push(DIGITS);
  if (options.symbols) sets.push(SYMBOLS);
  return sets;
}

/**
 * Draw one unbiased uniform integer in [0, maxExclusive) using rejection
 * sampling over 32-bit Web Crypto values. Values >= floor would skew the
 * distribution, so they are discarded and re-drawn.
 */
export function randomIntUniform(
  maxExclusive: number,
  nextUint32: () => number,
): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer.');
  }
  // Largest multiple of maxExclusive within uint32 range.
  const limit = 0x1_0000_0000 - (0x1_0000_0000 % maxExclusive);
  let value = nextUint32();
  while (value >= limit) {
    value = nextUint32();
  }
  return value % maxExclusive;
}

interface ByteSource {
  nextUint32: () => number;
}

/** Build a uint32 stream from a Web-Crypto-like source (or throw cleanly). */
export function createByteSource(source: RandomSource | undefined): ByteSource {
  if (!source || typeof source.getRandomValues !== 'function') {
    throw new Error(
      'No secure random source available: this browser must support crypto.getRandomValues.',
    );
  }
  const buffer = new Uint32Array(1);
  return {
    nextUint32(): number {
      source.getRandomValues!(buffer);
      return buffer[0];
    },
  };
}

/** Pick one character uniformly from a charset using the uint32 stream. */
function pickChar(charset: string, bytes: ByteSource): string {
  return charset[randomIntUniform(charset.length, bytes.nextUint32)];
}

/** Fisher–Yates shuffle with unbiased draws (no modulo bias). */
function shuffleInPlace<T>(items: T[], bytes: ByteSource): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomIntUniform(i + 1, bytes.nextUint32);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
}

export type PasswordResult =
  | { ok: true; password: string }
  | { ok: false; error: string };

/**
 * Generate one password. Guarantees at least one character from every enabled
 * set (then shuffles, so guaranteed characters carry no fixed positions), and
 * fills remaining slots from the combined pool. Deterministic given a supplied
 * uint32 stream, which makes helper logic testable without asserting any
 * statistical randomness property.
 */
export function generatePassword(
  options: PasswordOptions,
  source: RandomSource | undefined = globalThis.crypto,
): PasswordResult {
  const error = validatePasswordOptions(options);
  if (error) return { ok: false, error };
  let bytes: ByteSource;
  try {
    bytes = createByteSource(source);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Random source unavailable.' };
  }
  const sets = enabledCharsets(options);
  const pool = sets.join('');
  const chars: string[] = sets.map((set) => pickChar(set, bytes));
  while (chars.length < options.length) {
    chars.push(pickChar(pool, bytes));
  }
  shuffleInPlace(chars, bytes);
  return { ok: true, password: chars.join('') };
}
