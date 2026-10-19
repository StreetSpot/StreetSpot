-- Core StreetSpot tables. Public map data is separated from account-owned and private data.
begin;

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
create index if not exists community_spots_active_created_idx on public.community_spots(is_active, created_at desc);
alter table public.community_spots enable row level security;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  category text not null default 'vendor',
  is_live boolean not null default false,
  closing_time text not null default '22:00' check (closing_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_locations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  is_live boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vendors_live_created_idx on public.vendors(is_live, created_at desc);
create index if not exists vendor_locations_vendor_live_idx on public.vendor_locations(vendor_id, is_live);
create index if not exists vendor_locations_coords_idx on public.vendor_locations(latitude, longitude) where is_live;

create table if not exists public.vendor_claims (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text check (char_length(note) <= 2000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists vendor_claims_one_open_claim_idx
  on public.vendor_claims(vendor_id, claimant_id) where status in ('pending','approved');
create index if not exists vendor_claims_claimant_idx on public.vendor_claims(claimant_id, created_at desc);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  check (cardinality(participant_ids) between 2 and 20)
);
create index if not exists conversations_participants_idx on public.conversations using gin(participant_ids);
create index if not exists conversations_recent_idx on public.conversations(last_message_at desc nulls last);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists messages_recipient_unread_idx on public.messages(recipient_id, created_at desc) where read_at is null;

alter table public.vendors enable row level security;
alter table public.vendor_locations enable row level security;
alter table public.vendor_claims enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on public.vendors, public.vendor_locations, public.vendor_claims, public.conversations, public.messages from anon, authenticated;
grant select on public.vendors, public.vendor_locations to anon, authenticated;
grant insert, update on public.vendors to authenticated;
grant insert, update, delete on public.vendor_locations to authenticated;
grant select, insert, update on public.vendor_claims to authenticated;
grant select, insert on public.conversations to authenticated;
grant update (updated_at, last_message_at) on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;
grant all on public.vendors, public.vendor_locations, public.vendor_claims, public.conversations, public.messages to service_role;

create policy vendors_public_or_owner_select on public.vendors
  for select to anon, authenticated
  using (is_live or owner_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff'));
create policy vendors_owner_insert on public.vendors
  for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy vendors_owner_update on public.vendors
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy vendor_locations_public_or_owner_select on public.vendor_locations
  for select to anon, authenticated
  using (
    (is_live and exists (select 1 from public.vendors v where v.id = vendor_id and v.is_live))
    or exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
    or (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff')
  );
create policy vendor_locations_owner_insert on public.vendor_locations
  for insert to authenticated
  with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())));
create policy vendor_locations_owner_update on public.vendor_locations
  for update to authenticated
  using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())));
create policy vendor_locations_owner_delete on public.vendor_locations
  for delete to authenticated
  using (exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid())));

create policy vendor_claims_owner_or_staff_select on public.vendor_claims
  for select to authenticated
  using (claimant_id = (select auth.uid()) or (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff'));
create policy vendor_claims_self_insert on public.vendor_claims
  for insert to authenticated
  with check (claimant_id = (select auth.uid()) and status = 'pending');
create policy vendor_claims_staff_update on public.vendor_claims
  for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff'));

create policy conversations_participant_select on public.conversations
  for select to authenticated
  using ((select auth.uid()) = any(participant_ids));
create policy conversations_participant_insert on public.conversations
  for insert to authenticated
  with check ((select auth.uid()) = any(participant_ids));
create policy conversations_participant_update on public.conversations
  for update to authenticated
  using ((select auth.uid()) = any(participant_ids))
  with check ((select auth.uid()) = any(participant_ids));

create policy messages_participant_select on public.messages
  for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy messages_sender_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (select auth.uid()) = any(c.participant_ids)
        and recipient_id = any(c.participant_ids)
    )
  );
create policy messages_recipient_read_update on public.messages
  for update to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

commit;
