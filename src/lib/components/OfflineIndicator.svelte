<script lang="ts">
	// [Stage 9A, FR-44] Single global offline indicator, mounted once in the
	// root layout. Per-tool "you are offline" warnings were removed in favour
	// of this one indicator so every page reports offline state the same way.
	import { onMount } from 'svelte';
	import { WifiOff } from '@lucide/svelte';

	let online = $state(true);

	const setOnline = () => (online = true);
	const setOffline = () => (online = false);

	onMount(() => {
		online = navigator.onLine;
		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);
		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOffline);
		};
	});
</script>

{#if !online}
	<div
		class="alert alert-warning flex items-center gap-2 text-sm"
		role="status"
		id="offline-indicator"
	>
		<WifiOff class="size-4 shrink-0" aria-hidden="true" />
		<span data-testid="offline-indicator-message">
			You are offline. Civit tools run entirely in your browser and keep working.
		</span>
	</div>
{/if}