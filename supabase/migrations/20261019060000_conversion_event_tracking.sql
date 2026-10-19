create table public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'event_package_selected',
    'event_checkout_started',
    'event_package_available',
    'invitation_style_selected',
    'private_event_created',
    'private_invitation_opened'
  )),
  properties jsonb not null default '{}'::jsonb
    check (jsonb_typeof(properties) = 'object' and pg_column_size(properties) <= 2048),
  source_path text not null default '/'
    check (char_length(source_path) <= 200 and source_path like '/%'),
  created_at timestamptz not null default now()
);

create index conversion_events_created_at_idx
  on public.conversion_events (created_at desc);
create index conversion_events_name_created_at_idx
  on public.conversion_events (event_name, created_at desc);

alter table public.conversion_events enable row level security;
revoke all on table public.conversion_events from public, anon, authenticated;
grant insert, select on table public.conversion_events to service_role;
