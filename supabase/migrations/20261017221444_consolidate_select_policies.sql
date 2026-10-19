-- Consolidate public and owner SELECT rules while keeping writes owner-only.
begin;

drop policy if exists "owners can view their vendors" on public.vendors;
drop policy if exists "public can view live vendors" on public.vendors;
create policy vendors_public_or_owner_select on public.vendors
  for select to anon, authenticated
  using (is_live = true or owner_id = (select auth.uid()));

drop policy if exists "owners can manage vendor locations" on public.vendor_locations;
drop policy if exists "public can view live vendor locations" on public.vendor_locations;
create policy vendor_locations_public_or_owner_select on public.vendor_locations
  for select to anon, authenticated using (
    (is_live = true and exists (select 1 from public.vendors v where v.id = vendor_id and v.is_live = true))
    or exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_locations_owner_insert on public.vendor_locations
  for insert to authenticated with check (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_locations_owner_update on public.vendor_locations
  for update to authenticated using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );
create policy vendor_locations_owner_delete on public.vendor_locations
  for delete to authenticated using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.owner_id = (select auth.uid()))
  );

commit;
