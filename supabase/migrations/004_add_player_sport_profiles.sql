alter table public.player_profiles
  add column sport_profile_mode text not null default 'football',
  add column football_profile jsonb not null default '{}',
  add column padel_profile jsonb not null default '{}',
  add constraint player_profiles_sport_profile_mode_valid
    check (sport_profile_mode in ('football', 'padel', 'both'));
