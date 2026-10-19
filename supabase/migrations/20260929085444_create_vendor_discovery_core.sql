-- Core public discovery schema for live vendors and community spots.
begin;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(trim(name)) between 1 and 160),
  description text,
  category text,
  is_live boolean not null default false,
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_locations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null unique references public.vendors(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  is_live boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.community_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  type text not null,
  description text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_by text not null,
  event_date timestamptz,
  is_active boolean not null default true,
  claimed boolean not null default false,
  claimed_by text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_live_idx on public.vendors(is_live);
create index if not exists vendor_locations_live_idx on public.vendor_locations(is_live);
create index if not exists vendor_locations_vendor_idx on public.vendor_locations(vendor_id);

alter table public.vendors enable row level security;
alter table public.vendor_locations enable row level security;
alter table public.community_spots enable row level security;

grant select on public.vendors, public.vendor_locations to anon, authenticated;
grant insert, update, delete on public.vendors, public.vendor_locations to authenticated;

create policy "public can view live vendors" on public.vendors
  for select to anon, authenticated using (is_live = true);
create policy "owners can view their vendors" on public.vendors
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy "owners can create vendors" on public.vendors
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "owners can update vendors" on public.vendors
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "owners can delete vendors" on public.vendors
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "public can view live vendor locations" on public.vendor_locations
  for select to anon, authenticated using (
    is_live = true and exists (select 1 from public.vendors v where v.id = vendor_id and v.is_live = true)
  );
create policy "owners can manage vendor locations" on public.vendor_locations
  for all to authenticated using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );

commit;
