-- LN COS — Seed data
-- Migration 002: products, categories, services, staff, extras, availability, popups, home_sections

-- ─── Categories ───────────────────────────────────────────────────────────────
insert into public.categories (id, name, count, position) values
  ('visage',      'Soins visage',       48, 0),
  ('maquillage',  'Maquillage',         72, 1),
  ('parfums',     'Parfums',            26, 2),
  ('corps',       'Corps & bain',       34, 3),
  ('cheveux',     'Cheveux',            29, 4),
  ('accessoires', 'Accessoires',        18, 5),
  ('coffrets',    'Coffrets & cadeaux', 12, 6);

-- ─── Products ─────────────────────────────────────────────────────────────────
insert into public.products (id, name, cat, price, old_price, ml, rating, reviews, tag, stock, variants, desc, ingredients) values
  ('serum-eclat',     'Sérum Éclat Hyaluronique',      'visage',     29.90, 39.90, '30ml',     4.8, 124, 'Best-seller',     50, ARRAY['30ml','50ml','100ml'],  'Un sérum ultra-hydratant qui illumine et revitalise la peau en profondeur.', ARRAY['Acide Hyaluronique','Vitamine C','Niacinamide','Extrait de Rose']),
  ('creme-hydra',     'Crème Hydratante Soyeuse',      'visage',     24.90, null,  '50ml',     4.7,  89, 'Nouveau',         35, ARRAY['50ml','100ml'],         'Crème fondante enrichie en céramides pour une hydratation 24h.',           ARRAY['Céramides','Beurre de Karité','Aloe Vera']),
  ('parfum-noir',     'Parfum Élixir Noir',             'parfums',    49.90, 64.90, '100ml',    4.9, 213, 'Édition limitée', 20, ARRAY['50ml','100ml'],         'Une fragrance boisée et ambrée, sensuelle et mystérieuse.',               ARRAY['Oud','Vanille noire','Fève Tonka','Ambre']),
  ('rouge-mat',       'Rouge à Lèvres Velours',         'maquillage', 18.90, null,  'Teinte',   4.6, 156, 'Best-seller',     60, ARRAY['Rose Nude','Rouge Désir','Prune'], 'Fini mat velouté, tenue longue durée sans dessécher.',          ARRAY['Huile de Jojoba','Vitamine E','Pigments naturels']),
  ('palette-glow',    'Palette Glow Doré',              'maquillage', 34.90, 44.90, '12 teintes',4.8, 98, 'Flash',           25, ARRAY['Warm','Cool'],          '12 teintes nacrées et mates pour un regard intense.',                    ARRAY['Poudres minérales','Mica','Huiles végétales']),
  ('huile-demaq',     'Huile Démaquillante',            'visage',     19.90, null,  '150ml',    4.5,  67, null,              40, ARRAY['150ml'],                'Dissout maquillage et impuretés sans film gras.',                         ARRAY['Huile de Camélia','Vitamine E']),
  ('masque-purifiant','Masque Purifiant Argile Rose',   'visage',     22.90, null,  '75ml',     4.7,  74, 'Nouveau',         25, ARRAY['75ml'],                 'Masque à l''argile rose qui purifie et resserre les pores.',              ARRAY['Argile Rose','Eau de Rose','Zinc']),
  ('brume-corps',     'Brume Parfumée Corps',            'corps',      16.90, 21.90, '200ml',    4.4,  52, 'Flash',           45, ARRAY['200ml','400ml'],        'Brume légère aux notes florales pour un corps subtilement parfumé.',      ARRAY['Eau florale','Glycérine','Huile de Jojoba']),
  ('baume-levres',    'Baume Lèvres Nacré',             'maquillage',  9.90, null,  'Teinte',   4.5,  43, null,              70, ARRAY['Rose Perlé','Corail','Nude'], 'Soin et couleur en un geste, fini nacré ultra-glamour.',            ARRAY['Huile d''argan','Vitamine E','Cire de Carnauba']),
  ('coffret-ritual',  'Coffret Rituel Beauté Luxe',     'coffrets',   79.90,109.90, '4 pcs',    4.9,  31, 'Best-seller',     15, ARRAY['Standard'],             'Un coffret exclusif pour une routine beauté complète.',                  ARRAY['Sérum','Crème','Masque','Brume']);

-- ─── Services ─────────────────────────────────────────────────────────────────
insert into public.services (id, cat, name, price, min, color, pop, active, desc) values
  ('vsp-main',  'manucure',   'Vernis semi-permanent · Mains', 25, 45,  '#D4AF37', true,  true, 'Pose longue tenue, fini brillant jusqu''à 3 semaines.'),
  ('vsp-pieds', 'manucure',   'Vernis semi-permanent · Pieds', 25, 45,  '#C99A4B', false, true, 'Soin des pieds et pose semi-permanente impeccable.'),
  ('formule',   'manucure',   'Formule Mains + Pieds',         45, 90,  '#EFA9C0', true,  true, 'Le duo complet mains et pieds en une séance.'),
  ('gainage',   'manucure',   'Gainage sur ongle naturel',     40, 75,  '#B98AC9', false, true, 'Renforce et protège l''ongle naturel.'),
  ('chablon',   'extensions', 'Extension chablon',             45, 120, '#6FA8C9', true,  true, 'Allongement sur mesure au chablon.'),
  ('capsule',   'extensions', 'Capsule américaine',            35, 105, '#6FC9A0', false, true, 'Longueur instantanée et résistante.');

