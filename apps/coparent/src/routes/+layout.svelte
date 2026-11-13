<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { TabBar } from '@coparent/ui';
	import { APP_NAME } from '#lib/config.ts';
	import { TABS } from '#lib/nav.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<div class="mx-auto min-h-dvh max-w-screen-md pb-20">
	{@render children()}
</div>

<TabBar tabs={TABS} current={page.url.pathname} />
