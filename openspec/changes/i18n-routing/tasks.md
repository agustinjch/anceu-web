# Tasks: i18n-routing

## T1: Create i18n utilities

- `src/lib/i18n/index.ts`
- Types: `Lang = 'en' | 'es' | 'gl'`
- Constants: `LANGUAGES` array with code, label, and display name
- `getLangFromPath(path)` → `Lang`
- `stripLangPrefix(path)` → slug without lang prefix
- `localizedPath(pathname, targetLang)` → same page in another language
- `alternateLinks(pathname, siteUrl)` → array of hreflang link objects

## T2: Create layout load function

- `src/routes/+layout.ts`
- Return `{ lang, pathname }` based on URL
- Pass to layout component

## T3: Update +layout.svelte with hreflang

- Read `data.lang` and `data.pathname` from layout data
- Generate hreflang `<link>` tags in `<svelte:head>`
- Pass lang as CSS class or attribute on body

## T4: Create LanguageSwitcher component

- `src/lib/components/LanguageSwitcher.svelte`
- Shows current language code
- Dropdown with EN/ES/GL options
- Each option links to the same page in that language

## T5: Update Header with LanguageSwitcher

- Add LanguageSwitcher to desktop nav (right side, before Join Us)
- Add LanguageSwitcher to mobile menu

## T6: Update ES/GL routes

- ES `+layout.svelte` and GL `+layout.svelte` pass through (no special logic needed)
- ES/GL `[...rest]` catch-all pages use `data.lang` for context
- Keep placeholder content but make it i18n-aware

## T7: Update Footer language links

- "ES version" link → dynamic LanguageSwitcher-style links
- Add GL link to footer

## T8: Update LanguagePlaceholder component

- Use i18n utilities for language names
- Link to EN version uses `stripLangPrefix`