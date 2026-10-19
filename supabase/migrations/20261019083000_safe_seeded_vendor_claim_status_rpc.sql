create or replace function public.get_seeded_vendor_claim_status(p_seed_ids text[])
returns table (seed_id text, claim_status text)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select v.seed_id,
         case
           when v.owner_id is not null then 'CLAIMED'
           when exists (
             select 1 from public.vendor_claims c
             where c.vendor_id = v.id and c.status = 'pending'
           ) then 'PENDING_VERIFICATION'
           else 'UNCLAIMED'
         end as claim_status
  from public.vendors v
  where v.seed_id = any(coalesce(p_seed_ids, array[]::text[]))
    and cardinality(coalesce(p_seed_ids, array[]::text[])) <= 300;
$$;
revoke all on function public.get_seeded_vendor_claim_status(text[]) from public;
grant execute on function public.get_seeded_vendor_claim_status(text[]) to anon, authenticated, service_role;
comment on function public.get_seeded_vendor_claim_status(text[]) is 'Returns only claim status for supplied seed IDs; does not expose owner IDs or claimant data.';
