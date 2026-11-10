-- Letsatsi ClimateShield PostgreSQL starter schema.
-- Run through a migration tool rather than directly in production.

create extension if not exists pgcrypto;

create type user_role as enum ('farmer', 'buyer', 'agricultural_officer', 'admin', 'auditor');
create type record_status as enum ('draft', 'active', 'pending', 'verified', 'archived');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  phone text unique,
  password_hash text not null,
  full_name text not null,
  role user_role not null default 'farmer',
  district text,
  status record_status not null default 'pending',
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table farmer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  farming_location text,
  farming_since smallint,
  farming_history text,
  verification_notes text
);

create table farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  name text not null,
  district text not null,
  village text,
  area_hectares numeric(10,2) not null check (area_hectares > 0),
  latitude numeric(9,6),
  longitude numeric(9,6),
  status record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  name text not null,
  area_hectares numeric(10,2) not null check (area_hectares > 0),
  soil_type text,
  irrigation_type text
);

create table livestock (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  tag_or_group text not null,
  species text not null,
  breed text,
  head_count integer not null default 1 check (head_count > 0),
  health_status text,
  last_vaccination date,
  next_vaccination date,
  feeding_notes text
);

create table soil_tests (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  tested_at date not null,
  ph numeric(3,1) check (ph between 0 and 14),
  nitrogen numeric,
  phosphorus numeric,
  potassium numeric,
  organic_matter_percent numeric,
  recommendation text,
  reviewed_by uuid references users(id)
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text,
  phone text,
  verified boolean not null default false,
  rating numeric(2,1) check (rating between 0 and 5)
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id) on delete cascade,
  supplier_id uuid references suppliers(id),
  name text not null,
  category text not null,
  quantity numeric not null default 0,
  unit text not null,
  reorder_level numeric not null default 0,
  unit_cost_maloti numeric(12,2)
);

create table crop_cycles (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references fields(id) on delete cascade,
  crop text not null,
  seed_variety text,
  planted_at date,
  expected_harvest_at date,
  status record_status not null default 'active'
);

create table harvests (
  id uuid primary key default gen_random_uuid(),
  crop_cycle_id uuid not null references crop_cycles(id),
  harvested_at date not null,
  quantity_kg numeric(12,2) not null check (quantity_kg >= 0),
  quality_grade text,
  storage_location text,
  loss_kg numeric(12,2) not null default 0
);

create table crop_passports (
  id uuid primary key default gen_random_uuid(),
  harvest_id uuid not null references harvests(id),
  batch_code text unique not null,
  qr_payload text not null,
  blockchain_network text,
  transaction_hash text,
  issued_at timestamptz not null default now()
);

create table market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references users(id),
  harvest_id uuid references harvests(id),
  title text not null,
  quantity numeric not null,
  unit text not null,
  unit_price_maloti numeric(12,2) not null,
  status record_status not null default 'active'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id),
  status text not null default 'pending',
  total_maloti numeric(12,2) not null default 0,
  delivery_address text,
  payment_reference text,
  created_at timestamptz not null default now()
);

create table order_items (
  order_id uuid references orders(id) on delete cascade,
  listing_id uuid references market_listings(id),
  quantity numeric not null,
  unit_price_maloti numeric(12,2) not null,
  primary key (order_id, listing_id)
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references users(id),
  farm_id uuid references farms(id),
  category text not null,
  description text,
  amount_maloti numeric(12,2) not null,
  incurred_at date not null
);

create table grants (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  agency text not null,
  deadline date,
  maximum_maloti numeric(12,2),
  eligibility text,
  status record_status not null default 'active'
);

create table grant_applications (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references grants(id),
  farmer_id uuid not null references users(id),
  status text not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table audit_logs (
  id bigserial primary key,
  actor_id uuid references users(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  ip_address inet,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create index farms_owner_idx on farms(owner_id);
create index fields_farm_idx on fields(farm_id);
create index orders_buyer_idx on orders(buyer_id);
create index audit_logs_actor_time_idx on audit_logs(actor_id, occurred_at desc);
