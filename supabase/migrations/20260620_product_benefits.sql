-- Bénéfices produit (fiche boutique — bloc éditable admin)
alter table products
  add column if not exists benefits text[] not null default '{}';

comment on column products.benefits is
  'Bénéfices clés affichés sur la fiche produit (ex. Sans colle, Réutilisable)';

-- Rafraîchir le cache schéma PostgREST (évite "column not in schema cache")
notify pgrst, 'reload schema';
