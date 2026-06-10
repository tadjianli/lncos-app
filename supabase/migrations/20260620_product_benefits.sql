-- Bénéfices produit (fiche boutique — bloc éditable admin)
alter table products
  add column if not exists benefits text[] not null default '{}';
