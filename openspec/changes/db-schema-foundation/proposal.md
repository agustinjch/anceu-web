# Proposal: db-schema-foundation

## Summary

Create the foundational database schema using Drizzle ORM on Neon Postgres: tables for admin users, sessions, rooms, pricing periods, pricing period rates, and global settings. Includes migrations and a seed script.

This is feature 2 of 42. Establishes the data layer that all booking and admin features will build on.

## Scope

### In scope

- Drizzle schema definitions for 6 tables: `admin_users`, `sessions`, `rooms`, `pricing_periods`, `pricing_period_rates`, `settings`
- Drizzle Kit configuration for migration generation
- Neon Postgres client connection
- Migration files (generated via `drizzle-kit generate`)
- Seed script (`scripts/seed.ts`) with:
  - 11 rooms (full inventory per spec)
  - Initial pricing periods for 2026 (high/low/closed seasons)
  - Pricing period rates for private and luxury room types
  - Global settings defaults
  - 1+ admin users

### Out of scope

- Booking-related tables (`bookings`, `payments`, `blocks`) — feature 10
- Content-related tables (none — content is markdown files)
- Admin CRUD UI for pricing and settings (features 26-27)
- Any API endpoints

## Risks

- Requires a live Neon Postgres database. If `DATABASE_URL` is not available, migrations cannot be applied and seed cannot run.
- The seed script should be idempotent (safe to re-run). Rooms and admin users should use upsert logic.

## Success criteria

- `drizzle-kit generate` produces migration SQL
- `drizzle-kit migrate` applies migrations to Neon
- `bun run scripts/seed.ts` populates all tables without errors
- Re-running seed does not produce duplicate rows