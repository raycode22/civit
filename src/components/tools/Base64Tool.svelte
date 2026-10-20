<script lang="ts">
  // Civit Base64 Encoder/Decoder UI — Phase 3, Prompt 3C.
  // Svelte 5 runes island. Encoding/decoding is local/in-memory (Constitution
  // Art. I): text never leaves the device and is never persisted.
  import { encodeBase64, decodeBase64, type CodecResult } from '../../lib/text/base64';
  import { copyToClipboard } from '../../lib/tools/json';

  let input = $state('');
  let output = $state('');
  let errorText = $state('');
  let statusMessage = $state('');

  function apply(res: CodecResult) {
    if (res.ok) {
      output = res.output;
      errorText = '';
      statusMessage = 'Done. Output updated below.';
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
    apply(encodeBase64(input));
  }
  function onDecode() {
    apply(decodeBase64(input));
  }
  function onClear() {
    input = '';
    output = '';
    errorText = '';
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
    <span><strong>Base64 is an encoding, not encryption.</strong> Anyone can decode Base64 back to the original text — do not treat it as protection for secrets.</span>
  </div>

  <section aria-labelledby="b64-input-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="b64-input-heading" class="card-title text-lg">Input</h2>
      <label class="text-sm font-medium" for="b64-input">Text or Base64 string</label>
      <textarea
        id="b64-input"
        bind:value={input}
        rows="8"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="textarea textarea-primary w-full font-mono text-sm"
        placeholder="Type text to encode, or paste Base64 to decode…"></textarea>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-primary" on:click={onEncode}>Encode to Base64</button>
        <button type="button" class="btn btn-secondary" on:click={onDecode}>Decode from Base64</button>
        <button type="button" class="btn btn-neutral" on:click={onClear}>Clear</button>
      </div>
    </div>
  </section>

  <p class="sr-only" role="status" aria-live="polite">{statusMessage}</p>
  {#if errorText}
    <!-- Error alert: icon + text, never colour-only (same pattern as JSON Formatter). -->
    <div class="alert alert-error" role="alert">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5 shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
      <span>{errorText}</span>
    </div>
  {/if}

  <section aria-labelledby="b64-output-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="b64-output-heading" class="card-title text-lg">Output</h2>
        <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onCopy} disabled={!output}>
          Copy output
        </button>
      </div>
      <textarea
        id="b64-output"
        readonly
        value={output}
        rows="8"
        aria-label="Base64 result (read-only)"
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
