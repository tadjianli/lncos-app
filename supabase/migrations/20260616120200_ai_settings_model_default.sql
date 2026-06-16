-- Retire les identifiants de modèles Anthropic hardcodés (résolution dynamique via API)
alter table public.ai_settings
  alter column model set default '';

update public.ai_settings
set model = ''
where model in (
  'claude-sonnet-4-20250514',
  'claude-opus-4-20250514'
);
