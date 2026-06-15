-- LN COS — Paramètres Intelligence Artificielle (admin)

create table if not exists public.ai_settings (
  id                    text primary key default 'default',
  provider              text not null default 'anthropic'
    check (provider in ('anthropic', 'openai', 'gemini', 'mistral')),
  api_key_encrypted     text,
  model                 text not null default 'claude-sonnet-4-20250514',
  language              text not null default 'fr'
    check (language in ('fr', 'en', 'es', 'de')),
  tone                  text not null default 'luxe'
    check (tone in ('professional', 'luxe', 'beauty', 'cosmetic', 'marketing', 'ecommerce')),
  description_length    text not null default 'medium'
    check (description_length in ('short', 'medium', 'long')),
  seo_enabled           boolean not null default false,
  seo_auto_title        boolean not null default true,
  seo_auto_meta         boolean not null default true,
  seo_auto_slug         boolean not null default true,
  seo_auto_alt          boolean not null default true,
  seo_auto_keywords     boolean not null default true,
  blog_enabled          boolean not null default false,
  blog_word_count       int not null default 1000
    check (blog_word_count in (500, 1000, 1500, 2000)),
  blog_include_faq      boolean not null default true,
  blog_include_schema   boolean not null default true,
  blog_image_suggestions boolean not null default true,
  last_test_ok          boolean not null default false,
  last_test_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

insert into public.ai_settings (id) values ('default')
on conflict (id) do nothing;

create table if not exists public.ai_usage_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users (id) on delete set null,
  user_email      text,
  action          text not null,
  provider        text not null,
  model           text not null,
  tokens_input    int not null default 0,
  tokens_output   int not null default 0,
  cost_eur        numeric(12, 6) not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists ai_usage_logs_created_at_idx
  on public.ai_usage_logs (created_at desc);

alter table public.ai_settings enable row level security;
alter table public.ai_usage_logs enable row level security;

create policy "Admins manage ai_settings"
  on public.ai_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins read ai_usage_logs"
  on public.ai_usage_logs for select
  using (public.is_admin());

create policy "Admins insert ai_usage_logs"
  on public.ai_usage_logs for insert
  with check (public.is_admin());

create trigger trg_ai_settings_updated_at
  before update on public.ai_settings
  for each row execute procedure public.set_updated_at();
