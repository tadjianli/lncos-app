-- Pages contenu : Ventes Flash, Blog, Réseaux sociaux

-- ── Ventes Flash (singleton) ────────────────────────────────────────────────
create table if not exists public.flash_sales_settings (
  id                      text primary key default 'default',
  page_enabled            boolean not null default true,
  banner_eyebrow          text not null default 'Offres limitées',
  banner_title            text not null default 'Ventes Flash LN COS',
  banner_subtitle_template text not null default '{{count}} promotion(s) en cours — prix exclusifs, stocks limités.',
  countdown_label         text not null default 'Se termine dans',
  empty_eyebrow           text not null default '🔥 Ventes Flash LN COS',
  empty_title             text not null default 'Aucune vente flash disponible',
  empty_body              text not null default 'Aucune vente flash n''est disponible pour le moment. De nouvelles offres exclusives arrivent bientôt.',
  empty_cta_label         text not null default 'Découvrir nos produits',
  empty_cta_href          text not null default '/discover',
  updated_at              timestamptz not null default now()
);

insert into public.flash_sales_settings (id) values ('default')
on conflict (id) do nothing;

-- ── Blog page (singleton) ───────────────────────────────────────────────────
create table if not exists public.blog_page_settings (
  id                      text primary key default 'default',
  hero_eyebrow            text not null default 'Magazine beauté',
  hero_title              text not null default 'Blog LN COS',
  hero_subtitle           text not null default 'Conseils beauté, tutoriels, astuces skincare, tendances et nouveautés — curated by LN COS.',
  articles_section_title  text not null default 'Derniers articles',
  articles_section_hint   text not null default '',
  updated_at              timestamptz not null default now()
);

insert into public.blog_page_settings (id) values ('default')
on conflict (id) do nothing;

