/**
 * Format a date in Europe/Madrid timezone.
 */
export function formatInTimezone(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
	const defaultOptions: Intl.DateTimeFormatOptions = {
		timeZone: 'Europe/Madrid',
		...options
	};
	return new Intl.DateTimeFormat('en', defaultOptions).format(date);
}

/**
 * Get current date in Europe/Madrid as a Date object.
 */
export function nowInTimezone(): Date {
	return new Date(
		new Intl.DateTimeFormat('en', {
			timeZone: 'Europe/Madrid',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).format(new Date())
	);
}