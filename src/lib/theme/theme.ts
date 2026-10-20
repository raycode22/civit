/**
 * Theme resolution & persistence — pure, browser-free logic (Prompt 1B).
 *
 * Everything here is local-only: no network, no analytics. `Storage` and the
 * parts of the media-query API we use are injected as narrow interfaces so
 * this module can be unit-tested in Node without a DOM.
 */

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

export const THEME_STORAGE_KEY = 'civit-theme-preference';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || isTheme(value);
}

/** Minimal slice of the Storage API we depend on (may throw — see below). */
export interface MaybeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Read the stored explicit preference. Returns null when nothing is stored or
 * storage is unavailable/throwing (private mode, disabled cookies, SSR).
 */
export function readStoredPreference(storage: MaybeStorage | null | undefined): ThemePreference | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    return raw !== null && isThemePreference(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Persist the explicit preference; never throws, even if storage is broken. */
export function writeStoredPreference(storage: MaybeStorage | null | undefined, preference: ThemePreference): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage unavailable: keep the in-memory theme; fail silently by design.
  }
}

/**
 * Resolve which theme to apply: an explicit user choice always wins;
 * otherwise follow the operating-system preference (default dark).
 */
export function resolveTheme(preference: ThemePreference | null, systemPrefersDark: boolean): Theme {
  return preference === 'light' || preference === 'dark' ? preference : systemPrefersDark ? 'dark' : 'light';
}

/** The next explicit toggle step from the currently applied theme. */
export function nextPreference(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

/**
 * Attribute consumed by theme.css / daisyUI. Kept in one place so the inline
 * pre-paint script, the Svelte island, and the stylesheet cannot drift apart.
 * Applied on <html> before first paint to avoid a flash of the wrong theme.
 */
export const THEME_ATTRIBUTE = 'data-theme';

/** Catppuccin flavor backing each light/dark choice (docs/design/catppuccin-style-guide.md). */
export const DAISY_THEME: Record<Theme, string> = {
  light: 'catppuccin-latte',
  dark: 'catppuccin-mocha',
};

/** Map a raw data-theme value back to a light/dark choice (null if unknown). */
export function themeFromDaisyName(value: string | null): Theme | null {
  if (value === DAISY_THEME.light) return 'light';
  if (value === DAISY_THEME.dark) return 'dark';
  return null;
}

export function applyThemeAttribute(target: { setAttribute(name: string, value: string): void }, theme: Theme): void {
  // daisyUI selects its palette via data-theme="<theme-name>", so we write the
  // Catppuccin flavor name rather than the bare light/dark keyword.
  target.setAttribute(THEME_ATTRIBUTE, DAISY_THEME[theme]);
}

/**
 * Source for the tiny inline <script> that sets the theme before first paint.
 * Self-contained, defensive (never throws), local-only (no requests).
 */
export const PREPAINT_SCRIPT = `(function(){try{var d=document,k="${THEME_STORAGE_KEY}",a="${THEME_ATTRIBUTE}",m={"light":"${DAISY_THEME.light}","dark":"${DAISY_THEME.dark}"},v=null;try{v=localStorage.getItem(k)}catch(e){}var s=(v==="light"||v==="dark")?v:((window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light");d.documentElement.setAttribute(a,m[s]);}catch(e){}})();`;
