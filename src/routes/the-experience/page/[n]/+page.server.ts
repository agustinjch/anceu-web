import { getAllPosts } from '$lib/content';

export async function load({ params, parent }: { params: { n: string }; parent: () => Promise<{ lang: string }> }) {
	const { lang } = await parent();
	const allPosts = getAllPosts(lang);
	const perPage = 7;
	const page = Number(params.n);
	const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
	const start = (page - 1) * perPage;
	const posts = allPosts.slice(start, start + perPage);

	return { posts, page, totalPages, lang };
}