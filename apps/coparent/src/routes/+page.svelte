<script lang="ts">
	import { formatDate } from '@coparent/core';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import Placeholder from '#lib/components/Placeholder.svelte';
</script>

<PageHeader title="Today" subtitle={formatDate(new Date())} />
<Placeholder text="Who has the children today and what's on will show here." />
