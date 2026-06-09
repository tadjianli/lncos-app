-- LN COS — Engagements produit (badges icônes configurables)

alter table public.products
  add column if not exists commitments jsonb not null default '[]'::jsonb;
