export type Lang = 'en' | 'es' | 'gl';

export interface LanguageConfig {
	code: Lang;
	label: string;
	displayName: string;
	hreflang: string;
}

export const LANGUAGES: LanguageConfig[] = [
	{ code: 'en', label: 'EN', displayName: 'English', hreflang: 'en' },
	{ code: 'es', label: 'ES', displayName: 'Español', hreflang: 'es' },
	{ code: 'gl', label: 'GL', displayName: 'Galego', hreflang: 'gl' }
];

export function getLangFromPath(pathname: string): Lang {
	if (pathname.startsWith('/es/') || pathname === '/es') return 'es';
	if (pathname.startsWith('/gl/') || pathname === '/gl') return 'gl';
	return 'en';
}

export function stripLangPrefix(pathname: string): string {
	for (const lang of ['/es', '/gl']) {
		if (pathname === lang) return '/';
		if (pathname.startsWith(lang + '/')) return pathname.slice(3);
	}
	return pathname;
}

export function localizedPath(pathname: string, targetLang: Lang): string {
	if (targetLang === 'en') return stripLangPrefix(pathname) || '/';
	const stripped = stripLangPrefix(pathname) || '/';
	return `/${targetLang}${stripped}`;
}

export function alternateLinks(
	pathname: string,
	siteUrl: string
): Array<{ hreflang: string; href: string }> {
	const canonical = stripLangPrefix(pathname) || '/';
	return [
		...LANGUAGES.map(({ code, hreflang }) => ({
			hreflang,
			href: `${siteUrl}${code === 'en' ? canonical : `/${code}${canonical}`}`
		})),
		{ hreflang: 'x-default', href: `${siteUrl}${canonical}` }
	];
}