<script lang="ts">
  // Civit Password Generator UI — Phase 3, Prompt 3B.
  // Svelte 5 runes island. Uses Web Crypto with rejection sampling (no modulo
  // bias). The generated password is NOT uploaded, NOT stored automatically,
  // and NEVER logged or persisted by this app (Constitution Art. I). It lives
  // only in page memory until the user copies it or navigates away.
  import { generatePassword, MIN_LENGTH, MAX_LENGTH, type PasswordOptions } from '../../lib/tools/password';
  import { copyToClipboard } from '../../lib/tools/json';

  let length = $state(20);
  let lowercase = $state(true);
  let uppercase = $state(true);
  let digits = $state(true);
  let symbols = $state(true);

  let password = $state('');
  let statusMessage = $state('');
  let errorText = $state('');

  function currentOptions(): PasswordOptions {
    return {
      length: Number(length),
      lowercase,
      uppercase,
      digits,
      symbols,
    };
  }

  function onGenerate() {
    const res = generatePassword(currentOptions());
    if (res.ok) {
      password = res.password;
      errorText = '';
      statusMessage = 'Password generated. It stays in memory on this device only.';
    } else {
      password = '';
      errorText = res.error;
      statusMessage = 'Generation failed. Adjust the options and try again.';
    }
  }

  async function onCopy() {
    if (!password) {
      statusMessage = 'Nothing to copy yet.';
      return;
    }
    const ok = await copyToClipboard(password);
    statusMessage = ok
      ? 'Password copied to clipboard.'
      : 'Copy failed — your browser blocked clipboard access. Select the text manually.';
  }

  function onClear() {
    password = '';
    errorText = '';
    statusMessage = 'Cleared. No password data is retained.';
  }
</script>

<div class="flex flex-col gap-6">
  <section aria-labelledby="pw-options-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <h2 id="pw-options-heading" class="card-title text-lg">Options</h2>
      <label class="text-sm font-medium" for="pw-length">Length ({MIN_LENGTH}–{MAX_LENGTH})</label>
      <input
        id="pw-length"
        type="number"
        min={MIN_LENGTH}
        max={MAX_LENGTH}
        step="1"
        bind:value={length}
        class="input input-bordered w-32 font-mono" />
      <fieldset class="border border-[var(--civit-border-subtle)] rounded-box p-4">
        <legend class="text-sm font-medium px-1">Character sets</legend>
        <div class="flex flex-wrap gap-x-8 gap-y-3">
          <label class="label cursor-pointer gap-2" for="pw-lowercase">
            <input id="pw-lowercase" type="checkbox" class="checkbox checkbox-primary" bind:checked={lowercase} />
            <span class="label-text">Lowercase (a–z)</span>
          </label>
          <label class="label cursor-pointer gap-2" for="pw-uppercase">
            <input id="pw-uppercase" type="checkbox" class="checkbox checkbox-primary" bind:checked={uppercase} />
            <span class="label-text">Uppercase (A–Z)</span>
          </label>
          <label class="label cursor-pointer gap-2" for="pw-digits">
            <input id="pw-digits" type="checkbox" class="checkbox checkbox-primary" bind:checked={digits} />
            <span class="label-text">Digits (0–9)</span>
          </label>
          <label class="label cursor-pointer gap-2" for="pw-symbols">
            <input id="pw-symbols" type="checkbox" class="checkbox checkbox-primary" bind:checked={symbols} />
            <span class="label-text">Symbols</span>
          </label>
        </div>
      </fieldset>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn btn-primary" on:click={onGenerate}>Generate</button>
        <button type="button" class="btn btn-neutral" on:click={onClear} disabled={!password}>Clear</button>
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

  <section aria-labelledby="pw-output-heading" class="card border border-[var(--civit-border-subtle)] bg-base-200 shadow-sm">
    <div class="card-body gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="pw-output-heading" class="card-title text-lg">Generated password</h2>
        <button type="button" class="btn btn-outline btn-primary btn-sm" on:click={onCopy} disabled={!password}>
          Copy password
        </button>
      </div>
      <input
        id="pw-output"
        type="text"
        readonly
        value={password}
        spellcheck="false"
        autocomplete="off"
        aria-label="Generated password (read-only)"
        class="input input-bordered w-full font-mono text-sm bg-base-100"
        placeholder="Your generated password appears here." />
      <p class="text-sm leading-relaxed">
        This password is generated locally with the browser's cryptographic random API.
        It is never uploaded, logged, or saved automatically — copying it is the only way
        it leaves this page, and that requires your explicit action.
      </p>
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
