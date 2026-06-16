-- Blog : tags et schema Article (génération IA)

alter table public.blog_articles
  add column if not exists tags text[] not null default '{}',
  add column if not exists schema_article jsonb;
