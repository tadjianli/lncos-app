-- shipping_methods table
create table if not exists public.shipping_methods (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  description   text        not null default '',
  price         numeric(10,2) not null default 0,
  estimated_days text       not null default '',
  icon          text        not null default 'truck',
  is_active     boolean     not null default true,
  is_free       boolean     not null default false,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.shipping_methods enable row level security;

-- Public read (checkout needs active methods without auth)
create policy "public read active shipping methods"
  on public.shipping_methods for select
  using (is_active = true);

-- Admins can read all (including inactive)
create policy "admin read all shipping methods"
  on public.shipping_methods for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can insert / update / delete
create policy "admin write shipping methods"
  on public.shipping_methods for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Seed default methods
insert into public.shipping_methods (name, description, price, estimated_days, icon, is_active, is_free, sort_order)
values
  ('Standard',     '3-5 jours ouvrés',       0.00, '3-5 jours', 'truck', true,  true,  0),
  ('Express',      '24-48h · suivi inclus',   6.90, '24-48h',    'flame', true,  false, 1),
  ('Point relais', 'à proximité · 3-4 jours', 2.90, '3-4 jours', 'pin',   true,  false, 2)
on conflict do nothing;
