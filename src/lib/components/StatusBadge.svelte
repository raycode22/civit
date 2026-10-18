<script lang="ts">
	import type { OfflineSupport, ToolStatus } from '$lib/tools/types';

	// [REVISED] Shows the registry status badge and the offline-support badge
	// (PRD FR-21, FR-22). Values come only from the tool registry.
	let { status, offline }: { status: ToolStatus; offline: OfflineSupport } = $props();

	const STATUS_LABEL: Record<ToolStatus, string> = { new: 'New', beta: 'Beta', stable: 'Stable' };
	const STATUS_CLASS: Record<ToolStatus, string> = {
		new: 'badge-ghost',
		beta: 'badge-info',
		stable: 'badge-success'
	};
	const STATUS_TITLE: Record<ToolStatus, string> = {
		new: 'Newly registered tool',
		beta: 'Usable but with known limitations',
		stable: 'Meets the project quality gates'
	};

	const OFFLINE_LABEL: Record<OfflineSupport, string> = {
		full: 'Works offline',
		partial: 'Partial offline',
		'online-only': 'Online only'
	};
	const OFFLINE_CLASS: Record<OfflineSupport, string> = {
		full: 'badge-success',
		partial: 'badge-warning',
		'online-only': 'badge-neutral'
	};
	const OFFLINE_TITLE: Record<OfflineSupport, string> = {
		full: 'Verified to run with the network disabled',
		partial: 'Core functions run offline; some assets need a one-time download',
		'online-only': 'Not yet usable without a network connection'
	};
</script>

<span
	class="badge badge-sm {STATUS_CLASS[status]}"
	title={STATUS_TITLE[status]}
	role="status"
	data-testid="status-badge"
>
	{STATUS_LABEL[status]}
</span>
<span
	class="badge badge-sm {OFFLINE_CLASS[offline]}"
	title={OFFLINE_TITLE[offline]}
	role="status"
	data-testid="offline-badge"
>
	{OFFLINE_LABEL[offline]}
</span>
