-- Blog LN COS — Phase 2 : contenu, SEO, FAQ, produits liés

alter table public.blog_articles
  add column if not exists body jsonb not null default '[]'::jsonb,
  add column if not exists author_name text not null default 'Équipe LN COS',
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists seo_keyword text,
  add column if not exists canonical_url text,
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists related_product_ids text[] not null default '{}';

create index if not exists blog_articles_slug_idx on public.blog_articles (slug);

-- Slugs SEO-friendly (exemples demandés)
update public.blog_articles set slug = 'le-rituel-eclat-du-matin-en-5-minutes' where id = 'blog-1';
update public.blog_articles set slug = '5-erreurs-skincare-a-eviter' where id = 'blog-2';

insert into public.blog_articles (
  id, slug, title, excerpt, category_id, published_at, read_minutes, featured, published, position,
  author_name, seo_title, meta_description, seo_keyword, body, faq
) values (
  'blog-7',
  'cils-magnetiques-guide-complet',
  'Cils magnétiques : le guide complet LN COS',
  'Pose, entretien, durée de vie — tout ce qu''il faut savoir pour des cils magnétiques impeccables à la maison.',
  'tutoriels',
  '2026-06-10',
  7,
  true,
  true,
  6,
  'Équipe LN COS',
  'Cils magnétiques : guide complet | LN COS',
  'Guide complet cils magnétiques LN COS : pose pas à pas, entretien, durée et astuces pro pour un regard sublime sans colle.',
  'cils magnétiques',
  '[
    {"type":"p","text":"Les cils magnétiques révolutionnent le maquillage du regard : pas de colle, une pose en quelques secondes et un rendu digne d''un institut. LN COS vous guide pas à pas."},
    {"type":"h2","text":"Pourquoi choisir les cils magnétiques ?"},
    {"type":"p","text":"Contrairement aux faux cils classiques, la technologie magnétique élimine les risques de colle sur les paupières et accélère considérablement votre routine beauté."},
    {"type":"ul","items":["Pose en moins de 2 minutes","Réutilisables jusqu''à 30 fois","Confort toute la journée","Adaptés aux débutantes"]},
    {"type":"h2","text":"La pose pas à pas"},
    {"type":"h3","text":"Étape 1 — Préparer la paupière"},
    {"type":"p","text":"Nettoyez et dégraissez la paupière avec un lotion sans huile. Appliquez une fine couche de liner magnétique LN COS le long de la racine des cils."},
    {"type":"h3","text":"Étape 2 — Positionner la bande"},
    {"type":"p","text":"Approchez la bande de cils magnétiques du liner : les aimants s''alignent naturellement. Ajustez légèrement avec la pince fournie."},
    {"type":"quote","text":"Le secret d''un regard naturel : choisir une longueur adaptée à la forme de vos yeux, pas la plus longue disponible.","author":"Équipe LN COS"},
    {"type":"h2","text":"Entretien et durée de vie"},
    {"type":"p","text":"Après chaque port, retirez délicatement les cils et nettoyez-les avec un coton imbibé d''eau micellaire. Rangez-les dans leur boîtier pour préserver la courbe."}
  ]'::jsonb,
  '[
    {"question":"Combien de fois puis-je réutiliser mes cils magnétiques LN COS ?","answer":"Avec un entretien régulier, comptez 25 à 30 ports. Évitez l''eau chaude et les frottements excessifs."},
    {"question":"Le liner magnétique convient-il aux yeux sensibles ?","answer":"Notre formule est testée dermatologiquement et sans parfum ajouté. En cas de réaction, suspendez l''usage et consultez un professionnel."}
  ]'::jsonb
) on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  faq = excluded.faq,
  seo_title = excluded.seo_title,
  meta_description = excluded.meta_description,
  seo_keyword = excluded.seo_keyword;

