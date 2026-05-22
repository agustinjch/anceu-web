# Anceu.com — New website project spec

This document captures every decision made for the new anceu.com. It is the source of truth for generating OpenSpec features incrementally. Read it once end-to-end before starting. Then pick features one at a time using the index at the bottom.

---

## 1. Goal

Replace the current WordPress + HBook setup with a custom-built site that:

- Lets Agustin create blog posts easily from Claude Code / Cursor / opencode by editing markdown files in the repo.
- Preserves all current public URLs 1:1 to avoid SEO loss.
- Replaces HBook with a simpler booking system: see availability, send request, admin approves and charges via Stripe.
- Supports manual bookings from admin (paid or unpaid, e.g. for community projects, camps).
- Sends transactional emails automatically.

WordPress is "a mess". The new system must be the opposite: simple, predictable, owned in code.

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | SvelteKit | Single app, public + admin + API in one codebase |
| Hosting | Cloudflare Pages | Deploy from GitHub on push |
| Database | Neon Postgres (free tier) | Serverless, branchable, plenty for this volume |
| ORM | Drizzle | Type-safe, simpler than Prisma |
| Object storage | Cloudflare R2 | Images, served from same domain |
| Image optimization | Cloudflare Image Resizing | Free on Cloudflare Pages, srcset via `<Image>` component |
| Email | Resend | Templates as React Email components in repo |
| Auth | Magic link via email + DB allowlist | No passwords, no third-party auth |
| Payments | Stripe | Setup Intent at request, off-session charge at approval |
| Content format | Markdown / MDX | Files in `content/` directory in repo |
| Analytics | Cloudflare Web Analytics | No cookies, no consent banner needed |
| Error logging | Cloudflare Workers Logs | No external service; critical errors emailed to admin |
| Uptime monitoring | None at launch | Agustin will add BetterStack or similar later |
| Search | None at launch | Pagefind reserved for future |

---

## 3. Repo structure

Single public GitHub repository. All code, content, scripts, and migrations live here. No secrets in repo (env vars only).

```
anceu/
├── content/
│   ├── en/
│   │   ├── pages/        # the-space.md, faq.md, contact.md, book.md, ...
│   │   └── posts/        # hacker-days-2025.md, rural-wo.md, ...
│   ├── es/
│   │   ├── pages/
│   │   └── posts/
│   └── gl/
│       ├── pages/
│       └── posts/
├── scripts/
│   ├── scrape-wordpress.ts    # initial WP extraction
│   ├── translate.ts            # EN → ES + GL via Claude API
│   └── seed.ts                 # admin users, rooms, pricing periods, settings
├── src/
│   ├── lib/
│   │   ├── db/                 # Drizzle schema + client
│   │   ├── email/              # React Email templates (EN/ES/GL)
│   │   ├── stripe/             # Stripe helpers
│   │   ├── r2/                 # R2 upload helpers
│   │   ├── content/            # markdown loaders
│   │   ├── i18n/               # language helpers + EN fallback
│   │   └── auth/               # magic link logic
│   ├── routes/
│   │   ├── +page.svelte                          # home (EN)
│   │   ├── the-space/+page.svelte
│   │   ├── the-experience/
│   │   │   ├── +page.svelte                      # listing p1
│   │   │   └── page/[n]/+page.svelte             # p2, p3, ...
│   │   ├── [slug]/+page.svelte                   # blog posts in root
│   │   ├── book/                                 # 3-step wizard
│   │   ├── faq/+page.svelte
│   │   ├── contact/+page.svelte
│   │   ├── galicia-remote-work/+page.svelte
│   │   ├── answers/+page.svelte
│   │   ├── privacy-policy-2/+page.svelte
│   │   ├── es/...                                # mirror EN structure
│   │   ├── gl/...                                # mirror EN structure
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── bookings/
│   │   │   ├── calendar/
│   │   │   ├── pricing/
│   │   │   ├── rooms/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── availability/
│   │   │   ├── bookings/
│   │   │   ├── admin/
│   │   │   └── webhooks/stripe/
│   │   └── wp-content/uploads/[...path]+server.ts  # serves from R2 transparently
│   └── ...
├── drizzle/
│   └── migrations/
├── .env.example
├── CLAUDE.md
└── README.md
```

