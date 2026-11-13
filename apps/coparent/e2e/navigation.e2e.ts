import { expect, test } from '@playwright/test';

const tabs = [
	{ label: 'Today', path: '/' },
	{ label: 'Calendar', path: '/calendar' },
	{ label: 'Messages', path: '/messages' },
	{ label: 'Money', path: '/money' },
	{ label: 'Kids', path: '/kids' }
];

test('the five tabs open their pages on a phone-sized screen', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Main' });

	for (const tab of tabs) {
		await nav.getByRole('link', { name: tab.label }).click();
		await expect(page).toHaveURL(tab.path);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(tab.label);
		await expect(nav.getByRole('link', { name: tab.label })).toHaveAttribute(
			'aria-current',
			'page'
		);
	}
});

test('a deep link loads through the SPA fallback', async ({ page }) => {
	await page.goto('/money');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Money');
});
