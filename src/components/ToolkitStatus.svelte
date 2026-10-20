<script lang="ts">
  // Svelte 5 runes component — the single interactive island verifying that
  // @astrojs/svelte + Svelte 5 compile and hydrate in the static build.
  // Intentionally tiny: no fetch, no storage, no analytics; all computation is local.
  import { countLocalWords } from '../lib/text/wordCount';

  let sample = $state('Type or paste text here to test local processing');

  const words = $derived(countLocalWords(sample));
  const chars = $derived(sample.length);
</script>

<div
  class="rounded-lg border border-[var(--civit-border)] bg-[var(--civit-surface)] p-4"
>
  <label for="toolkit-sample" class="block text-sm font-medium">
    Sample text (processed only in this browser tab)
  </label>
  <textarea
    id="toolkit-sample"
    rows="3"
    class="mt-2 w-full resize-y rounded border border-[var(--civit-border)] bg-[var(--civit-bg)] p-3 text-[var(--civit-text)]"
    bind:value={sample}
  ></textarea>

  <!-- aria-live so screen readers announce updated counts; text, not colour-only. -->
  <p class="mt-3 text-sm text-[var(--civit-muted)]" aria-live="polite">
    Words: <strong class="text-[var(--civit-text)]">{words}</strong> · Characters:
    <strong class="text-[var(--civit-text)]">{chars}</strong>
  </p>
</div>
