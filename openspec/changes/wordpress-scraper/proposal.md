# Proposal: wordpress-scraper

## Summary

Create a script that reads `https://anceu.com/wp-sitemap.xml`, fetches each URL, extracts frontmatter from meta tags, converts HTML body to markdown with `turndown`, and saves as `.md` files in `content/en/pages/` and `content/en/posts/`. Also downloads original images to `downloads/images/`.

## Scope

### In scope

- `scripts/scrape-wordpress.ts` — full scraper
- Parses WP sitemap index → post + page sitemaps
- Extracts: title, description, date, og:image, body content
- Converts HTML → markdown with turndown
- Saves to `content/en/{pages,posts}/{slug}.md`
- Downloads original (non-resized) images to `downloads/images/{slug}/`
- Skips already-scraped pages (idempotent)
- Ignores `/events/`, `/press/`, `/anceu-coliving-es/`

### Out of scope

- R2 upload (deferred to feature 6)
- ES/GL translation (feature 7)
- Manual content review (post-scrape task for the user)

## Success criteria

- 69+ blog posts and 9+ static pages scraped into `content/en/`
- Frontmatter contains title, description, date, og_image, slug, type
- Images downloaded as originals (no WP -resized variants)
- Re-running the script skips existing files