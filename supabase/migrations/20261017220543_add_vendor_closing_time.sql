alter table public.vendors add column if not exists closing_time text not null default '22:00';

alter table public.vendors drop constraint if exists vendors_closing_time_format;

alter table public.vendors add constraint vendors_closing_time_format check (closing_time ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$');
