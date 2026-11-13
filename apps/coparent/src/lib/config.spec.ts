import { describe, expect, it } from 'vitest';
import { APP_NAME } from './config';

describe('APP_NAME', () => {
	it('is set', () => {
		expect(APP_NAME.length).toBeGreaterThan(0);
	});
});
