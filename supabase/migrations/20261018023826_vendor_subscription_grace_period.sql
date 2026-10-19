-- Keep vendors live during Stripe's payment-retry window, but only through the paid period end.
CREATE OR REPLACE FUNCTION private.has_active_vendor_subscription(target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.account_entitlements e
    where e.user_id = target_user_id
      and e.feature in ('vendor_bronze','vendor_silver','vendor_gold')
      and (
        (e.status = 'active' and (e.current_period_end is null or e.current_period_end > now()))
        or (e.status = 'past_due' and e.current_period_end is not null and e.current_period_end > now())
      )
  );
$function$;
