-- LN COS — Initial database schema
-- Migration 001: all tables, RLS, indexes, triggers

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  phone         text,
  avatar_url    text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Products ─────────────────────────────────────────────────────────────────
create table public.products (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  cat         text not null,
  price       numeric(10,2) not null,
  old_price   numeric(10,2),
  ml          text not null default '',
  rating      numeric(3,2) not null default 4.5,
  reviews     integer not null default 0,
  tag         text,
  stock       integer not null default 0,
  variants    text[] not null default '{}',
  desc        text not null default '',
  ingredients text[] not null default '{}',
  active      boolean not null default true,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Categories ───────────────────────────────────────────────────────────────
create table public.categories (
  id        text primary key,
  name      text not null,
  count     integer not null default 0,
  cover_url text,
  position  integer not null default 0
);

-- ─── Cart items ───────────────────────────────────────────────────────────────
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  text not null references public.products(id) on delete cascade,
  variant     text not null,
  qty         integer not null default 1 check (qty > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id, variant)
);

-- ─── Favorites ────────────────────────────────────────────────────────────────
create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ─── Orders ───────────────────────────────────────────────────────────────────
create table public.orders (
  id                 text primary key default 'LN-' || lpad(floor(random()*100000)::text, 4, '0'),
  user_id            uuid references public.profiles(id) on delete set null,
  status             text not null default 'preparing'
                       check (status in ('preparing','shipped','in_transit','delivered','cancelled')),
  payment_status     text not null default 'pending'
                       check (payment_status in ('pending','paid','refunded')),
  subtotal           numeric(10,2) not null,
  shipping_cost      numeric(10,2) not null default 0,
  total              numeric(10,2) not null,
  tracking_number    text,
  estimated_delivery text,
  delivered_at       timestamptz,
  shipping_address   jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── Order items ──────────────────────────────────────────────────────────────
create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   text not null references public.orders(id) on delete cascade,
  product_id text not null,
  name       text not null,
  price      numeric(10,2) not null,
  qty        integer not null,
  variant    text,
  image_url  text
);

-- ─── Services ─────────────────────────────────────────────────────────────────
create table public.services (
  id     text primary key,
  cat    text not null,
  name   text not null,
  price  numeric(10,2) not null,
  min    integer not null,
  color  text not null default '#D4AF37',
  pop    boolean not null default false,
  active boolean not null default true,
  desc   text not null default ''
);

-- ─── Staff ────────────────────────────────────────────────────────────────────
create table public.staff (
  id          text primary key,
  name        text not null,
  role        text not null default '',
  color       text not null default '#D4AF37',
  rating      numeric(3,2) not null default 4.9,
  reviews     integer not null default 0,
  active      boolean not null default true,
  specialties text[] not null default '{}',
  services    text[] not null default '{}',
  avatar_url  text
);

-- ─── Extras ───────────────────────────────────────────────────────────────────
create table public.extras (
  id    text primary key,
  name  text not null,
  price numeric(10,2) not null,
  min   integer not null
);

-- ─── Availability ─────────────────────────────────────────────────────────────
create table public.availability (
  day    integer primary key check (day between 0 and 6),
  label  text not null,
  closed boolean not null default false,
  open   text not null default '10:00',
  close  text not null default '19:00'
);

-- ─── Blocked slots ────────────────────────────────────────────────────────────
create table public.blocked_slots (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  start      time not null,
  "end"      time not null,
  staff_id   text references public.staff(id) on delete set null,
  reason     text,
  created_at timestamptz not null default now()
);

-- ─── Appointments ─────────────────────────────────────────────────────────────
create table public.appointments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references public.profiles(id) on delete set null,
  service_id         text not null references public.services(id),
  staff_id           text not null references public.staff(id),
  extras_ids         text[] not null default '{}',
  start_at           timestamptz not null,
  duration_min       integer not null,
  price              numeric(10,2) not null,
  deposit            numeric(10,2) not null default 0,
  payment_status     text not null default 'unpaid'
                       check (payment_status in ('unpaid','deposit','paid')),
  status             text not null default 'pending'
                       check (status in ('pending','confirmed','completed','cancelled','no_show')),
  client_name        text not null,
  client_phone       text,
  client_email       text,
  notes              text,
  loyalty_pts_earned integer not null default 0,
  confirmation_ref   text not null,
  source             text not null default 'client' check (source in ('client','admin')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text not null
               check (type in ('promo','order','points','new_product','rdv_reminder','system')),
  title      text not null,
  body       text not null,
  unread     boolean not null default true,
  meta       jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Loyalty points ───────────────────────────────────────────────────────────
create table public.loyalty_points (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  points       integer not null default 0,
  total_earned integer not null default 0,
  tier         text not null default 'bronze'
                 check (tier in ('bronze','argent','or','platine')),
  joined_at    timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Loyalty transactions ─────────────────────────────────────────────────────
create table public.loyalty_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('earn','redeem','expire','bonus')),
  pts         integer not null,
  description text not null,
  ref_id      text,
  created_at  timestamptz not null default now()
);

-- ─── Home sections ────────────────────────────────────────────────────────────
create table public.home_sections (
  id           text not null,
  type         text not null,
  name         text not null,
  enabled      boolean not null default true,
  variant      text not null default 'default',
  title        text not null default '',
  subtitle     text,
  eyebrow      text,
  title_accent text,
  cta          text,
  source       text,
  img          text,
  device       text not null default 'all' check (device in ('all','mobile','desktop')),
  audience     text not null default 'all' check (audience in ('all','vip','logged_in')),
  schedule     jsonb not null default '{"enabled":false,"start":"","end":""}',
  views        integer not null default 0,
  position     integer not null default 0,
  is_draft     boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (id, is_draft)
);

