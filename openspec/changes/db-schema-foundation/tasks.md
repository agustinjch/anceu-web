# Tasks: db-schema-foundation

## T1: Install Drizzle + Neon dependencies

- `bun add drizzle-orm @neondatabase/serverless`
- `bun add -D drizzle-kit dotenv tsx`

## T2: Create drizzle.config.ts

- Configure Drizzle Kit for Neon Postgres
- Schema path: `src/lib/db/schema.ts`
- Output: `drizzle/migrations`
- Driver: `@neondatabase/serverless`

## T3: Create DB client

- `src/lib/db/client.ts`
- Load `DATABASE_URL` from env
- Export initialized Drizzle instance with all schemas

## T4: Create schema

- `src/lib/db/schema.ts`
- All 6 tables as defined in design.md
- Proper types, defaults, constraints, and relations

## T5: Create seed script

- `scripts/seed.ts`
- Idempotent (upsert for rooms, admin users; skip existing for periods)
- 11 rooms
- Initial pricing periods + rates (2026)
- Settings row (with ON CONFLICT for singleton)
- Admin users from `SEED_ADMIN_EMAILS` env var
- Uses `tsx` runner: `bun run scripts/seed.ts`

## T6: Generate and apply migrations

- `bunx drizzle-kit generate`
- `bunx drizzle-kit migrate`
- Verify tables exist in Neon

## T7: Run seed

- `bun run scripts/seed.ts`
- Verify all data inserted correctly