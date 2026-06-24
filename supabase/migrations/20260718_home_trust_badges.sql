-- Bandeau confiance accueil : badges éditables dans App Builder (subtitle + icônes eyebrow)

update public.home_sections
set
  subtitle = 'Livraison 48h offerte|Vegan & cruelty-free|Formulé en France|+12 000 avis 4.9/5',
  eyebrow = 'truck|sparkle|heart|star'
where page_slug = 'home'
  and id = 'trust-1'
  and type = 'trust'
  and coalesce(subtitle, '') = '';
