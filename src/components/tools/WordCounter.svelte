<script lang="ts">
  // Civit Word Counter UI — Phase 3, Prompt 3C.
  // Svelte 5 runes island. All counting is local/in-memory (Constitution Art. I):
  // text is never sent anywhere and never persisted. Live stats update as the
  // user types; no debounce needed at the documented input limit for typical use.
  import { computeWordStats, countWords, MAX_WORD_INPUT_CHARS } from '../../lib/text/wordStats';

  const INPUT_PLACEHOLDER = 'Type or paste text to count it…';

  let input = $state('');

  const tooLarge = $derived(input.length > MAX_WORD_INPUT_CHARS);
  const stats = $derived(computeWordStats(tooLarge ? '' : input));

  const entries: Array<[string, number | string]> = $derived(
    tooLarge
      ? []
      : [
          ['Words', stats.words],
          ['Characters', stats.characters],
          ['Characters (no spaces)', stats.charactersExcludingWhitespace],
          ['Lines', stats.lines],
          ['Sentences (approx.)', stats.sentences],
          ['Paragraphs', stats.paragraphs],
          ['Reading time (approx.)', stats.readingMinutes === 0 ? '—' : `~${stats.readingMinutes} min`],
        ],
  );

  function onClear() {
    input = '';
  }

  // Polite live-region summary (not colour-only; text carries all meaning).
  const summary = $derived(
    tooLarge
      ? 'Input exceeds the size limit; statistics paused.'
      : `${countWords(input)} words, ${stats.characters} characters.`,
  );
</script>

<div class="flex flex-col gap-6">
  <section aria-labelledby="wc-input-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="wc-input-heading" class="card-title text-lg">Your text</h2>
      <label class="text-sm font-medium" for="wc-input">Text to analyze</label>
      <textarea
        id="wc-input"
        bind:value={input}
        rows="10"
        spellcheck="false"
        class="textarea textarea-primary w-full"
        placeholder={INPUT_PLACEHOLDER}></textarea>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="sr-only" role="status" aria-live="polite">{summary}</p>
        <p aria-hidden="true" class="text-sm text-[var(--civit-subtext-1)]">{summary}</p>
        <button type="button" class="btn btn-neutral btn-sm" on:click={onClear}>Clear</button>
      </div>
      {#if tooLarge}
        <!-- Error alert with icon + text (never colour-only). -->
        <div class="alert alert-error" role="alert">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <span>Input too large ({input.length.toLocaleString()} characters). Limit: {MAX_WORD_INPUT_CHARS.toLocaleString()}. Statistics are paused until you shorten it.</span>
        </div>
      {/if}
    </div>
  </section>

  {#if !tooLarge}
    <section aria-labelledby="wc-stats-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
      <div class="card-body gap-3">
        <h2 id="wc-stats-heading" class="card-title text-lg">Statistics</h2>
        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
          {#each entries as [label, value] (label)}
            <div class="rounded-box bg-base-100 p-3">
              <dt class="text-xs uppercase tracking-wide text-[var(--civit-subtext-1)]">{label}</dt>
              <dd class="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          {/each}
        </dl>
        <p class="text-sm text-[var(--civit-subtext-1)]">
          Counting rule: a word is any run of characters separated by whitespace. This works well for
          space-separated languages but does not segment scripts written without spaces (e.g. Chinese).
          Sentence counts are approximate. Reading time assumes ~200 words per minute.
        </p>
      </div>
    </section>
  {/if}
</div>

<style>
  /* Screen-reader-only utility kept scoped to this island (same pattern as JsonFormatter). */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