-- ─── Popups ───────────────────────────────────────────────────────────────────
create table public.popups (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  enabled       boolean not null default true,
  type          text not null default 'promo_code',
  layout        text not null default 'centered',
  eyebrow       text not null default '',
  title         text not null default '',
  subtitle      text not null default '',
  code          text not null default '',
  cta_label     text not null default 'Copier le code',
  cta_action    text not null default 'copy',
  email_capture boolean not null default false,
  accent        text not null default '#D4AF37',
  image         boolean not null default false,
  image_id      text not null default '',
  delay_sec     integer not null default 7,
  trigger       text not null default 'delay',
  frequency     jsonb not null default '{"mode":"once","days":7}',
  audience      text not null default 'all',
  device        text not null default 'all',
  pages         text[] not null default '{home}',
  countdown     jsonb not null default '{"enabled":false,"minutes":30}',
  schedule      jsonb not null default '{"enabled":false,"start":"","end":""}',
  stats         jsonb not null default '{"views":0,"closes":0,"clicks":0,"copies":0,"conversions":0,"daily":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]}',
  updated_at    timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index on public.appointments (start_at);
create index on public.appointments (staff_id);
create index on public.appointments (user_id);
create index on public.appointments (status);
create index on public.orders (user_id);
create index on public.orders (status);
create index on public.notifications (user_id, created_at desc);
create index on public.loyalty_transactions (user_id, created_at desc);
create index on public.home_sections (is_draft, position);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.set_updated_at();

create trigger trg_loyalty_points_updated_at
  before update on public.loyalty_points
  for each row execute procedure public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles           enable row level security;
alter table public.products           enable row level security;
alter table public.categories         enable row level security;
alter table public.cart_items         enable row level security;
alter table public.favorites          enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.appointments       enable row level security;
alter table public.notifications      enable row level security;
alter table public.loyalty_points     enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.home_sections      enable row level security;
alter table public.popups             enable row level security;
alter table public.services           enable row level security;
alter table public.staff              enable row level security;
alter table public.extras             enable row level security;
alter table public.availability       enable row level security;
alter table public.blocked_slots      enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── Profiles ──
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles"
  on public.profiles for select using (public.is_admin());
create policy "Admins can update all profiles"
  on public.profiles for update using (public.is_admin());

-- ── Products (public read, admin write) ──
create policy "Products are publicly readable"
  on public.products for select using (true);
create policy "Admins can manage products"
  on public.products for all using (public.is_admin());

-- ── Categories (public read, admin write) ──
create policy "Categories are publicly readable"
  on public.categories for select using (true);
create policy "Admins can manage categories"
  on public.categories for all using (public.is_admin());

-- ── Cart items ──
create policy "Users manage own cart"
  on public.cart_items for all using (auth.uid() = user_id);
create policy "Admins can read all cart items"
  on public.cart_items for select using (public.is_admin());

-- ── Favorites ──
create policy "Users manage own favorites"
  on public.favorites for all using (auth.uid() = user_id);

-- ── Orders ──
create policy "Users can read own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders"
  on public.orders for all using (public.is_admin());

-- ── Order items ──
create policy "Users can read own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins can manage all order items"
  on public.order_items for all using (public.is_admin());

-- ── Appointments ──
create policy "Users can read own appointments"
  on public.appointments for select using (auth.uid() = user_id);
create policy "Users can insert own appointments"
  on public.appointments for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admins can manage all appointments"
  on public.appointments for all using (public.is_admin());

-- ── Notifications ──
create policy "Users can read own notifications"
  on public.notifications for select using (auth.uid() = user_id or user_id is null);
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);
create policy "Admins can manage all notifications"
  on public.notifications for all using (public.is_admin());

-- ── Loyalty ──
create policy "Users can read own loyalty"
  on public.loyalty_points for select using (auth.uid() = user_id);
create policy "Admins can manage all loyalty"
  on public.loyalty_points for all using (public.is_admin());

create policy "Users can read own transactions"
  on public.loyalty_transactions for select using (auth.uid() = user_id);
create policy "Admins can manage all transactions"
  on public.loyalty_transactions for all using (public.is_admin());

-- ── Home sections (public read, admin write) ──
create policy "Home sections are publicly readable"
  on public.home_sections for select using (true);
create policy "Admins can manage home sections"
  on public.home_sections for all using (public.is_admin());

-- ── Popups (public read enabled ones, admin write all) ──
create policy "Enabled popups are publicly readable"
  on public.popups for select using (enabled = true or public.is_admin());
create policy "Admins can manage all popups"
  on public.popups for all using (public.is_admin());

-- ── Services / Staff / Extras / Availability (public read, admin write) ──
create policy "Services are publicly readable"
  on public.services for select using (true);
create policy "Admins can manage services"
  on public.services for all using (public.is_admin());

create policy "Staff are publicly readable"
  on public.staff for select using (true);
create policy "Admins can manage staff"
  on public.staff for all using (public.is_admin());

create policy "Extras are publicly readable"
  on public.extras for select using (true);
create policy "Admins can manage extras"
  on public.extras for all using (public.is_admin());

create policy "Availability is publicly readable"
  on public.availability for select using (true);
create policy "Admins can manage availability"
  on public.availability for all using (public.is_admin());

create policy "Blocked slots readable by admins"
  on public.blocked_slots for select using (public.is_admin());
create policy "Admins can manage blocked slots"
  on public.blocked_slots for all using (public.is_admin());

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime for live-update tables
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.popups;
alter publication supabase_realtime add table public.home_sections;
