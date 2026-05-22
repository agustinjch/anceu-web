import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

// ─── Admin users ───────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	role: text('role', { enum: ['owner', 'staff'] }).notNull().default('staff'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
	sessions: many(sessions)
}));

// ─── Sessions ──────────────────────────────────────────────

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	adminUserId: uuid('admin_user_id')
		.notNull()
		.references(() => adminUsers.id),
	token: text('token').notNull().unique(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	adminUser: one(adminUsers, {
		fields: [sessions.adminUserId],
		references: [adminUsers.id]
	})
}));

// ─── Rooms ─────────────────────────────────────────────────

export const rooms = pgTable('rooms', {
	id: text('id').primaryKey(), // '000', '001', ..., '108'
	type: text('type', { enum: ['private', 'luxury'] }).notNull(),
	bedsDescription: text('beds_description').notNull(),
	maxOccupancyAdmin: integer('max_occupancy_admin').notNull(),
	maxOccupancyPublic: integer('max_occupancy_public').notNull()
});

// ─── Pricing periods ───────────────────────────────────────

export const pricingPeriods = pgTable(
	'pricing_periods',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		startDate: date('start_date').notNull(),
		endDate: date('end_date').notNull(),
		status: text('status', { enum: ['open', 'closed'] }).notNull().default('open'),
		notes: text('notes')
	},
	(table) => [sql`CONSTRAINT valid_range CHECK (end_date >= start_date)`]
);

export const pricingPeriodsRelations = relations(pricingPeriods, ({ many }) => ({
	rates: many(pricingPeriodRates)
}));

// ─── Pricing period rates ──────────────────────────────────

export const pricingPeriodRates = pgTable(
	'pricing_period_rates',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		pricingPeriodId: uuid('pricing_period_id')
			.notNull()
			.references(() => pricingPeriods.id),
		roomType: text('room_type', { enum: ['private', 'luxury'] }).notNull(),
		pricePerNightCents: integer('price_per_night_cents').notNull()
	},
	(table) => [unique().on(table.pricingPeriodId, table.roomType)]
);

// Override: add unique constraint properly
export const pricingPeriodRatesRelations = relations(pricingPeriodRates, ({ one }) => ({
	pricingPeriod: one(pricingPeriods, {
		fields: [pricingPeriodRates.pricingPeriodId],
		references: [pricingPeriods.id]
	})
}));

// ─── Settings (singleton) ──────────────────────────────────

export const settings = pgTable(
	'settings',
	{
		id: integer('id').primaryKey().default(1),
		longStayDiscountPercent: integer('long_stay_discount_percent').notNull().default(30),
		longStayThresholdNights: integer('long_stay_threshold_nights').notNull().default(30),
		extraPersonPerNightCents: integer('extra_person_per_night_cents').notNull().default(1500),
		minStayNights: integer('min_stay_nights').notNull().default(15),
		maxStayNights: integer('max_stay_nights').notNull().default(60),
		vatPercent: integer('vat_percent').notNull().default(10),
		allowRequestsWithoutAvailability: boolean('allow_requests_without_availability')
			.notNull()
			.default(true),
		paymentFirstChargeNights: integer('payment_first_charge_nights').notNull().default(15),
		defaultCommunicationLanguage: text('default_communication_language')
			.notNull()
			.default('en')
	},
	(table) => [sql`CONSTRAINT single_row CHECK (id = 1)`]
);