# Tasks: project-scaffold

## T1: Scaffold SvelteKit project

- Run `bun create svelte@latest .` with TypeScript, ESLint, Prettier
- Install dependencies
- Install `@sveltejs/adapter-cloudflare`
- Configure `svelte.config.js` with adapter-cloudflare
- Verify `bun run dev` starts
- Verify `bun run build` completes

## T2: Configure Tailwind CSS

- Install `tailwindcss` and `@tailwindcss/vite`
- Add `@tailwindcss/vite` to Vite plugins in `svelte.config.js` (or `vite.config.ts`)
- Import `tailwindcss` in `src/app.css`
- Extract color hex values from current anceu.com WP theme `:root` CSS variables
- Configure custom colors in CSS using `@theme`
- Verify Tailwind classes work in a test component

## T3: Configure Google Fonts

- Identify the exact font families used by the current WordPress theme (inspect `<link>` tags in live site HTML)
- Add `<link rel="stylesheet" href="...">` in `src/app.html`
- Set font-family on body in `src/app.css`
- Verify fonts render locally

## T4: Configure Europe/Madrid timezone

- Set `process.env.TZ = 'Europe/Madrid'` in Vite config
- Create `src/lib/utils/date.ts` with `formatInTimezone(date, format)` helper using `Intl.DateTimeFormat`
- Verify timezone in a test route

## T5: Create Header component

- Create `src/lib/components/Header.svelte`
- Logo slot: render `src/lib/assets/logo.svg` if exists, else text "Anceu" fallback
- Nav items: Home (`/`), The Space (`/the-space/`), The Experience (`/the-experience/`), FAQ (`/faq/`), Contact (`/contact/`)
- "Join Us" button: pill style (green bg `#00a66b`, white text, rounded-full), links to `/book/`
- Active link highlighting based on current route (`$page.url.pathname`)
- Responsive: hamburger menu toggle at ≤1024px using Svelte `{#if}` + state
- Sticky positioning on mobile

## T6: Create Footer component

- Create `src/lib/components/Footer.svelte`
- Two-column responsive grid layout
- Left column: social media icon links (FB, X, IG, YT) as inline SVGs, placeholder for newsletter area
- Right column: phone (`+34 626 943 874`), email (`hello@anceu.com`), Privacy Policy link (`/privacy-policy-2/`), ES version link
- Full-width copyright bar: "Made with Love from a rural area — © 2026 Anceu coliving"
- All social links open in new tabs with `rel="noopener noreferrer"`

## T7: Create language placeholder component

- Create `src/lib/components/LanguagePlaceholder.svelte`
- Props: `lang: 'es' | 'gl'`
- Renders: small banner saying "This page is not yet available in [Spanish/Galician]"
- Link back to the equivalent EN page

## T8: Create layout

- Create/edit `src/routes/+layout.svelte`
- Import and render Header and Footer
- `<slot/>` for page content
- Apply base font, background color, and min-height

## T9: Create placeholder pages

Create each route with minimal content:
- `src/routes/+page.svelte` — Home
- `src/routes/the-space/+page.svelte`
- `src/routes/the-experience/+page.svelte`
- `src/routes/the-experience/page/[n]/+page.svelte`
- `src/routes/faq/+page.svelte`
- `src/routes/contact/+page.svelte`
- `src/routes/book/+page.svelte`
- `src/routes/galicia-remote-work/+page.svelte`
- `src/routes/answers/+page.svelte`
- `src/routes/privacy-policy-2/+page.svelte`
- `src/routes/[slug]/+page.svelte` — blog post placeholder

Each page: title, brief description, layout inherits from parent.

## T10: Create ES/GL language structure

- `src/routes/es/+layout.svelte` — applies EN layout with language-banner
- `src/routes/es/+page.svelte` — ES home placeholder
- `src/routes/es/[...rest]/+page.svelte` — catch-all ES slug, renders `LanguagePlaceholder`
- `src/routes/gl/+layout.svelte` — same for GL
- `src/routes/gl/+page.svelte` — GL home placeholder
- `src/routes/gl/[...rest]/+page.svelte` — catch-all GL slug, renders `LanguagePlaceholder`

## T11: Create R2 uploads stub

- Create `src/routes/wp-content/uploads/[...path]/+server.ts`
- For now, return 501 Not Implemented with JSON body explaining R2 not yet configured
- This route structure preserves the URL space for feature 6

## T12: Initialize git and conventions

- Create `.gitignore` for Bun + Node + SvelteKit + env files
- Create `CLAUDE.md` with:
  - Dev commands: `bun run dev`, `bun run build`, `bun run preview`
  - Convention: never use em-dashes; use commas, parentheses, or rephrase
  - Languages: EN (primary), ES, GL
  - How to create a new page
  - Code style: SvelteKit + TypeScript + Tailwind
- Run `git init && git add . && git commit -m "Initial scaffold: SvelteKit + Tailwind + Cloudflare Pages"`

## T13: First deploy

- Create Cloudflare Pages project via dashboard (or `wrangler pages project create`)
- Connect GitHub repo
- Configure build settings in Cloudflare dashboard:
  - Build command: `bun run build`
  - Build output: `.svelte-kit/cloudflare`
  - Root directory: `/`
- Add `PUBLIC_SITE_URL` env var
- Trigger first deploy
- Verify site is accessible at `<project>.pages.dev`
- Verify all routes render correctly

## T14: Verify

- Check every route returns 200
- Check ES/GL catch-all routes return language placeholder
- Check header renders all links
- Check footer renders all sections
- Check mobile responsive behavior
- Check build succeeds with no TypeScript errors
- Check `formatInTimezone` works correctly for Europe/Madrid