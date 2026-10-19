-- Core Stripe entitlement synchronization. The shared secret is seeded separately through secure admin tooling.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to service_role;

create table if not exists private.stripe_webhook_config (
  id boolean primary key default true check (id),
  shared_secret text not null
);
revoke all on private.stripe_webhook_config from public, anon, authenticated;
grant all on private.stripe_webhook_config to service_role;

create table if not exists private.stripe_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
revoke all on private.stripe_webhook_events from public, anon, authenticated;
grant all on private.stripe_webhook_events to service_role;

CREATE OR REPLACE FUNCTION public.sync_stripe_entitlement(p_shared_secret text, p_event_id text, p_action text, p_user_id uuid DEFAULT NULL::uuid, p_feature text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_customer_id text DEFAULT NULL::text, p_subscription_id text DEFAULT NULL::text, p_period_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare affected_users uuid[];
begin
  if p_shared_secret is null or not exists (
    select 1 from private.stripe_webhook_config c where c.id = true and c.shared_secret = p_shared_secret
  ) then
    raise exception using errcode = '42501', message = 'Webhook sync authorization failed';
  end if;
  if p_event_id is null or char_length(p_event_id) < 8 or char_length(p_event_id) > 255 then
    raise exception using errcode = '22023', message = 'Invalid event id';
  end if;
  if p_action not in ('upsert','subscription_status','ignore') then
    raise exception using errcode = '22023', message = 'Invalid sync action';
  end if;

  insert into private.stripe_webhook_events(event_id) values (p_event_id) on conflict do nothing;
  if not found then return true; end if;
  if p_action = 'ignore' then return true; end if;

  if p_action = 'upsert' then
    if p_user_id is null or p_feature not in (
      'vendor_bronze','vendor_silver','vendor_gold',
      'theme_street_style','theme_creator','theme_brand_studio',
      'event_hosting_invite','event_hosting_hosted','event_hosting_signature'
    ) or p_status not in ('active','inactive','past_due','canceled') then
      raise exception using errcode = '22023', message = 'Invalid entitlement payload';
    end if;

    if p_feature in ('vendor_bronze','vendor_silver','vendor_gold') and p_status = 'active' then
      update public.account_entitlements
      set status = 'inactive', updated_at = now()
      where user_id = p_user_id
        and feature in ('vendor_bronze','vendor_silver','vendor_gold')
        and feature <> p_feature and status = 'active';
    end if;

    insert into public.account_entitlements (
      user_id, feature, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at
    ) values (
      p_user_id, p_feature, p_status, p_customer_id, p_subscription_id, p_period_end, now()
    )
    on conflict (user_id, feature) do update set
      status = excluded.status,
      stripe_customer_id = coalesce(excluded.stripe_customer_id, public.account_entitlements.stripe_customer_id),
      stripe_subscription_id = coalesce(excluded.stripe_subscription_id, public.account_entitlements.stripe_subscription_id),
      current_period_end = coalesce(excluded.current_period_end, public.account_entitlements.current_period_end),
      updated_at = now();

    if p_feature in ('vendor_bronze','vendor_silver','vendor_gold') then
      update public.vendors v set
        is_premium = private.has_active_vendor_subscription(v.owner_id),
        is_live = case when private.has_active_vendor_subscription(v.owner_id) then v.is_live else false end,
        premium_tier = (
          select case e.feature when 'vendor_gold' then 'gold' when 'vendor_silver' then 'silver' when 'vendor_bronze' then 'bronze' end
          from public.account_entitlements e
          where e.user_id = v.owner_id
            and e.feature in ('vendor_bronze','vendor_silver','vendor_gold')
            and e.status = 'active'
            and (e.current_period_end is null or e.current_period_end > now())
          order by case e.feature when 'vendor_gold' then 3 when 'vendor_silver' then 2 when 'vendor_bronze' then 1 else 0 end desc
          limit 1
        ),
        updated_at = now()
      where v.owner_id = p_user_id;
      update public.vendor_locations l set is_live = false, updated_at = now()
      where l.is_live and exists (select 1 from public.vendors v where v.id = l.vendor_id and v.owner_id = p_user_id and not private.has_active_vendor_subscription(v.owner_id));
    end if;
    return true;
  end if;

  if p_action = 'subscription_status' then
    if p_subscription_id is null or p_status not in ('active','inactive','past_due','canceled') then
      raise exception using errcode = '22023', message = 'Invalid subscription status payload';
    end if;
    with changed as (
      update public.account_entitlements
      set status = p_status,
          current_period_end = coalesce(p_period_end, current_period_end),
          stripe_customer_id = coalesce(p_customer_id, stripe_customer_id),
          updated_at = now()
      where stripe_subscription_id = p_subscription_id
      returning user_id
    )
    select array_agg(distinct user_id) into affected_users from changed;

    if affected_users is not null then
      update public.vendors v set
        is_premium = private.has_active_vendor_subscription(v.owner_id),
        is_live = case when private.has_active_vendor_subscription(v.owner_id) then v.is_live else false end,
        premium_tier = (
          select case e.feature when 'vendor_gold' then 'gold' when 'vendor_silver' then 'silver' when 'vendor_bronze' then 'bronze' end
          from public.account_entitlements e
          where e.user_id = v.owner_id
            and e.feature in ('vendor_bronze','vendor_silver','vendor_gold')
            and e.status = 'active'
            and (e.current_period_end is null or e.current_period_end > now())
          order by case e.feature when 'vendor_gold' then 3 when 'vendor_silver' then 2 when 'vendor_bronze' then 1 else 0 end desc
          limit 1
        ),
        updated_at = now()
      where v.owner_id = any(affected_users);
      update public.vendor_locations l set is_live = false, updated_at = now()
      where l.is_live and exists (select 1 from public.vendors v where v.id = l.vendor_id and v.owner_id = any(affected_users) and not private.has_active_vendor_subscription(v.owner_id));
    end if;
    return true;
  end if;
  return true;
end;
$function$;

revoke all on function public.sync_stripe_entitlement(text,text,text,uuid,text,text,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.sync_stripe_entitlement(text,text,text,uuid,text,text,text,text,timestamptz) to service_role;