**`CLAUDE.md`** documents:
- How to create a new post (file path, frontmatter, image location, translation script)
- Convention: never use em-dashes; use commas, parentheses, or rephrase
- Local dev commands (`bun run dev`, `bun run translate`, `bun run seed`)
- How to test changes locally before push

---

## 4. URLs and i18n

### Languages

- **English**: default, lives at root. No prefix. `/`, `/the-space/`, `/hacker-days-2025/`
- **Spanish**: `/es/...` — same slugs as EN, just prefixed. `/es/the-space/`, `/es/hacker-days-2025/`
- **Galician**: `/gl/...` — same slugs as EN.
- **Slugs are not translated**. Same slug across all three languages.

### Fallback

If a markdown file does not exist for ES or GL, the URL serves the EN version with a small banner: *"This post is not yet available in [language]"*. No 404, no empty pages.

### `hreflang`

Every page emits `<link rel="alternate" hreflang="...">` tags for EN, ES, GL, and `x-default` pointing to EN. This is the SEO contract: Google treats them as translations, not duplicates.

### URL preservation (no SEO loss)

All current public URLs are replicated 1:1, including ugly ones like `/privacy-policy-2/`. The only redirects are:

- `/anceu-coliving-es/` → 301 → `/es/` (current standalone Spanish page)
- `/the-experience/?query-2dd753a5-page=N` → 301 → `/the-experience/page/N/`
- `/wp-content/uploads/...` — NOT a redirect. The new app serves these paths directly from R2, so old image URLs (indexed in Google Images, embedded in social media Open Graph previews) keep working with no redirect chain.

### Public URL inventory

Static pages:
- `/`, `/the-space/`, `/the-experience/`, `/faq/`, `/contact/`, `/book/`, `/galicia-remote-work/`, `/answers/`, `/privacy-policy-2/`

Blog: ~70 posts living in root (`/hacker-days-2025/`, `/rural-wo/`, etc.). The exact list comes from `https://anceu.com/wp-sitemap.xml`.

`/the-experience/` is the blog listing with pagination (7 pages currently). Reimplemented with new pagination scheme.

---

## 5. Content model

### Markdown files

Each post or page is a single `.md` (or `.mdx` if interactive components are needed) with frontmatter:

```yaml
---
title: "Hacker Days 2025"
description: "Collective water management prototype built at Anceu"
date: 2025-10-28
og_image: /wp-content/uploads/2025/11/HackerDays_grupo_2.jpg
slug: hacker-days-2025          # explicit, must match filename
type: post                      # "post" | "page"
---
```

### Image paths

- **Legacy** images (migrated from WP): keep `/wp-content/uploads/YYYY/MM/...` paths exactly as they were. Served from R2 under the same path via a catch-all SvelteKit route.
- **New** images (uploaded from now on): live under `/media/...`, organized by context. Examples:
  - `/media/posts/SLUG/IMG.jpg`
  - `/media/rooms/101/IMG.jpg`
  - `/media/pages/the-space/IMG.jpg`

### `<Image>` component

A custom Svelte component wraps every image. It:
- Generates a `srcset` with multiple widths.
- Uses Cloudflare Image Resizing via URL parameters.
- Outputs WebP/AVIF when supported (`format=auto`).
- Sets `loading="lazy"` by default.

---

## 6. Booking domain model

### Rooms

11 rooms total. Static inventory, defined in `scripts/seed.ts`, rarely changes.

| ID  | Type    | Beds                              | Max occupancy (admin) | Max occupancy (public) |
|-----|---------|-----------------------------------|------------------------|------------------------|
| 000 | private | 1× double                         | 2                      | 2                      |
| 001 | private | 1× double + 1× single (90cm)      | 3                      | 2                      |
| 002 | luxury  | 1× double + 2× single (90cm)      | 4                      | 2                      |
| 101 | private | 1× double                         | 2                      | 2                      |
| 102 | private | 1× double + 1× single             | 3                      | 2                      |
| 103 | private | 1× double + 1× single             | 3                      | 2                      |
| 104 | luxury  | 1× double + 2× single             | 4                      | 2                      |
| 105 | private | 1× double                         | 2                      | 2                      |
| 106 | private | 1× double                         | 2                      | 2                      |
| 107 | private | 1× double                         | 2                      | 2                      |
| 108 | private | 2× single                         | 2                      | 2                      |

