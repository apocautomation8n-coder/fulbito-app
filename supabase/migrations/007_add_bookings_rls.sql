create policy "bookings_read_own_player"
on public.bookings for select
using (player_id = auth.uid());

create policy "bookings_read_club_owner"
on public.bookings for select
using (
  exists (
    select 1 from public.clubs
    where clubs.id = bookings.club_id
    and clubs.owner_id = auth.uid()
  )
);

create policy "bookings_insert_player"
on public.bookings for insert
with check (player_id = auth.uid());

create policy "bookings_update_own_player"
on public.bookings for update
using (player_id = auth.uid())
with check (player_id = auth.uid());

create policy "bookings_manage_club_owner"
on public.bookings for all
using (
  exists (
    select 1 from public.clubs
    where clubs.id = bookings.club_id
    and clubs.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.clubs
    where clubs.id = bookings.club_id
    and clubs.owner_id = auth.uid()
  )
);

create policy "bookings_admin_all"
on public.bookings for all
using (public.is_admin())
with check (public.is_admin());
