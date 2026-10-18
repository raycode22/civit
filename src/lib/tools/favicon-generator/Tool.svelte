<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { generateFavicon, downloadFavicon, formatDataUriSize } from './logic';
  import { downloadText } from '$lib/io/download';
  import { Download, Palette, Check, Copy } from '@lucide/svelte';

  export let meta: ToolMeta;

  let name = '';
  let preview = '';
  let error = '';
  let resultDataUri = '';
  let resultSize = '';
  let downloadable = false;
  let copied = false;

  function generate(): void {
    error = '';
    if (name.trim().length === 0) {
      error = 'Enter a name (e.g. "CN") to generate a favicon.';
      return;
    }
    try {
      preview = generateFavicon(name);
      resultDataUri = preview;
      resultSize = formatDataUriSize(preview);
      downloadable = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed.';
    }
  }

  function download(): void {
    if (!resultDataUri) return;
    downloadFavicon(name);
  }

  function copy(): void {
    downloadText('favicon.png', resultDataUri);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="max-w-2xl mx-auto w-full space-y-6">
  <header class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </header>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <div class="flex flex-wrap items-end gap-2">
        <label for="name" class="label w-32 shrink-0">Name</label>
        <input
          id="name"
          bind:value={name}
          onkeydown={(e) => e.key === 'Enter' && generate()}
          placeholder="e.g. CN"
          class="input input-bordered flex-1 min-w-0"
        />
        <button class="btn btn-primary" onclick={generate}>
          <Palette class="size-4 mr-1" aria-hidden="true" /> Generate
        </button>
      </div>

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      {#if preview}
        <div class="flex flex-col items-center gap-4">
          <div class="favicon-preview rounded border bg-white p-3">
            {preview} alt="Generated favicon for {name}" class="max-w-full max-h-40 rounded" />
          </div>
          <p class="text-xs opacity-60 text-center">{resultSize}</p>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline" onclick={download}>
              <Download class="size-4 mr-1" aria-hidden="true" /> Download PNG
            </button>
            <button class="btn btn-sm btn-outline" onclick={copy}>
              {#if copied}
                <Check class="size-4 mr-1" aria-hidden="true" /> Copied
              {:else}
                <Copy class="size-4 mr-1" aria-hidden="true" /> Copy
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <p class="text-xs opacity-60 text-center">Runs entirely in your browser. Nothing is uploaded.</p>
</div>
