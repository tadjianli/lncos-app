-- Zones de livraison commerçant (SEO + paramètres boutique)

alter table public.legal_settings
  add column if not exists delivery_reunion boolean not null default true,
  add column if not exists delivery_france boolean not null default false,
  add column if not exists delivery_europe boolean not null default false,
  add column if not exists delivery_international boolean not null default false;

comment on column public.legal_settings.delivery_reunion is 'Zone livraison : La Réunion';
comment on column public.legal_settings.delivery_france is 'Zone livraison : France métropolitaine';
comment on column public.legal_settings.delivery_europe is 'Zone livraison : Europe';
comment on column public.legal_settings.delivery_international is 'Zone livraison : International';
