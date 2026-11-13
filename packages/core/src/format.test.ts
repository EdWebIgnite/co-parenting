import { describe, expect, it } from 'vitest';
import { formatDate, formatRand, formatTime } from './format';

describe('formatRand', () => {
	it('formats cents as rand with spaces between thousands', () => {
		expect(formatRand(123456)).toBe('R1 234.56');
		expect(formatRand(0)).toBe('R0.00');
		expect(formatRand(5)).toBe('R0.05');
		expect(formatRand(100000000)).toBe('R1 000 000.00');
	});

	it('handles negative amounts', () => {
		expect(formatRand(-2550)).toBe('-R25.50');
	});

	it('rejects fractions of a cent', () => {
		expect(() => formatRand(1.5)).toThrow();
	});
});

describe('formatDate and formatTime', () => {
	it('uses South African time and formats', () => {
		// 22:30 UTC on 12 Nov is 00:30 on 13 Nov in Johannesburg (UTC+2).
		const d = new Date('2026-11-12T22:30:00Z');
		expect(formatDate(d)).toBe('13 Nov 2026');
		expect(formatTime(d)).toBe('00:30');
	});
});
