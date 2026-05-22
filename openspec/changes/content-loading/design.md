# Design: content-loading

## Architecture

```
content/
├── en/
│   ├── pages/
│   │   ├── home.md
│   │   ├── the-space.md
│   │   ├── faq.md
│   │   └── ...
│   └── posts/
│       ├── sample-post.md
│       └── ...
├── es/
│   ├── pages/
│   │   └── home.md
│   └── posts/
│       └── (empty — EN fallback)
└── gl/
    ├── pages/
    │   └── (empty — EN fallback)
    └── posts/
        └── (empty — EN fallback)
```

## Markdown format

```yaml
---
title: "Page Title"
description: "SEO description"
date: 2025-10-28
og_image: /media/pages/home/hero.jpg
slug: page-slug        # optional, defaults to filename
type: page              # "page" or "post"
---
Content body in markdown...
```

## Content loading pipeline

```
import.meta.glob('/content/**/*.md', { eager: true, query: '?raw' })
  → Map<path, string> of all .md files
  → For each file:
    → gray-matter extracts frontmatter + body
    → marked renders body to HTML
    → Organize by language + type (page/post)
  → Export helpers:
    getPage(slug, lang) → Content | null
    getAllPosts(lang) → Content[]
```

## EN fallback logic

```typescript
function getContent(slug: string, lang: Lang, type: 'pages' | 'posts') {
  const file = contentMap[lang][type][slug];
  if (file) return file;
  if (lang !== 'en') return contentMap['en'][type][slug]; // fallback
  return null;
}
```

## Image component

Cloudflare Image Resizing URL format:
```
https://anceu.com/cdn-cgi/image/width=800,format=auto/{path}
```

The `<Image>` component generates:
```html
<img
  src="/cdn-cgi/image/width=800,format=auto/image.jpg"
  srcset="
    /cdn-cgi/image/width=400,format=auto/image.jpg 400w,
    /cdn-cgi/image/width=800,format=auto/image.jpg 800w,
    /cdn-cgi/image/width=1200,format=auto/image.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, 800px"
  loading="lazy"
  alt="..."
/>
```

For external images (not on Cloudflare), fall back to the raw URL.

## Route wiring

```
src/routes/
├── +page.server.ts      → content/en/pages/home.md
├── +page.svelte         → renders {content.html}
├── the-space/+page.server.ts → content/en/pages/the-space.md
├── faq/+page.server.ts       → content/en/pages/faq.md
├── [slug]/+page.server.ts    → content/en/posts/[slug].md
```

Each `+page.server.ts`:
1. Gets lang from URL params (parent layout data)
2. Calls `getPage(slug, lang)` or `getAllPosts(lang)`
3. Returns content data
4. Fallback: returns null → page shows placeholder or 404