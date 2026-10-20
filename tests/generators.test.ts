// Civit UUID Generator + Password Generator core tests — Phase 3, Prompt 3B.
// Deterministic helper-logic tests only: per the build guide we do NOT assert
// statistical randomness guarantees from small unit tests.

import { describe, expect, it } from 'vitest';

import {
  MAX_BATCH_SIZE,
  generateUuidBatch,
  generateUuidV4,
  isUuidV4,
  uuidsToPlainText,
  validateBatchSize,
  type RandomSource,
} from '../src/lib/tools/uuid';
import {
  MAX_LENGTH,
  MIN_LENGTH,
  createByteSource,
  enabledCharsets,
  generatePassword,
  randomIntUniform,
  validatePasswordOptions,
  type PasswordOptions,
} from '../src/lib/tools/password';

/** Fake entropy source: deterministic byte stream, no Math.random anywhere. */
function fakeRandomValuesFactory(pattern: number[]): RandomSource {
  let i = 0;
  return {
    getRandomValues<T extends ArrayBufferView>(array: T): T {
      const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let b = 0; b < view.length; b += 1) {
        view[b] = pattern[i % pattern.length] ?? 0;
        i += 1;
      }
      return array;
    },
  };
}

/** Fake uint32 stream generator for rejection-sampling tests. */
function uint32Stream(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i % values.length] ?? 0;
    i += 1;
    return v >>> 0;
  };
}

describe('UUID Generator — generation', () => {
  it('uses crypto.randomUUID when available', () => {
    const source: RandomSource = { randomUUID: () => '00000000-0000-4000-8000-000000000000' };
    expect(generateUuidV4(source)).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('falls back to getRandomValues with correct version/variant nibbles', () => {
    // All-zero stream → bytes after masking: v4 digit '4' at pos 14, variant '8' at pos 19.
    const source = fakeRandomValuesFactory([0]);
    const uuid = generateUuidV4(source);
    expect(uuid).toBe('00000000-0000-4000-8000-000000000000');
    expect(isUuidV4(uuid)).toBe(true);
  });

  it('produces canonical lowercase v4 shape from a mixed byte stream', () => {
    const source = fakeRandomValuesFactory([0xab]);
    const uuid = generateUuidV4(source);
    // 0xab & 0x0f | 0x40 = 0xeb; 0xab & 0x3f | 0x80 = 0xab — still valid v4 bits.
    expect(isUuidV4(uuid)).toBe(true);
  });

  it('throws (never falls back to Math.random) when no secure source exists', () => {
    // Pass an explicit non-crypto value so the default parameter (which would
    // resolve to Node's real globalThis.crypto in tests) is bypassed.
    expect(() => generateUuidV4(null as unknown as RandomSource | undefined)).toThrowError(/secure random source/i);
    expect(() => generateUuidV4({})).toThrowError(/secure random source/i);
  });

  it('batch results are clean ok/error unions — invalid size never generates', () => {
    const res = generateUuidBatch(0, { randomUUID: () => 'x' });
    expect(res.ok).toBe(false);
  });
});

describe('UUID Generator — batch validation', () => {
  it('accepts sizes within 1..MAX_BATCH_SIZE', () => {
    expect(validateBatchSize(1)).toBeNull();
    expect(validateBatchSize(MAX_BATCH_SIZE)).toBeNull();
  });

  it('rejects zero, negatives, non-integers, and oversized batches', () => {
    expect(validateBatchSize(0)).toMatch(/at least 1/);
    expect(validateBatchSize(-5)).toMatch(/at least 1/);
    expect(validateBatchSize(2.5)).toMatch(/whole number/);
    expect(validateBatchSize(MAX_BATCH_SIZE + 1)).toMatch(/cannot exceed/);
  });

  it('generateUuidBatch returns exactly the requested count of valid UUIDs', () => {
    const res = generateUuidBatch(7, fakeRandomValuesFactory([0x3c]));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.uuids).toHaveLength(7);
      for (const u of res.uuids) expect(isUuidV4(u)).toBe(true);
    }
  });

  it('generateUuidBatch surfaces missing-entropy errors instead of throwing', () => {
    const res = generateUuidBatch(3, null as unknown as RandomSource | undefined);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/secure random source/i);
  });

  it('plain-text output joins one UUID per line', () => {
    expect(uuidsToPlainText(['a', 'b'])).toBe('a\nb');
    expect(uuidsToPlainText([])).toBe('');
  });
});

