# Proposal: i18n-routing

## Summary

Implement proper internationalized routing: EN at root, ES at `/es/`, GL at `/gl/`. Add hreflang tags, language switching, and English fallback infrastructure. This establishes the routing layer that content loading (feature 4) will use.

## Scope

### In scope

- i18n utility library (language detection, URL helpers, constants)
- hreflang `<link>` tags on every page (EN, ES, GL, x-default)
- Language switcher in header (EN/ES/GL links to current page in other languages)
- Proper ES/GL route handling via catch-all with language context
- Footer language links updated
- `LanguagePlaceholder` component updated to use i18n utilities

### Out of scope

- Translated UI strings beyond basic nav/footer labels (content translation is feature 7)
- Actual translated content (features 8-9)
- Content-based language detection (always URL-based)

## Success criteria

- `/es/the-space/` shows language-aware content
- Every page emits 4 hreflang tags: EN, ES, GL, x-default
- Language switcher shows 3 options and links to the same page in each language
- Switching language preserves the current page/slug