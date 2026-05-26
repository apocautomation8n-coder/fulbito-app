alter table public.player_profiles
  add column if not exists phone text;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  profile_role public.user_role;
  profile_birthdate date;
  profile_phone text;
  raw_birthdate text;
begin
  profile_role := case
    when new.raw_user_meta_data->>'role' in ('player', 'club', 'admin')
      then (new.raw_user_meta_data->>'role')::public.user_role
    else 'player'::public.user_role
  end;

  raw_birthdate := nullif(new.raw_user_meta_data->>'birthdate', '');
  profile_phone := nullif(trim(new.raw_user_meta_data->>'phone'), '');

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
    insert into public.player_profiles (user_id, birthdate, phone)
    values (new.id, profile_birthdate, profile_phone)
    on conflict (user_id) do update
      set birthdate = coalesce(excluded.birthdate, public.player_profiles.birthdate),
          phone = coalesce(excluded.phone, public.player_profiles.phone);
  end if;

  return new;
end;
$$;
