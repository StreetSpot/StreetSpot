-- Private hosting and vendor-follow notification schema. Private coordinates never enter public map queries.
begin;

create table if not exists public.account_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  status text not null check (status in ('active','inactive','past_due','canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, feature)
);

create table if not exists public.private_events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  event_type text not null check (event_type in ('Wedding','Graduation','Birthday','Baby Shower','Anniversary','Family Gathering','Private Party','Other')),
  host_name text not null default '' check (char_length(host_name) <= 100),
  starts_at timestamptz not null,
  venue_label text not null check (char_length(venue_label) between 1 and 200),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  invitation_style text not null default 'celebration' check (invitation_style in ('elegant','celebration','street')),
  invitation_message text not null default '' check (char_length(invitation_message) <= 1000),
  status text not null default 'draft' check (status in ('draft','published','canceled')),
  is_private boolean not null default true check (is_private = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.private_event_invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.private_events(id) on delete cascade,
  invited_email text not null,
  invited_user_id uuid references auth.users(id) on delete set null,
  token_hash text not null unique,
  status text not null default 'invited' check (status in ('invited','accepted','declined','revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (event_id, invited_email)
);

create table if not exists public.vendor_social_profiles (
  vendor_id uuid primary key references public.vendors(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  website_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_updates (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  update_type text not null check (update_type in ('location','specialty','deal','event','status')),
  headline text not null check (char_length(headline) between 1 and 120),
  body text not null default '' check (char_length(body) <= 2000),
  deal_text text check (char_length(deal_text) <= 300),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vendor_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vendor_id)
);

create table if not exists public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1500),
  created_at timestamptz not null default now(),
  unique (user_id, vendor_id)
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  update_id uuid references public.vendor_updates(id) on delete cascade,
  notification_type text not null check (notification_type in ('vendor_update','event_invitation','system')),
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, update_id)
);

create index if not exists private_events_host_created_idx on public.private_events(host_id, created_at desc);
create index if not exists private_event_invites_email_idx on public.private_event_invites(lower(invited_email), status, expires_at);
create index if not exists vendor_updates_published_idx on public.vendor_updates(vendor_id, published_at desc) where published_at is not null;
create index if not exists user_notifications_user_idx on public.user_notifications(user_id, created_at desc);

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_private_event_host(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.private_events e
    where e.id = target_event_id and e.host_id = (select auth.uid())
  );
$$;

create or replace function private.can_view_private_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_private_event_host(target_event_id)
    or exists (
      select 1
      from public.private_event_invites i
      where i.event_id = target_event_id
        and i.status in ('invited','accepted')
        and i.expires_at > now()
        and (
          i.invited_user_id = (select auth.uid())
          or lower(i.invited_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
        )
    );
$$;

revoke all on function private.is_private_event_host(uuid) from public, anon;
revoke all on function private.can_view_private_event(uuid) from public, anon;
grant execute on function private.is_private_event_host(uuid) to authenticated;
grant execute on function private.can_view_private_event(uuid) to authenticated;

alter table public.account_entitlements enable row level security;
alter table public.private_events enable row level security;
alter table public.private_event_invites enable row level security;
alter table public.vendor_social_profiles enable row level security;
alter table public.vendor_updates enable row level security;
alter table public.vendor_favorites enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.user_notifications enable row level security;

revoke all on public.account_entitlements, public.private_events, public.private_event_invites, public.vendor_social_profiles, public.vendor_updates, public.vendor_favorites, public.vendor_reviews, public.user_notifications from anon, authenticated;
grant select on public.account_entitlements to authenticated;
grant select, insert, update, delete on public.private_events, public.private_event_invites, public.vendor_social_profiles, public.vendor_updates, public.vendor_favorites, public.vendor_reviews to authenticated;
grant select on public.user_notifications to authenticated;
grant update (read_at) on public.user_notifications to authenticated;
grant select on public.vendor_social_profiles, public.vendor_updates, public.vendor_reviews to anon;
grant all on public.account_entitlements, public.private_events, public.private_event_invites, public.vendor_social_profiles, public.vendor_updates, public.vendor_favorites, public.vendor_reviews, public.user_notifications to service_role;

create policy account_entitlements_owner_select on public.account_entitlements
  for select to authenticated using (user_id = (select auth.uid()));

create policy private_events_host_or_invitee_select on public.private_events
  for select to authenticated using (private.can_view_private_event(id));
create policy private_events_host_insert on public.private_events
  for insert to authenticated with check (host_id = (select auth.uid()));
create policy private_events_host_update on public.private_events
  for update to authenticated using (host_id = (select auth.uid())) with check (host_id = (select auth.uid()));
create policy private_events_host_delete on public.private_events
  for delete to authenticated using (host_id = (select auth.uid()));

create policy private_event_invites_host_or_invitee_select on public.private_event_invites
  for select to authenticated using (
    private.is_private_event_host(event_id)
    or invited_user_id = (select auth.uid())
    or lower(invited_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );
create policy private_event_invites_host_insert on public.private_event_invites
  for insert to authenticated with check (private.is_private_event_host(event_id));
create policy private_event_invites_host_update on public.private_event_invites
  for update to authenticated using (private.is_private_event_host(event_id)) with check (private.is_private_event_host(event_id));
create policy private_event_invites_host_delete on public.private_event_invites
  for delete to authenticated using (private.is_private_event_host(event_id));

create policy vendor_social_profiles_public_or_owner_select on public.vendor_social_profiles
  for select to anon, authenticated using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.is_live)
    or owner_id = (select auth.uid())
  );
create policy vendor_social_profiles_owner_insert on public.vendor_social_profiles
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_social_profiles_owner_update on public.vendor_social_profiles
  for update to authenticated using (owner_id = (select auth.uid())) with check (
    owner_id = (select auth.uid()) and exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_social_profiles_owner_delete on public.vendor_social_profiles
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy vendor_updates_public_or_owner_select on public.vendor_updates
  for select to anon, authenticated using (
    (published_at is not null and exists (select 1 from public.vendors v where v.id = vendor_id and v.is_live))
    or owner_id = (select auth.uid())
  );
create policy vendor_updates_owner_insert on public.vendor_updates
  for insert to authenticated with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_updates_owner_update on public.vendor_updates
  for update to authenticated using (owner_id = (select auth.uid())) with check (
    owner_id = (select auth.uid()) and exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_updates_owner_delete on public.vendor_updates
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy vendor_favorites_owner_select on public.vendor_favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy vendor_favorites_owner_insert on public.vendor_favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy vendor_favorites_owner_delete on public.vendor_favorites
  for delete to authenticated using (user_id = (select auth.uid()));

create policy vendor_reviews_public_select on public.vendor_reviews
  for select to anon, authenticated using (true);
create policy vendor_reviews_owner_insert on public.vendor_reviews
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy vendor_reviews_owner_update on public.vendor_reviews
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy vendor_reviews_owner_delete on public.vendor_reviews
  for delete to authenticated using (user_id = (select auth.uid()));

create policy user_notifications_owner_select on public.user_notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_notifications_owner_read_update on public.user_notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

commit;
