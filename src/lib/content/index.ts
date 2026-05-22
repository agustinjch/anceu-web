import { browser } from '$app/environment';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface ContentFrontmatter {
	title: string;
	description?: string;
	date?: string;
	og_image?: string;
	slug?: string;
	type: 'page' | 'post';
}

export interface Content {
	slug: string;
	frontmatter: ContentFrontmatter;
	html: string;
}

type ContentMap = Record<string, Record<string, Record<string, Content>>>;

let cache: ContentMap | null = null;

function buildContentMap(): ContentMap {
	if (cache) return cache;

	const files = import.meta.glob('/content/**/*.md', {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>;

	const map: ContentMap = { en: { pages: {}, posts: {} }, es: { pages: {}, posts: {} }, gl: { pages: {}, posts: {} } };

	for (const [filepath, raw] of Object.entries(files)) {
		const parts = filepath.replace('/content/', '').split('/');
		if (parts.length < 3) continue;

		const lang = parts[0] as keyof ContentMap;
		const type = parts[1] as 'pages' | 'posts';
		const filename = parts[parts.length - 1].replace('.md', '');

		if (!map[lang] || !map[lang][type]) continue;

		const parsed = matter(raw);
		const frontmatter = parsed.data as ContentFrontmatter;
		const slug = frontmatter.slug || filename;
		const html = marked.parse(parsed.content, { async: false }) as string;

		map[lang][type][slug] = { slug, frontmatter, html };
	}

	cache = map;
	return map;
}

export function getPage(slug: string, lang: string = 'en'): Content | null {
	const map = buildContentMap();
	const langKey = lang as keyof ContentMap;

	if (map[langKey]?.pages[slug]) return map[langKey].pages[slug];
	if (langKey !== 'en' && map.en?.pages[slug]) return map.en.pages[slug];
	return null;
}

export function getPost(slug: string, lang: string = 'en'): Content | null {
	const map = buildContentMap();
	const langKey = lang as keyof ContentMap;

	if (map[langKey]?.posts[slug]) return map[langKey].posts[slug];
	if (langKey !== 'en' && map.en?.posts[slug]) return map.en.posts[slug];
	return null;
}

export function getAllPosts(lang: string = 'en'): Content[] {
	const map = buildContentMap();
	const langKey = lang as keyof ContentMap;

	const posts: Content[] = [];
	const seen = new Set<string>();

	if (map[langKey]?.posts) {
		for (const [slug, post] of Object.entries(map[langKey].posts)) {
			posts.push(post);
			seen.add(slug);
		}
	}

	if (langKey !== 'en' && map.en?.posts) {
		for (const [slug, post] of Object.entries(map.en.posts)) {
			if (!seen.has(slug)) {
				posts.push(post);
			}
		}
	}

	return posts.sort((a, b) => {
		if (a.frontmatter.date && b.frontmatter.date) {
			return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
		}
		return 0;
	});
}