-- ── Blog categories ─────────────────────────────────────────────────────────
create table if not exists public.blog_categories (
  id          text primary key,
  label       text not null,
  description text not null default '',
  icon        text not null default 'sparkle',
  position    int not null default 0,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into public.blog_categories (id, label, description, icon, position) values
  ('conseils', 'Conseils beauté', 'Rituels, gestes pro et inspiration au quotidien.', 'sparkle', 0),
  ('tutoriels', 'Tutoriels', 'Pas à pas maquillage, onglerie et soins.', 'play', 1),
  ('skincare', 'Astuces skincare', 'Peau éclatante, routines adaptées à chaque besoin.', 'heart', 2),
  ('tendances', 'Tendances', 'Ce qui fait vibrer la beauté cette saison.', 'flame', 3),
  ('nouveautes', 'Nouveautés LN COS', 'Lancements, coulisses et exclusivités maison.', 'star', 4)
on conflict (id) do nothing;

-- ── Blog articles ───────────────────────────────────────────────────────────
create table if not exists public.blog_articles (
  id            text primary key,
  slug          text not null unique,
  title         text not null,
  excerpt       text not null default '',
  category_id   text not null references public.blog_categories(id) on delete restrict,
  published_at  date not null default current_date,
  read_minutes  int not null default 5,
  featured      boolean not null default false,
  cover_url     text,
  published     boolean not null default false,
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists blog_articles_category_idx on public.blog_articles (category_id);
create index if not exists blog_articles_published_idx on public.blog_articles (published, published_at desc);

insert into public.blog_articles (id, slug, title, excerpt, category_id, published_at, read_minutes, featured, published, position) values
  ('blog-1', 'rituel-eclat-matin', 'Le rituel éclat du matin en 5 minutes', 'Réveillez votre peau avec des gestes simples et des textures LN COS pensées pour un glow naturel.', 'conseils', '2026-06-01', 4, true, true, 0),
  ('blog-2', 'erreurs-skincare-eviter', '5 erreurs skincare à éviter absolument', 'Sur-nettoyage, sur-exfoliation… Les pièges qui sabotent votre routine et comment les corriger.', 'skincare', '2026-05-28', 6, true, true, 1),
  ('blog-3', 'manucure-french-parfaite', 'Tutoriel : la French manucure parfaite', 'De la préparation de l''ongle au fini ultra net — la technique institut à reproduire chez vous.', 'tutoriels', '2026-05-25', 8, false, true, 2),
  ('blog-4', 'tendance-glow-skin', 'Tendance 2026 : le glow skin minimaliste', 'Peau lumineuse, maquillage léger — la direction beauté que LN COS adopte cette année.', 'tendances', '2026-05-20', 5, false, true, 3),
  ('blog-5', 'lancement-serum-or', 'Nouveau : Sérum Or 24K — édition limitée', 'Découvrez notre dernière innovation anti-âge, enrichie en particules d''or et actifs botaniques.', 'nouveautes', '2026-06-08', 3, true, true, 4),
  ('blog-6', 'hydratation-peaux-seches', 'Astuce : booster l''hydratation des peaux sèches', 'Layering, textures et moment d''application — nos recommandations expertes.', 'skincare', '2026-05-15', 5, false, true, 5)
on conflict (id) do nothing;

-- ── Social page (singleton) ───────────────────────────────────────────────────
create table if not exists public.social_page_settings (
  id            text primary key default 'default',
  hero_eyebrow  text not null default 'Communauté LN COS',
  hero_title    text not null default 'Réseaux sociaux',
  hero_subtitle text not null default 'Suivez LN COS au quotidien — inspiration beauté, coulisses, tutoriels et lancements en exclusivité.',
  footnote      text not null default 'Statistiques et dernières publications affichées automatiquement dès la connexion admin.',
  updated_at    timestamptz not null default now()
);

insert into public.social_page_settings (id) values ('default')
on conflict (id) do nothing;

-- ── Social network links ──────────────────────────────────────────────────────
create table if not exists public.social_network_links (
  id           text primary key,
  name         text not null,
  handle       text not null default '',
  url          text not null,
  accent       text not null default '#D4AF37',
  followers    int,
  latest_post  text,
  latest_video text,
  position     int not null default 0,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

insert into public.social_network_links (id, name, handle, url, accent, position) values
  ('instagram', 'Instagram', '@lncos', 'https://www.instagram.com/lncos/', '#E1306C', 0),
  ('tiktok', 'TikTok', '@lncos', 'https://www.tiktok.com/@lncos', '#69C9D0', 1),
  ('facebook', 'Facebook', 'LN COS', 'https://www.facebook.com/lncos', '#1877F2', 2),
  ('youtube', 'YouTube', '@lncos', 'https://www.youtube.com/@lncos', '#FF0000', 3),
  ('pinterest', 'Pinterest', 'lncos', 'https://www.pinterest.fr/lncos/', '#E60023', 4)
on conflict (id) do nothing;

-- ── Sections par défaut (flash-sales, blog, social) ───────────────────────────
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, source, position, is_draft)
values
  ('flash-sales', 'hero-flash', 'hero', 'En-tête ventes flash', true, 'default', 'Ventes Flash LN COS', 'Prix exclusifs, stocks limités', 'Offres limitées', null, 0, false),
  ('flash-sales', 'products-flash', 'products', 'Produits flash', true, 'grid', 'En promotion', null, null, 'flash', 1, false),
  ('blog', 'hero-blog', 'hero', 'En-tête blog', true, 'default', 'Blog LN COS', 'Magazine beauté LN COS', 'Magazine beauté', null, 0, false),
  ('blog', 'quote-blog', 'quote', 'Citation blog', false, 'default', 'La beauté commence par le soin de soi.', null, null, null, 1, false),
  ('social', 'hero-social', 'hero', 'En-tête réseaux', true, 'default', 'Réseaux sociaux', 'Communauté LN COS', 'Communauté LN COS', null, 0, false),
  ('social', 'cta-social', 'cta', 'CTA réseaux', false, 'default', 'Rejoignez-nous', null, null, null, 1, false)
on conflict (page_slug, id, is_draft) do nothing;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.flash_sales_settings enable row level security;
alter table public.blog_page_settings enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_articles enable row level security;
alter table public.social_page_settings enable row level security;
alter table public.social_network_links enable row level security;

create policy "Flash settings public read" on public.flash_sales_settings for select using (true);
create policy "Admins manage flash settings" on public.flash_sales_settings for all using (public.is_admin());

create policy "Blog page public read" on public.blog_page_settings for select using (true);
create policy "Admins manage blog page" on public.blog_page_settings for all using (public.is_admin());

create policy "Blog categories public read" on public.blog_categories for select using (enabled = true);
create policy "Admins manage blog categories" on public.blog_categories for all using (public.is_admin());

create policy "Blog articles public read" on public.blog_articles for select using (published = true);
create policy "Admins manage blog articles" on public.blog_articles for all using (public.is_admin());

create policy "Social page public read" on public.social_page_settings for select using (true);
create policy "Admins manage social page" on public.social_page_settings for all using (public.is_admin());

create policy "Social links public read" on public.social_network_links for select using (enabled = true);
create policy "Admins manage social links" on public.social_network_links for all using (public.is_admin());

-- ── Triggers updated_at ───────────────────────────────────────────────────────
create trigger trg_flash_sales_settings_updated_at
  before update on public.flash_sales_settings
  for each row execute procedure public.set_updated_at();

create trigger trg_blog_page_settings_updated_at
  before update on public.blog_page_settings
  for each row execute procedure public.set_updated_at();

create trigger trg_blog_categories_updated_at
  before update on public.blog_categories
  for each row execute procedure public.set_updated_at();

create trigger trg_blog_articles_updated_at
  before update on public.blog_articles
  for each row execute procedure public.set_updated_at();

create trigger trg_social_page_settings_updated_at
  before update on public.social_page_settings
  for each row execute procedure public.set_updated_at();

create trigger trg_social_network_links_updated_at
  before update on public.social_network_links
  for each row execute procedure public.set_updated_at();
