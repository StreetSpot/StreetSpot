create index if not exists event_hosting_purchases_user_id_idx
  on public.event_hosting_purchases (user_id);

create index if not exists private_event_guest_drafts_user_id_idx
  on public.private_event_guest_drafts (user_id);
