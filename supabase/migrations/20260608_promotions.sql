-- Add promo fields to orders (safe: idempotent via IF NOT EXISTS)
alter table public.orders
  add column if not exists discount   numeric(10,2) not null default 0,
  add column if not exists promo_code text          null;

-- promotions table
create table if not exists public.promotions (
  id            uuid        primary key default gen_random_uuid(),
  code          text        not null unique,
  description   text        not null default '',
  type          text        not null default 'percentage' check (type in ('percentage', 'fixed', 'shipping')),
  value         numeric(10,2) not null default 0,
  is_active     boolean     not null default true,
  expires_at    timestamptz null,
  max_uses      integer     null,
  current_uses  integer     not null default 0,
  free_shipping boolean     not null default false,
  minimum_order numeric(10,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table public.promotions enable row level security;

-- Public can read active promos (needed for validatePromoCode in browser)
create policy "public read active promotions"
  on public.promotions for select
  using (is_active = true);

-- Admins can read all (including inactive)
create policy "admin read all promotions"
  on public.promotions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can insert / update / delete
create policy "admin write promotions"
  on public.promotions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- RPC to safely increment current_uses (called server-side after order creation)
create or replace function public.increment_promo_uses(promo_code_arg text)
returns void
language sql
security definer
as $$
  update public.promotions
  set current_uses = current_uses + 1
  where code = upper(trim(promo_code_arg));
$$;

-- Seed: LNBV fixed 4.99€
insert into public.promotions (code, description, type, value, is_active, free_shipping, minimum_order)
values
  ('LNBV', 'Réduction bienvenue LN COS', 'fixed', 4.99, true, false, 0)
on conflict (code) do nothing;
