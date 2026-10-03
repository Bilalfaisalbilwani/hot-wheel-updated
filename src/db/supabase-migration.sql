-- ==============================================================================
-- ZONE TOURISM LLC & HOTWHEELS CAR RENTAL LLC
-- SUPABASE POSTGRESQL INITIAL SCHEMA & SEED SCRIPT
-- ==============================================================================

-- 1. Bank Accounts Table (Payment details for Zone Tourism & Hotwheels)
CREATE TABLE IF NOT EXISTS "bank_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"company_account_name" text DEFAULT '' NOT NULL,
	"bank_name" text DEFAULT '' NOT NULL,
	"account_number" text DEFAULT '' NOT NULL,
	"iban" text DEFAULT '' NOT NULL,
	"swift_code" text DEFAULT '' NOT NULL,
	"currency" text DEFAULT 'AED' NOT NULL,
	"branch_name" text DEFAULT '' NOT NULL,
	"country" text DEFAULT 'United Arab Emirates' NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- 2. Fleet & Rental Cars Table
CREATE TABLE IF NOT EXISTS "cars" (
	"id" text PRIMARY KEY NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"color" text DEFAULT '',
	"year" integer DEFAULT 2021,
	"category" text NOT NULL,
	"body_type" text DEFAULT '',
	"service_type" text DEFAULT 'Self Drive' NOT NULL,
	"seats" integer DEFAULT 5 NOT NULL,
	"luggage" text DEFAULT '2 Bags' NOT NULL,
	"horsepower" text DEFAULT '',
	"engine" text DEFAULT '',
	"engine_capacity" text DEFAULT '',
	"length" text DEFAULT '',
	"width" text DEFAULT '',
	"height" text DEFAULT '',
	"rental_period" text DEFAULT 'Monthly',
	"daily_price_aed" integer DEFAULT 0 NOT NULL,
	"daily_price_usd" integer DEFAULT 0 NOT NULL,
	"weekly_price_aed" integer DEFAULT 0 NOT NULL,
	"weekly_price_usd" integer DEFAULT 0 NOT NULL,
	"monthly_price_aed" integer DEFAULT 0 NOT NULL,
	"monthly_price_usd" integer DEFAULT 0 NOT NULL,
	"yearly_price_aed" integer DEFAULT 0 NOT NULL,
	"yearly_price_usd" integer DEFAULT 0 NOT NULL,
	"image" text DEFAULT '',
	"gallery" text DEFAULT '[]' NOT NULL,
	"video_url" text DEFAULT '',
	"description" text DEFAULT '' NOT NULL,
	"get_quote_option" boolean DEFAULT false NOT NULL,
	"is_mercedes_chauffeur" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- 3. Unified Enquiries Table (Visa Applications & Car Rental Leads)
CREATE TABLE IF NOT EXISTS "enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_id" text DEFAULT '',
	"enquiry_type" text NOT NULL, -- 'visa' | 'car-rental' | 'chauffeur' | 'contact'
	"name" text DEFAULT '' NOT NULL,
	"nationality" text DEFAULT '',
	"is_uae_resident" text DEFAULT '', -- 'Yes' | 'No'
	"destination" text DEFAULT '',
	"travel_date" text DEFAULT '',
	"whatsapp_number" text DEFAULT '' NOT NULL,
	"pickup_location" text DEFAULT '',
	"pickup_date" text DEFAULT '',
	"return_date" text DEFAULT '',
	"service_type" text DEFAULT '', -- 'Self Drive' | 'Chauffeur'
	"vehicle_type" text DEFAULT '',
	"status" text DEFAULT 'New' NOT NULL, -- 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Cancelled'
	"notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- ==============================================================================
-- INITIAL PRODUCTION SEED DATA (Company Bank Accounts & Fleet Cars)
-- ==============================================================================

INSERT INTO "bank_accounts" ("id", "company_account_name", "bank_name", "account_number", "iban", "swift_code", "currency", "branch_name", "country", "instructions")
VALUES 
('primary', 'ZONE TOURISM LLC', 'Emirates NBD', '1014347702901', 'AE790260001014347702901', '', 'AED', 'Dubai Branch', 'United Arab Emirates', 'For UAE Visit Visa services and general tourism packages.'),
('secondary', 'HOTWHEELS CAR RENTALS', 'Habib Bank AG Zurich', '02-02-08-020311-105-0573857', 'AE030290890210500573857', 'HBZUAEADXXX', 'AED', 'Sharjah Branch', 'United Arab Emirates', 'For Car Rental, VIP Chauffeur services, and corporate fleet bookings.')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "cars" ("id", "make", "model", "color", "year", "category", "body_type", "service_type", "seats", "luggage", "horsepower", "engine", "engine_capacity", "length", "width", "height", "rental_period", "daily_price_aed", "daily_price_usd", "weekly_price_aed", "weekly_price_usd", "monthly_price_aed", "monthly_price_usd", "yearly_price_aed", "yearly_price_usd", "image", "description", "get_quote_option", "is_mercedes_chauffeur", "is_active")
VALUES
('car-kia-forte-white', 'Kia', 'KIA FORTE', 'WHITE', 2021, 'Sedan', 'Sedan', 'Self Drive', 5, '2 Bags', '147 HP', '2.0L 4 Cylinder', '1,999 cc', '182.7 in', '70.9 in', '56.5 in', 'Monthly', 59, 16, 399, 109, 1499, 408, 14990, 4080, '', 'KIA FORTE 2021 (WHITE) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 182.7 in, Width: 70.9 in, Height: 56.5 in. Sedan.', false, false, true),
('car-kia-soul-gray', 'Kia', 'KIA SOUL', 'GRAY', 2021, 'SUV', 'Compact SUV', 'Self Drive', 5, '3 Bags', '147 HP', '2.0L 4 Cylinder', '1,999 cc', '165.2 in', '70.9 in', '63.0 in', 'Monthly', 49, 13, 339, 92, 1349, 368, 13490, 3680, '', 'KIA SOUL 2021 (GRAY) - 2.0L 4 Cylinder, 147 HP, 1,999 cc, 5 Persons. Length: 165.2 in, Width: 70.9 in, Height: 63.0 in. Compact SUV.', false, false, true),
('car-mirage-red', 'Mitsubishi', 'MIRAGE', 'RED', 2021, 'Sedan', 'Hatchback', 'Self Drive', 5, '2 Bags', '78 HP', '1.2L 3 Cylinder', '1,193 cc', '149.4 in', '65.0 in', '59.4 in', 'Monthly', 39, 11, 249, 68, 999, 272, 9990, 2720, '', 'MIRAGE 2021 (RED) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.', false, false, true),
('car-mirage-black', 'Mitsubishi', 'MIRAGE', 'BLACK', 2021, 'Sedan', 'Hatchback', 'Self Drive', 5, '2 Bags', '78 HP', '1.2L 3 Cylinder', '1,193 cc', '149.4 in', '65.0 in', '59.4 in', 'Monthly', 39, 11, 249, 68, 999, 272, 9990, 2720, '', 'MIRAGE 2021 (BLACK) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.', false, false, true),
('car-mirage-burgundy', 'Mitsubishi', 'MIRAGE', 'BURGUNDY', 2021, 'Sedan', 'Hatchback', 'Self Drive', 5, '2 Bags', '78 HP', '1.2L 3 Cylinder', '1,193 cc', '149.4 in', '65.0 in', '59.4 in', 'Monthly', 39, 11, 249, 68, 999, 272, 9990, 2720, '', 'MIRAGE 2021 (BURGUNDY) - 1.2L 3 Cylinder, 78 HP, 1,193 cc, 5 Persons. Length: 149.4 in, Width: 65.0 in, Height: 59.4 in. Hatchback.', false, false, true)
ON CONFLICT ("id") DO NOTHING;

-- Safe migration for existing databases:
ALTER TABLE "cars" ADD COLUMN IF NOT EXISTS "gallery" text DEFAULT '[]' NOT NULL;
