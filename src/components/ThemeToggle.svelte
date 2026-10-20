<script lang="ts">
  // Theme toggle island — Svelte 5 runes (Prompt 1B).
  // Deliberately tiny: one explicit light/dark control, nothing more.
  // The pre-paint inline script in BaseLayout already applied the resolved
  // theme to <html data-theme>; here we only sync state and handle clicks.
  import { onMount } from 'svelte';
  import {
    THEME_ATTRIBUTE,
    isTheme,
    nextPreference,
    readStoredPreference,
    resolveTheme,
    writeStoredPreference,
    type Theme,
  } from '../lib/theme/theme';

  let theme = $state<Theme>('dark'); // SSR-safe default; corrected on mount.
  let announced = $state(false);     // concise, polite live-region message.

  const label = $derived(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  const icon = $derived(theme === 'dark' ? '☀' : '☾');

  function syncFromDocument(): void {
    if (typeof document === 'undefined') return;
    const attr = document.documentElement.getAttribute(THEME_ATTRIBUTE);
    if (isTheme(attr)) {
      theme = attr;
    } else {
      // Attribute missing (e.g. pre-paint script blocked): resolve ourselves.
      const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      theme = resolveTheme(readStoredPreference(tryLocalStorage()), systemPrefersDark);
      document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
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
    document.documentElement.setAttribute(THEME_ATTRIBUTE, next);
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
    class="rounded border border-[var(--civit-border)] bg-[var(--civit-bg)] px-2.5 py-1 text-base leading-none text-[var(--civit-text)] hover:border-[var(--civit-accent)]"
  >
    <span aria-hidden="true">{icon}</span>
  </button>

  <!-- Concise polite announcement; text-based, not colour-only. -->
  <span class="sr-only" role="status" aria-live="polite">
    {#if announced}Current theme: {theme}{/if}
  </span>
</div>
