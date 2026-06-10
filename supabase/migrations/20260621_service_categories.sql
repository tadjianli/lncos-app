-- Catégories de prestations RDV + liaison services.category_id

create table if not exists public.service_categories (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  icon        text not null default 'scissors',
  color       text not null default '#D4AF37',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.service_categories enable row level security;

drop policy if exists "Service categories publicly readable" on public.service_categories;
create policy "Service categories publicly readable"
  on public.service_categories for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins manage service categories" on public.service_categories;
create policy "Admins manage service categories"
  on public.service_categories for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.set_service_categories_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists service_categories_updated_at on public.service_categories;
create trigger service_categories_updated_at
  before update on public.service_categories
  for each row execute function public.set_service_categories_updated_at();

-- Liaison services → catégories
alter table public.services
  add column if not exists category_id text references public.service_categories(id);

-- Seed catégories par défaut (idempotent)
insert into public.service_categories (id, name, slug, icon, color, sort_order, is_active)
values
  ('manucure',   'Manucure',   'manucure',   'scissors', '#D4AF37', 1, true),
  ('extensions', 'Extensions', 'extensions', 'sparkle',  '#6FA8C9', 2, true)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  icon = excluded.icon,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- Backfill category_id depuis la colonne legacy cat
update public.services s
set category_id = sc.id
from public.service_categories sc
where s.category_id is null
  and (
    s.cat = sc.id
    or s.cat = sc.slug
    or lower(s.cat) = lower(sc.name)
  );

-- Services sans correspondance → première catégorie active
update public.services
set category_id = (
  select id from public.service_categories
  where is_active = true
  order by sort_order
  limit 1
)
where category_id is null;

-- Sync legacy cat pour compatibilité lecture
update public.services s
set cat = sc.slug
from public.service_categories sc
where s.category_id = sc.id
  and (s.cat is distinct from sc.slug);
