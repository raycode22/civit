<script lang="ts">
  // Civit JSON Formatter UI — Phase 3, Prompt 3A (first vertical slice).
  // Svelte 5 runes island. All processing is local/in-memory (Constitution Art. I):
  // input is never sent anywhere, never persisted, and never executed (native
  // JSON.parse/stringify only — see src/lib/tools/json.ts).
  import { formatJson, minifyJson, copyToClipboard, type JsonResult } from '../../lib/tools/json';

  // Static sample shown in the empty input box (kept out of markup so Svelte
  // does not parse its braces as template expressions).
  const INPUT_PLACEHOLDER = '{"paste":"your JSON here"}';

  let input = $state('');
  let output = $state('');
  let result = $state<JsonResult | null>(null);
  let statusMessage = $state('');

  const hasError = $derived(result !== null && result.ok === false);
  const errorText = $derived(
    result && !result.ok
      ? result.error.line !== undefined && result.error.column !== undefined
        ? `${result.error.message} (line ${result.error.line}, column ${result.error.column})`
        : result.error.message
      : '',
  );

  function apply(res: JsonResult) {
    result = res;
    if (res.ok) {
      output = res.output;
      statusMessage = 'Done. Output updated below.';
    } else {
      // Preserve the user's input on invalid JSON — never clear it.
      output = '';
      statusMessage = 'Invalid JSON. Your input was preserved.';
    }
  }

  function onFormat() {
    apply(formatJson(input));
  }
  function onMinify() {
    apply(minifyJson(input));
  }
  function onClear() {
    input = '';
    output = '';
    result = null;
    statusMessage = 'Cleared.';
  }
  async function onCopy() {
    if (!output) {
      statusMessage = 'Nothing to copy yet.';
      return;
    }
    const ok = await copyToClipboard(output);
    statusMessage = ok
      ? 'Output copied to clipboard.'
      : 'Copy failed — your browser blocked clipboard access. Select the output text manually.';
  }
</script>

<div class="flex flex-col gap-6">
  <section aria-labelledby="json-input-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="json-input-heading" class="card-title text-lg">Input</h2>
      <label class="text-sm font-medium" for="json-input">JSON text</label>
      <textarea
        id="json-input"
        bind:value={input}
        rows="10"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="textarea textarea-primary w-full font-mono text-sm"
        placeholder={INPUT_PLACEHOLDER}></textarea>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-primary" on:click={onFormat}>Format</button>
        <button type="button" class="btn btn-secondary" on:click={onMinify}>Minify</button>
        <button type="button" class="btn btn-neutral" on:click={onClear}>Clear</button>
      </div>
    </div>
  </section>

  <!-- Accessible status/error region: polite announcements + visible alert -->
  <p class="sr-only" role="status" aria-live="polite">{statusMessage}</p>
  {#if hasError}
    <!-- Error alert: white on Latte Red = 5.43:1 AA (see style guide §9). -->
    <div class="alert alert-error" role="alert">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
      <span>{errorText}</span>
    </div>
  {/if}

  <section aria-labelledby="json-output-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="json-output-heading" class="card-title text-lg">Output</h2>
        <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onCopy} disabled={!output}>
          Copy output
        </button>
      </div>
      <textarea
        id="json-output"
        readonly
        value={output}
        rows="10"
        aria-label="Formatted JSON output (read-only)"
        class="textarea w-full font-mono text-sm bg-base-100"
        placeholder="Results appear here."></textarea>
    </div>
  </section>
</div>

<style>
  /* Screen-reader-only utility kept scoped to this island (no global CSS added). */
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
