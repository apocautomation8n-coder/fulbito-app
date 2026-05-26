create policy "time_slots_read_authenticated"
on public.time_slots for select
using (auth.uid() is not null);

create policy "time_slots_insert_authenticated"
on public.time_slots for insert
with check (auth.uid() is not null);

create policy "time_slots_update_creator_or_club_owner"
on public.time_slots for update
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.courts
    join public.clubs on clubs.id = courts.club_id
    where courts.id = time_slots.court_id
      and clubs.owner_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  created_by = auth.uid()
  or exists (
    select 1
    from public.courts
    join public.clubs on clubs.id = courts.club_id
    where courts.id = time_slots.court_id
      and clubs.owner_id = auth.uid()
  )
  or public.is_admin()
);
