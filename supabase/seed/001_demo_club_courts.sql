-- Canchas demo para probar reservas reales.
-- Requiere al menos un perfil con role = 'club' en public.profiles.

insert into public.clubs (
  id,
  owner_id,
  name,
  address,
  neighborhood,
  city,
  verification_status
)
select
  'f1111111-1111-4111-8111-111111111111'::uuid,
  p.id,
  'La Docta Futbol',
  'Av. Velez Sarsfield 800',
  'Nueva Cordoba',
  'Cordoba',
  'approved'::public.club_verification_status
from public.profiles p
where p.role = 'club'
order by p.created_at
limit 1
on conflict (id) do update
  set verification_status = 'approved',
      name = excluded.name,
      updated_at = now();

insert into public.courts (
  id,
  club_id,
  name,
  sport,
  format,
  price_per_slot,
  duration_minutes,
  payment_mode,
  is_active
)
values
  (
    'f2222222-2222-4222-8222-222222222221'::uuid,
    'f1111111-1111-4111-8111-111111111111'::uuid,
    'Cancha 1 Sintetico',
    'football',
    '7v7',
    28000,
    60,
    'at_club',
    true
  ),
  (
    'f2222222-2222-4222-8222-222222222222'::uuid,
    'f1111111-1111-4111-8111-111111111111'::uuid,
    'Padel 1',
    'padel',
    '2v2',
    18000,
    60,
    'at_club',
    true
  )
on conflict (id) do update
  set is_active = true,
      price_per_slot = excluded.price_per_slot,
      updated_at = now();
