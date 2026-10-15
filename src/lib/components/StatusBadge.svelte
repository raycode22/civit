<script lang="ts">
	let { offlineCapable }: { offlineCapable: boolean } = $props();
</script>

<span
	class="badge badge-sm gap-1 {offlineCapable ? 'badge-success' : 'badge-neutral'}"
	title={offlineCapable ? 'Works offline once cached' : 'Requires network for first load'}
	role="status"
>
	<span aria-hidden="true">{offlineCapable ? '⚡' : '🌐'}</span>
	{offlineCapable ? 'Offline ready' : 'Online'}
</span>
