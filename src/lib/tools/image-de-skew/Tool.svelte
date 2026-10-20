<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { deskewImage, formatBytes } from './logic';
  import { FileDropZone } from '$lib/components/FileDropZone.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { Download, RotateCcw, Copy, Check, Upload } from '@lucide/svelte';

  export let meta: ToolMeta;

  let file = $state<File | null>(null);
  let result = $state<{ dataUri: string; size: number } | null>(null);
  let error = $state<string | null>(null);
  let processing = $state(false);
  let progress = $state(0);
  let copied = $state(false);

  async function handleFile(f: File): Promise<void> {
    error = null;
    result = null;
    const invalid = await validateFile(f);
    if (invalid) {
      error = describeError(invalid);
      return;
    }
    file = f;
    processing = true;
    progress = 0;
    try {
      progress = 0.4;
      result = await deskewImage(f);
      progress = 1;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Deskew failed.';
    } finally {
      processing = false;
    }
  }

  async function validateFile(f: File): Promise<string | null> {
    if (f.size === 0) return 'That file is empty.';
    if (f.size > 30 * 1024 * 1024) return `File is too large (${formatBytes(f.size)}). Maximum is 30 MB.`;
    if (!f.type.startsWith('image/')) return `Unsupported file type: ${f.type || 'unknown'}. Please choose an image.`;
    return null;
  }

  function describeError(err: string | null): string {
    if (!err) return '';
    return err;
  }

  function copyResult(): void {
    if (!result) return;
    navigator.clipboard.writeText(result.dataUri).then(() => {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    }).catch(() => {
      error = 'Clipboard access was blocked by the browser.';
    });
  }

  function downloadResult(): void {
    if (!result) return;
    const link = document.createElement('a');
    link.download = `deskweed-${file.name.replace(/\\.[^.]+$/, '')}.png`;
    link.href = result.dataUri;
    link.click();
    link.remove();
  }

  $effect(() => {
    if (!result) copied = false;
  });
</script>

<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <StatusBadge status={meta.status} offline={meta.offline} />
  </div>
  <p class="opacity-80 -mt-4">{meta.description}</p>

  <FileDropZone onfile={handleFile} label="Drop an image here to deskew" hint="Click or drop a rotated image to straighten it" />

  {#if processing}
    <div class="flex items-center gap-3">
      <progress class="progress progress-primary flex-1" value={progress} max="1" aria-label="Deskewing progress" />
      <span class="text-sm opacity-70">{Math.round(progress * 100)}%</span>
    </div>
  {/if}

  {#if error}
    <div class="alert alert-error text-sm" role="alert">{error}</div>
  {/if}

  {#if result}
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="font-semibold">Deskewed {file?.name} ({formatBytes(result.size)} output)</h3>
        <div class="flex gap-2">
          <button type="button" class="btn btn-sm btn-outline" onclick={downloadResult}>
            <Download class="size-4 mr-1" aria-hidden="true" /> Download
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick={copyResult}>
            {#if copied}<Check class="size-4 mr-1" aria-hidden="true" /> Copied{:else}<Copy class="size-4 mr-1" aria-hidden="true" /> Copy{/if}
          </button>
        </div>
      </div>
      <img src={result.dataUri} alt="Deskewed preview" class="max-h-64 rounded border" />
    </div>
  {/if}
</div>
