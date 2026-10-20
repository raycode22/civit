import { describe, expect, it } from 'vitest';
import {
  DAISY_THEME,
  PREPAINT_SCRIPT,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  applyThemeAttribute,
  themeFromDaisyName,
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

describe('Catppuccin daisyUI theme mapping (Prompt 1B revision)', () => {
  it('maps light/dark choices to the official flavor names', () => {
    expect(DAISY_THEME.light).toBe('catppuccin-latte');
    expect(DAISY_THEME.dark).toBe('catppuccin-mocha');
  });

  it('round-trips flavor names back to light/dark and rejects unknown values', () => {
    expect(themeFromDaisyName('catppuccin-latte')).toBe('light');
    expect(themeFromDaisyName('catppuccin-mocha')).toBe('dark');
    expect(themeFromDaisyName('dracula')).toBeNull();
    expect(themeFromDaisyName(null)).toBeNull();
  });

  it('applyThemeAttribute writes the flavor name, not the bare keyword', () => {
    const el = { attrs: {} as Record<string, string>, setAttribute(n: string, v: string) { this.attrs[n] = v; } };
    applyThemeAttribute(el, 'dark');
    expect(el.attrs[THEME_ATTRIBUTE]).toBe('catppuccin-mocha');
  });

  it('pre-paint script resolves stored preference over OS and never throws without storage', () => {
    // The script is generated from the same constants — sanity-check its content.
    expect(PREPAINT_SCRIPT).toContain('catppuccin-latte');
    expect(PREPAINT_SCRIPT).toContain('catppuccin-mocha');
    expect(PREPAINT_SCRIPT).toContain(THEME_STORAGE_KEY);
    expect(PREPAINT_SCRIPT).not.toMatch(/fetch\(|XMLHttpRequest|beacon/i);
  });
});
