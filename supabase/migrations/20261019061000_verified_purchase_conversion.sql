alter table public.conversion_events
  add column event_key text;

create unique index conversion_events_event_key_idx
  on public.conversion_events (event_key)
  where event_key is not null;

alter table public.conversion_events
  drop constraint conversion_events_event_name_check;

alter table public.conversion_events
  add constraint conversion_events_event_name_check
  check (event_name in (
    'event_package_selected',
    'event_checkout_started',
    'event_package_available',
    'invitation_style_selected',
    'private_event_created',
    'private_invitation_opened',
    'event_purchase_confirmed'
  ));
