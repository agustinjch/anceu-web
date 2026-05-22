import 'dotenv/config';
import { JSDOM } from 'jsdom';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';

// ─── Types ────────────────────────────────────────────────

interface PageData {
	url: string;
	slug: string;
	type: 'post' | 'page';
	lastmod: string;
	images: string[];
}

interface ScrapedContent {
	title: string;
	description: string;
	date: string;
	ogImage: string;
	bodyHtml: string;
}

// ─── Config ────────────────────────────────────────────────

const SITE_URL = 'https://anceu.com';
const CONTENT_DIR = 'content/en';
const IMAGES_DIR = 'downloads/images';

const turndown = new TurndownService({
	headingStyle: 'atx',
	bulletListMarker: '-',
	codeBlockStyle: 'fenced',
	emDelimiter: '*'
});

const SKIP_PATHS = new Set([
	'/events/',
	'/press/',
	'/anceu-coliving-es/'
]);

// Paths that appear in the page sitemap but are actually blog-style content
const POST_LIKE_PATHS = new Set([
	'/what-is-rural-coliving/',
	'/rural-hybrid-talents/',
	'/trail-maintenance-wayfinding-steward/'
]);

// ─── XML helpers ──────────────────────────────────────────

async function fetchXml(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	return res.text();
}

function extractUrls(xml: string): string[] {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function extractPageData(xml: string, defaultType: 'post' | 'page'): PageData[] {
	const pages: PageData[] = [];
	const blocks = xml.match(/<url>([\s\S]*?)<\/url>/g) || [];
	for (const block of blocks) {
		const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
		const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] || '';
		const images = [...block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
		if (!loc) continue;

		const url = new URL(loc);
		const pathname = url.pathname;
		if (SKIP_PATHS.has(pathname)) continue;

		const slug = pathname.replace(/\/$/, '').split('/').pop() || 'home';
		const type = defaultType === 'page' && POST_LIKE_PATHS.has(pathname) ? 'post' : defaultType;

		pages.push({ url: loc, slug, type, lastmod, images });
	}
	return pages;
}

// ─── Scraper ──────────────────────────────────────────────

async function scrapeUrl(url: string): Promise<ScrapedContent | null> {
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': 'Anceu-Migration/1.0' }
		});
		if (!res.ok) return null;

		const html = await res.text();
		const doc = new JSDOM(html).window.document;

		const title =
			doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
			doc.querySelector('title')?.textContent?.replace(/ ?[—–|-].*$/, '').trim() ||
			'';

		const description =
			doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
			doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
			'';

		const ogImage =
			doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

		const date =
			doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
			doc.querySelector('time')?.getAttribute('datetime') ||
			'';

		const contentEl =
			doc.querySelector('.entry-content') ||
			doc.querySelector('article') ||
			doc.querySelector('main');

		if (!contentEl) return null;

		const removeEls = contentEl.querySelectorAll(
			'script, style, nav, .shared-counts, .post-navigation, .comments-area, .yoast-breadcrumbs'
		);
		removeEls.forEach((el) => el.remove());

		return {
			title,
			description,
			date,
			ogImage,
			bodyHtml: contentEl.innerHTML
		};
	} catch {
		return null;
	}
}

// ─── File builders ────────────────────────────────────────

function buildFrontmatter(c: ScrapedContent, slug: string, type: string): string {
	const lines = ['---'];
	lines.push(`title: "${c.title.replace(/"/g, '\\"')}"`);
	if (c.description) lines.push(`description: "${c.description.replace(/"/g, '\\"')}"`);
	if (c.date) lines.push(`date: ${c.date.split('T')[0]}`);
	if (c.ogImage) lines.push(`og_image: ${new URL(c.ogImage).pathname}`);
	lines.push(`slug: ${slug}`);
	lines.push(`type: ${type}`);
	lines.push('---');
	return lines.join('\n');
}

function markdownFromHtml(html: string): string {
	return turndown.turndown(html);
}

// ─── Images ───────────────────────────────────────────────

async function downloadImages(urls: string[], slug: string): Promise<number> {
	const dir = path.join(IMAGES_DIR, slug);
	if (!existsSync(dir)) await mkdir(dir, { recursive: true });

	let count = 0;
	for (const imgUrl of [...new Set(urls)].filter(Boolean)) {
		const filename = path.basename(new URL(imgUrl).pathname);
		if (filename.match(/-\d+x\d+/)) continue;

		const dest = path.join(dir, filename);
		if (existsSync(dest)) { count++; continue; }

		try {
			const res = await fetch(imgUrl);
			if (!res.ok) continue;
			await writeFile(dest, Buffer.from(await res.arrayBuffer()));
			count++;
		} catch { /* skip */ }
	}
	return count;
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
	console.log('Fetching sitemap index...');
	const indexXml = await fetchXml(`${SITE_URL}/wp-sitemap.xml`);
	const sitemaps = extractUrls(indexXml);

	const postSitemap = sitemaps.find((u) => u.includes('post-sitemap'));
	const pageSitemap = sitemaps.find((u) => u.includes('page-sitemap'));
	if (!postSitemap || !pageSitemap) throw new Error('Sitemaps not found');

	console.log(`Parsing post sitemap...`);
	const postData = extractPageData(await fetchXml(postSitemap), 'post');

	console.log(`Parsing page sitemap...`);
	const pageData = extractPageData(await fetchXml(pageSitemap), 'page');

	const all = [...postData, ...pageData];
	console.log(`\nFound ${postData.length} posts + ${pageData.length} pages = ${all.length} total\n`);

	await mkdir(CONTENT_DIR + '/posts', { recursive: true });
	await mkdir(CONTENT_DIR + '/pages', { recursive: true });
	await mkdir(IMAGES_DIR, { recursive: true });

	let scraped = 0, failed = 0, skipped = 0;

	for (const page of all) {
		const dir = page.type === 'post' ? 'posts' : 'pages';
		const filePath = path.join(CONTENT_DIR, dir, `${page.slug}.md`);

		if (existsSync(filePath)) {
			console.log(`  [skip] ${page.slug} — already exists`);
			skipped++;
			continue;
		}

		process.stdout.write(`  [scrape] ${page.slug}... `);
		const content = await scrapeUrl(page.url);
		if (!content) {
			console.log('FAILED');
			failed++;
			continue;
		}

		const frontmatter = buildFrontmatter(content, page.slug, page.type);
		const md = markdownFromHtml(content.bodyHtml);
		await writeFile(filePath, `${frontmatter}\n\n${md}`);
		console.log('OK');

		// Download images
		const imageUrls = [...new Set([...page.images, content.ogImage].filter(Boolean))];
		if (imageUrls.length > 0) {
			const n = await downloadImages(imageUrls, page.slug);
			if (n > 0) console.log(`    → ${n} image(s) saved to ${IMAGES_DIR}/${page.slug}/`);
		}

		scraped++;
		await new Promise((r) => setTimeout(r, 300));
	}

	console.log(`\n─── Done ───`);
	console.log(`Scraped: ${scraped}  |  Skipped: ${skipped}  |  Failed: ${failed}  |  Total: ${all.length}`);
}

main().catch((err) => {
	console.error('Fatal:', err);
	process.exit(1);
});