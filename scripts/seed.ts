import 'dotenv/config';
import { db } from '../src/lib/db/client';
import { adminUsers, pricingPeriodRates, pricingPeriods, rooms, settings } from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';

// ─── Seed rooms ───────────────────────────────────────────

const roomData = [
	{ id: '000', type: 'private' as const, beds: '1× double', adminMax: 2, publicMax: 2 },
	{ id: '001', type: 'private' as const, beds: '1× double + 1× single (90cm)', adminMax: 3, publicMax: 2 },
	{ id: '002', type: 'luxury' as const, beds: '1× double + 2× single (90cm)', adminMax: 4, publicMax: 2 },
	{ id: '101', type: 'private' as const, beds: '1× double', adminMax: 2, publicMax: 2 },
	{ id: '102', type: 'private' as const, beds: '1× double + 1× single', adminMax: 3, publicMax: 2 },
	{ id: '103', type: 'private' as const, beds: '1× double + 1× single', adminMax: 3, publicMax: 2 },
	{ id: '104', type: 'luxury' as const, beds: '1× double + 2× single', adminMax: 4, publicMax: 2 },
	{ id: '105', type: 'private' as const, beds: '1× double', adminMax: 2, publicMax: 2 },
	{ id: '106', type: 'private' as const, beds: '1× double', adminMax: 2, publicMax: 2 },
	{ id: '107', type: 'private' as const, beds: '1× double', adminMax: 2, publicMax: 2 },
	{ id: '108', type: 'private' as const, beds: '2× single', adminMax: 2, publicMax: 2 }
];

async function seedRooms() {
	for (const r of roomData) {
		await db
			.insert(rooms)
			.values({
				id: r.id,
				type: r.type,
				bedsDescription: r.beds,
				maxOccupancyAdmin: r.adminMax,
				maxOccupancyPublic: r.publicMax
			})
			.onConflictDoNothing();
	}
	console.log(`Seeded ${roomData.length} rooms`);
}

// ─── Seed pricing periods ─────────────────────────────────

const periodData = [
	{
		name: 'Low season Jan-Mar 2026',
		startDate: '2026-01-01',
		endDate: '2026-03-31',
		status: 'open' as const,
		rates: { private: 9000, luxury: 12000 }
	},
	{
		name: 'High season Apr-Jun 2026',
		startDate: '2026-04-01',
		endDate: '2026-06-30',
		status: 'open' as const,
		rates: { private: 12000, luxury: 16000 }
	},
	{
		name: 'High season Jul-Aug 2026',
		startDate: '2026-07-01',
		endDate: '2026-08-31',
		status: 'open' as const,
		rates: { private: 14000, luxury: 18000 }
	},
	{
		name: 'Low season Sep-Oct 2026',
		startDate: '2026-09-01',
		endDate: '2026-10-31',
		status: 'open' as const,
		rates: { private: 9000, luxury: 12000 }
	},
	{
		name: 'Closed Nov 2026 - Feb 2027',
		startDate: '2026-11-01',
		endDate: '2027-02-28',
		status: 'closed' as const,
		rates: { private: 0, luxury: 0 }
	}
];

async function seedPricingPeriods() {
	for (const p of periodData) {
		const existing = await db
			.select()
			.from(pricingPeriods)
			.where(sql`${pricingPeriods.name} = ${p.name}`)
			.limit(1);

		if (existing.length > 0) continue;

		const period = await db
			.insert(pricingPeriods)
			.values({
				name: p.name,
				startDate: p.startDate,
				endDate: p.endDate,
				status: p.status
			})
			.returning({ id: pricingPeriods.id });

		const periodId = period[0].id;

		await db.insert(pricingPeriodRates).values([
			{
				pricingPeriodId: periodId,
				roomType: 'private',
				pricePerNightCents: p.rates.private
			},
			{
				pricingPeriodId: periodId,
				roomType: 'luxury',
				pricePerNightCents: p.rates.luxury
			}
		]);
	}
	console.log(`Seeded ${periodData.length} pricing periods`);
}

// ─── Seed settings ────────────────────────────────────────

async function seedSettings() {
	await db
		.insert(settings)
		.values({
			id: 1,
			longStayDiscountPercent: 30,
			longStayThresholdNights: 30,
			extraPersonPerNightCents: 1500,
			minStayNights: 15,
			maxStayNights: 60,
			vatPercent: 10,
			allowRequestsWithoutAvailability: true,
			paymentFirstChargeNights: 15,
			defaultCommunicationLanguage: 'en'
		})
		.onConflictDoNothing();
	console.log('Seeded settings');
}

// ─── Seed admin users ─────────────────────────────────────

async function seedAdminUsers() {
	const emails = (process.env.SEED_ADMIN_EMAILS || 'agustin@anceu.com')
		.split(',')
		.map((e) => e.trim())
		.filter(Boolean);

	for (const email of emails) {
		await db
			.insert(adminUsers)
			.values({
				email,
				name: email.split('@')[0],
				role: 'owner'
			})
			.onConflictDoNothing();
	}
	console.log(`Seeded ${emails.length} admin user(s)`);
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
	console.log('Seeding database...\n');

	await seedRooms();
	await seedPricingPeriods();
	await seedSettings();
	await seedAdminUsers();

	console.log('\nDone.');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});