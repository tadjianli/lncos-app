-- RDV page settings (singleton) + Stripe session on appointments

alter table public.appointments
  add column if not exists stripe_session_id text unique;

create table if not exists public.rdv_settings (
  id                  text primary key default 'default',
  hero_eyebrow        text not null default 'Institut onglerie',
  hero_title          text not null default 'Réservez votre moment beauté',
  hero_subtitle       text not null default 'En moins de 60 secondes, sans appel.',
  cta_label           text not null default 'Prendre rendez-vous',
  trust_1_icon        text not null default 'clock',
  trust_1_text        text not null default 'Dispo. temps réel',
  trust_2_icon        text not null default 'bell',
  trust_2_text        text not null default 'Rappel auto.',
  trust_3_icon        text not null default 'star',
  trust_3_text        text not null default '+ points VIP',
  confirm_title       text not null default 'Rendez-vous confirmé ✨',
  confirm_reminder    text not null default 'Un rappel vous sera envoyé 24h avant.',
  location_name       text not null default 'Institut LN COS',
  deposit_enabled     boolean not null default false,
  deposit_type        text not null default 'percent'
    check (deposit_type in ('percent', 'fixed')),
  deposit_value       numeric(10,2) not null default 30,
  deposit_label       text not null default 'Acompte à régler maintenant',
  deposit_min_amount  numeric(10,2) not null default 0,
  updated_at          timestamptz not null default now()
);

insert into public.rdv_settings (id) values ('default')
on conflict (id) do nothing;

alter table public.rdv_settings enable row level security;

create policy "RDV settings public read"
  on public.rdv_settings for select using (true);

create policy "Admins manage RDV settings"
  on public.rdv_settings for all using (public.is_admin());

create trigger trg_rdv_settings_updated_at
  before update on public.rdv_settings
  for each row execute procedure public.set_updated_at();
