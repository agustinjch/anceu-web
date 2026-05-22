import type { Lang } from '$lib/i18n';
import { getLangFromPath } from '$lib/i18n';

export function load({ url }: { url: URL }) {
	const lang: Lang = getLangFromPath(url.pathname);
	return { lang, pathname: url.pathname };
}