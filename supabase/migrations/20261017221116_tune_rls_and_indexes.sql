-- Remove duplicate policies and index foreign keys for the current core schema.
begin;

drop policy if exists vendors_public_or_owner_select on public.vendors;
drop policy if exists vendors_owner_insert on public.vendors;
drop policy if exists vendors_owner_update on public.vendors;
drop policy if exists vendor_locations_public_or_owner_select on public.vendor_locations;
drop policy if exists vendor_locations_owner_insert on public.vendor_locations;
drop policy if exists vendor_locations_owner_update on public.vendor_locations;
drop policy if exists vendor_locations_owner_delete on public.vendor_locations;

drop index if exists public.vendor_claims_one_open_claim_idx;
create index if not exists vendors_owner_id_idx on public.vendors(owner_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists private_event_invites_invited_user_id_idx on public.private_event_invites(invited_user_id);
create index if not exists user_notifications_update_id_idx on public.user_notifications(update_id);
create index if not exists user_notifications_vendor_id_idx on public.user_notifications(vendor_id);
create index if not exists vendor_favorites_vendor_id_idx on public.vendor_favorites(vendor_id);
create index if not exists vendor_reviews_vendor_id_idx on public.vendor_reviews(vendor_id);
create index if not exists vendor_social_profiles_owner_id_idx on public.vendor_social_profiles(owner_id);
create index if not exists vendor_updates_owner_id_idx on public.vendor_updates(owner_id);
create index if not exists community_spots_active_created_idx on public.community_spots(is_active, created_at desc);

create or replace function private.current_user_is_staff()
returns boolean language sql stable set search_path = ''
as $$
  select (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','staff');
$$;
create or replace function private.current_user_email()
returns text language sql stable set search_path = ''
as $$
  select lower(coalesce((select auth.jwt() ->> 'email'), ''));
$$;
revoke all on function private.current_user_is_staff() from public, anon;
revoke all on function private.current_user_email() from public, anon;
grant execute on function private.current_user_is_staff() to authenticated;
grant execute on function private.current_user_email() to authenticated;

drop policy if exists vendor_claims_owner_or_staff_select on public.vendor_claims;
create policy vendor_claims_owner_or_staff_select on public.vendor_claims
  for select to authenticated using (
    claimant_id = (select auth.uid()) or (select private.current_user_is_staff())
  );
drop policy if exists vendor_claims_staff_update on public.vendor_claims;
create policy vendor_claims_staff_update on public.vendor_claims
  for update to authenticated
  using ((select private.current_user_is_staff()))
  with check ((select private.current_user_is_staff()));

drop policy if exists private_event_invites_host_or_invitee_select on public.private_event_invites;
create policy private_event_invites_host_or_invitee_select on public.private_event_invites
  for select to authenticated using (
    private.is_private_event_host(event_id)
    or invited_user_id = (select auth.uid())
    or lower(invited_email) = (select private.current_user_email())
  );

commit;
