-- Retirer la section « Vidéos Beauté » (reels) de l'accueil App Builder
delete from public.home_sections
where type = 'reels' or id = 'reels-1';
