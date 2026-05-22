# Proposal: content-loading

## Summary

Create the content loading pipeline: markdown files in `content/` parsed with frontmatter, rendered to HTML, and served through SvelteKit routes. Also create the `<Image>` component wrapping Cloudflare Image Resizing.

This replaces placeholder pages with real content from markdown files. Content editing happens by writing markdown files in the repo.

## Scope

### In scope

- `content/` directory structure (en/es/gl × pages/posts)
- Sample markdown files for a few pages (home, the-space, faq)
- Markdown loader: glob-based, parses frontmatter, renders to HTML
- Content server load functions for routes
- `<Image>` component with Cloudflare Image Resizing (srcset, format=auto, lazy)
- Static pages wired to content: home, the-space, faq
- Blog `[slug]` route wired to content

### Out of scope

- Full content migration from WordPress (feature 5)
- Translation pipeline (feature 7)
- Pagination for `/the-experience/` (feature 8)
- Page renders for every page — just the infrastructure + a few sample files

## Success criteria

- Home page shows content from `content/en/pages/home.md`
- Creating a new `.md` file in `content/en/posts/` makes it available at `/[slug]`
- Changing content in a markdown file updates the rendered page
- `<Image>` component generates correct srcset with Cloudflare URLs
- Build prerenders all content pages