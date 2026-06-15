-- Suppression du module Vidéos Beauté (contenu désormais via le blog)

drop function if exists public.increment_beauty_video_views(uuid);

drop table if exists public.beauty_videos cascade;

-- Retirer la section reels / vidéos de l'App Builder si encore présente
update public.home_sections
set enabled = false
where type in ('reels', 'beauty_videos', 'videos');

delete from public.home_sections
where type in ('reels', 'beauty_videos', 'videos');
