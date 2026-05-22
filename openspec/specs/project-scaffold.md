# Spec: project-scaffold

Capability: Foundation project structure for anceu.com.

## Requires

Nothing — this is the first feature.

## Provides

A working SvelteKit web application deployed to Cloudflare Pages with:
- Layout shell (header + footer)
- Placeholder pages for all defined routes
- Tailwind CSS with brand color palette
- Google Fonts
- Europe/Madrid timezone
- Git repo with conventions

## Details

### 1. Project initialization

- Framework: SvelteKit 2.x
- Language: TypeScript
- Package manager: Bun
- Adapter: `@sveltejs/adapter-cloudflare`
- Static content: prerendered (SSG) where possible
- Dynamic routes (admin, API): SSR via Cloudflare Pages Functions

### 2. CSS and styling

- Tailwind CSS v4 via `@tailwindcss/vite`
- Color palette extracted from current WordPress theme `:root` CSS variables
- Brand colors mapped as Tailwind custom colors (see design.md)
- Google Fonts loaded via `<link>` in `app.html`
- Responsive breakpoint at 1024px for mobile hamburger menu

### 3. Routes

All routes must exist and return 200. Content can be minimal placeholder text.

| Route | Type | Notes |
|---|---|---|
| `/` | Static | Home page |
| `/the-space/` | Static | |
| `/the-experience/` | Static | Blog listing page |
| `/the-experience/page/[n]/` | Static | Pagination (n = 2, 3, ...) |
| `/faq/` | Static | |
| `/contact/` | Static | |
| `/book/` | Static shell | Interactive wizard added later |
| `/galicia-remote-work/` | Static | |
| `/answers/` | Static | |
| `/privacy-policy-2/` | Static | Must preserve this exact slug |
| `/[slug]/` | Static | Blog posts, prerendered at build |
| `/wp-content/uploads/[...path]/` | Server | R2 proxy stub (returns 501 for now) |
| `/es/` | Static | "Not yet available" placeholder |
| `/es/[...rest]/` | Static | Catch-all for any ES slug |
| `/gl/` | Static | "Not yet available" placeholder |
| `/gl/[...rest]/` | Static | Catch-all for any GL slug |

### 4. Layout

A `+layout.svelte` at `src/routes/` wraps all pages with:

**Header (visible on all pages):**
- Logo (placeholder, user provides `logo.svg`)
- Nav links: Home, The Space, The Experience, FAQ, Contact
- "Join Us" button (green pill style, links to `/book/`)
- Responsive: collapses to hamburger at ≤1024px
- Sticky on mobile

**Footer (visible on all pages):**
- Two-column grid layout
- Left column: social media icons (Facebook, X/Twitter, Instagram, YouTube), placeholder for newsletter
- Right column: phone, email, privacy policy link, ES version link
- Full-width copyright bar: "Made with Love from a rural area — © 2026 Anceu coliving"

### 5. Timezone

- Default timezone: `Europe/Madrid`
- Configured at the Vite/SvelteKit level so all server-side date operations use this zone
- A utility function `formatInTimezone(date, format)` in `src/lib/utils/date.ts`

### 6. Git and conventions

- Git repo initialized with `.gitignore` (Node, Bun, env files, build output)
- `CLAUDE.md` created with:
  - Dev commands: `bun run dev`, `bun run build`, `bun run preview`
  - Convention notice: never use em-dashes; use commas, parentheses, or rephrase
  - How to add a new route

### 7. Deployment

- Connected to Cloudflare Pages via GitHub
- Build command: `bun run build`
- Output directory: `.svelte-kit/cloudflare`
- Environment variables: `PUBLIC_SITE_URL` set to temp URL
- First deploy verified at temp Cloudflare Pages URL

## Edge cases

- **404 handling**: Unknown routes should show a basic 404 page (SvelteKit default)
- **Trailing slashes**: Consistent behavior — all routes with trailing slash per current WP convention
- **Logo missing**: If `logo.svg` is not yet provided, show a text fallback "Anceu" in the header
- **ES/GL non-existent slugs**: Any slug under `/es/` or `/gl/` returns the placeholder page, never 404

## Verification

1. `bun run dev` starts without errors
2. `bun run build` completes without errors
3. Every route in the table above returns 200
4. Header shows all nav links and "Join Us" button
5. Footer shows all social icons, contact info, and copyright
6. Mobile viewport ≤1024px shows hamburger menu
7. `/es/any-slug/` shows language placeholder (not 404)
8. `/gl/any-slug/` shows language placeholder (not 404)
9. Cloudflare Pages deploy succeeds from GitHub push