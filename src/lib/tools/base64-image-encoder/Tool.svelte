<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Copy, Check, WifiOff } from '@lucide/svelte';
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { meta } from './meta';
	import {
		validateImage,
		encodeBytes,
		formatBytes,
		MAX_FILE_BYTES,
		type EncodeResult
	} from './logic';

	let error = $state<string | null>(null);
	let result = $state<EncodeResult | null>(null);
	let fileName = $state('');
	let copied = $state(false);
	let online = $state(true);

	function describeError(err: ReturnType<typeof validateImage>): string {
		if (!err) return '';
		switch (err.code) {
			case 'empty':
				return 'That file is empty.';
			case 'too-large':
				return `File is too large (${formatBytes(err.bytes)}). Maximum is ${formatBytes(MAX_FILE_BYTES)}.`;
			case 'unsupported-type':
				return `Unsupported file type: ${err.mime}. Please choose a PNG, JPEG, GIF, WebP, SVG, AVIF, or BMP image.`;
		}
	}

	function handleFile(file: File): void {
		error = null;
		result = null;
		const invalid = validateImage(file);
		if (invalid) {
			error = describeError(invalid);
			return;
		}
		fileName = file.name;
		const reader = new FileReader();
		reader.onerror = () => (error = 'Could not read the file. Please try again.');
		reader.onload = () => {
			try {
				const buffer = reader.result as ArrayBuffer;
				result = encodeBytes(file.type, new Uint8Array(buffer));
			} catch (e) {
				error = e instanceof Error ? e.message : 'Encoding failed.';
			}
		};
		reader.readAsArrayBuffer(file);
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

	// Offline indicator (FR-18).
	const setOnline = () => (online = true);
	const setOffline = () => (online = false);
	onMount(() => {
		online = navigator.onLine;
		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);
	});
	onDestroy(() => {
		window.removeEventListener('online', setOnline);
		window.removeEventListener('offline', setOffline);
	});

	$effect(() => {
		// Reset transient copy-feedback state when there is no result.
		if (!result) copied = false;
	});
</script>

<div class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-2xl font-bold">{meta.name}</h2>
		<StatusBadge offlineCapable={meta.offlineCapable} />
	</div>
	<p class="opacity-80 -mt-4">{meta.description}</p>

	{#if !online}
		<div
			class="alert alert-warning flex items-center gap-2 text-sm"
			role="status"
			id="offline-indicator"
		>
			<WifiOff class="size-4 shrink-0" aria-hidden="true" />
			You are offline. This tool runs entirely in your browser and keeps working.
		</div>
	{/if}

	<FileDropZone onfile={handleFile} />

	{#if error}
		<div class="alert alert-error text-sm" role="alert" id="encoder-error">{error}</div>
	{/if}

	{#if result}
		<div class="flex flex-col gap-2" id="encoder-output">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold">Data URI ({fileName}, {formatBytes(result.sizeBase64)} encoded)</h3>
				<button type="button" class="btn btn-sm gap-1" onclick={copyResult} id="copy-button">
					{#if copied}
						<Check class="size-4" aria-hidden="true" /> Copied
					{:else}
						<Copy class="size-4" aria-hidden="true" /> Copy
					{/if}
				</button>
			</div>
			<textarea
				readonly
				class="textarea textarea-bordered font-mono text-xs h-40 w-full"
				value={result.dataUri}
				aria-label="Base64 data URI output"
				id="encoder-output-text"
			></textarea>
			<div class="flex items-center gap-4">
				<img src={result.dataUri} alt="Preview of {fileName}" class="max-h-40 rounded border" />
			</div>
		</div>
	{/if}
</div>
