-- LN COS — Détail d'erreur dans les logs IA

alter table public.ai_usage_logs
  add column if not exists error_detail text;
