# Design: wordpress-scraper

## Data flow

```
anceu.com/wp-sitemap.xml
  → post-sitemap.xml (69 posts)
  → page-sitemap.xml (12 pages)
    → For each URL:
      1. Fetch HTML
      2. Parse with JSDOM
      3. Extract:
         - <meta property="og:title"> → title
         - <meta property="og:description"> → description
         - <meta property="article:published_time"> → date
         - <meta property="og:image"> → og_image
         - .entry-content or <article> → body HTML
      4. Turndown: body HTML → markdown
      5. Write: content/en/{type}/{slug}.md
      6. Download images from sitemap + og:image → downloads/images/{slug}/
```

## URL classification

| Sitemap | Content type | Destination |
|---|---|---|
| `post-sitemap.xml` | `post` | `content/en/posts/` |
| `page-sitemap.xml` | `page` | `content/en/pages/` |
| `/events/`, `/press/`, `/anceu-coliving-es/` | skip | — |

Special cases (page-sitemap URLs treated as posts):
- `/what-is-rural-coliving/`
- `/rural-hybrid-talents/`
- `/trail-maintenance-wayfinding-steward/`