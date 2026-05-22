-- 001_initial_schema.sql
create extension if not exists "pgcrypto";

create type public.user_role as enum ('player', 'club', 'admin');
create type public.club_verification_status as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');
create type public.court_format as enum ('5v5', '6v6', '7v7', '8v8', '9v9', '11v11', 'other');
create type public.payment_collection_mode as enum ('full', 'deposit');
create type public.slot_status as enum ('available', 'held', 'booked', 'manual_block', 'cancelled');
create type public.booking_status as enum ('pending_payment', 'paid', 'manual_block', 'cancelled', 'refunded');
create type public.match_status as enum ('open', 'full', 'payment_pending', 'confirmed', 'finished', 'cancelled');
create type public.match_request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.payment_status as enum ('pending', 'approved', 'rejected', 'refunded', 'expired');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role public.user_role not null,
  full_name text not null,
  avatar_url text,
  fcm_token text,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  birthdate date,
  position text,
  skill_level text,
  avg_rating numeric(3,2) not null default 0,
  matches_played integer not null default 0,
  created_at timestamptz not null default now(),
  constraint player_is_adult check (birthdate is null or birthdate <= (current_date - interval '18 years'))
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  neighborhood text,
  city text not null default 'Cordoba',
  lat numeric,
  lng numeric,
  photos text[] not null default '{}',
  verification_status public.club_verification_status not null default 'draft',
  mp_account_id text,
  mp_connected_at timestamptz,
  split_deadline_hours integer not null default 3,
  cancellation_policy jsonb not null default '[{"label":"Reembolso total","hours_before":24,"refund_rate":1},{"label":"Reembolso parcial","hours_before":3,"refund_rate":0.5},{"label":"Sin reembolso","hours_before":0,"refund_rate":0}]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clubs_split_deadline_positive check (split_deadline_hours >= 1 and split_deadline_hours <= 48)
);

create table public.courts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  format public.court_format not null,
  players_per_team integer,
  price_per_slot numeric(12,2) not null,
  duration_minutes integer not null default 60,
  payment_mode public.payment_collection_mode not null default 'full',
  deposit_amount numeric(12,2),
  photos text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courts_price_positive check (price_per_slot > 0),
  constraint courts_duration_positive check (duration_minutes >= 30),
  constraint courts_deposit_valid check (
    payment_mode = 'full'
    or (deposit_amount is not null and deposit_amount > 0 and deposit_amount <= price_per_slot)
  )
);

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.slot_status not null default 'available',
  held_until timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint time_slots_valid_range check (end_time > start_time)
);

create index time_slots_court_start_idx on public.time_slots(court_id, start_time);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.profiles(id) on delete set null,
  slot_id uuid not null references public.time_slots(id) on delete restrict,
  club_id uuid not null references public.clubs(id) on delete restrict,
  court_id uuid not null references public.courts(id) on delete restrict,
  total_amount numeric(12,2) not null,
  amount_due_now numeric(12,2) not null,
  app_commission numeric(12,2) not null,
  club_amount numeric(12,2) not null,
  payment_mode public.payment_collection_mode not null,
  mp_payment_id text,
  status public.booking_status not null default 'pending_payment',
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz,
  constraint bookings_amounts_valid check (
    total_amount > 0
    and amount_due_now >= 0
    and app_commission >= 0
    and club_amount >= 0
  )
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  spots_total integer not null,
  spots_taken integer not null default 1,
  is_split_payment boolean not null default true,
  price_per_player numeric(12,2),
  payment_deadline timestamptz not null,
  status public.match_status not null default 'open',
  description text,
  created_at timestamptz not null default now(),
  constraint matches_spots_valid check (spots_total > 1 and spots_taken >= 1 and spots_taken <= spots_total)
);

create table public.match_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  status public.match_request_status not null default 'pending',
  paid boolean not null default false,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (match_id, player_id)
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  match_request_id uuid references public.match_requests(id) on delete cascade,
  payer_id uuid references public.profiles(id) on delete set null,
  mp_payment_id text,
  amount numeric(12,2) not null,
  app_commission numeric(12,2) not null default 0,
  status public.payment_status not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  from_player_id uuid not null references public.profiles(id) on delete cascade,
  to_player_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  stars integer not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (from_player_id, to_player_id, match_id),
  constraint ratings_no_self_rating check (from_player_id <> to_player_id)
);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  reason text not null,
  details text,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.player_profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.courts enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;
alter table public.matches enable row level security;
alter table public.match_requests enable row level security;
alter table public.payment_events enable row level security;
alter table public.ratings enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_suspended = false
  );
$$;

create policy "profiles_read_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "player_profiles_read_authenticated"
on public.player_profiles for select
using (auth.uid() is not null);

create policy "player_profiles_manage_own"
on public.player_profiles for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "clubs_read_approved_or_owner_or_admin"
on public.clubs for select
using (verification_status = 'approved' or owner_id = auth.uid() or public.is_admin());

create policy "clubs_manage_owner"
on public.clubs for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "clubs_admin_update"
on public.clubs for update
using (public.is_admin())
with check (public.is_admin());

create policy "courts_read_active"
on public.courts for select
using (
  is_active = true
  and exists (
    select 1 from public.clubs
    where clubs.id = courts.club_id
    and clubs.verification_status = 'approved'
  )
);

create policy "courts_manage_club_owner"
on public.courts for all
using (
  exists (
    select 1 from public.clubs
    where clubs.id = courts.club_id
    and clubs.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clubs
    where clubs.id = courts.club_id
    and clubs.owner_id = auth.uid()
  )
);

create policy "admin_read_all"
on public.payment_events for select
using (public.is_admin());

-- 002_auth_signup_profile_trigger.sql
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_role public.user_role;
  profile_birthdate date;
  raw_birthdate text;
begin
  profile_role := case
    when new.raw_user_meta_data->>'role' in ('player', 'club', 'admin')
      then (new.raw_user_meta_data->>'role')::public.user_role
    else 'player'::public.user_role
  end;

  raw_birthdate := nullif(new.raw_user_meta_data->>'birthdate', '');

  if raw_birthdate ~ '^\d{4}-\d{2}-\d{2}$' then
    profile_birthdate := raw_birthdate::date;
  elsif raw_birthdate ~ '^\d{2}/\d{2}/\d{4}$' then
    profile_birthdate := to_date(raw_birthdate, 'DD/MM/YYYY');
  else
    profile_birthdate := null;
  end if;

  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    profile_role,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Usuario Fulbito')
  )
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role,
        full_name = excluded.full_name,
        updated_at = now();

  if profile_role = 'player' then
    insert into public.player_profiles (user_id, birthdate)
    values (new.id, profile_birthdate)
    on conflict (user_id) do update
      set birthdate = coalesce(excluded.birthdate, public.player_profiles.birthdate);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- 003_add_court_sport.sql
create type public.court_sport as enum ('football', 'padel');

alter type public.court_format add value if not exists '1v1';
alter type public.court_format add value if not exists '2v2';

alter table public.courts
  add column sport public.court_sport not null default 'football';

-- 004_add_player_sport_profiles.sql
alter table public.player_profiles
  add column sport_profile_mode text not null default 'football',
  add column football_profile jsonb not null default '{}',
  add column padel_profile jsonb not null default '{}',
  add constraint player_profiles_sport_profile_mode_valid
    check (sport_profile_mode in ('football', 'padel', 'both'));

-- 005_add_at_club_payment_mode.sql
alter type public.payment_collection_mode add value if not exists 'at_club';

-- 006_add_player_transfer_alias.sql
alter table public.player_profiles
  add column if not exists transfer_alias text;
