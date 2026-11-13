import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PageHeader from './PageHeader.svelte';

describe('PageHeader', () => {
	it('shows the title and optional subtitle', async () => {
		render(PageHeader, { title: 'Money', subtitle: '13 Nov 2026' });
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Money');
		await expect.element(page.getByText('13 Nov 2026')).toBeInTheDocument();
	});
});
