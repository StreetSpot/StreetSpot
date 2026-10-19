-- Remove public write access to community spots; keep discovery public and writes owner-bound.
begin;
drop policy if exists "Allow public insert and update access" on public.community_spots;
drop policy if exists "Allow public read access" on public.community_spots;
revoke all on public.community_spots from anon, authenticated;
grant select (id, name, type, description, latitude, longitude, event_date, is_active, created_at, updated_at)
  on public.community_spots to anon, authenticated;
grant insert (name, type, description, latitude, longitude, created_by, event_date, is_active)
  on public.community_spots to authenticated;
grant update (name, description, latitude, longitude, event_date, is_active, updated_at)
  on public.community_spots to authenticated;
create policy community_spots_public_active_read on public.community_spots
  for select to anon, authenticated using (is_active = true);
create policy community_spots_authenticated_insert on public.community_spots
  for insert to authenticated with check (
    created_by = (select auth.uid())::text
    and is_active = true
    and claimed = false
    and claimed_by is null
    and claimed_at is null
    and char_length(trim(name)) between 1 and 120
    and latitude between -90 and 90
    and longitude between -180 and 180
  );
create policy community_spots_creator_update_unclaimed on public.community_spots
  for update to authenticated
  using (created_by = (select auth.uid())::text and claimed = false)
  with check (
    created_by = (select auth.uid())::text
    and claimed = false
    and claimed_by is null
    and claimed_at is null
    and char_length(trim(name)) between 1 and 120
    and latitude between -90 and 90
    and longitude between -180 and 180
  );
commit;
