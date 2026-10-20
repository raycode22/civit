<script lang="ts">
  // Civit UUID Generator UI — Phase 3, Prompt 3B.
  // Svelte 5 runes island. Generation is fully local via Web Crypto
  // (crypto.randomUUID / getRandomValues) — never Math.random, never sent
  // anywhere, never persisted (Constitution Art. I). Copy/download happen
  // only after an explicit user action.
  import { generateUuidBatch, uuidsToPlainText, MAX_BATCH_SIZE } from '../../lib/tools/uuid';
  import { copyToClipboard } from '../../lib/tools/json';

  let count = $state(5);
  let uuids = $state<string[]>([]);
  let statusMessage = $state('');
  let errorText = $state('');

  const output = $derived(uuidsToPlainText(uuids));

  function onGenerate() {
    const parsed = Number(count);
    const res = generateUuidBatch(parsed);
    if (res.ok) {
      uuids = res.uuids;
      errorText = '';
      statusMessage = `Generated ${res.uuids.length} UUID${res.uuids.length === 1 ? '' : 's'}.`;
    } else {
      uuids = [];
      errorText = res.error;
      statusMessage = 'Generation failed. Fix the settings and try again.';
    }
  }

  async function onCopy() {
    if (!output) {
      statusMessage = 'Nothing to copy yet.';
      return;
    }
    const ok = await copyToClipboard(output);
    statusMessage = ok
      ? 'UUIDs copied to clipboard.'
      : 'Copy failed — your browser blocked clipboard access. Select the text manually.';
  }

  function onDownload() {
    if (!output) {
      statusMessage = 'Nothing to download yet.';
      return;
    }
    // Explicit user action only; object URL revoked immediately after click.
    const blob = new Blob([output + '\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'civit-uuids.txt';
    a.click();
    URL.revokeObjectURL(url);
    statusMessage = 'Download started (plain text, one UUID per line).';
  }

  function onClear() {
    uuids = [];
    errorText = '';
    statusMessage = 'Cleared.';
  }
</script>

<div class="flex flex-col gap-6">
  <section aria-labelledby="uuid-settings-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="uuid-settings-heading" class="card-title text-lg">Settings</h2>
      <label class="text-sm font-medium" for="uuid-count">How many UUIDs? (1–{MAX_BATCH_SIZE})</label>
      <input
        id="uuid-count"
        type="number"
        min="1"
        max={MAX_BATCH_SIZE}
        step="1"
        bind:value={count}
        class="input input-bordered w-32 font-mono" />
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-primary" on:click={onGenerate}>Generate</button>
        <button type="button" class="btn btn-neutral" on:click={onClear} disabled={uuids.length === 0}>Clear</button>
      </div>
    </div>
  </section>

  <!-- Accessible status/error region: polite announcements + visible alert -->
  <p class="sr-only" role="status" aria-live="polite">{statusMessage}</p>
  {#if errorText}
    <div class="alert alert-error" role="alert">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
      <span>{errorText}</span>
    </div>
  {/if}

  <section aria-labelledby="uuid-output-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="uuid-output-heading" class="card-title text-lg">Generated UUIDs</h2>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onCopy} disabled={!output}>Copy</button>
          <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onDownload} disabled={!output}>Download .txt</button>
        </div>
      </div>
      <textarea
        id="uuid-output"
        readonly
        value={output}
        rows="10"
        spellcheck="false"
        aria-label="Generated UUIDs (read-only)"
        class="textarea w-full font-mono text-sm bg-base-100"
        placeholder="Generated UUIDs appear here, one per line."></textarea>
    </div>
  </section>
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
