-- Keep draft guest email lists private until the event host issues paid invitations.
create table if not exists public.private_event_guest_drafts (
  event_id uuid primary key references public.private_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emails text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.private_event_guest_drafts enable row level security;
revoke all on public.private_event_guest_drafts from public, anon, authenticated;
grant all on public.private_event_guest_drafts to service_role;
create policy private_event_guest_drafts_deny_user_access on public.private_event_guest_drafts
  for all to anon, authenticated using (false) with check (false);
