-- Private hosting and vendor-follow notification schema. Never expose private coordinates through public vendor/map APIs.
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
-- Server routes use the service role only after validating the signed-in user, invite, ownership, and entitlement.
revoke all on public.account_entitlements, public.private_events, public.private_event_invites, public.vendor_social_profiles, public.vendor_updates, public.vendor_favorites, public.vendor_reviews, public.user_notifications from anon, authenticated;
grant all on public.account_entitlements, public.private_events, public.private_event_invites, public.vendor_social_profiles, public.vendor_updates, public.vendor_favorites, public.vendor_reviews, public.user_notifications to service_role;
alter table public.account_entitlements enable row level security;
alter table public.private_events enable row level security;
alter table public.private_event_invites enable row level security;
alter table public.vendor_social_profiles enable row level security;
alter table public.vendor_updates enable row level security;
alter table public.vendor_favorites enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.user_notifications enable row level security;
