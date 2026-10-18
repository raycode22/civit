<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { pxToRem, remToPx, formatNumber } from './logic';
  import { downloadText } from '$lib/io/download';
  import { Download } from '@lucide/svelte';

  export let meta: ToolMeta;

  let px = '';
  let rem = '';
  let result = '';
  let error = '';
  let converting = false;

  function convert(): void {
    error = '';
    converting = true;
    const input = parseFloat(px);
    if (Number.isNaN(input) || input < 0) {
      error = 'Enter a non-negative number.';
      converting = false;
      return;
    }
    result = `${formatNumber(pxToRem(input))} rem`;
    converting = false;
  }

  function toPx(): void {
    error = '';
    const input = parseFloat(rem);
    if (Number.isNaN(input) || input < 0) {
      error = 'Enter a non-negative number.';
      return;
    }
    result = `${formatNumber(remToPx(input))} px`;
  }

  function download(): void {
    if (!result) return;
    downloadText('px-to-rem.txt', `Result: ${result}`);
  }
</script>

<div class="max-w-2xl mx-auto w-full space-y-6">
  <header class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </header>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <div>
        <label for="px" class="label">Pixels (px)</label>
        <input
          id="px"
          bind:value={px}
          onkeydown={(e) => e.key === 'Enter' && convert()}
          placeholder="e.g. 16"
          inputmode="decimal"
          class="input input-bordered w-full"
        />
      </div>
      <div>
        <label for="rem" class="label">REM (rem)</label>
        <input
          id="rem"
          bind:value={rem}
          onkeydown={(e) => e.key === 'Enter' && toPx()}
          placeholder="e.g. 1.5"
          inputmode="decimal"
          class="input input-bordered w-full"
        />
      </div>
      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary" onclick={convert} disabled={converting}>
          {converting ? 'Converting…' : 'PX → REM'}
        </button>
        <button class="btn btn-ghost" onclick={toPx} disabled={!rem}>
          REM → PX
        </button>
        {#if result}
          <button class="btn btn-accent" onclick={download}>
            <Download class="size-4 mr-1" aria-hidden="true" /> Download result
          </button>
        {/if}
      </div>
      {#if result}
        <div class="alert alert-info text-sm" role="status">
          <span class="font-mono">{result}</span>
        </div>
      {/if}
    </div>
  </div>

  <p class="text-xs opacity-60 text-center">Runs entirely in your browser. Nothing is uploaded.</p>
</div>
