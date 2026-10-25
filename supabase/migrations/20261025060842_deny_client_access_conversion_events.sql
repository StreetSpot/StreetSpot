-- Internal conversion analytics are service-only. Explicitly deny browser roles.
create policy conversion_events_deny_client_access
on public.conversion_events
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
