-- Réglages compte à rebours ventes flash (admin Pages contenu)
alter table public.flash_sales_settings
  add column if not exists countdown jsonb not null default '{
    "enabled": true,
    "mode": "duration",
    "hours": 4,
    "minutes": 12,
    "seconds": 34,
    "end_at": null,
    "on_expire": "reset"
  }'::jsonb;

comment on column public.flash_sales_settings.countdown is
  'Compte à rebours : enabled, mode (duration|end_at), hours, minutes, seconds, end_at, on_expire';
