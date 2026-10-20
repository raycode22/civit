<script lang="ts">
  // Theme toggle island — Svelte 5 runes + daisyUI button styles (Prompt 1B revision).
  // Deliberately tiny: one explicit light/dark control backed by Catppuccin
  // Latte/Mocha. The pre-paint inline script in BaseLayout already applied the
  // resolved theme to <html data-theme>; here we only sync state and clicks.
  import { onMount } from 'svelte';
  import {
    THEME_ATTRIBUTE,
    DAISY_THEME,
    nextPreference,
    readStoredPreference,
    resolveTheme,
    themeFromDaisyName,
    writeStoredPreference,
    type Theme,
  } from '../lib/theme/theme';

  let theme = $state<Theme>('light'); // SSR-safe default; corrected on mount.
  let announced = $state(false); // concise, polite live-region message.

  const label = $derived(theme === 'dark' ? 'Switch to light theme (Catppuccin Latte)' : 'Switch to dark theme (Catppuccin Mocha)');
  const icon = $derived(theme === 'dark' ? '☀' : '☾');

  function syncFromDocument(): void {
    if (typeof document === 'undefined') return;
    const attr = document.documentElement.getAttribute(THEME_ATTRIBUTE);
    const fromAttr = themeFromDaisyName(attr);
    if (fromAttr) {
      theme = fromAttr;
    } else {
      // Attribute missing/unrecognised (e.g. pre-paint script blocked): resolve ourselves.
      const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      theme = resolveTheme(readStoredPreference(tryLocalStorage()), systemPrefersDark);
      document.documentElement.setAttribute(THEME_ATTRIBUTE, DAISY_THEME[theme]);
    }
  }

  function tryLocalStorage(): Storage | null {
    try {
      return window.localStorage;
    } catch {
      return null; // Blocked (private mode / disabled cookies): run in memory.
    }
  }

  function toggle(): void {
    const next = nextPreference(theme);
    theme = next;
    document.documentElement.setAttribute(THEME_ATTRIBUTE, DAISY_THEME[next]);
    writeStoredPreference(tryLocalStorage(), next);
    announced = true;
  }

  onMount(() => {
    syncFromDocument();
  });
</script>

<div class="flex items-center gap-2">
  <button
    type="button"
    onclick={toggle}
    aria-label={label}
    class="btn btn-sm btn-variant-outline gap-1 normal-case"
  >
    <span aria-hidden="true">{icon}</span>
    <span class="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>

  <!-- Concise polite announcement; text-based, not colour-only. -->
  <span class="sr-only" role="status" aria-live="polite">
    {#if announced}Current theme: {theme}{/if}
  </span>
</div>
