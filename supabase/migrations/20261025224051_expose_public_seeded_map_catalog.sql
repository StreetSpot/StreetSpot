create or replace function public.get_public_seeded_vendor_catalog(p_seed_ids text[])
returns table (
  seed_id text,
  vendor_id uuid,
  name text,
  description text,
  category text,
  claim_status text,
  latitude double precision,
  longitude double precision
)
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select
    v.seed_id,
    v.id,
    v.name,
    coalesce(v.description, ''),
    coalesce(v.category, 'vendor'),
    case
      when v.owner_id is not null
        or exists (
          select 1 from public.vendor_claims vc
          where vc.vendor_id = v.id and vc.status = 'approved'
        ) then 'CLAIMED'
      when exists (
        select 1 from public.vendor_claims vc
        where vc.vendor_id = v.id and vc.status = 'pending'
      ) then 'PENDING_VERIFICATION'
      else 'UNCLAIMED'
    end,
    location.latitude,
    location.longitude
  from public.vendors v
  left join lateral (
    select vl.latitude, vl.longitude
    from public.vendor_locations vl
    where vl.vendor_id = v.id
    order by vl.updated_at desc
    limit 1
  ) location on true
  where v.seed_id = any(coalesce(p_seed_ids, array[]::text[]))
    and v.seed_id like 'seed-%'
    and cardinality(coalesce(p_seed_ids, array[]::text[])) <= 100;
$function$;

revoke all on function public.get_public_seeded_vendor_catalog(text[]) from public;
grant execute on function public.get_public_seeded_vendor_catalog(text[]) to anon, authenticated;
