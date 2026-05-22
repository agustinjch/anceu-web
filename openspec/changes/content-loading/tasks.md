# Tasks: content-loading

## T1: Install markdown dependencies

- `bun add gray-matter marked`
- `bun add -D @types/marked` (if needed)

## T2: Create sample content files

- `content/en/pages/home.md` — home page content with frontmatter
- `content/en/pages/the-space.md` — the space page
- `content/en/pages/faq.md` — FAQ page
- `content/en/posts/sample-post.md` — sample blog post
- `content/es/pages/home.md` — Spanish home (same content for now, just to test ES loading)

## T3: Create content loader

- `src/lib/content/index.ts`
- `import.meta.glob('/content/**/*.md', { eager: true, query: '?raw' })`
- Parse frontmatter with gray-matter
- Render markdown body with marked
- Export `getPage(slug, lang)` and `getAllPosts(lang)`
- Handle EN fallback: if ES/GL file doesn't exist, return EN content
- Cache results at build time

## T4: Create Image component

- `src/lib/components/Image.svelte`
- Props: `src`, `alt`, `widths` (default: [400, 800, 1200]), `class`
- Generate srcset using Cloudflare Image Resizing URL format
- Default `loading="lazy"`
- `format=auto` for WebP/AVIF
- Handle both legacy (`/wp-content/uploads/...`) and new (`/media/...`) paths

## T5: Wire home page to content

- `src/routes/+page.server.ts`
- Load `content/en/pages/home.md` (or language-appropriate version)
- `+page.svelte` renders the content HTML

## T6: Wire other static pages to content

- `src/routes/the-space/+page.server.ts` → `content/en/pages/the-space.md`
- `src/routes/faq/+page.server.ts` → `content/en/pages/faq.md`

## T7: Wire blog posts to content

- `src/routes/[slug]/+page.server.ts`
- Look up `content/en/posts/[slug].md`
- Return 404 if not found
- `+page.svelte` renders post with title, date, content

## T8: Build and verify