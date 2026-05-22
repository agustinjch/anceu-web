# Design: db-schema-foundation

## Architecture

```
src/lib/db/
├── client.ts         # Neon connection + Drizzle instance
└── schema.ts         # All table definitions + relations
scripts/
└── seed.ts           # Seed data (rooms, periods, rates, settings, admin users)
drizzle.config.ts     # Drizzle Kit configuration
drizzle/
└── migrations/       # Generated SQL migrations
```

## Schema

### admin_users

```sql
CREATE TABLE admin_users (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);
```

### sessions

```sql
CREATE TABLE sessions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id TEXT NOT NULL REFERENCES admin_users(id),
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### rooms

```sql
CREATE TABLE rooms (
  id                 TEXT PRIMARY KEY,  -- '000', '001', ..., '108'
  type               TEXT NOT NULL CHECK (type IN ('private', 'luxury')),
  beds_description   TEXT NOT NULL,
  max_occupancy_admin INTEGER NOT NULL,
  max_occupancy_public INTEGER NOT NULL
);
```

### pricing_periods

```sql
CREATE TABLE pricing_periods (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes      TEXT,
  CONSTRAINT valid_range CHECK (end_date >= start_date)
);
```

### pricing_period_rates

```sql
CREATE TABLE pricing_period_rates (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_period_id   TEXT NOT NULL REFERENCES pricing_periods(id),
  room_type           TEXT NOT NULL CHECK (room_type IN ('private', 'luxury')),
  price_per_night_cents INTEGER NOT NULL CHECK (price_per_night_cents > 0),
  UNIQUE (pricing_period_id, room_type)
);
```

### settings

Single-row table (singleton pattern):

```sql
CREATE TABLE settings (
  id                              INTEGER PRIMARY KEY DEFAULT 1,
  long_stay_discount_percent      INTEGER NOT NULL DEFAULT 30,
  long_stay_threshold_nights      INTEGER NOT NULL DEFAULT 30,
  extra_person_per_night_cents    INTEGER NOT NULL DEFAULT 1500,
  min_stay_nights                 INTEGER NOT NULL DEFAULT 15,
  max_stay_nights                 INTEGER NOT NULL DEFAULT 60,
  vat_percent                     INTEGER NOT NULL DEFAULT 10,
  allow_requests_without_availability BOOLEAN NOT NULL DEFAULT true,
  payment_first_charge_nights     INTEGER NOT NULL DEFAULT 15,
  default_communication_language  TEXT NOT NULL DEFAULT 'en',
  CONSTRAINT single_row CHECK (id = 1)
);
```

## Relationships

```
admin_users ──1:N──> sessions
pricing_periods ──1:N──> pricing_period_rates
```

Rooms and settings are standalone (no FK relations to other tables in this feature).

## Seed data

### Rooms (11 total)

| id  | type    | beds                               | admin_max | public_max |
|-----|---------|-------------------------------------|-----------|------------|
| 000 | private | 1x double                          | 2         | 2          |
| 001 | private | 1x double + 1x single (90cm)       | 3         | 2          |
| 002 | luxury  | 1x double + 2x single (90cm)       | 4         | 2          |
| 101 | private | 1x double                          | 2         | 2          |
| 102 | private | 1x double + 1x single              | 3         | 2          |
| 103 | private | 1x double + 1x single              | 3         | 2          |
| 104 | luxury  | 1x double + 2x single              | 4         | 2          |
| 105 | private | 1x double                          | 2         | 2          |
| 106 | private | 1x double                          | 2         | 2          |
| 107 | private | 1x double                          | 2         | 2          |
| 108 | private | 2x single                          | 2         | 2          |

### Pricing periods (example for 2026)

- Low season Jan-Mar (open)
- High season Apr-Jun (open)
- High season Jul-Aug (open)
- Low season Sep-Oct (open)
- Closed season Nov-Dec-Feb 2027 (closed)

### Pricing period rates

Per period + room type:
- Private: ~9000 cents/night low, ~12000 high
- Luxury: ~12000 cents/night low, ~16000 high

### Settings

All defaults from the spec (see schema defaults above).

### Admin users

Read from `SEED_ADMIN_EMAILS` env var (comma-separated list). Create with role 'owner'. If no env var, create a placeholder admin. The script is idempotent (skips existing emails).