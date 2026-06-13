-- Pre-production hardening: orders idempotency, promo RPC, public RLS

-- ── 1. Unique Stripe session per order (idempotent fulfillment) ─────────────
create unique index if not exists orders_stripe_session_id_unique
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

-- ── 2. Restrict increment_promo_uses to service role ────────────────────────
revoke all on function public.increment_promo_uses(text) from public;
revoke all on function public.increment_promo_uses(text) from anon;
revoke all on function public.increment_promo_uses(text) from authenticated;
grant execute on function public.increment_promo_uses(text) to service_role;

-- ── 3. Products: hide inactive from public reads ─────────────────────────────
drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable"
  on public.products for select
  using (active = true or public.is_admin());

-- ── 4. Home sections: hide drafts from public ────────────────────────────────
drop policy if exists "Home sections are publicly readable" on public.home_sections;
drop policy if exists "Public read home sections" on public.home_sections;
create policy "Home sections public read published"
  on public.home_sections for select
  using (is_draft = false or public.is_admin());

-- ── 5. Product page builder blocks: hide drafts from public ──────────────────
drop policy if exists "Product page blocks public read" on public.product_page_blocks;
create policy "Product page blocks public read published"
  on public.product_page_blocks for select
  using (is_draft = false or public.is_admin());
