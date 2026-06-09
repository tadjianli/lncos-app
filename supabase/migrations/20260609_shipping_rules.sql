-- Règles de livraison avancées (seuils gratuité, min/max commande)

alter table public.shipping_methods
  add column if not exists free_shipping_enabled boolean not null default false,
  add column if not exists free_shipping_threshold numeric(10,2),
  add column if not exists minimum_order_enabled boolean not null default false,
  add column if not exists minimum_order_amount numeric(10,2),
  add column if not exists maximum_order_enabled boolean not null default false,
  add column if not exists maximum_order_amount numeric(10,2);

comment on column public.shipping_methods.free_shipping_enabled is 'Livraison offerte à partir du seuil si panier >= threshold';
comment on column public.shipping_methods.minimum_order_enabled is 'Masquer la méthode si panier < minimum_order_amount';
comment on column public.shipping_methods.maximum_order_enabled is 'Masquer la méthode si panier > maximum_order_amount';

-- Exemple : Standard payant avec offre dès 50 €
update public.shipping_methods
set
  is_free = false,
  price = 4.90,
  free_shipping_enabled = true,
  free_shipping_threshold = 50.00
where name = 'Standard';
