-- Add verified OpenStreetMap fixed-location points as claimable business candidates.
-- These records remain unpublished and unowned until the real owner completes StreetSpot's claim review.
begin;

with seed_data(seed_id, name, description, category, latitude, longitude) as (
  values
    ('seed-fixed-drip-coffee', 'Drip Coffee', 'Coffee shop · 729 Saluda Ave, Columbia, SC 29205 · Fixed-location candidate. Owner must verify details and claim before publishing.', 'local_business', 33.9992267::double precision, -81.0173688::double precision),
    ('seed-fixed-curiosity-coffee', 'Curiosity Coffee Bar', 'Cafe, bakery, coffee shop · 2327 Main St, Columbia, SC 29201 · Fixed-location candidate. Owner must verify details and claim before publishing.', 'local_business', 34.0168063::double precision, -81.0407018::double precision),
    ('seed-fixed-azalea-coffee', 'Azalea Coffee Bar', 'Coffee shop · 2700 Devine St, Columbia, SC 29205 · Fixed-location candidate. Owner must verify details and claim before publishing.', 'local_business', 33.9979999::double precision, -81.0053721::double precision),
    ('seed-fixed-farmers-market-xchange', 'Farmers Market Xchange Bakehouse & Cafe', 'Market, bakery, cafe · 1237 Washington St, Columbia, SC 29201 · Fixed-location candidate. Owner must verify details and claim before publishing.', 'local_business', 34.0044915::double precision, -81.0337115::double precision)
),
upserted as (
  insert into public.vendors (seed_id, name, description, category, is_live, is_premium, closing_time)
  select seed_id, name, description, category, false, false, '22:00'
  from seed_data
  on conflict (seed_id) do update
    set name = excluded.name,
        description = excluded.description,
        category = excluded.category
  returning id, seed_id
)
insert into public.vendor_locations (vendor_id, latitude, longitude, is_live)
select u.id, d.latitude, d.longitude, false
from upserted u
join seed_data d using (seed_id)
where not exists (
  select 1 from public.vendor_locations vl where vl.vendor_id = u.id
);

commit;
