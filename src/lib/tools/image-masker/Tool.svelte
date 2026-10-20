<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { maskImage, MaskRegion, clamp } from './logic';
  import { FileDropZone } from '$lib/components/FileDropZone.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { Download, Mask, Copy, Check, Upload, X } from '@lucide/svelte';

  export let meta: ToolMeta;

  let file = $state<File | null>(null);
  let preview = $state<string | null>(null);
  let result = $state<{ dataUri: string; size: number } | null>(null);
  let error = $state<string | null>(null);
  let processing = $state(false);
  let progress = $state(0);
  let copied = $state(false);
  let region = $state<MaskRegion>({ x: 0, y: 0, width: 120, height: 80 });
  let dragging = $state(false);

  async function handleFile(f: File): Promise<void> {
    error = null;
    result = null;
    if (f.size === 0) {
      error = 'That file is empty.';
      return;
    }
    if (f.size > 30 * 1024 * 1024) {
      error = `File is too large (${formatBytes(f.size)}). Maximum is 30 MB.`;
      return;
    }
    if (!f.type.startsWith('image/')) {
      error = `Unsupported file type: ${f.type || 'unknown'}. Please choose an image.`;
      return;
    }
    file = f;
    preview = await loadPreview(f);
    region = { x: 0, y: 0, width: 120, height: 80 };
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let v = bytes;
    let u = 'B';
    for (const unit of units) {
      v = v / 1024;
      u = unit;
      if (v < 1024) break;
    }
    return `${v.toFixed(v >= 100 ? 0 : 1)} ${u}`;
  }

  async function loadPreview(f: File): Promise<string> {
    const bitmap = await createImageBitmap(f);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not supported in this browser.');
    ctx.drawImage(bitmap, 0, 0);
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    bitmap.close();
    return new Response(blob).text();
  }

  function mouseDownClientPos(e: MouseEvent): { x: number; y: number } {
    return { x: e.clientX, y: e.clientY };
  }

  function onPointerDown(e: MouseEvent): void {
    dragging = true;
    lastPos = mouseDownClientPos(e);
  }

  function onPointerMove(e: MouseEvent): void {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    region = {
      x: clamp(region.x + dx, 0, Infinity),
      y: clamp(region.y + dy, 0, Infinity),
      width: clamp(region.width + dx, 1, Infinity),
      height: clamp(region.height + dy, 1, Infinity)
    };
    lastPos = mouseDownClientPos(e);
  }

  function onPointerUp(): void {
    dragging = false;
  }

  let draggingStart = $state<{ x: number; y: number } | null>(null);

  function onDragStart(e: MouseEvent): void {
    draggingStart = mouseDownClientPos(e);
  }

  function onDragMove(e: MouseEvent): void {
    if (!draggingStart) return;
    const dx = e.clientX - draggingStart.x;
    const dy = e.clientY - draggingStart.y;
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    region = {
      x: clamp(region.x + dx, 0, Infinity),
      y: clamp(region.y + dy, 0, Infinity),
      width: clamp(region.width + dx, 1, Infinity),
      height: clamp(region.height + dy, 1, Infinity)
    };
    draggingStart = null;
  }

  async function applyMask(): Promise<void> {
    error = null;
    if (!file) return;
    processing = true;
    progress = 0;
    try {
      progress = 0.3;
      result = await maskImage(file, region);
      progress = 1;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Masking failed.';
    } finally {
      processing = false;
    }
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
    link.download = `masked-${file?.name.replace(/\\.[^.]+$/, '')}.png`;
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

  <FileDropZone onfile={handleFile} label="Drop an image here" hint="Click or drop an image to mask a region" />

  {#if file && preview}
    <div class="card card-bordered bg-base-200">
      <div class="card-body p-4 space-y-4">
        <div class="relative">
          <img src={preview} alt="Source preview" class="max-h-64 rounded border" />
          {#if region.width > 0 && region.height > 0}
            <div
              class="absolute inset-0 pointer-events-none"
              style="clip-path: inset({region.y}px {region.x + region.width - region.x}px {region.y + region.height - region.y}px {region.x}px);"
            >
              <div class="absolute inset-0 border-2 border-red-500/60 pointer-events-auto" style="clip-path: inset({region.y}px {region.x + region.width - region.x}px {region.y + region.height - region.y}px {region.x}px);"></div>
            </div>
          {/if}
        </div>

        <div class="flex flex-wrap gap-2 items-end">
          <label class="label cursor-pointer">
            <span>Region ({region.width} x {region.height}px)</span>
            <input
              type="range"
              min={0}
              max={file ? Math.max(1, (file.size || 0)) : 100}
              bind:value={region.width}
            />
          </label>
          <label class="label cursor-pointer">
            <span>Height</span>
            <input
              type="range"
              min={1}
              max={file ? Math.max(1, (file.size || 0)) : 100}
              bind:value={region.height}
            />
          </label>
          <label class="label cursor-pointer">
            <span>X</span>
            <input type="number" bind:value={region.x} class="input input-bordered w-20" />
          </label>
          <label class="label cursor-pointer">
            <span>Y</span>
            <input type="number" bind:value={region.y} class="input input-bordered w-20" />
          </label>
          <button type="button" class="btn btn-sm btn-outline" onmousedown={onDragStart} onmousemove={onDragMove} onmouseup={onPointerUp} onpointerdown={onPointerDown} onpointermove={onPointerMove} onpointerup={onPointerUp}>
            <Mask class="size-4 mr-1" aria-hidden="true" /> Move region
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick={() => (region = { x: 0, y: 0, width: 120, height: 80 })}>
            <X class="size-4 mr-1" aria-hidden="true" /> Reset
          </button>
        </div>

        {#if error}
          <div class="alert alert-error text-sm" role="alert">{error}</div>
        {/if}

        <div class="flex gap-2">
          <button type="button" class="btn btn-primary" disabled={processing} onclick={applyMask}>
            {#if processing}Masking…{:else}Mask region{/if}
          </button>
          {#if result}
            <button type="button" class="btn btn-sm btn-outline" onclick={downloadResult}>
              <Download class="size-4 mr-1" aria-hidden="true" /> Download masked
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick={copyResult}>
              {#if copied}<Check class="size-4 mr-1" aria-hidden="true" /> Copied{:else}<Copy class="size-4 mr-1" aria-hidden="true" /> Copy{/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