update public.blog_articles set
  author_name = 'Équipe LN COS',
  seo_title = 'Rituel éclat du matin en 5 min | LN COS',
  meta_description = 'Réveillez votre peau en 5 minutes avec le rituel éclat LN COS : nettoyage, hydratation et glow naturel pour commencer la journée.',
  seo_keyword = 'rituel beauté matin',
  body = '[
    {"type":"p","text":"Cinq minutes suffisent pour transformer une peau terne en un teint lumineux. LN COS a conçu ce rituel express pour les matins chargés — sans compromis sur l''efficacité."},
    {"type":"h2","text":"Minute 1 — Réveil en douceur"},
    {"type":"p","text":"Commencez par un nettoyant doux à l''eau micellaire pour éliminer les impuretés nocturnes sans agresser la barrière cutanée."},
    {"type":"h2","text":"Minutes 2-3 — Hydratation ciblée"},
    {"type":"p","text":"Appliquez une sérum éclat sur peau légèrement humide, puis une crème légère aux textures gel pour sceller l''hydratation."},
    {"type":"quote","text":"Une peau bien hydratée réfléchit la lumière — c''est la base de tout glow réussi.","author":"Équipe LN COS"},
    {"type":"h2","text":"Minutes 4-5 — Protection et finition"},
    {"type":"ul","items":["SPF 30 minimum, même par temps couvert","Touches de highlighter sur les pommettes","Baume lèvres nourrissant"]}
  ]'::jsonb,
  faq = '[
    {"question":"Ce rituel convient-il aux peaux grasses ?","answer":"Oui. Privilégiez des textures gel et un sérum léger ; évitez les crèmes trop riches le matin."}
  ]'::jsonb
where id = 'blog-1';

update public.blog_articles set
  author_name = 'Équipe LN COS',
  seo_title = '5 erreurs skincare à éviter | LN COS',
  meta_description = 'Sur-nettoyage, sur-exfoliation, SPF oublié… Découvrez les 5 erreurs skincare les plus courantes et comment les corriger avec LN COS.',
  seo_keyword = 'erreurs skincare',
  body = '[
    {"type":"p","text":"Même avec les meilleurs produits, certaines habitudes sabotent votre routine. Voici les cinq erreurs que nous voyons le plus souvent en boutique LN COS."},
    {"type":"h2","text":"Erreur 1 — Sur-nettoyer la peau"},
    {"type":"p","text":"Laver le visage plus de deux fois par jour ou utiliser un gel trop agressif déclenche souvent une surproduction de sébum."},
    {"type":"h2","text":"Erreur 2 — Enchaîner les actifs puissants"},
    {"type":"p","text":"Rétinol, acides et vitamine C méritent une introduction progressive. Mélanger tout dès le premier jour irrite la peau."},
    {"type":"h2","text":"Erreur 3 — Négliger la protection solaire"},
    {"type":"quote","text":"Le SPF est le anti-âge le plus efficace et le moins cher que vous puissiez utiliser.","author":"Équipe LN COS"},
    {"type":"h2","text":"Erreurs 4 et 5"},
    {"type":"ol","items":["Exfolier plus de 2 fois par semaine sans avis professionnel","Changer toute sa routine d''un coup au lieu d''introduire un produit à la fois"]}
  ]'::jsonb,
  faq = '[
    {"question":"À quelle fréquence exfolier ?","answer":"1 à 2 fois par semaine suffisent pour la plupart des peaux. Les peaux sensibles : 1 fois maximum."}
  ]'::jsonb
where id = 'blog-2';

-- Section accueil : Journal beauté
insert into public.home_sections (page_slug, id, type, name, enabled, variant, title, subtitle, eyebrow, cta, source, position, is_draft)
values (
  'home', 'journal-1', 'journal', 'Journal beauté LN COS', true, 'default',
  'LE JOURNAL BEAUTÉ LN COS', 'Conseils, tutoriels et tendances curated by LN COS.',
  'Magazine', 'Voir tous les articles', null, 8, false
) on conflict (page_slug, id, is_draft) do nothing;
