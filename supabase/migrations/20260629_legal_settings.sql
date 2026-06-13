-- Paramètres légaux (singleton) — hébergement mentions légales, etc.

create table if not exists public.legal_settings (
  id            text primary key default 'default',
  hosting_info  text not null default '',
  updated_at    timestamptz not null default now()
);

insert into public.legal_settings (id) values ('default')
on conflict (id) do nothing;

alter table public.legal_settings enable row level security;

create policy "Legal settings public read"
  on public.legal_settings for select using (true);

create policy "Admins manage legal settings"
  on public.legal_settings for all using (public.is_admin());

create trigger trg_legal_settings_updated_at
  before update on public.legal_settings
  for each row execute procedure public.set_updated_at();
