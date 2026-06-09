-- LN COS — Social Proof & Conversion

create table if not exists public.social_proof_settings (
  id                      text primary key default 'default',
  purchase_notifications  boolean not null default true,
  review_notifications    boolean not null default true,
  favorite_notifications  boolean not null default true,
  cart_notifications      boolean not null default true,
  live_viewers_enabled    boolean not null default true,
  stock_alerts_enabled    boolean not null default true,
  sales_counter_enabled   boolean not null default true,
  rotation_interval_sec   integer not null default 10 check (rotation_interval_sec in (5, 10, 15, 30)),
  notification_duration_ms integer not null default 4000,
  viewers_min             integer not null default 5 check (viewers_min >= 3),
  viewers_max             integer not null default 50 check (viewers_max >= viewers_min),
  stock_low_threshold     integer not null default 10 check (stock_low_threshold in (5, 10, 15)),
  trust_fast_delivery     boolean not null default true,
  trust_secure_payment    boolean not null default true,
  trust_verified_purchase boolean not null default true,
  trust_easy_returns      boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

insert into public.social_proof_settings (id) values ('default')
on conflict (id) do nothing;

create table if not exists public.social_proof_events (
  id            uuid primary key default gen_random_uuid(),
  event_type    text not null check (event_type in ('purchase', 'review', 'favorite', 'cart')),
  product_id    text references public.products(id) on delete set null,
  product_name  text not null default '',
  customer_name text not null,
  rating        integer check (rating is null or rating between 1 and 5),
  created_at    timestamptz not null default now()
);

create index if not exists idx_social_proof_events_recent
  on public.social_proof_events (created_at desc);

create index if not exists idx_social_proof_events_type
  on public.social_proof_events (event_type, created_at desc);

alter table public.social_proof_settings enable row level security;
alter table public.social_proof_events enable row level security;

create policy "Social proof settings public read"
  on public.social_proof_settings for select using (true);

create policy "Admins manage social proof settings"
  on public.social_proof_settings for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Social proof events public read"
  on public.social_proof_events for select using (true);

create policy "Admins manage social proof events"
  on public.social_proof_events for all
  using (public.is_admin()) with check (public.is_admin());

create trigger trg_social_proof_settings_updated_at
  before update on public.social_proof_settings
  for each row execute procedure public.set_updated_at();

-- Stats ventes par produit (lecture publique agrégée)
create or replace function public.get_product_sales_stats(p_product_id text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'today', coalesce((
      select sum(oi.qty)::integer from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = p_product_id
        and o.payment_status = 'paid'
        and o.created_at >= date_trunc('day', now() at time zone 'Europe/Paris')
    ), 0),
    'week', coalesce((
      select sum(oi.qty)::integer from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = p_product_id
        and o.payment_status = 'paid'
        and o.created_at >= date_trunc('week', now() at time zone 'Europe/Paris')
    ), 0)
  );
$$;

grant execute on function public.get_product_sales_stats(text) to anon, authenticated;

-- Alimente les événements depuis commandes payées
create or replace function public.trg_order_paid_social_proof()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_name text;
begin
  if new.payment_status = 'paid' and (old.payment_status is distinct from 'paid') then
    select coalesce(p.full_name, 'Cliente') into v_name
      from public.profiles p where p.id = new.user_id;
    if v_name is null or v_name = '' then v_name := 'Cliente'; end if;
    v_name := split_part(v_name, ' ', 1) || ' ' || upper(left(split_part(v_name, ' ', 2), 1)) || '.';

    for r in
      select oi.product_id, oi.name as product_name
      from public.order_items oi where oi.order_id = new.id
    loop
      insert into public.social_proof_events (event_type, product_id, product_name, customer_name)
      values ('purchase', r.product_id, r.product_name, v_name);
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_social_proof on public.orders;
create trigger trg_orders_social_proof
  after update of payment_status on public.orders
  for each row execute procedure public.trg_order_paid_social_proof();

-- Alimente les événements depuis avis publiés
create or replace function public.trg_review_published_social_proof()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    insert into public.social_proof_events (event_type, product_id, product_name, customer_name, rating)
    values ('review', new.product_id, new.product_name, new.author_name, new.rating);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reviews_social_proof on public.product_reviews;
create trigger trg_reviews_social_proof
  after insert or update of status on public.product_reviews
  for each row execute procedure public.trg_review_published_social_proof();

alter publication supabase_realtime add table public.social_proof_settings;

-- Événements initiaux depuis avis publiés
insert into public.social_proof_events (event_type, product_id, product_name, customer_name, rating, created_at)
select 'review', product_id, product_name, author_name, rating, created_at
from public.product_reviews
where status = 'published';
