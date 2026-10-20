<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import { computeFontSize, FONT_STACK, computeScale } from './logic';
  import { downloadText } from '$lib/io/download';
  import { Download, TextScale, Check, Copy } from '@lucide/svelte';

  export let meta: ToolMeta;

  let text = $state('');
  let fontSize = $state(256);
  let preview = $state<string | null>(null);
  let error = $state('');
  let copied = $state(false);

  function generate(): void {
    error = '';
    if (text.trim().length === 0) {
      error = 'Enter text to display.';
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        error = 'Canvas 2D is not supported in this browser.';
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#111111';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      preview = canvas.toDataURL('image/png');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Generation failed.';
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
  <div class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </div>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <div class="flex flex-col gap-2">
        <label for="text" class="label">Text</label>
        <textarea
          id="text"
          bind:value={text}
          onkeydown={(e) => e.key === 'Enter' && generate()}
          class="textarea textarea-bordered font-mono text-sm h-24 w-full"
          placeholder="Enter text to display very large..."
          rows={4}
        ></textarea>
      </div>

      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label for="size" class="label">Font size</label>
          <input
            id="size"
            type="range"
            bind:value={fontSize}
            min={24}
            max={400}
            step={4}
            class="range range-primary"
          />
          <div class="flex justify-between text-xs opacity-60">
            <span>24</span>
            <span>{fontSize} px</span>
            <span>400</span>
          </div>
        </div>
      </div>

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      {#if preview}
        <div class="flex gap-4 items-center">
          <img src={preview} alt="Large type preview" class="max-w-full max-h-64 rounded border" />
          <div class="flex flex-col gap-2">
            <div class="text-sm opacity-70">Font size: {fontSize} px</div>
            <div class="flex gap-2">
              <button type="button" class="btn btn-sm btn-outline" onclick={() => downloadText('large-type.txt', text)}>
                <Download class="size-4 mr-1" aria-hidden="true" /> Save text
              </button>
              <button type="button" class="btn btn-sm btn-outline" onclick={copyResult}>
                {#if copied}<Check class="size-4 mr-1" aria-hidden="true" /> Copied{:else}<Copy class="size-4 mr-1" aria-hidden="true" /> Copy{/if}
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<script lang="ts">
  import { onDestroy } from 'svelte';

  $effect(() => {
    if (!text.trim()) copied = false;
  });
</script>
