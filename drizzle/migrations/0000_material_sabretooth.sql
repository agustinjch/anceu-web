CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pricing_period_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pricing_period_id" uuid NOT NULL,
	"room_type" text NOT NULL,
	"price_per_night_cents" integer NOT NULL,
	CONSTRAINT "pricing_period_rates_pricing_period_id_room_type_unique" UNIQUE("pricing_period_id","room_type")
);
--> statement-breakpoint
CREATE TABLE "pricing_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"beds_description" text NOT NULL,
	"max_occupancy_admin" integer NOT NULL,
	"max_occupancy_public" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"long_stay_discount_percent" integer DEFAULT 30 NOT NULL,
	"long_stay_threshold_nights" integer DEFAULT 30 NOT NULL,
	"extra_person_per_night_cents" integer DEFAULT 1500 NOT NULL,
	"min_stay_nights" integer DEFAULT 15 NOT NULL,
	"max_stay_nights" integer DEFAULT 60 NOT NULL,
	"vat_percent" integer DEFAULT 10 NOT NULL,
	"allow_requests_without_availability" boolean DEFAULT true NOT NULL,
	"payment_first_charge_nights" integer DEFAULT 15 NOT NULL,
	"default_communication_language" text DEFAULT 'en' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pricing_period_rates" ADD CONSTRAINT "pricing_period_rates_pricing_period_id_pricing_periods_id_fk" FOREIGN KEY ("pricing_period_id") REFERENCES "public"."pricing_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;