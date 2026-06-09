-- LN COS — Images produit, galerie, variantes, bucket storage

-- Colonnes produits
alter table public.products
  add column if not exists main_image_url text,
  add column if not exists gallery_images text[] not null default '{}',
  add column if not exists video_url text;

update public.products
set main_image_url = image_url
where main_image_url is null and image_url is not null;

-- Variantes produit
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  price       numeric(10,2) not null,
  stock       integer not null default 0 check (stock >= 0),
  sku         text not null default '',
  image_url   text,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_product_variants_product
  on public.product_variants (product_id, position);

create unique index if not exists idx_product_variants_sku
  on public.product_variants (product_id, sku)
  where sku <> '';

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute procedure public.set_updated_at();

alter table public.product_variants enable row level security;

drop policy if exists "Public read product variants" on public.product_variants;
drop policy if exists "Admin manage product variants" on public.product_variants;

create policy "Public read product variants"
  on public.product_variants for select using (true);

create policy "Admin manage product variants"
  on public.product_variants for all using (public.is_admin());

-- Bucket storage product-images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Admin upload product images" on storage.objects;
drop policy if exists "Admin update product images" on storage.objects;
drop policy if exists "Admin delete product images" on storage.objects;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
