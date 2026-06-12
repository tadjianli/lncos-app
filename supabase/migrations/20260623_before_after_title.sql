-- Titre optionnel sur les résultats avant / après (fiche produit admin)
alter table public.before_after_results
  add column if not exists title text;

comment on column public.before_after_results.title is
  'Titre optionnel affiché sous la comparaison avant/après';
