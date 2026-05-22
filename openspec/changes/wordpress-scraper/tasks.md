# Tasks: wordpress-scraper

## T1: Install dependencies

- `turndown` — HTML to markdown
- `jsdom` — HTML parsing in Node

## T2: Create scrape script

- `scripts/scrape-wordpress.ts`
- Fetch sitemap index → post-sitemap.xml, page-sitemap.xml
- Parse each sitemap → URL list
- For each URL: fetch → extract metadata → convert body → save .md
- Download images referenced in sitemap + og:image

## T3: Run scraper

- `bun run scrape` → all 80+ pages scraped
- Verify output in `content/en/posts/` and `content/en/pages/`

## T4: Add downloads to .gitignore

- `/downloads/` ignored (images are large, not committed)

## T5: Commit and push