Public web only ever allows 1 or 2 guests per room. Admin can override and place 3+ for camps, projects, or events.

### Pricing periods

Editable from admin. A pricing period has:

```
pricing_period {
  id
  name                  # e.g. "High season 2026", "Closed Dec/Jan/Feb 2026"
  start_date            # DATE
  end_date              # DATE
  status                # 'open' | 'closed'
  notes                 # optional
}

pricing_period_rate {
  pricing_period_id
  room_type             # 'private' | 'luxury'
  price_per_night_cents # base nightly price (single occupancy, before any discount), 10% IVA included
}
```

Closed periods: web hides them in the date picker. They cannot be selected, cannot be requested even with negotiation flag on. Booking ranges may not cross a closed period.

### Global settings

Editable from admin. Single row in `settings` table:

```
settings {
  long_stay_discount_percent     # default 30
  long_stay_threshold_nights     # default 30 (>= this triggers discount)
  extra_person_per_night_cents   # default 1500 (15.00 EUR)
  min_stay_nights                # default 15
  max_stay_nights                # default 60
  vat_percent                    # default 10
  allow_requests_without_availability   # default true
  payment_first_charge_nights    # default 15 (charge first 15 nights at approval)
  default_communication_language # default 'en'
}
```

### Price calculation

Inputs: check_in (DATE), check_out (DATE), guests (1 or 2 from public; up to room max from admin).

1. Compute number of nights = `check_out - check_in`.
2. For each night in the range, find the applicable `pricing_period_rate` based on date + room type.
3. Sum nightly base rates → `subtotal_base`.
4. If `guests >= 2`, add `(guests - 1) * extra_person_per_night_cents * nights` → `subtotal_with_extras`.
5. If `nights >= long_stay_threshold_nights`, apply `long_stay_discount_percent` to the full subtotal → `total`.
6. All prices include 10% VAT (Spanish lodging rate). Stripe Invoicing handles the VAT breakdown automatically.

For stays that cross seasons (e.g. 11 nights low + 10 nights high), the booking form shows the breakdown.

### Booking state machine

```
pending_review
  ↓ admin approves + Stripe off-session charge succeeds
confirmed
  ↓ admin cancels
cancelled_by_admin

[pending_review]
  ↓ admin rejects
rejected

[pending_review]
  ↓ another overlapping booking is confirmed
rejected_overlap          (automatic, sends email to guest)

[admin creates booking manually, no payment]
admin_manual              (blocks calendar)

[admin creates booking manually, with payment]
confirmed                 (after charge succeeds)
```

If Stripe off-session charge fails on approval: booking stays in `pending_review`, admin sees the error, contacts the guest manually (no automated `payment_action_required` state).

### Availability rules

A room is **occupied** for a given date range if it has any booking in state `confirmed` or `admin_manual`, OR if there is a manual `block` covering that range. `pending_review` bookings do not block availability.

### Manual blocks

Admin can create blocks: room + start_date + end_date + reason (free text). Used for maintenance, owner stays, events. Appear in calendar as red bars.

### Payments

A booking has 1..N payments.

```
payment {
  id
  booking_id
  amount_cents
  description           # "First 15 nights", "Remaining nights + laundry", etc.
  stripe_payment_intent_id
  status                # 'succeeded' | 'failed' | 'pending'
  vat_percent           # 10 by default
  invoice_url           # Stripe-generated PDF
  paid_at
  created_by_admin_user_id
}
```

First payment: triggered automatically on approval. Amount = first 15 nights (or full stay if shorter).

Subsequent payments: admin enters a free amount + description and triggers off-session charge from the booking detail screen. All charged at 10% VAT for simplicity (stay + extras lumped together).

### Stripe integration

- One Stripe account (existing, Spanish CIF).
- Setup Intent created when guest submits booking request. Card 3DS-authenticated at that point. Payment method saved to a Stripe customer.
- Payment Intents created off-session at admin approval and for any subsequent payment. Metadata: `booking_id`, `room_id`, `nights`, `guest_email`, `payment_description`.
- Stripe Invoicing generates invoices automatically with VAT breakdown.
- Webhook endpoint `/api/webhooks/stripe/` handles `payment_intent.succeeded`, `payment_intent.payment_failed`, `setup_intent.succeeded` events.

