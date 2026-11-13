import type { Tab } from '@coparent/ui';

// Outline icons, 24x24, drawn as a single path each.
export const TABS: Tab[] = [
	{
		href: '/',
		label: 'Today',
		icon: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5'
	},
	{
		href: '/calendar',
		label: 'Calendar',
		icon: 'M4 6.5h16V20H4zM4 10.5h16M8.5 3.5v5M15.5 3.5v5'
	},
	{
		href: '/messages',
		label: 'Messages',
		icon: 'M4 5h16v11H9l-5 4z'
	},
	{
		href: '/money',
		label: 'Money',
		icon: 'M3.5 7h17v11h-17zM12 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3.5 10.5h2M18.5 14.5h2'
	},
	{
		href: '/kids',
		label: 'Kids',
		icon: 'M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5.5 20c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6'
	}
];
