-- SEO IA — mots-clés secondaires et description courte

alter table public.products
  add column if not exists seo_secondary_keywords text[] not null default '{}',
  add column if not exists seo_excerpt text;

comment on column public.products.seo_secondary_keywords is 'Mots-clés SEO secondaires (générateur IA)';
comment on column public.products.seo_excerpt is 'Description courte SEO (extrait fiche produit)';
