# Anceu Coliving — new website

## Stack

- **Framework**: SvelteKit 2.x + TypeScript
- **Hosting**: Cloudflare Pages
- **Database**: Neon Postgres (free tier)
- **ORM**: Drizzle
- **Styling**: Tailwind CSS v4
- **Font**: Aleo (headings), system UI (body)

## Dev commands

```bash
bun run dev        # Start dev server
bun run build      # Build for production
bun run preview    # Preview production build locally
bun run check      # Run svelte-check for type errors
```

## Conventions

- **Language**: English in code and comments. Content in EN (primary), ES, GL.
- **Em-dashes**: NEVER use em-dashes (—). Use commas, parentheses, or rephrase. Applies to all content and generated communications.
- **Code style**: Standard SvelteKit + TypeScript + Tailwind conventions. Use Runes (Svelte 5 reactivity).
- **Date format**: All business dates in Europe/Madrid timezone. Technical timestamps in UTC.

## How to create a new page

1. Create a directory or file under `src/routes/` matching the desired URL path
2. Create a `+page.svelte` with a `<svelte:head>` for title/description
3. For server-side data, add `+page.server.ts` or `+page.ts`

## Secrets

All sensitive values in environment variables. See `.env.example` for the full list.
Never commit `.env` or secrets to the repository.