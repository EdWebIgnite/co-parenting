// South African display formats: R amounts, dates like 13 Nov 2026, 24-hour time.

const TIME_ZONE = 'Africa/Johannesburg';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an amount in cents as rand, for example 123456 -> "R1 234.56". */
export function formatRand(cents: number): string {
	if (!Number.isInteger(cents)) {
		throw new Error('Amounts must be whole cents');
	}
	const sign = cents < 0 ? '-' : '';
	const abs = Math.abs(cents);
	const rands = Math.floor(abs / 100)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	const rest = (abs % 100).toString().padStart(2, '0');
	return `${sign}R${rands}.${rest}`;
}

function partsInZone(date: Date) {
	const parts = new Intl.DateTimeFormat('en-ZA', {
		timeZone: TIME_ZONE,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(date);
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((p) => p.type === type)?.value);
	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour'),
		minute: get('minute')
	};
}

/** Formats a date as "13 Nov 2026" in South African time. */
export function formatDate(date: Date): string {
	const { year, month, day } = partsInZone(date);
	return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Formats a time as "14:05" (24-hour) in South African time. */
export function formatTime(date: Date): string {
	const { hour, minute } = partsInZone(date);
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
