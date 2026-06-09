-- LN COS — Bucket Supabase Storage pour images admin (sections, popups, etc.)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media" on storage.objects;
drop policy if exists "Admin upload media" on storage.objects;
drop policy if exists "Admin update media" on storage.objects;
drop policy if exists "Admin delete media" on storage.objects;

create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Admin upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admin update media"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

create policy "Admin delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());
