-- PostgreSQL unique indexes allow multiple NULL values; use the complete key for upsert conflict inference.
drop index if exists public.conversion_events_event_key_idx;
create unique index conversion_events_event_key_idx
  on public.conversion_events (event_key);
