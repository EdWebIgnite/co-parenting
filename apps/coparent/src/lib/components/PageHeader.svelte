<script lang="ts">
	let { title, subtitle }: { title: string; subtitle?: string } = $props();
</script>

<header class="px-4 pt-6 pb-4">
	<h1 class="text-2xl font-semibold">{title}</h1>
	{#if subtitle}
		<p class="mt-1 text-sm text-muted">{subtitle}</p>
	{/if}
</header>