### Booking data captured

Booking form (3-step wizard):

**Step 1 — Availability**
- Check-in, check-out (Airbnb-style date picker showing availability inline)
- Number of guests (1 or 2)
- Room type filter (Private, Luxury, Any) — recommended hint
- Shows total price with seasonal breakdown when applicable

**Step 2 — About you**
- Guest 1 (always): first name, last name, email, phone, country, date of birth, full address, VAT/passport number
- Guest 2 (if guests=2): first name, last name, email, VAT/passport number
- Community questions (asked once per booking):
  - "How do you imagine a perfect day in Anceu coliving?"
  - "What's the most passionate project you are working on at the moment?"
  - "How do you think you'll be able to contribute to Anceu Coliving community best?"
  - "Tell us a bit more about yourself"
  - "A website or social media?" (optional)
- Allergies / dietary restrictions
- How did you hear about Anceu? (optional)

**Step 3 — Confirm + card**
- Summary review
- Stripe embedded Setup Intent form (guest enters card, 3DS completes)
- Submit → booking created in `pending_review`

If `allow_requests_without_availability` is on and selected dates conflict with existing bookings or partial gaps, step 1 shows an inline warning before allowing continuation. The booking is created with `requires_dates_negotiation: true` and highlighted in admin.

Closed periods are never selectable. Stay must be 15-60 nights. Both rules enforced in date picker, never bypassable from public form.

### Communication language per booking

Booking has a `communication_language` field (`en` | `es` | `gl`), default `en`. Editable in admin before sending any guest-facing email. Determines which language template is used.

---

## 7. Admin

### Auth

- Magic link login. Guest enters email, system checks against `admin_users` table, sends one-time link valid 15 minutes.
- Session cookie httpOnly, signed, 30-day expiry.
- All admin actions logged with `admin_user_id` (audit trail).

### Admin users

Seeded via script. Schema:

```
admin_user {
  id
  email
  name
  role           # 'owner' | 'staff' (no enforced differences in MVP, just for record)
  created_at
  last_login_at
}
```

### Admin features (MVP scope)

1. Bookings list with filters (state, date range, room type, guest name)
2. Booking detail view: guest info, community answers, room assignment, payment history, status changes, notes
3. Approve booking → triggers off-session charge for first 15 nights
4. Reject booking → triggers rejection email
5. Cancel confirmed booking → marks `cancelled_by_admin`, no refund
6. Create manual booking (paid or unpaid)
7. Trigger additional payment from booking detail (free amount + description)
8. Calendar view: Gantt-style, X = days, Y = 11 rooms, 2 months by default
   - `confirmed`: solid green bar
   - `admin_manual`: solid gray bar
   - `blocked`: solid red bar
   - `pending_review`: dashed-border yellow bar (visible but not blocking)
   - Click bar → booking detail; click empty cell → quick create block or booking
9. Assign room: when approving a request that didn't specify a room (`Any`), admin picks the specific room
10. Create / edit manual blocks
11. Edit pricing periods (CRUD)
12. Edit global settings
13. Anonymize guest data (GDPR right to erasure): replaces PII with `[redacted]`, keeps booking integrity
14. Export guest data (GDPR right of access): JSON dump

### Out of scope for MVP

- Content editor (markdown editing happens in Cursor/Claude Code, not in admin web)
- Guest portal / login
- Financial reports / dashboards
- Email template editor (templates are React Email components in code)
- Role-based permissions (all admins have full access)
- Room inventory CRUD (rooms are seeded once)

---

## 8. Emails

Provider: Resend. Templates: React Email components in `src/lib/email/templates/`. One file per template per language (e.g. `request_received.en.tsx`, `request_received.es.tsx`, `request_received.gl.tsx`).

Language fallback: if `communication_language` is `gl` but no GL template exists for a given email, fall back to EN.

From: `hello@anceu.com`. Reply-To: `hello@anceu.com`. All guest-facing emails BCC `hello@anceu.com` so the team has an internal copy.

### Guest-facing emails

