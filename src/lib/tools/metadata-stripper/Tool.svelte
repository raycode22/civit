<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Copy, Check, Download } from '@lucide/svelte';
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import type { ToolMeta } from '$lib/tools/types';
	let { meta }: { meta: ToolMeta } = $props();
	import {
		validateImage,
		stripMetadata,
		formatBytes,
		MAX_FILE_BYTES,
		type StripResult
	} from './logic';

	let error = $state<string | null>(null);
	let result = $state<StripResult | null>(null);
	let fileName = $state('');
	let copied = $state(false);
	let processing = $state(false);
	let progress = $state(0);

	function describeError(err: ReturnType<typeof validateImage>): string {
		if (!err) return '';
		switch (err.code) {
			case 'empty':
				return 'That file is empty.';
			case 'too-large':
				return `File is too large (${formatBytes(err.bytes)}). Maximum is ${formatBytes(MAX_FILE_BYTES)}.`;
			case 'unsupported-type':
				return `Unsupported file type: ${err.mime}. Please choose a PNG, JPEG, WebP, GIF, or BMP image.`;
		}
	}

	async function handleFile(file: File): Promise<void> {
		error = null;
		result = null;
		const invalid = validateImage(file);
		if (invalid) {
			error = describeError(invalid);
			return;
		}
		fileName = file.name;
		processing = true;
		progress = 0;

		try {
			// Simulate progress since stripMetadata is fast but we want to show something
			progress = 0.3;
			result = await stripMetadata(file);
			progress = 1;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to strip metadata.';
		} finally {
			processing = false;
		}
	}

	async function copyResult(): Promise<void> {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(result.dataUri);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			error = 'Clipboard access was blocked by the browser.';
		}
	}

	async function downloadResult(): Promise<void> {
		if (!result) return;
		try {
			const response = await fetch(result.dataUri);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `stripped-${fileName}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			error = 'Download failed. Please try again.';
		}
	}

	onDestroy(() => {
		// No workers to clean up for this tool
	});

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

	<FileDropZone onfile={handleFile} />

	{#if processing}
		<div class="flex items-center gap-3" id="stripper-progress">
			<progress
				class="progress progress-primary flex-1"
				value={progress}
				max="1"
				aria-label="Stripping metadata progress"
			></progress>
			<span class="text-sm opacity-70">{Math.round(progress * 100)}%</span>
		</div>
	{/if}

	{#if error}
		<div class="alert alert-error text-sm" role="alert" id="stripper-error">{error}</div>
	{/if}

	{#if result}
		<div class="flex flex-col gap-2" id="stripper-output">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold">Metadata stripped ({fileName}, {formatBytes(result.size)} output)</h3>
				<div class="flex items-center gap-2">
					<button type="button" class="btn btn-sm gap-1" onclick={copyResult} id="copy-button">
						{#if copied}
							<Check class="size-4" aria-hidden="true" /> Copied
						{:else}
							<Copy class="size-4" aria-hidden="true" /> Copy URI
						{/if}
					</button>
					<button type="button" class="btn btn-sm gap-1" onclick={downloadResult} id="download-button">
						<Download class="size-4" aria-hidden="true" /> Download
					</button>
				</div>
			</div>
			<textarea
				readonly
				class="textarea textarea-bordered font-mono text-xs h-40 w-full"
				value={result.dataUri}
				aria-label="Data URI output (metadata removed)"
				id="stripper-output-text"
			></textarea>
			<div class="flex items-center gap-4">
				<img src={result.dataUri} alt="Preview of {fileName}" class="max-h-40 rounded border" />
			</div>
		</div>
	{/if}
</div>