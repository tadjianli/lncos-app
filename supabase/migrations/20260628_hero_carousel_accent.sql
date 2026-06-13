-- Accent titre (style italique doré) par slide carousel

alter table public.hero_carousel_slides
  add column if not exists title_accent text not null default '';

-- Slide 1 : séparer titre / accent si tout est dans title
update public.hero_carousel_slides
set
  title = 'Révélez votre',
  title_accent = 'éclat',
  subtitle = coalesce(nullif(subtitle, ''), 'Nouvelle collection')
where position = 1
  and title ilike '%éclat%'
  and (title_accent = '' or title_accent is null);
