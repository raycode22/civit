<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Copy, Check } from '@lucide/svelte';
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import type { ToolMeta } from '$lib/tools/types';
	// [Stage 9A] The route passes the registry metadata as a prop, like every
	// other tool; the component no longer imports its own meta statically.
	let { meta }: { meta: ToolMeta } = $props();
	import {
		validateImage,
		encodeBytes,
		formatBytes,
		MAX_FILE_BYTES,
		type EncodeResult
	} from './logic';
	import { createEncodeWorker } from './encodeWorkerFactory';
	import { createTaskWorker, TaskCancelledError } from '$lib/workers/taskWorker';
	import { detectCapabilities } from '$lib/capabilities';

	let error = $state<string | null>(null);
	let result = $state<EncodeResult | null>(null);
	let fileName = $state('');
	let copied = $state(false);
	// [NEW] Worker-backed encoding state (PRD FR-25).
	let encoding = $state(false);
	let progress = $state(0);
	let cancelled = $state(false);

	// Task client is created lazily on the first encode so the worker chunk
	// loads with the tool, not with the app shell (PRD FR-24).
	let taskClient: ReturnType<typeof createTaskWorker<{ mime: string; bytes: ArrayBuffer }, EncodeResult>> | null =
		$state(null);

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

	function ensureTaskClient() {
		if (taskClient) return taskClient;
		if (!detectCapabilities().worker) return null;
		taskClient = createTaskWorker(createEncodeWorker);
		return taskClient;
	}

	function cancelEncode(): void {
		taskClient?.cancel();
	}

	async function encode(
		mime: string,
		buffer: ArrayBuffer
	): Promise<EncodeResult> {
		const client = ensureTaskClient();
		if (!client) {
			// Capability fallback: encode inline on the main thread.
			return encodeBytes(mime, new Uint8Array(buffer));
		}
		try {
			return await client.run({
				payload: { mime, bytes: buffer },
				onProgress: (fraction) => (progress = fraction)
			});
		} catch (err) {
			if (err instanceof TaskCancelledError) throw err;
			// Worker failed (e.g. chunk not cached while offline): fall back to
			// inline encoding so the tool keeps working (FR-18).
			return encodeBytes(mime, new Uint8Array(buffer));
		}
	}

	function handleFile(file: File): void {
		error = null;
		result = null;
		cancelled = false;
		const invalid = validateImage(file);
		if (invalid) {
			error = describeError(invalid);
			return;
		}
		fileName = file.name;
		encoding = true;
		progress = 0;
		const reader = new FileReader();
		reader.onerror = () => (error = 'Could not read the file. Please try again.');
		reader.onload = async () => {
			try {
				const buffer = reader.result as ArrayBuffer;
				result = await encode(file.type, buffer);
			} catch (e) {
				if (e instanceof TaskCancelledError) {
					cancelled = true;
				} else {
					error = e instanceof Error ? e.message : 'Encoding failed.';
				}
			} finally {
				encoding = false;
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

	// [Stage 9A, FR-44] The offline indicator moved to the global layout
	// component (src/lib/components/OfflineIndicator.svelte); only the worker
	// cleanup remains here.
	onDestroy(() => {
		taskClient?.terminate();
	});

	$effect(() => {
		// Reset transient copy-feedback state when there is no result.
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

	{#if encoding}
		<div class="flex items-center gap-3" id="encoder-progress">
			<progress
				class="progress progress-primary flex-1"
				value={progress}
				max="1"
				aria-label="Encoding progress"
			></progress>
			<span class="text-sm opacity-70">{Math.round(progress * 100)}%</span>
			<button type="button" class="btn btn-sm" onclick={cancelEncode} id="encoder-cancel">
				Cancel
			</button>
		</div>
	{/if}

	{#if cancelled}
		<div class="alert alert-info text-sm" role="status" id="encoder-cancelled">
			Encoding cancelled.
		</div>
	{/if}

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
