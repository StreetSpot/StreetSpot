-- Atomic authenticated vendor publishing and live-status updates.
begin;
create unique index if not exists vendor_locations_vendor_id_key on public.vendor_locations(vendor_id);

create or replace function public.publish_vendor(
  p_name text, p_description text, p_category text,
  p_lat double precision, p_lng double precision, p_closing_time text
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare new_vendor_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_name is null or char_length(trim(p_name)) not between 1 and 160 then
    raise exception using errcode = '22023', message = 'Invalid business name';
  end if;
  if p_description is not null and char_length(p_description) > 2000 then
    raise exception using errcode = '22023', message = 'Description is too long';
  end if;
  if p_lat is null or p_lat < -90 or p_lat > 90 or p_lng is null or p_lng < -180 or p_lng > 180 then
    raise exception using errcode = '22023', message = 'Invalid coordinates';
  end if;
  if p_closing_time is null or p_closing_time !~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception using errcode = '22023', message = 'Invalid closing time';
  end if;

  insert into public.vendors (owner_id, name, description, category, is_live, closing_time, updated_at)
  values ((select auth.uid()), trim(p_name), coalesce(trim(p_description), ''), coalesce(nullif(trim(p_category), ''), 'vendor'), true, p_closing_time, now())
  returning id into new_vendor_id;

  insert into public.vendor_locations (vendor_id, latitude, longitude, is_live, updated_at)
  values (new_vendor_id, p_lat, p_lng, true, now())
  on conflict (vendor_id) do update
    set latitude = excluded.latitude, longitude = excluded.longitude, is_live = true, updated_at = now();
  return new_vendor_id;
end;
$$;

create or replace function public.set_vendor_live(
  p_vendor_id uuid, p_is_live boolean, p_lat double precision, p_lng double precision,
  p_closing_time text, p_description text
)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '42501', message = 'Authentication required';
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

  update public.vendors
  set is_live = coalesce(p_is_live, false), closing_time = p_closing_time,
      description = coalesce(trim(p_description), ''), updated_at = now()
  where id = p_vendor_id and owner_id = (select auth.uid());
  if not found then
    raise exception using errcode = '42501', message = 'Vendor not found or not owned by this account';
  end if;

  if p_is_live then
    insert into public.vendor_locations (vendor_id, latitude, longitude, is_live, updated_at)
    values (p_vendor_id, p_lat, p_lng, true, now())
    on conflict (vendor_id) do update
      set latitude = excluded.latitude, longitude = excluded.longitude, is_live = true, updated_at = now();
  else
    update public.vendor_locations set is_live = false, updated_at = now() where vendor_id = p_vendor_id;
  end if;
  return true;
end;
$$;

revoke all on function public.publish_vendor(text,text,text,double precision,double precision,text) from public, anon;
revoke all on function public.set_vendor_live(uuid,boolean,double precision,double precision,text,text) from public, anon;
grant execute on function public.publish_vendor(text,text,text,double precision,double precision,text) to authenticated;
grant execute on function public.set_vendor_live(uuid,boolean,double precision,double precision,text,text) to authenticated;
commit;
