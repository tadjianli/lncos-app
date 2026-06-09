-- Multi-page section editor: page_slug on home_sections

alter table public.home_sections
  add column if not exists page_slug text not null default 'home';

alter table public.home_sections drop constraint if exists home_sections_pkey;
alter table public.home_sections add primary key (page_slug, id, is_draft);

create index if not exists idx_home_sections_page
  on public.home_sections (page_slug, is_draft, position);

-- Boutique (published)
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, source, position, is_draft)
values
  ('boutique', 'hero-boutique', 'hero', 'En-tête boutique', true, 'default', 'Boutique', 'Du plus récent au plus ancien', 'LN COS', null, 0, false),
  ('boutique', 'products-all', 'products', 'Catalogue produits', true, 'grid', 'Tous les produits', null, null, 'all', 1, false)
on conflict (page_slug, id, is_draft) do nothing;

-- Découvrir (published)
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, position, is_draft)
values
  ('discover', 'hero-discover', 'hero', 'En-tête découverte', true, 'default', 'Découvrez', 'Explorez nos univers beauté', 'Boutique LN COS', 0, false),
  ('discover', 'categories-1', 'categories', 'Grille catégories', true, 'grid', 'Catégories', null, null, 1, false)
on conflict (page_slug, id, is_draft) do nothing;

-- RDV (published)
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, cta, position, is_draft)
values
  ('rdv', 'hero-rdv', 'hero', 'Hero RDV', true, 'default', 'Réservez votre moment beauté', 'En moins de 60 secondes, sans appel.', 'Institut onglerie', null, 0, false),
  ('rdv', 'trust-rdv', 'trust', 'Bandeau confiance RDV', true, 'pills', 'Confiance', 'Dispo. temps réel|Rappel auto.|+ points VIP', null, null, 1, false),
  ('rdv', 'cta-rdv', 'cta', 'Bouton réservation', true, 'default', 'Prendre rendez-vous', null, null, 'Prendre rendez-vous', 2, false)
on conflict (page_slug, id, is_draft) do nothing;

-- Profil (published)
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, position, is_draft)
values
  ('profile', 'hero-profile', 'hero', 'En-tête profil', true, 'default', 'Mon espace', 'Compte, commandes et fidélité', 'LN COS', 0, false),
  ('profile', 'newsletter-profile', 'newsletter', 'Club beauté', true, 'default', 'Rejoignez le Club LN COS', 'Offres exclusives et conseils personnalisés.', 'Club VIP', 1, false)
on conflict (page_slug, id, is_draft) do nothing;
