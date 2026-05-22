alter table public.player_profiles
  add column if not exists transfer_alias text;
