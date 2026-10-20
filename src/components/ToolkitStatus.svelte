<script lang="ts">
  // Svelte 5 runes component — the single interactive island verifying that
  // @astrojs/svelte + Svelte 5 compile and hydrate in the static build.
  // Intentionally tiny: no fetch, no storage, no analytics; all computation is local.
  import { countLocalWords } from '../lib/text/wordCount';

  let sample = $state('Type or paste text here to test local processing');

  const words = $derived(countLocalWords(sample));
  const chars = $derived(sample.length);
</script>

<div class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
  <div class="card-body gap-0">
    <label for="toolkit-sample" class="block text-sm font-medium">
      Sample text (processed only in this browser tab)
    </label>
    <textarea
      id="toolkit-sample"
      rows="3"
      class="textarea mt-2 w-full resize-y"
      bind:value={sample}
    ></textarea>

    <!-- aria-live so screen readers announce updated counts; text, not colour-only. -->
    <p class="mt-3 text-sm text-base-content/70" aria-live="polite">
      Words: <strong class="badge badge-primary badge-soft px-2 normal-case">{words}</strong> ·
      Characters: <strong class="badge badge-neutral badge-soft px-2 normal-case">{chars}</strong>
    </p>
  </div>
</div>