describe('Password Generator — option validation', () => {
  const base: PasswordOptions = {
    length: 20,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  };

  it('accepts a valid configuration', () => {
    expect(validatePasswordOptions(base)).toBeNull();
  });

  it('requires at least one enabled character set', () => {
    expect(
      validatePasswordOptions({ ...base, lowercase: false, uppercase: false, digits: false, symbols: false }),
    ).toMatch(/at least one character set/);
  });

  it('enforces min/max length bounds and whole numbers', () => {
    expect(validatePasswordOptions({ ...base, length: MIN_LENGTH - 1 })).toMatch(/at least/);
    expect(validatePasswordOptions({ ...base, length: MAX_LENGTH + 1 })).toMatch(/at most/);
    expect(validatePasswordOptions({ ...base, length: 12.5 })).toMatch(/whole number/);
  });

  it('enabledCharsets lists sets in deterministic order', () => {
    expect(enabledCharsets({ ...base, symbols: false })).toEqual([
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
    ]);
  });
});

describe('Password Generator — unbiased sampling helpers', () => {
  it('randomIntUniform rejects invalid ranges', () => {
    expect(() => randomIntUniform(0, () => 0)).toThrowError(/positive integer/);
    expect(() => randomIntUniform(1.5, () => 0)).toThrowError(/positive integer/);
  });

  it('rejection sampling discards values >= limit and re-draws', () => {
    // maxExclusive = 10 → limit = 2^32 - (2^32 % 10) = 4294967290.
    // First draw 4294967295 must be rejected; second draw 4294967291 also; third draw 25 accepted.
    const draws = uint32Stream([4294967295, 4294967291, 25]);
    expect(randomIntUniform(10, draws)).toBe(5); // 25 % 10
  });

  it('accepts the boundary value just below the limit', () => {
    const draws = uint32Stream([4294967289]); // limit - 1
    expect(randomIntUniform(10, draws)).toBe(4294967289 % 10);
  });

  it('createByteSource throws cleanly without getRandomValues', () => {
    expect(() => createByteSource(undefined)).toThrowError(/secure random source/i);
    expect(() => createByteSource({})).toThrowError(/secure random source/i);
  });
});

describe('Password Generator — generation', () => {
  const allSets: PasswordOptions = {
    length: 24,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  };

  function fakeCrypto(): RandomSource {
    let counter = 0;
    return {
      getRandomValues<T extends ArrayBufferView>(array: T): T {
        const view = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        for (let i = 0; i < view.length; i += 1) {
          // Spread across the full uint32 space but stay below every used limit.
          const v = (counter * 101 + 7) % 1_000_000;
          counter += 1;
          view[i * 4] = v & 0xff;
          view[i * 4 + 1] = (v >> 8) & 0xff;
          view[i * 4 + 2] = (v >> 16) & 0xff;
          view[i * 4 + 3] = (v >> 24) & 0xff;
        }
        return array;
      },
    };
  }

  it('honors disabled character sets — output contains only enabled classes', () => {
    const res = generatePassword(
      { length: 32, lowercase: true, uppercase: false, digits: false, symbols: false },
      fakeCrypto(),
    );
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.password).toHaveLength(32);
      expect(/^[a-z]+$/.test(res.password)).toBe(true);
    }
  });

  it('includes at least one character from every enabled set', () => {
    const res = generatePassword(allSets, fakeCrypto());
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.password).toHaveLength(24);
      expect(/[a-z]/.test(res.password)).toBe(true);
      expect(/[A-Z]/.test(res.password)).toBe(true);
      expect(/[0-9]/.test(res.password)).toBe(true);
      expect(/[!@#$%^&*()\-_=+\[\]{};:,.<>?]/.test(res.password)).toBe(true);
    }
  });

  it('is deterministic given the same fake entropy stream (helper logic check)', () => {
    const a = generatePassword(allSets, fakeCrypto());
    const b = generatePassword(allSets, fakeCrypto());
    expect(a).toEqual(b);
  });

  it('returns clean errors for impossible options or missing entropy', () => {
    const bad = generatePassword({ ...allSets, length: 4 }, fakeCrypto());
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toMatch(/at least/);

    const noEntropy = generatePassword(allSets, null as unknown as RandomSource | undefined);
    expect(noEntropy.ok).toBe(false);
    if (!noEntropy.ok) expect(noEntropy.error).toMatch(/secure random source/i);
  });
});
