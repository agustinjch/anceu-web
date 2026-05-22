import { getPage } from '$lib/content';

export async function load({ parent }: { parent: () => Promise<{ lang: string }> }) {
	const { lang } = await parent();
	const content = getPage('privacy-policy-2', lang);
	return { content };
}