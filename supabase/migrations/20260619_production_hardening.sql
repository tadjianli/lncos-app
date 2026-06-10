-- Alignement schéma DB ↔ code TypeScript + durcissement sécurité production
-- Idempotent : safe si les colonnes ont déjà été renommées (Supabase distant).

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'desc'
  ) then
    alter table public.products rename column "desc" to description;
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'services' and column_name = 'min'
  ) then
    alter table public.services rename column "min" to duration;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'services' and column_name = 'pop'
  ) then
    alter table public.services rename column pop to popular;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'services' and column_name = 'desc'
  ) then
    alter table public.services rename column "desc" to description;
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'popups' and column_name = 'trigger'
  ) then
    alter table public.popups rename column "trigger" to trigger_type;
  end if;
end $$;

-- Empêcher l'auto-élévation is_admin via UPDATE profil
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

-- Commandes : les utilisateurs ne peuvent créer que des commandes en attente de paiement
drop policy if exists "Users can insert own orders" on public.orders;
create policy "Users can insert own orders"
  on public.orders for insert
  with check (
    auth.uid() = user_id
    and payment_status = 'pending'
  );
