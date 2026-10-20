import { describe, expect, it } from 'vitest';
import {
  THEME_STORAGE_KEY,
  nextPreference,
  readStoredPreference,
  resolveTheme,
  writeStoredPreference,
  type MaybeStorage,
} from '../src/lib/theme/theme';

function fakeStorage(initial: Record<string, string> = {}): MaybeStorage & { data: Record<string, string> } {
  const data = initial;
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

const throwingStorage: MaybeStorage = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
};

describe('resolveTheme', () => {
  it('follows the OS preference when no explicit choice exists', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('lets an explicit user choice override the OS', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('treats the "system" preference as no override', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('stored preference', () => {
  it('reads a valid stored value', () => {
    expect(readStoredPreference(fakeStorage({ [THEME_STORAGE_KEY]: 'light' }))).toBe('light');
  });

  it('ignores invalid or missing values', () => {
    expect(readStoredPreference(fakeStorage({ [THEME_STORAGE_KEY]: 'neon' }))).toBeNull();
    expect(readStoredPreference(fakeStorage())).toBeNull();
  });

  it('survives unavailable or throwing storage without crashing', () => {
    expect(readStoredPreference(null)).toBeNull();
    expect(readStoredPreference(undefined)).toBeNull();
    expect(readStoredPreference(throwingStorage)).toBeNull();
    expect(() => writeStoredPreference(throwingStorage, 'dark')).not.toThrow();
  });

  it('round-trips through storage', () => {
    const storage = fakeStorage();
    writeStoredPreference(storage, 'light');
    expect(storage.data[THEME_STORAGE_KEY]).toBe('light');
    expect(readStoredPreference(storage)).toBe('light');
  });
});

describe('nextPreference', () => {
  it('flips between light and dark', () => {
    expect(nextPreference('dark')).toBe('light');
    expect(nextPreference('light')).toBe('dark');
  });
});
