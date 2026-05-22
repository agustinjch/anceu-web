# Design: project-scaffold

## Architecture overview

```
┌──────────────────────────────────────────────────────┐
│                    anceu.com                          │
│  SvelteKit 2.x + TypeScript + Tailwind CSS v4        │
│                                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │  +layout.svelte                                  ││
│  │  ├── Header (nav + logo + cta button)            ││
│  │  ├── <slot/> (page content)                      ││
│  │  └── Footer (address, social, contact, legal)    ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  Routes (all prerendered):                            │
│  ├── /                    Home                        │
│  ├── /the-space                                       │
│  ├── /the-experience                                  │
│  ├── /the-experience/page/[n]                         │
│  ├── /faq                                             │
│  ├── /contact                                         │
│  ├── /book                                            │
│  ├── /galicia-remote-work                             │
│  ├── /answers                                         │
│  ├── /privacy-policy-2                                │
│  ├── /[slug]              blog posts                  │
│  ├── /es/...              language placeholder         │
│  ├── /gl/...              language placeholder         │
│  └── /wp-content/uploads/[...path]  future R2 proxy   │
└──────────────────────────────────────────────────────┘

Deployment:
  GitHub ──push──▶ Cloudflare Pages ──▶ https://anceu.pages.dev (temp)
```

## Component tree

```
src/
├── app.html                          # SvelteKit shell
├── app.css                           # Tailwind entry + palette
├── lib/
│   ├── assets/
│   │   └── logo.svg                  # User-provided logo (placeholder)
│   └── components/
│       ├── Header.svelte             # Nav bar + logo + CTAs
│       ├── Footer.svelte             # Multi-column footer
│       └── LanguagePlaceholder.svelte # i18n not-ready banner
├── routes/
│   ├── +layout.svelte                # Wraps Header + Footer around slot
│   ├── +page.svelte                  # Home placeholder
│   ├── the-space/+page.svelte
│   ├── the-experience/+page.svelte
│   ├── the-experience/page/[n]/+page.svelte
│   ├── faq/+page.svelte
│   ├── contact/+page.svelte
│   ├── book/+page.svelte
│   ├── galicia-remote-work/+page.svelte
│   ├── answers/+page.svelte
│   ├── privacy-policy-2/+page.svelte
│   ├── [slug]/+page.svelte
│   ├── es/+layout.svelte             # Shared layout for ES routes
│   ├── es/+page.svelte               # "Not yet available" placeholder
│   ├── es/[...rest]/+page.svelte     # Catch-all for ES slugs
│   ├── gl/+layout.svelte
│   ├── gl/+page.svelte
│   ├── gl/[...rest]/+page.svelte
│   └── wp-content/uploads/[...path]/+server.ts  # R2 proxy (stub for now)
```

## Header structure

```
┌──────────────────────────────────────────────────────┐
│  [Logo]  Home  The Space  The Experience  FAQ        │
│          Contact               [ Join Us ]           │
└──────────────────────────────────────────────────────┘
```

- Logo: left-aligned, links to `/`
- Nav items: inline, horizontal. Active state for current page.
- "Join Us": pill button style, green accent (`#00a66b`), links to `/book/`
- Responsive: at ≤1024px, collapses to hamburger menu
- Mobile: sticky header with hamburger toggle

Color variables for header:
- Background: white (`#ffffff`)
- Text: dark gray (from palette)
- Active link: green accent
- "Join Us" button: bg `#00a66b`, text white, hover slightly darker

## Footer structure

```
┌──────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Newsletter        │  │ Contact          │          │
│  │ (future)          │  │ 📞 +34 626 943   │          │
│  │                   │  │ ✉ hello@anceu.com           │
│  │ Social:           │  │                  │          │
│  │ [FB] [X] [IG] [YT]│  │ Privacy Policy   │          │
│  │                   │  │ ES version 🇪🇸    │          │
│  └──────────────────┘  └──────────────────┘          │
│                                                       │
│  Made with Love from a rural area — © 2026 Anceu      │
└──────────────────────────────────────────────────────┘
```

- Two-column grid layout
- No newsletter form in MVP (placeholder area or hide until later)
- Social icons: inline SVG icons for Facebook, X/Twitter, Instagram, YouTube
- ES version link: `/anceu-coliving-es/` redirect (per spec section 4)
- Copyright: centered full-width bar below columns

## Tailwind palette setup

Extract from WP `:root` CSS variables the following and map to Tailwind:

```css
/* WP CSS variables to extract (actual hex values need inspection): */
--contrast:    /* near-black text */
--contrast-2:  /* secondary text */
--contrast-3:  /* muted text */
--base:        /* page background */
--base-2:      /* slight off-white */
--accent:      /* green primary #00a66b or similar */
--accent-2:    /* secondary accent */
--accent-3:    /* lighter accent */
--accent-4:    /* muted accent */
```

Map as Tailwind `theme.extend.colors`:

```js
colors: {
  brand: {
    green: '#00a66b',
    'green-dark': '#008f5a',
    'green-light': '#33b888',
  },
  neutral: {
    50:  '#fafafa',   // base-2
    100: '#f5f5f5',   // base
    700: '#444444',   // contrast-3
    800: '#222222',   // contrast-2
    900: '#111111',   // contrast
  }
}
```

## Timezone

- Server-side: `process.env.TZ = 'Europe/Madrid'` in `svelte.config.js` or `vite.config.ts`
- All date handling: use `DATE` type (no time component) for check-in/check-out
- Timestamps (created_at, etc.): stored as UTC, displayed in Europe/Madrid
- A utility function `formatInTimezone(date, format)` in `src/lib/utils/date.ts`

## Fonts

Google Fonts used by current WP theme (to be confirmed from live site HTML). Likely:
- Primary font: Inter or similar sans-serif
- Import via `<link>` in `app.html` or `@import` in CSS

## Responsive breakpoints

Match current WP theme:
- Mobile: ≤1024px (header collapses to hamburger)
- Desktop: >1024px (full nav)
- Content max-width: ~1200px centered

## Language routing strategy (MVP)

- EN at root: routes serve content directly
- `/es/` and `/gl/`: use `[...rest]` catch-all to handle any slug
- ES/GL pages render a `LanguagePlaceholder.svelte` component that shows:
  - "This page is not yet available in [language]" banner
  - A link back to the EN version
- This structure matches spec section 4 (fallback behavior)
- Full i18n with hreflang comes in feature 3