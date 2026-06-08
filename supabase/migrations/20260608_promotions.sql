-- Add promo fields to orders
alter table public.orders
  add column if not exists discount   numeric(10,2) not null default 0,
  add column if not exists promo_code text          null;

-- Promotions table
create table public.promotions (
  id            uuid          primary key default gen_random_uuid(),
  code          text          not null unique,
  description   text          not null default '',
  type          text          not null default 'percentage'
                              check (type in ('percentage', 'fixed', 'shipping')),
  value         numeric(10,2) not null default 0,
  is_active     boolean       not null default true,
  expires_at    timestamptz   null,
  max_uses      integer       null,
  current_uses  integer       not null default 0,
  free_shipping boolean       not null default false,
  minimum_order numeric(10,2) not null default 0,
  created_at    timestamptz   not null default now()
);

alter table public.promotions enable row level security;

create policy "public read active promotions"
  on public.promotions for select
  using (is_active = true);

create policy "admin read all promotions"
  on public.promotions for select
  using (public.is_admin());

create policy "admin insert promotions"
  on public.promotions for insert
  with check (public.is_admin());

create policy "admin update promotions"
  on public.promotions for update
  using (public.is_admin());

create policy "admin delete promotions"
  on public.promotions for delete
  using (public.is_admin());

create or replace function public.increment_promo_uses(promo_code_arg text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.promotions
  set current_uses = current_uses + 1
  where code = upper(trim(promo_code_arg));
$$;

insert into public.promotions (code, description, type, value, is_active, free_shipping, minimum_order)
values ('LNBV', 'Réduction bienvenue LN COS', 'fixed', 4.99, true, false, 0)
on conflict (code) do nothing;
