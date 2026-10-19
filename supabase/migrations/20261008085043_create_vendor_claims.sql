-- Vendor claim requests. Ownership changes require a separate verified admin workflow.
begin;
create table if not exists public.vendor_claims (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text check (char_length(note) <= 2000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists vendor_claims_one_active_per_user
  on public.vendor_claims(vendor_id, claimant_id) where status in ('pending','approved');
create index if not exists vendor_claims_claimant_idx on public.vendor_claims(claimant_id, created_at desc);
alter table public.vendor_claims enable row level security;
grant select, insert, update on public.vendor_claims to authenticated;
commit;
