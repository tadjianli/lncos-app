-- LN COS — Migration 003: SumUp payment integration
-- Adds payment provider tracking columns to the orders table.

alter table public.orders
  add column if not exists sumup_checkout_id text,
  add column if not exists payment_provider   text not null default 'sumup';

-- Unique index for idempotency checks on checkout completion
create unique index if not exists idx_orders_sumup_checkout_id
  on public.orders (sumup_checkout_id)
  where sumup_checkout_id is not null;
