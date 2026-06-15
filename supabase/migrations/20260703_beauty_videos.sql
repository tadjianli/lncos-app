-- LN COS — Vidéos Beauté (TikTok / Reels / Shorts)

create table if not exists public.beauty_videos (
  id                   text primary key,
  slug                 text not null unique,
  title                text not null,
  description          text not null default '',
  thumbnail_url        text,
  video_type           text not null default 'hosted'
    check (video_type in ('hosted', 'tiktok', 'instagram_reel', 'youtube_short')),
  video_url            text not null default '',
  category             text not null default 'routine'
    check (category in (
      'routine', 'tutoriel', 'avant_apres', 'unboxing', 'astuce',
      'nouveaute', 'maquillage', 'skincare'
    )),
  published            boolean not null default false,
  featured             boolean not null default false,
  views                int not null default 0,
  likes                int not null default 0,
  related_product_ids  text[] not null default '{}',
  published_at         date not null default current_date,
  position             int not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists beauty_videos_slug_idx on public.beauty_videos (slug);
create index if not exists beauty_videos_published_idx on public.beauty_videos (published, published_at desc);
create index if not exists beauty_videos_category_idx on public.beauty_videos (category);
create index if not exists beauty_videos_featured_idx on public.beauty_videos (featured) where featured = true;

alter table public.beauty_videos enable row level security;

create policy "Beauty videos public read"
  on public.beauty_videos for select
  using (published = true);

create policy "Admins manage beauty videos"
  on public.beauty_videos for all
  using (public.is_admin());

create or replace function public.increment_beauty_video_views(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.beauty_videos
  set views = views + 1, updated_at = now()
  where id = p_id and published = true;
end;
$$;

grant execute on function public.increment_beauty_video_views(text) to anon, authenticated;

-- Accueil : renommer la section reels
update public.home_sections
set
  title = '🎥 Vidéos Beauté',
  subtitle = 'Découvrez nos conseils, démonstrations, nouveautés, routines et astuces beauté en vidéo.',
  cta = 'Tout voir'
where page_slug = 'home' and id = 'reels-1';

-- Données de démonstration
insert into public.beauty_videos (
  id, slug, title, description, thumbnail_url, video_type, video_url,
  category, published, featured, views, likes, related_product_ids, published_at, position
) values
(
  'bv-1',
  'routine-glow-du-matin',
  'Routine glow du matin ✨',
  'Réveillez votre peau en quelques minutes avec notre routine express LN COS : nettoyage, hydratation et finition glow.',
  null,
  'hosted',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'routine',
  true,
  true,
  12400,
  2100,
  ARRAY(
    SELECT id FROM public.products
    WHERE name ILIKE '%cils%magn%'
    ORDER BY name
    LIMIT 1
  ),
  current_date - 3,
  0
),
(
  'bv-2',
  'secret-teint-frais',
  'Le secret d''un teint frais',
  'Nos astuces pro pour un teint lumineux toute la journée — produits LN COS et gestes simples à reproduire chez vous.',
  null,
  'youtube_short',
  'https://www.youtube.com/shorts/9xwazD5SyVg',
  'astuce',
  true,
  false,
  8900,
  1400,
  ARRAY(
    SELECT id FROM public.products
    WHERE name ILIKE '%palette%'
    ORDER BY name
    LIMIT 1
  ),
  current_date - 5,
  1
),
(
  'bv-3',
  'unboxing-nouveautes-lncos',
  'Unboxing nouveautés LN COS',
  'Découvrez en exclusivité nos dernières nouveautés maison — unboxing premium et premières impressions.',
  null,
  'hosted',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'unboxing',
  true,
  true,
  21700,
  5300,
  ARRAY(
    SELECT id FROM public.products
    WHERE active = true
      AND (main_image_url is not null OR image_url is not null)
    ORDER BY rating desc nulls last, reviews desc nulls last
    LIMIT 1
  ),
  current_date - 1,
  2
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  video_type = excluded.video_type,
  video_url = excluded.video_url,
  category = excluded.category,
  published = excluded.published,
  featured = excluded.featured,
  views = excluded.views,
  likes = excluded.likes,
  related_product_ids = excluded.related_product_ids,
  published_at = excluded.published_at,
  position = excluded.position,
  updated_at = now();
