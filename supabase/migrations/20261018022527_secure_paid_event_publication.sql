-- Enforce paid event publication and invite creation in Postgres, not just in the web UI.
create or replace function private.has_paid_event_hosting(target_event_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.event_hosting_purchases p
    where p.event_id = target_event_id
      and p.user_id = target_user_id
      and p.status = 'paid'
  );
$function$;

revoke all on function private.has_paid_event_hosting(uuid, uuid) from public, anon;
grant execute on function private.has_paid_event_hosting(uuid, uuid) to authenticated;

drop policy if exists private_events_host_insert on public.private_events;
create policy private_events_host_insert on public.private_events
  for insert to authenticated
  with check (host_id = (select auth.uid()) and status = 'draft');

drop policy if exists private_events_host_update on public.private_events;
create policy private_events_host_update on public.private_events
  for update to authenticated
  using (host_id = (select auth.uid()))
  with check (
    host_id = (select auth.uid())
    and (status <> 'published' or private.has_paid_event_hosting(id, (select auth.uid())))
  );

drop policy if exists private_event_invites_host_insert on public.private_event_invites;
create policy private_event_invites_host_insert on public.private_event_invites
  for insert to authenticated
  with check (
    private.is_private_event_host(event_id)
    and private.has_paid_event_hosting(event_id, (select auth.uid()))
    and exists (
      select 1 from public.private_events e
      where e.id = event_id and e.host_id = (select auth.uid()) and e.status = 'published'
    )
  );

drop policy if exists private_event_invites_host_update on public.private_event_invites;
create policy private_event_invites_host_update on public.private_event_invites
  for update to authenticated
  using (private.is_private_event_host(event_id))
  with check (
    private.is_private_event_host(event_id)
    and private.has_paid_event_hosting(event_id, (select auth.uid()))
    and exists (
      select 1 from public.private_events e
      where e.id = event_id and e.host_id = (select auth.uid()) and e.status = 'published'
    )
  );
