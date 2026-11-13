<script lang="ts">
	import type { Tab } from './tabs';

	let { tabs, current }: { tabs: Tab[]; current: string } = $props();

	function isActive(href: string): boolean {
		return href === '/' ? current === '/' : current === href || current.startsWith(href + '/');
	}
</script>

<nav
	aria-label="Main"
	class="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
>
	<ul class="mx-auto flex max-w-screen-md">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href)}
			<li class="flex-1">
				<a
					href={tab.href}
					aria-current={active ? 'page' : undefined}
					class="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium {active
						? 'text-brand'
						: 'text-muted'}"
				>
					<svg
						viewBox="0 0 24 24"
						class="size-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d={tab.icon} />
					</svg>
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
