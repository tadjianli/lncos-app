-- Add Stripe session ID column to orders (replaces sumup_checkout_id for new orders)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Index for idempotency check in /api/stripe/complete and webhook
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
