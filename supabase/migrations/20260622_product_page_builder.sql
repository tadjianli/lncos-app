-- LN COS — Product Page Builder (layout global fiche produit)

create table if not exists public.product_page_layout_meta (
  id                 text primary key default 'default',
  published_version  integer not null default 1,
  updated_at         timestamptz not null default now()
);

insert into public.product_page_layout_meta (id) values ('default')
on conflict (id) do nothing;

create table if not exists public.product_page_blocks (
  id          text not null,
  block_type  text not null,
  title       text not null,
  settings    jsonb not null default '{}'::jsonb,
  enabled     boolean not null default true,
  zone        text not null default 'main' check (zone in ('main', 'sticky')),
  position    integer not null default 0,
  is_draft    boolean not null default false,
  primary key (id, is_draft)
);

create index if not exists idx_product_page_blocks_draft
  on public.product_page_blocks (is_draft, zone, position);

create table if not exists public.product_page_layout_versions (
  id              uuid primary key default gen_random_uuid(),
  version_number  integer not null,
  blocks          jsonb not null,
  change_note     text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_product_page_layout_versions_num
  on public.product_page_layout_versions (version_number desc);

alter table public.product_page_layout_meta enable row level security;
alter table public.product_page_blocks enable row level security;
alter table public.product_page_layout_versions enable row level security;

create policy "Product page layout meta public read"
  on public.product_page_layout_meta for select using (true);

create policy "Admins manage product page layout meta"
  on public.product_page_layout_meta for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Product page blocks public read"
  on public.product_page_blocks for select using (true);

create policy "Admins manage product page blocks"
  on public.product_page_blocks for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Product page layout versions admin read"
  on public.product_page_layout_versions for select
  using (public.is_admin());

create policy "Admins insert product page layout versions"
  on public.product_page_layout_versions for insert
  with check (public.is_admin());

create trigger trg_product_page_layout_meta_updated_at
  before update on public.product_page_layout_meta
  for each row execute procedure public.set_updated_at();

-- Blocs publiés par défaut (ordre actuel fiche produit LN COS)
insert into public.product_page_blocks (id, block_type, title, settings, enabled, zone, position, is_draft)
values
  ('ppb-gallery', 'gallery', 'Galerie images', '{"showTag":true}', true, 'main', 0, false),
  ('ppb-info', 'product_info', 'Informations produit', '{"showBestSeller":true,"showCategory":true,"showStock":true}', true, 'main', 1, false),
  ('ppb-stock-alert', 'stock_alert', 'Alerte stock', '{}', true, 'main', 2, false),
  ('ppb-reviews-summary', 'reviews_summary', 'Résumé avis', '{}', true, 'main', 3, false),
  ('ppb-reference', 'reference', 'Référence SKU', '{}', true, 'main', 4, false),
  ('ppb-live-viewers', 'live_viewers', 'Visiteurs en direct', '{}', true, 'main', 5, false),
  ('ppb-variants', 'variants', 'Variantes', '{}', true, 'main', 6, false),
  ('ppb-quantity', 'quantity', 'Quantité', '{"label":"Quantité"}', true, 'main', 7, false),
  ('ppb-benefits', 'benefits', 'Bénéfices clés', '{}', true, 'main', 8, false),
  ('ppb-description', 'description', 'Description', '{}', true, 'main', 9, false),
  ('ppb-usage-tips', 'usage_tips', 'Conseils d''utilisation', '{}', true, 'main', 10, false),
  ('ppb-video', 'video', 'Vidéo produit', '{"autoplay":false}', true, 'main', 11, false),
  ('ppb-faq', 'faq', 'FAQ', '{"items":[]}', true, 'main', 12, false),
  ('ppb-routine', 'routine', 'Routine beauté', '{"title":"Complétez votre rituel"}', true, 'main', 13, false),
  ('ppb-before-after', 'before_after', 'Avant / Après', '{}', true, 'main', 14, false),
  ('ppb-reviews', 'reviews', 'Avis clients', '{"title":"Avis clients"}', true, 'main', 15, false),
  ('ppb-recommendations', 'recommendations', 'Vous aimerez aussi', '{"title":"Vous aimerez aussi","maxItems":8}', true, 'main', 16, false),
  ('ppb-sales-counter', 'sales_counter', 'Compteur ventes', '{}', true, 'sticky', 0, false),
  ('ppb-add-to-cart', 'add_to_cart', 'Ajouter au panier', '{"showPrice":true}', true, 'sticky', 1, false),
  ('ppb-trust', 'trust_badges', 'Réassurance', '{}', true, 'sticky', 2, false)
on conflict (id, is_draft) do nothing;
