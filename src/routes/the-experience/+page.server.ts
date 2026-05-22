import { getAllPosts } from '$lib/content';

export async function load({ parent }: { parent: () => Promise<{ lang: string }> }) {
	const { lang } = await parent();
	const allPosts = getAllPosts(lang);
	const perPage = 7;
	const page = 1;
	const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
	const posts = allPosts.slice(0, perPage);

	return { posts, page, totalPages, lang };
}