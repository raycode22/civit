import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ThemeName = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'civit-theme';

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeName>('system');

  /** Apply the resolved theme to the document. */
  function apply(name: ThemeName): void {
    if (!browser || typeof document === 'undefined') return;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = name === 'system' ? (prefersDark ? 'dark' : 'light') : name;
    document.documentElement.dataset.theme = resolved;
  }

  return {
    subscribe,
    /** Set the theme preference, persist it, and apply it. */
    set(name: ThemeName): void {
      setFn(name);
    },
    init(): void {
      if (!browser) return;
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      setFn(stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system');
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        // Re-resolve when the OS preference changes and we are in system mode.
        getAndReapply();
      });
    },
    /** Cycle light -> dark -> system -> light. */
    toggle(): void {
      update((current) => {
        const next: ThemeName =
          current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
        setFn(next);
        return next;
      });
    }
  };

  function setFn(name: ThemeName): void {
    if (browser) localStorage.setItem(STORAGE_KEY, name);
    apply(name);
    set(name);
  }

  function getAndReapply(): void {
    update((current) => {
      apply(current);
      return current;
    });
  }
}

export const theme = createThemeStore();
