-- Champs SEO produits et catégories (sans API externe)

alter table public.products
  add column if not exists seo_keyword text,
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists seo_slug text,
  add column if not exists image_alt text;

create unique index if not exists products_seo_slug_unique
  on public.products (seo_slug)
  where seo_slug is not null and seo_slug <> '';

alter table public.categories
  add column if not exists seo_keyword text,
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists seo_slug text,
  add column if not exists image_alt text;

create unique index if not exists categories_seo_slug_unique
  on public.categories (seo_slug)
  where seo_slug is not null and seo_slug <> '';

-- Slugs SEO par défaut = id existant
update public.products
set seo_slug = id
where seo_slug is null or seo_slug = '';

update public.categories
set seo_slug = id
where seo_slug is null or seo_slug = '';
