import { getPage } from '$lib/content';

export async function load({ parent }: { parent: () => Promise<{ lang: string }> }) {
	const { lang } = await parent();
	const content = getPage('galicia-remote-work', lang);
	return { content };
}