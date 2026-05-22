import { getPost } from '$lib/content';

export async function load({ params, parent }: { params: { slug: string }; parent: () => Promise<{ lang: string }> }) {
	const { lang } = await parent();
	const content = getPost(params.slug, lang);
	return { content };
}