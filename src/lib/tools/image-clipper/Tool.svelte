<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { clipImage, computeClipRect, formatBytes } from './logic';
  import { downloadText } from '$lib/io/download';
  import { Crop, Download, Check, Copy, Upload } from '@lucide/svelte';

  const { meta } = $props();

  // [Stage 9A] `bind:files` yields a FileList (Svelte 5 binds `input.files`
  // directly); the single selected file is derived from it. Binding a File
  // here previously threw "Overload resolution failed" in createObjectURL
  // and left the preview/clip flow without a source URL.
  let fileList = $state<FileList | null>(null);
  const file = $derived(fileList && fileList.length > 0 ? fileList[0] : null);
  let imageUrl = $state<string | null>(null);
  let result = $state<{ dataUri: string; size: number } | null>(null);
  let error = $state<string | null>(null);
  let downloading = $state(false);
  let copied = $state(false);
  // Hidden file input; referenced from the drop-zone click/keyboard handlers.
  let input = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      imageUrl = url;
      return () => URL.revokeObjectURL(url);
    }
  });

  async function clip(): Promise<void> {
    error = null;
    const src = imageUrl;
    if (!src || !file) return;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode the image.'));
      el.src = src;
    });
    const rect = computeClipRect(img, 768, 512);
    try {
      result = await clipImage(file, rect);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Clip failed.';
    }
  }

  function download(): void {
    if (!result?.dataUri) return;
    downloading = true;
    downloadText('clipped-image.png', result.dataUri);
    setTimeout(() => (downloading = false), 1500);
  }

  function copy(): void {
    if (!result?.dataUri) return;
    navigator.clipboard.writeText(result.dataUri).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    });
  }
</script>

<div class="max-w-2xl mx-auto w-full space-y-6">
  <header class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </header>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      {#if !file}
        <div
          class="border-2 border-dashed border-base-300 rounded-lg p-10 text-center cursor-pointer"
          role="button"
          tabindex="0"
          onkeypress={(e) => {
            if (e.key === 'Enter') input?.click();
          }}
          onclick={() => input?.click()}
        >
          <input
            bind:files={fileList}
            bind:this={input}
            id="input"
            type="file"
            accept="image/*"
            hidden
            aria-label="Upload image"
          />
          <Upload class="size-8 mx-auto opacity-50" aria-hidden="true" />
          <p class="text-sm opacity-70">Click or drop an image to clip</p>
        </div>
      {:else}
        <div class="flex flex-col items-center gap-3">
          <img
            src={imageUrl}
            alt="Uploaded source preview"
            class="max-h-48 rounded border"
            width={768}
            height={512}
          />
          <button class="btn btn-primary btn-sm" onclick={clip}>
            <Crop class="size-4 mr-1" aria-hidden="true" /> Clip and export
          </button>
        </div>
      {/if}

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      {#if result}
        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center gap-2 text-sm opacity-70">
            <span>Result:</span>
            <span class="font-mono">{formatBytes(result.size)}</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline" onclick={download} disabled={downloading}>
              <Download class="size-4 mr-1" aria-hidden="true" />
              {downloading ? 'Downloading…' : 'Download PNG'}
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
