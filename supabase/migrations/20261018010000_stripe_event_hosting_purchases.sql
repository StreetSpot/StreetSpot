-- Allow a verified one-time Stripe purchase to be recorded before the host attaches event details.
alter table public.event_hosting_purchases alter column event_id drop not null;

create or replace function public.record_stripe_event_purchase(
  p_shared_secret text,
  p_event_id text,
  p_user_id uuid,
  p_tier text,
  p_checkout_session_id text,
  p_payment_intent_id text default null
) returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if p_shared_secret is null or not exists (
    select 1 from private.stripe_webhook_config c
    where c.id = true and c.shared_secret = p_shared_secret
  ) then
    raise exception using errcode = '42501', message = 'Webhook sync authorization failed';
  end if;

  if p_event_id is null or char_length(p_event_id) < 8 or char_length(p_event_id) > 255
     or p_user_id is null
     or p_tier not in ('invite','hosted','signature')
     or p_checkout_session_id is null or char_length(p_checkout_session_id) < 8 then
    raise exception using errcode = '22023', message = 'Invalid event purchase payload';
  end if;

  insert into private.stripe_webhook_events(event_id) values (p_event_id)
  on conflict do nothing;
  if not found then return true; end if;

  insert into public.event_hosting_purchases (
    event_id, user_id, tier, status, guest_limit,
    stripe_checkout_session_id, stripe_payment_intent_id, stripe_event_id
  ) values (
    null, p_user_id, p_tier, 'paid',
    case p_tier when 'invite' then 1 when 'hosted' then 50 when 'signature' then 200 end,
    p_checkout_session_id, p_payment_intent_id, p_event_id
  )
  on conflict (stripe_checkout_session_id) do nothing;

  return true;
end;
$function$;

revoke all on function public.record_stripe_event_purchase(text,text,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.record_stripe_event_purchase(text,text,uuid,text,text,text) to service_role;
