-- Visibilité produit sur les sections de l'accueil (admin checkboxes)
alter table public.products
  add column if not exists home_visibility jsonb not null default '{}'::jsonb;

comment on column public.products.home_visibility is
  'Sections accueil : flash, best_seller, new_arrivals, skincare, parfums, makeup, self_care_rituals';

-- Rétrocompat : migrer les tags promo existants
update public.products
set home_visibility = coalesce(home_visibility, '{}'::jsonb)
  || jsonb_strip_nulls(jsonb_build_object(
    'flash', case when tag = 'Flash' then true end,
    'best_seller', case when tag = 'Best-seller' then true end,
    'new_arrivals', case when tag = 'Nouveau' then true end
  ))
where tag in ('Flash', 'Best-seller', 'Nouveau');
