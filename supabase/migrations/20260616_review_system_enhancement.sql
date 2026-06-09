-- LN COS — Système avis clients professionnel (extensions + images)

alter table public.product_reviews
  add column if not exists author_email text,
  add column if not exists author_photo_url text,
  add column if not exists title text not null default '',
  add column if not exists review_date timestamptz,
  add column if not exists homepage_featured boolean not null default false;

alter table public.product_reviews drop constraint if exists product_reviews_status_check;
alter table public.product_reviews add constraint product_reviews_status_check
  check (status in ('pending', 'published', 'rejected', 'draft'));

create index if not exists idx_product_reviews_featured
  on public.product_reviews (featured, homepage_featured, status);

create table if not exists public.review_images (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.product_reviews(id) on delete cascade,
  image_url  text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_review_images_review on public.review_images (review_id);

alter table public.review_images enable row level security;

drop policy if exists "Public read review images" on public.review_images;
create policy "Public read review images"
  on public.review_images for select
  using (
    exists (
      select 1 from public.product_reviews pr
      where pr.id = review_id
        and (pr.status = 'published' or public.is_admin() or auth.uid() = pr.user_id)
    )
  );

drop policy if exists "Admins manage review images" on public.review_images;
create policy "Admins manage review images"
  on public.review_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bucket storage review-images (photos clients, max 5 par avis côté app)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read review images storage" on storage.objects;
drop policy if exists "Admin upload review images" on storage.objects;
drop policy if exists "Admin update review images storage" on storage.objects;
drop policy if exists "Admin delete review images storage" on storage.objects;

create policy "Public read review images storage"
  on storage.objects for select
  using (bucket_id = 'review-images');

create policy "Admin upload review images"
  on storage.objects for insert
  with check (bucket_id = 'review-images' and public.is_admin());

create policy "Admin update review images storage"
  on storage.objects for update
  using (bucket_id = 'review-images' and public.is_admin());

create policy "Admin delete review images storage"
  on storage.objects for delete
  using (bucket_id = 'review-images' and public.is_admin());

alter publication supabase_realtime add table public.review_images;
