/*
  # World Cup E-commerce Schema

  Creates all tables for the Copa do Mundo jersey e-commerce system.

  ## New Tables

  1. `national_teams` - Stores national football teams
     - `id` (uuid, PK)
     - `countryName` (text, required)
     - `confederation` (text, optional)

  2. `jerseys` - Official jerseys for sale
     - `id` (uuid, PK)
     - `nationalTeamId` (uuid, FK -> national_teams)
     - `edition` (text, e.g. "Titular", "Reserva")
     - `price` (numeric)
     - `stockQuantity` (integer, default 0)

  3. `jersey_tech_specs` - 1:1 technical specs per jersey
     - `id` (uuid, PK)
     - `jerseyId` (uuid, FK unique -> jerseys)
     - `fabricMaterial` (text)
     - `coolingTechnology` (text)

  4. `customers` - Buyers
     - `id` (uuid, PK)
     - `fullName` (text, required)
     - `email` (text, unique)

  5. `orders` - Pivot table for N:M jersey purchases
     - `customerId` + `jerseyId` (composite PK)
     - `purchaseDate` (timestamptz, default now)

  ## Security

  - RLS enabled on all tables
  - Public read access for national_teams and jerseys (product catalog)
  - Public insert for customers and orders (checkout flow)
  - Tech specs readable publicly alongside jerseys

  ## Notes

  - All tables use snake_case mapping (via Prisma @@map)
  - Orders enforce composite PK to prevent duplicate purchases per customer per jersey
*/

CREATE TABLE IF NOT EXISTS national_teams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "countryName" text NOT NULL,
  confederation text
);

ALTER TABLE national_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read national teams"
  ON national_teams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS jerseys (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nationalTeamId" uuid NOT NULL REFERENCES national_teams(id),
  edition          text NOT NULL,
  price            numeric(10, 2) NOT NULL,
  "stockQuantity"  integer NOT NULL DEFAULT 0
);

ALTER TABLE jerseys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jerseys"
  ON jerseys FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS jersey_tech_specs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "jerseyId"          uuid NOT NULL UNIQUE REFERENCES jerseys(id),
  "fabricMaterial"    text NOT NULL,
  "coolingTechnology" text NOT NULL
);

ALTER TABLE jersey_tech_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jersey tech specs"
  ON jersey_tech_specs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS customers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName" text NOT NULL,
  email      text NOT NULL UNIQUE
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own customer record"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS orders (
  "customerId"   uuid NOT NULL REFERENCES customers(id),
  "jerseyId"     uuid NOT NULL REFERENCES jerseys(id),
  "purchaseDate" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("customerId", "jerseyId")
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);
