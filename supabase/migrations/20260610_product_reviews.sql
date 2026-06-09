-- LN COS — Avis produits (collecte post-achat + modération admin)

create table if not exists public.product_reviews (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete set null,
  order_id     text references public.orders(id) on delete set null,
  product_id   text references public.products(id) on delete set null,
  product_name text not null default '',
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  body         text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'published', 'rejected')),
  verified     boolean not null default false,
  featured     boolean not null default false,
  pinned       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index if not exists idx_product_reviews_user_order_product
  on public.product_reviews (user_id, order_id, product_id)
  where user_id is not null and order_id is not null and product_id is not null;

create index if not exists idx_product_reviews_status on public.product_reviews (status, created_at desc);
create index if not exists idx_product_reviews_product on public.product_reviews (product_id, status);

create trigger trg_product_reviews_updated_at
  before update on public.product_reviews
  for each row execute procedure public.set_updated_at();

-- Recalcule rating + compteur sur products
create or replace function public.sync_product_review_stats(p_product_id text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
  v_avg numeric;
begin
  if p_product_id is null then return; end if;
  select count(*)::integer, coalesce(avg(rating)::numeric, 0)
    into v_count, v_avg
    from public.product_reviews
    where product_id = p_product_id and status = 'published';
  update public.products
    set reviews = v_count,
        rating = round(v_avg::numeric, 2)
    where id = p_product_id;
end;
$$;

create or replace function public.trg_sync_product_review_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_product_review_stats(old.product_id);
    return old;
  end if;
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.sync_product_review_stats(old.product_id);
  end if;
  perform public.sync_product_review_stats(new.product_id);
  return new;
end;
$$;

drop trigger if exists trg_product_reviews_stats on public.product_reviews;
create trigger trg_product_reviews_stats
  after insert or update of status, rating, product_id or delete on public.product_reviews
  for each row execute procedure public.trg_sync_product_review_stats();

alter table public.product_reviews enable row level security;

create policy "Published reviews are publicly readable"
  on public.product_reviews for select
  using (status = 'published' or auth.uid() = user_id or public.is_admin());

create policy "Users submit reviews for delivered orders"
  on public.product_reviews for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and verified = true
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
        and oi.product_id = product_id
    )
    and not exists (
      select 1 from public.product_reviews pr
      where pr.user_id = auth.uid()
        and pr.order_id = order_id
        and pr.product_id = product_id
    )
  );

create policy "Admins manage all reviews"
  on public.product_reviews for all
  using (public.is_admin())
  with check (public.is_admin());

alter publication supabase_realtime add table public.product_reviews;

-- Avis vitrine (publiés) — contenu modifiable par l'admin
insert into public.product_reviews (author_name, product_name, rating, body, status, verified, featured, pinned, created_at)
values
  ('Margaux L.', 'Sérum Éclat', 5, 'Ce sérum a complètement transformé mon teint en trois semaines. La texture est incomparable — soyeuse, absorbée instantanément. Je ne peux plus m''en passer.', 'published', true, false, true, now() - interval '2 days'),
  ('Diane K.', 'Parfum Noir', 5, 'LN COS comprend que le luxe est dans les détails. Du packaging à la fragrance, chaque élément est intentionnel. Un vrai soin haut de gamme.', 'published', true, true, false, now() - interval '5 days'),
  ('Isabelle R.', 'Crème Nuit', 5, 'La collection nocturne est devenue mon rituel du soir. Je me réveille avec un éclat qu''il me fallait autrefois toute une routine de maquillage pour obtenir.', 'published', true, false, false, now() - interval '7 days'),
  ('Camille D.', 'Huile Démaq.', 5, 'L''huile démaquillante est une révélation. Ma peau n''a jamais été aussi douce et lumineuse. Le parfum d''amande vanillée est absolument divin.', 'published', true, false, false, now() - interval '14 days'),
  ('Sophie M.', 'Masque Purifiant', 5, 'Le masque purifiant est mon coup de cœur absolu. En 20 minutes les pores sont resserrés, le teint unifié. Résultat professionnel à la maison.', 'published', true, false, false, now() - interval '21 days');
