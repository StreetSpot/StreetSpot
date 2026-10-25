-- Prevent blank or seed-placeholder listings from going live.
CREATE OR REPLACE FUNCTION private.publish_vendor(p_name text, p_description text, p_category text, p_lat double precision, p_lng double precision, p_closing_time text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare new_vendor_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if not private.has_active_vendor_subscription((select auth.uid())) then
    raise exception using errcode = '42501', message = 'An active StreetSpot vendor subscription is required to go live';
  end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 160 then
    raise exception using errcode = '22023', message = 'Invalid business name';
  end if;
  if p_description is null or char_length(trim(p_description)) < 20 then
    raise exception using errcode = '22023', message = 'Add an accurate description of at least 20 characters before publishing';
  end if;
  if char_length(p_description) > 2000 then
    raise exception using errcode = '22023', message = 'Description is too long';
  end if;
  if p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180 then
    raise exception using errcode = '22023', message = 'Invalid coordinates';
  end if;
  if p_closing_time is null or p_closing_time !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception using errcode = '22023', message = 'Invalid closing time';
  end if;
  insert into public.vendors (owner_id, name, description, category, is_live, closing_time, is_premium, updated_at)
  values ((select auth.uid()), trim(p_name), coalesce(trim(p_description), ''), coalesce(nullif(trim(p_category), ''), 'vendor'), true, p_closing_time, true, now())
  returning id into new_vendor_id;
  insert into public.vendor_locations (vendor_id, latitude, longitude, is_live, updated_at)
  values (new_vendor_id, p_lat, p_lng, true, now())
  on conflict (vendor_id) do update set latitude = excluded.latitude, longitude = excluded.longitude, is_live = true, updated_at = now();
  return new_vendor_id;
end;
$function$;

CREATE OR REPLACE FUNCTION private.set_vendor_live(p_vendor_id uuid, p_is_live boolean, p_lat double precision, p_lng double precision, p_closing_time text, p_description text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_is_live and not private.has_active_vendor_subscription((select auth.uid())) then
    raise exception using errcode = '42501', message = 'An active StreetSpot vendor subscription is required to go live';
  end if;
  if p_is_live and (p_description is null or char_length(trim(p_description)) < 20) then
    raise exception using errcode = '22023', message = 'Add an accurate description of at least 20 characters before going live';
  end if;
  if p_is_live and exists (
    select 1 from public.vendors v
    where v.id = p_vendor_id and v.owner_id = (select auth.uid()) and v.seed_id is not null
  ) and lower(coalesce(p_description, '')) like '%unclaimed candidate%' then
    raise exception using errcode = '22023', message = 'Replace the catalog placeholder with an accurate description before going live';
  end if;
  if p_is_live and (p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180) then
    raise exception using errcode = '22023', message = 'Invalid coordinates';
  end if;
  if p_closing_time is null or p_closing_time !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception using errcode = '22023', message = 'Invalid closing time';
  end if;
  if p_description is not null and char_length(p_description) > 2000 then
    raise exception using errcode = '22023', message = 'Description is too long';
  end if;
  update public.vendors set is_live = coalesce(p_is_live, false), closing_time = p_closing_time,
    description = coalesce(trim(p_description), ''), updated_at = now()
  where id = p_vendor_id and owner_id = (select auth.uid());
  if not found then raise exception using errcode = '42501', message = 'Vendor not found or not owned by this account'; end if;
  if p_is_live then
    insert into public.vendor_locations (vendor_id, latitude, longitude, is_live, updated_at)
    values (p_vendor_id, p_lat, p_lng, true, now())
    on conflict (vendor_id) do update set latitude = excluded.latitude, longitude = excluded.longitude, is_live = true, updated_at = now();
  else
    update public.vendor_locations set is_live = false, updated_at = now() where vendor_id = p_vendor_id;
  end if;
  return true;
end;
$function$;

-- Keep public RPCs as thin invoker wrappers; the implementation stays in the private schema.
create or replace function public.publish_vendor(
  p_name text, p_description text, p_category text,
  p_lat double precision, p_lng double precision, p_closing_time text
) returns uuid
language sql
set search_path to ''
as $function$
  select private.publish_vendor(p_name, p_description, p_category, p_lat, p_lng, p_closing_time);
$function$;

create or replace function public.set_vendor_live(
  p_vendor_id uuid, p_is_live boolean, p_lat double precision, p_lng double precision,
  p_closing_time text, p_description text
) returns boolean
language sql
set search_path to ''
as $function$
  select private.set_vendor_live(p_vendor_id, p_is_live, p_lat, p_lng, p_closing_time, p_description);
$function$;

revoke all on function private.publish_vendor(text, text, text, double precision, double precision, text) from public, anon;
revoke all on function private.set_vendor_live(uuid, boolean, double precision, double precision, text, text) from public, anon;
grant execute on function private.publish_vendor(text, text, text, double precision, double precision, text) to authenticated, service_role;
grant execute on function private.set_vendor_live(uuid, boolean, double precision, double precision, text, text) to authenticated, service_role;

revoke all on function public.publish_vendor(text, text, text, double precision, double precision, text) from public, anon;
revoke all on function public.set_vendor_live(uuid, boolean, double precision, double precision, text, text) from public, anon;
grant execute on function public.publish_vendor(text, text, text, double precision, double precision, text) to authenticated, service_role;
grant execute on function public.set_vendor_live(uuid, boolean, double precision, double precision, text, text) to authenticated, service_role;
