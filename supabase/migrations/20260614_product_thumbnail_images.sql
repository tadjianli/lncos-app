-- LN COS — Miniatures produit (vignettes boutique, séparées de la galerie fiche)

alter table public.products
  add column if not exists thumbnail_images text[] not null default '{}';
