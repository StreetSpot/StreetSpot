-- Explicitly deny all direct client access to paid event purchase records.
create policy event_hosting_purchases_deny_user_access on public.event_hosting_purchases for all to anon, authenticated using (false) with check (false);