| # | Trigger                                                | Template name        |
|---|--------------------------------------------------------|----------------------|
| 1 | Booking request submitted (`pending_review` created)   | `request_received`   |
| 2 | Booking approved + charged successfully                | `booking_confirmed`  |
| 3 | Booking rejected by admin                              | `booking_rejected`   |
| 4 | Booking auto-rejected because of overlap               | `booking_rejected_overlap` |
| 5 | Booking cancelled by admin                             | `booking_cancelled`  |
| 6 | 10 days before check-in                                | `pre_checkin_10d`    |
| 7 | 2 days before check-in                                 | `pre_checkin_2d`     |
| 8 | 1-2 days after check-out                               | `post_checkout`      |

### Admin-facing emails

| # | Trigger                                  | Template name              |
|---|------------------------------------------|----------------------------|
| 9  | New booking request received            | `admin_new_request`        |
| 10 | Off-session charge failed on approval   | `admin_payment_failed`     |
| 11 | Any uncaught critical error in code     | `admin_critical_error`     |

Cron jobs (Cloudflare Workers scheduled events) trigger pre-checkin and post-checkout emails daily.

### DNS configuration

Add SPF + DKIM records for Resend in Cloudflare DNS for `anceu.com`. Resend provides exact records.

---

## 9. Migration plan

Cutover happens in October-November (off-season), no active bookings to migrate.

### Phase 1 — Technical setup (week 1)

- Repo created on GitHub (public).
- SvelteKit skeleton deployed to Cloudflare Pages at temp URL.
- Neon DB created, Drizzle schema applied.
- R2 bucket created, domain/path for image serving configured.
- Stripe configured in test mode, keys in Cloudflare env vars.
- Resend configured, DNS records added.

### Phase 2 — Content migration (week 1-2)

- `scripts/scrape-wordpress.ts` reads `https://anceu.com/wp-sitemap.xml`, fetches each URL, converts HTML to markdown with `turndown`, extracts frontmatter (title, date, description, og:image).
- Images downloaded (originals, not WP-resized variants) and uploaded to R2 at same paths.
- Manual review of extracted content (always artifacts).
- `scripts/translate.ts` calls Claude API to translate each EN file to ES + GL.
- Human review of translations (at minimum the static pages: home, the-space, the-experience, faq, contact, book, galicia-remote-work, answers, privacy-policy-2).

### Phase 3 — Booking system (week 2-4)

- Drizzle schema for rooms, pricing_periods, pricing_period_rates, bookings, payments, blocks, admin_users, settings, sessions.
- Seed script with 11 rooms, initial pricing periods (2026 high/low/closed), settings defaults, 1+ admin users.
- Availability endpoint.
- 3-step booking wizard.
- Admin authentication.
- Admin bookings list + detail + actions.
- Admin calendar.
- Admin pricing CRUD.
- Admin settings.
- Email templates EN (then ES/GL).
- Stripe Setup Intent + off-session charge + webhooks.

### Phase 4 — QA in staging (week 4)

- 5+ end-to-end bookings with Stripe test cards.
- Verify all emails arrive and render correctly in Gmail/Outlook/Apple Mail.
- Diff old sitemap vs. new routes: every old URL must exist.
- Mobile + cross-browser testing.

### Phase 5 — Cutover (1 day)

- Stripe to live mode.
- Full backup of WordPress (DB export + uploads zip).
- DNS switch: `anceu.com` to Cloudflare Pages.
- Active monitoring 24-48h.
- WordPress kept off but not deleted for 2-4 weeks.

### Rollback criteria

Revert DNS to WordPress if:
- Booking wizard fails for >10% of users, or
- Stripe charges are incorrect.

Minor cosmetic bugs: patch in place, no rollback.

### Phase 6 — Post-launch

- Monitor Google Search Console for unexpected 404s.
- No bookings to migrate from HBook (cutover during closed season).

---

## 10. Time, dates, and locale

- Business timezone: `Europe/Madrid`. All scheduling logic evaluated here.
- Check-in / check-out stored as `DATE` (no time component).
- Technical timestamps (created_at, paid_at, etc.) stored as `TIMESTAMPTZ` (UTC in DB), displayed in `Europe/Madrid`.
- Nights = `check_out - check_in` (e.g. 5 to 20 June = 15 nights).
- Long-stay discount applies when `nights >= 30`. Automatic, no admin override.
- Long-stay discount: 30% off the full subtotal (room + extras).

---

