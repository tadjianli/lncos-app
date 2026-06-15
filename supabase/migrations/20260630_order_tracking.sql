-- Suivi colis : transporteur et URL de suivi transporteur
alter table public.orders
  add column if not exists carrier text,
  add column if not exists tracking_url text;

comment on column public.orders.carrier is 'Transporteur (colissimo, chronopost, … ou libre)';
comment on column public.orders.tracking_url is 'URL de suivi chez le transporteur (prioritaire sur le template auto)';
