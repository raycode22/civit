<script lang="ts">
  // Civit URL Encoder/Decoder UI — Phase 3, Prompt 3C.
  // Svelte 5 runes island. Uses the platform encodeURIComponent/decodeURIComponent
  // APIs (see src/lib/text/urlCodec.ts). All processing is local; nothing is
  // sent anywhere or persisted.
  import { encodeComponent, decodeComponent, type UrlResult } from '../../lib/text/urlCodec';
  import { copyToClipboard } from '../../lib/tools/json';

  let input = $state('');
  let output = $state('');
  let errorText = $state('');
  let warningText = $state('');
  let statusMessage = $state('');

  function apply(res: UrlResult, successNote: string) {
    warningText = res.warning ?? '';
    if (res.ok) {
      output = res.output;
      errorText = '';
      statusMessage = res.warning ? `${successNote} with warnings — see the notice above the output.` : 'Done. Output updated below.';
    } else {
      output = '';
      errorText = res.error;
      statusMessage = 'The operation failed. Your input was preserved.';
    }
  }

  function onEncode() {
    if (input === '') {
      errorText = 'Nothing to encode — the input is empty.';
      output = '';
      statusMessage = 'Enter some text first.';
      return;
    }
    apply(encodeComponent(input), 'Encoded');
  }
  function onDecode() {
    if (input === '') {
      errorText = 'Nothing to decode — the input is empty.';
      output = '';
      statusMessage = 'Paste percent-encoded text first.';
      return;
    }
    apply(decodeComponent(input), 'Decoded');
  }
  function onClear() {
    input = '';
    output = '';
    errorText = '';
    warningText = '';
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
  <div class="alert alert-info" role="note">
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
    <span><strong>Percent-encoding is an encoding, not encryption.</strong> It makes text safe for URLs; it does not hide or protect it.</span>
  </div>

  <section aria-labelledby="url-input-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="url-input-heading" class="card-title text-lg">Input</h2>
      <label class="text-sm font-medium" for="url-input">Text or percent-encoded string</label>
      <textarea
        id="url-input"
        bind:value={input}
        rows="6"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="textarea textarea-primary w-full font-mono text-sm"
        placeholder="Type text to encode, or paste %XX-encoded text to decode…"></textarea>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-primary" on:click={onEncode}>Encode component</button>
        <button type="button" class="btn btn-secondary" on:click={onDecode}>Decode</button>
        <button type="button" class="btn btn-neutral" on:click={onClear}>Clear</button>
      </div>
      <p class="text-sm text-[var(--civit-subtext-1)]">
        Encode mode follows <code>encodeURIComponent</code>: spaces become <code>%20</code> and reserved
        URL characters are escaped, so results are safe inside a single query parameter or path segment.
      </p>
    </div>
  </section>

  <p class="sr-only" role="status" aria-live="polite">{statusMessage}</p>
  {#if errorText}
    <div class="alert alert-error" role="alert">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
      <span>{errorText}</span>
    </div>
  {/if}
  {#if warningText}
    <!-- Warning uses Yellow per style guide; icon + text carry meaning, not colour alone. -->
    <div class="alert alert-warning" role="alert">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.036 8.586a1.5 1.5 0 011.294-2.25h17.484a1.5 1.5 0 011.294 2.25L13.29 5.25a1.5 1.5 0 00-2.588 0L2.964 19.336zM12 15.75h.008v.008H12v-.008z" />
      </svg>
      <span>{warningText}</span>
    </div>
  {/if}

  <section aria-labelledby="url-output-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="url-output-heading" class="card-title text-lg">Output</h2>
        <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onCopy} disabled={!output}>
          Copy output
        </button>
      </div>
      <textarea
        id="url-output"
        readonly
        value={output}
        rows="6"
        aria-label="URL encoding result (read-only)"
        class="textarea w-full font-mono text-sm bg-base-100"
        placeholder="Results appear here."></textarea>
    </div>
  </section>
</div>

<style>
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