## 11. Performance

- Static content (pages + posts): prerendered at build time (SSG).
- `/book/`: page itself prerendered, wizard interactive via client-side fetch to `/api/availability`.
- Admin: SSR with auth check on every request.
- API: serverless functions.
- No availability caching at launch (Neon + indexed queries are fast enough).
- Images: Cloudflare Image Resizing in edge, srcset via `<Image>` component, `format=auto` for WebP/AVIF.

---

## 12. GDPR

- Privacy policy at `/privacy-policy-2/` rewritten to list new processors: Neon (DB), Cloudflare (hosting, R2), Stripe (payments), Resend (emails).
- No cookies banner needed: Cloudflare Web Analytics is cookieless, only functional cookies used (admin session, language preference).
- Right to erasure: admin can anonymize a booking (replaces PII with `[redacted]`, keeps booking row for accounting integrity).
- Right of access: admin can export a guest's data as JSON.
- Retention: 7 years from check-out (Spanish fiscal limit). Cron job anonymizes older bookings monthly. Nice-to-have post-MVP.
- DPAs: auto-signed via each processor's T&C, no manual action.

---

## 13. Future / not in MVP

Documented here so they are not forgotten.

- **SES Hospedajes automation**: monthly report of travelers to the Spanish Ministry of Interior. The booking schema already captures all required SES fields (name, document, address, dates, etc.). Add a daily job that posts check-ins/check-outs to the SES Web Service.
- **Pagefind site search**: when posts > 100, add client-side search.
- **Uptime monitoring**: BetterStack free tier, ping `anceu.com/` every 3 min.
- **Stripe Invoicing customization**: if invoices need custom branding or extra fields.
- **Retention cron job**: anonymize bookings older than 7 years.
- **Multi-room bookings in a single request**: today, one request = one room. If groups want to book 3 rooms at once, currently 3 separate requests. Could be merged later.
- **Guest portal**: guests log in to see their booking status, download invoices. Currently everything is via email.

---

## 14. Conventions

- Code style: standard SvelteKit + TypeScript + Drizzle conventions.
- Markdown style: never use em-dashes (—). Use commas, parentheses, or rephrase. Applies to all content and all generated communications.
- Languages used in code and comments: English.
- Languages used in content: EN (primary), ES, GL.

---

## 15. Secrets and configuration

All sensitive values in environment variables, never committed. `.env.example` documents the full list:

```
# Database
DATABASE_URL=postgres://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=anceu
R2_PUBLIC_DOMAIN=anceu.com   # or cdn.anceu.com if subdomain approach is used

# Auth
SESSION_SECRET=...           # for signing cookies
MAGIC_LINK_SECRET=...        # for signing magic link tokens

# Site
PUBLIC_SITE_URL=https://anceu.com
ADMIN_NOTIFICATION_EMAIL=hello@anceu.com

# Seed (only used by scripts/seed.ts, not in production)
SEED_ADMIN_EMAILS=agustin@anceu.com,...
```

---

# Feature index for OpenSpec

Generate OpenSpec specs in this order. Each feature is small enough to be specified, implemented, and tested before the next one begins.

## Phase 1 — Foundation

1. **project-scaffold** — Initialize SvelteKit project, Cloudflare Pages deployment, basic layout with header/footer matching current design, `Europe/Madrid` timezone setup, GitHub repo.
2. **db-schema-foundation** — Drizzle schema for: `admin_users`, `sessions`, `rooms`, `pricing_periods`, `pricing_period_rates`, `settings`. Migrations applied. Seed script created.
3. **i18n-routing** — Routing structure for EN (root) / ES (`/es/`) / GL (`/gl/`) with `hreflang` tags and EN fallback for missing translations.
4. **content-loading** — Markdown loader, frontmatter parsing, `<Image>` component wrapping Cloudflare Image Resizing.

## Phase 2 — Content migration

5. **wordpress-scraper** — Script to read `wp-sitemap.xml`, fetch each URL, convert to markdown with frontmatter, download images to R2.
6. **r2-image-serving** — Catch-all SvelteKit route at `/wp-content/uploads/[...path]` serving from R2 transparently with Cloudflare Image Resizing.
7. **translate-script** — Script that calls Claude API to translate EN markdown to ES + GL, output to `content/es/` and `content/gl/`.
8. **static-pages-render** — Render all migrated static pages: `/`, `/the-space/`, `/the-experience/` (with pagination), `/faq/`, `/contact/`, `/book/`, `/galicia-remote-work/`, `/answers/`, `/privacy-policy-2/`.
9. **blog-posts-render** — Render blog posts in root with proper SEO (canonical, hreflang, og:image).

