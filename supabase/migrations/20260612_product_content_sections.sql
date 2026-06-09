-- LN COS — Sections éditoriales produit (conseils, toggles, sections extra)

alter table public.products
  add column if not exists usage_tips text[] not null default '{}',
  add column if not exists section_toggles jsonb not null default '{"description":true,"usageTips":true,"ingredients":true}'::jsonb,
  add column if not exists extra_sections jsonb not null default '[]'::jsonb;
