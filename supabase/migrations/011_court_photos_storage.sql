-- Bucket publico para fotos de canchas (ruta: {club_id}/{archivo}).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'court-photos',
  'court-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "court_photos_public_read"
on storage.objects for select
using (bucket_id = 'court-photos');

create policy "court_photos_insert_owner"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'court-photos'
  and (storage.foldername(name))[1] in (
    select id::text from public.clubs where owner_id = auth.uid()
  )
);

create policy "court_photos_update_owner"
on storage.objects for update
to authenticated
using (
  bucket_id = 'court-photos'
  and (storage.foldername(name))[1] in (
    select id::text from public.clubs where owner_id = auth.uid()
  )
);

create policy "court_photos_delete_owner"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'court-photos'
  and (storage.foldername(name))[1] in (
    select id::text from public.clubs where owner_id = auth.uid()
  )
);
