create type public.court_sport as enum ('football', 'padel');

alter type public.court_format add value if not exists '1v1';
alter type public.court_format add value if not exists '2v2';

alter table public.courts
  add column sport public.court_sport not null default 'football';