-- ─── Staff ────────────────────────────────────────────────────────────────────
insert into public.staff (id, name, role, color, rating, reviews, active, specialties, services) values
  ('lea',  'Léa',  'Fondatrice · Nail artist',       '#D4AF37', 4.9, 218, true, ARRAY['Nail art','Extension chablon'], ARRAY['chablon','capsule','gainage','vsp-main']),
  ('ines', 'Inès', 'Spécialiste semi-permanent',     '#EFA9C0', 4.8, 156, true, ARRAY['Semi-permanent','French'],     ARRAY['vsp-main','vsp-pieds','formule','gainage']),
  ('maya', 'Maya', 'Experte extensions',             '#6FA8C9', 4.9, 174, true, ARRAY['Capsules','Gainage'],          ARRAY['capsule','chablon','gainage','vsp-pieds']);

-- ─── Extras ───────────────────────────────────────────────────────────────────
insert into public.extras (id, name, price, min) values
  ('remplissage', 'Remplissage',              25, 60),
  ('depose-gel',  'Dépose gel',               20, 30),
  ('depose-sp',   'Dépose semi-permanent',    10, 20),
  ('baby-french', 'Baby boomer / French',      5, 15),
  ('nailart',     'Nail art déco',             5, 15);

-- ─── Availability ─────────────────────────────────────────────────────────────
insert into public.availability (day, label, closed, open, close) values
  (0, 'Dimanche', true,  '10:00', '19:00'),
  (1, 'Lundi',    true,  '10:00', '19:00'),
  (2, 'Mardi',    false, '10:00', '19:00'),
  (3, 'Mercredi', false, '10:00', '19:00'),
  (4, 'Jeudi',    false, '10:00', '19:00'),
  (5, 'Vendredi', false, '10:00', '19:30'),
  (6, 'Samedi',   false, '09:30', '18:00');

-- ─── Default popup ────────────────────────────────────────────────────────────
insert into public.popups (id, name, enabled, type, layout, eyebrow, title, subtitle, code, cta_label, cta_action, accent, delay_sec, trigger, frequency, pages, stats) values
  ('pop_welcome', 'Bienvenue · -10%', true, 'promo_code', 'centered',
   'Offre de bienvenue', '−10% sur votre première commande',
   'Inscrivez-vous et recevez votre code exclusif.', 'BIENVENUE10',
   'Copier le code', 'copy', '#D4AF37', 7, 'delay',
   '{"mode":"once","days":7}', '{home}',
   '{"views":0,"closes":0,"clicks":0,"copies":0,"conversions":0,"daily":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]}');

-- ─── Home sections (published) ────────────────────────────────────────────────
insert into public.home_sections (id, type, name, enabled, variant, title, subtitle, eyebrow, title_accent, cta, source, img, device, audience, position, is_draft) values
  ('hero-1',        'hero',       'Bannière héro',      true,  'luxury',    'Révélez votre éclat',              null,                                                         'Nouvelle collection', 'éclat',    'Découvrir', null,    null,        'all', 'all', 0,  false),
  ('trust-1',       'trust',      'Bandeau confiance',  true,  'pills',     'Bandeau confiance',                null,                                                         null,                  null,       null,        null,    null,        'all', 'all', 1,  false),
  ('products-flash','products',   'Ventes Flash',       true,  'carousel',  'Ventes Flash',                     null,                                                         null,                  null,       null,        'flash', null,        'all', 'all', 2,  false),
  ('routine-1',     'routine',    'Rituel beauté',      true,  'editorial', 'Votre rituel parfait',             null,                                                         'Sur-mesure',          null,       null,        null,    null,        'all', 'all', 3,  false),
  ('products-best', 'products',   'Best-sellers',       true,  'carousel',  'Best-sellers',                     null,                                                         null,                  null,       null,        'best',  null,        'all', 'all', 4,  false),
  ('promo-1',       'promo',      'Promo éditoriale',   true,  'editorial', 'L''art de la séduction',           'Découvrez notre collection capsule Élixir Noir.',            'Édition Limitée',     'séduction','Découvrir', null,    'parfum-noir','all', 'all', 5,  false),
  ('bento-1',       'bento',      'Univers LN COS',     true,  'bento',     'L''univers LN COS',                'Self-care',                                                  null,                  null,       null,        null,    null,        'all', 'all', 6,  false),
  ('products-new',  'products',   'Nouveautés',         true,  'grid',      'Nouveautés',                       null,                                                         null,                  null,       null,        'new',   null,        'all', 'all', 7,  false),
  ('quote-1',       'quote',      'Citation',           true,  'immersive', 'La beauté commence à l''instant où vous décidez d''être vous-même.', null,                        null,                  null,       null,        null,    null,        'all', 'all', 8,  false),
  ('reels-1',       'reels',      'Reels beauté',       true,  'vertical',  'LN COS Beauté',                    null,                                                         null,                  null,       null,        null,    null,        'all', 'all', 9,  false),
  ('newsletter-1',  'newsletter', 'Newsletter',         true,  'card',      'Rejoignez le club beauté',         'Offres exclusives, lancements en avant-première.',           'Club LN COS',         null,       'Je m''inscris', null, null,      'all', 'all', 10, false);

-- Copy to draft
insert into public.home_sections
  select id, type, name, enabled, variant, title, subtitle, eyebrow, title_accent, cta, source, img, device, audience, schedule, views, position, true, updated_at
  from public.home_sections where is_draft = false;
