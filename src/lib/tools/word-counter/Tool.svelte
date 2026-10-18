<script lang="ts">
  import type { ToolMeta } from '$lib/tools/types';
  import {
    countText,
    formatCount,
    type TextCount
  } from './logic';
  import { downloadText } from '$lib/io/download';
  import { Copy, Trash2 } from '@lucide/svelte';

  const { meta } = $props();

  let text = $state('');
  let result: TextCount | null = $state(null);
  let error = $state('');
  let copying = $state(false);
  let copied = $state(false);

  function count(): void {
    error = '';
    if (text.trim() === '') {
      error = 'Paste or type some text first.';
      result = null;
      return;
    }
    result = countText(text);
  }

  function copy(): void {
    if (!result) return;
    copying = true;
    const summary = [
      `Words: ${formatCount(result.words)}`,
      `Characters: ${formatCount(result.characters.withSpaces)} (no spaces: ${formatCount(result.characters.withoutSpaces)})`,
      `Sentences: ${formatCount(result.sentences)}`,
      `Paragraphs: ${formatCount(result.paragraphs)}`
    ].join('\n');
    downloadText('word-counter.txt', summary);
    copied = true;
    setTimeout(() => {
      copied = false;
      copying = false;
    }, 1500);
  }
</script>

<div class="max-w-2xl mx-auto w-full space-y-6">
  <header class="flex items-center justify-between gap-4">
    <h2 class="text-2xl font-bold">{meta.name}</h2>
    <p class="opacity-80">{meta.description}</p>
  </header>

  <div class="card card-bordered bg-base-200">
    <div class="card-body p-4 space-y-4">
      <textarea
        bind:value={text}
        oninput={count}
        placeholder="Paste or type some text to count words, characters, sentences, and paragraphs…"
        class="textarea textarea-bordered font-mono text-sm h-48 w-full"
        aria-label="Text to count"
      ></textarea>

      {#if error}
        <div class="alert alert-error text-sm" role="alert">{error}</div>
      {/if}

      {#if result && (result.words > 0 || result.sentences > 0 || result.paragraphs > 0)}
        <div class="grid grid-cols-2 gap-3">
          <div class="stat stat-sm">
            <div class="stat-title opacity-60 text-xs">Words</div>
            <div class="stat-value text-lg">{formatCount(result.words)}</div>
          </div>
          <div class="stat stat-sm">
            <div class="stat-title opacity-60 text-xs">Characters</div>
            <div class="stat-value text-lg">{formatCount(result.characters.withSpaces)}</div>
          </div>
          <div class="stat stat-sm">
            <div class="stat-title opacity-60 text-xs">Sentences</div>
            <div class="stat-value text-lg">{formatCount(result.sentences)}</div>
          </div>
          <div class="stat stat-sm">
            <div class="stat-title opacity-60 text-xs">Paragraphs</div>
            <div class="stat-value text-lg">{formatCount(result.paragraphs)}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-sm btn-outline" onclick={copy}>
            {#if copying}
              <Copy class="size-4 mr-1 animate-spin" aria-hidden="true" /> Copy summary
            {:else}
              <Copy class="size-4 mr-1" aria-hidden="true" /> Copy summary
            {/if}
          </button>
          <button class="btn btn-sm btn-outline" onclick={() => (text = '')}>
            <Trash2 class="size-4 mr-1" aria-hidden="true" /> Clear
          </button>
        </div>
      {:else if !error}
        <p class="text-xs opacity-60 text-center">Enter text above to see the count.</p>
      {/if}
    </div>
  </div>

  <p class="text-xs opacity-60 text-center">Runs entirely in your browser. Nothing is uploaded.</p>
</div>