## Phase 3 — Booking schema

10. **db-schema-booking** — Drizzle schema for: `bookings`, `payments`, `blocks`. Indexes for availability queries.

## Phase 4 — Public booking flow

11. **availability-endpoint** — `/api/availability` returns availability for a date range and party size. Considers `confirmed`, `admin_manual`, `blocks`, and closed periods.
12. **booking-wizard-step1** — Date picker (Airbnb-style) with availability indication, party size selector, price calculation showing seasonal breakdown.
13. **booking-wizard-step2** — Guest data form (guest 1 + optional guest 2, community questions, allergies). Validation.
14. **booking-wizard-step3** — Confirmation review + Stripe Setup Intent embedded form. Creates booking in `pending_review` state.
15. **negotiable-bookings** — `allow_requests_without_availability` flag handling: inline warning in step 1, `requires_dates_negotiation` field, highlighted in admin.

## Phase 5 — Admin

16. **admin-auth** — Magic link login flow. Allowlist check against `admin_users` table. Session cookie.
17. **admin-bookings-list** — List view with filters (state, date range, room type, guest name).
18. **admin-bookings-detail** — Detail view: guest info, community answers, payment history, action buttons.
19. **admin-booking-approve** — Approve action: trigger Stripe off-session charge for first 15 nights, transition to `confirmed`, trigger `booking_confirmed` email, auto-reject overlapping `pending_review` bookings.
20. **admin-booking-reject** — Reject action with optional reason, send `booking_rejected` email.
21. **admin-booking-cancel** — Cancel action for confirmed bookings, send `booking_cancelled` email.
22. **admin-booking-manual-create** — Create booking manually from admin (with or without payment).
23. **admin-additional-payment** — Trigger additional Stripe off-session charge with free amount + description from booking detail.
24. **admin-calendar** — Gantt-style calendar, 2 months default, color-coded states, click interactions.
25. **admin-blocks** — Create / edit / delete manual blocks.
26. **admin-pricing** — CRUD for pricing periods and rates. Closed periods supported.
27. **admin-settings** — Edit global settings (discount %, threshold, extra person price, min/max stay, etc.).
28. **admin-room-assignment** — When approving "Any room of type X" requests, admin picks specific room.

## Phase 6 — Emails

29. **email-infrastructure** — Resend setup, React Email base components, language-aware sender, BCC `hello@anceu.com`.
30. **email-request-received** — Triggered on `pending_review` creation. EN/ES/GL.
31. **email-booking-confirmed** — Triggered on `confirmed`. EN/ES/GL. Includes practical info (how to arrive, etc.).
32. **email-booking-rejected** — Manual and overlap variants. EN/ES/GL.
33. **email-booking-cancelled** — Triggered on cancellation. EN/ES/GL.
34. **email-pre-checkin** — Cron job sending 10-day and 2-day reminders. EN/ES/GL.
35. **email-post-checkout** — Cron job sending 1-2 days after check-out. EN/ES/GL.
36. **email-admin-notifications** — New request, payment failed, critical error.

## Phase 7 — GDPR + polish

37. **gdpr-anonymize** — Admin action to anonymize a guest's PII while keeping booking row.
38. **gdpr-export** — Admin action to export a guest's data as JSON.
39. **privacy-policy-update** — Rewrite `/privacy-policy-2/` content for new processors.

## Phase 8 — Launch

40. **production-readiness** — Cloudflare Web Analytics integration, environment variables hardening, error notifications to admin, DNS record verification, Stripe live mode switch, rollback procedure documented in `README.md`.
41. **content-translation-pass** — Final human review pass on all translations for static pages and recent posts.
42. **dns-cutover** — Switch DNS from WordPress to Cloudflare Pages. Active monitoring window.

---

End of spec. To start a feature, point Claude Code at this file and ask: *"Generate the OpenSpec proposal for feature N: [name]"*. Implement, test, ship, repeat.
