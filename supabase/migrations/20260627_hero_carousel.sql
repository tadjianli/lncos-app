-- Hero carousel administrable (accueil, max 3 slides)

create table if not exists public.hero_carousel_settings (
  id                  text primary key default 'home',
  enabled             boolean not null default true,
  autoplay            boolean not null default true,
  interval_seconds    numeric(4,1) not null default 5
    check (interval_seconds >= 2 and interval_seconds <= 60),
  show_indicators     boolean not null default true,
  show_arrows         boolean not null default true,
  updated_at          timestamptz not null default now()
);

insert into public.hero_carousel_settings (id)
values ('home')
on conflict (id) do nothing;

create table if not exists public.hero_carousel_slides (
  id            uuid primary key default gen_random_uuid(),
  position      smallint not null check (position between 1 and 3),
  image_url     text,
  image_alt     text not null default '',
  title         text not null default '',
  subtitle      text not null default '',
  button_text   text not null default '',
  button_link   text not null default '',
  active        boolean not null default false,
  updated_at    timestamptz not null default now(),
  unique (position)
);

-- Seed 3 slide slots
insert into public.hero_carousel_slides (position, active)
values (1, false), (2, false), (3, false)
on conflict (position) do nothing;

-- Migrate existing home hero section into slide 1 when empty
update public.hero_carousel_slides s
set
  title = trim(both from coalesce(h.title, '') || ' ' || coalesce(h.title_accent, '')),
  subtitle = coalesce(h.eyebrow, ''),
  button_text = coalesce(h.cta, ''),
  button_link = '/boutique',
  image_url = h.img,
  image_alt = coalesce(h.title, 'LN COS'),
  active = coalesce(h.enabled, false) and h.img is not null and h.img <> ''
from public.home_sections h
where s.position = 1
  and h.id = 'hero-1'
  and h.page_slug = 'home'
  and h.is_draft = false
  and (s.title = '' or s.title is null)
  and (s.image_url is null or s.image_url = '');

alter table public.hero_carousel_settings enable row level security;
alter table public.hero_carousel_slides enable row level security;

create policy "Hero carousel settings public read"
  on public.hero_carousel_settings for select using (true);

create policy "Admins manage hero carousel settings"
  on public.hero_carousel_settings for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Hero carousel slides public read"
  on public.hero_carousel_slides for select using (true);

create policy "Admins manage hero carousel slides"
  on public.hero_carousel_slides for all
  using (public.is_admin()) with check (public.is_admin());

create trigger trg_hero_carousel_settings_updated_at
  before update on public.hero_carousel_settings
  for each row execute procedure public.set_updated_at();

create trigger trg_hero_carousel_slides_updated_at
  before update on public.hero_carousel_slides
  for each row execute procedure public.set_updated_at();
