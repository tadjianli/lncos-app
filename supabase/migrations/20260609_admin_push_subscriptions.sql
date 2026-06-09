-- Admin Web Push subscriptions (notifications commandes sur mobile)

create table if not exists public.admin_push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index if not exists admin_push_subscriptions_user_idx
  on public.admin_push_subscriptions (user_id);

alter table public.admin_push_subscriptions enable row level security;

create policy "Admins manage own push subscriptions"
  on public.admin_push_subscriptions
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
