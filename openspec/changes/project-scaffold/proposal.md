# Proposal: project-scaffold

## Summary

Initialize the entire anceu.com project: SvelteKit scaffold, Cloudflare Pages deployment, basic layout with header/footer matching the current WordPress design, Tailwind CSS, timezone setup, and git repo.

This is feature 1 of 42. Everything else builds on this foundation.

## Motivation

The current WordPress + HBook setup is being replaced with a custom SvelteKit site. This scaffold is the first brick — it establishes the project structure, build pipeline, deployment flow, and visual shell so that subsequent features (DB schema, content loading, booking wizard, admin) have a place to land.

## Scope

### In scope

- SvelteKit 2.x + TypeScript project with Bun
- Cloudflare Pages adapter (`@sveltejs/adapter-cloudflare`)
- `+layout.svelte` with header and footer matching current anceu.com design structurally
- Tailwind CSS v4 with color palette from current WP theme
- Google Fonts (same as current site)
- Timezone configured to `Europe/Madrid`
- `+page.svelte` placeholders for all public routes (Home, The Space, The Experience, FAQ, Contact, Book, Galicia Remote Work, Answers, Privacy Policy, blog `[slug]`)
- Language directory structure: EN at root, `/es/` and `/gl/` with placeholder content
- Catch-all route at `/wp-content/uploads/[...path]` for future R2 image serving
- Logo placeholder in `src/lib/assets/` (user provides `logo.svg` later)
- Git repo initialized, `.gitignore`, initial commit
- `CLAUDE.md` with dev commands and conventions
- First deploy to Cloudflare Pages at temp URL

### Out of scope

- Newsletter / MailerLite integration
- Language switcher UI / actual i18n routing (deferred to feature 3)
- Real page content (deferred to features 8-9)
- Booking wizard (features 12-15)
- Admin panel (features 16-28)
- Database, authentication, or any backend logic
- Image optimization component (deferred to feature 4)

## Risks

- The exact Google Fonts family used by the WP theme needs to be identified and verified. If the font name or weight is wrong, the visual match won't be close.
- The color palette needs manual extraction from the current WP CSS. Missing a key shade means the header/footer won't look right.
- Tailwind v4 has a different config approach (CSS-based instead of JS-based). Need to confirm the correct setup path for SvelteKit.

## Success criteria

- `bun run dev` starts a local server
- `bun run build` produces a working Cloudflare Pages build
- Header renders with all nav links: Home, The Space, The Experience, FAQ, Contact, Join Us
- Footer renders with address, social icons (FB/X/IG/YT), contact info, privacy policy, ES version link
- All public routes return 200 and show a placeholder page
- `/es/` and `/gl/` routes exist and show a "not yet available" placeholder
- Deployed to Cloudflare Pages and accessible at temp URL
- Timezone-aware date handling produces `Europe/Madrid` times