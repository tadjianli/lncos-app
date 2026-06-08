# LN COS — Local Development Setup

Onboarding guide for developers running the project on a new machine.

---

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 20.x or later | `@types/node` is pinned to `^20`; use [nvm](https://github.com/nvm-sh/nvm) to manage versions |
| **npm** | 10.x or later | Ships with Node 20 |
| **Git** | any recent | — |
| **Supabase CLI** | latest | `brew install supabase/tap/supabase` or `npm i -g supabase` |
| **Vercel CLI** | latest (optional) | Only needed for deployment: `npm i -g vercel` |

Check versions:

```bash
node -v   # should be v20.x or later
npm -v    # should be 10.x or later
supabase --version
```

---

## 2. Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd lncos-app

# 2. Install dependencies
npm install

# 3. Create your local env file
cp .env.local.example .env.local
# Then fill in the values — see Section 3 below

# 4. Start the dev server
npm run dev
# App is available at http://localhost:3000
```

---

## 3. Environment Variables

Create `.env.local` at the project root. The `.env.local.example` file provides the template.

### Complete variable reference

| Variable | Required | Where to get it | Format |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard → Project Settings → API → Project URL | `https://<project-id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard → Project Settings → API → Project API keys → `anon public` | `eyJhbGci...` (JWT) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard → Project Settings → API → Project API keys → `service_role secret` | `eyJhbGci...` (JWT) — **never expose in browser** |
| `STRIPE_SECRET_KEY` | Yes (for checkout/webhooks) | Stripe Dashboard → Developers → API keys → Secret key | `sk_test_...` (test) or `sk_live_...` (production) |
| `STRIPE_WEBHOOK_SECRET` | Yes (for webhooks) | Stripe Dashboard → Developers → Webhooks → endpoint → Signing secret | `whsec_...` |

> `NEXT_PUBLIC_*` variables are embedded in the browser bundle. All others are server-only.

### Minimal `.env.local` for local development

```bash
# LN COS — Local environment

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

Without `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` the checkout flow and webhook endpoint return `503 Stripe not configured` but the rest of the app still works.

---

## 4. Supabase Setup

### 4.1 Create a project

1. Go to [supabase.com](https://supabase.com) and create an account.
2. Click **New project**, choose a region close to your users.
3. Save the database password — you will not see it again.

### 4.2 Get your API keys

**Supabase Dashboard → Project Settings → API**

- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Run migrations

The `supabase/migrations/` folder contains two SQL files that must be run in order:

```
supabase/migrations/001_initial_schema.sql   — all tables, RLS policies, indexes, triggers
supabase/migrations/002_seed_data.sql        — reference seed data (services, staff, etc.)
```

**Option A — Supabase Dashboard (simplest)**

1. Open **SQL Editor** in the Supabase Dashboard.
2. Paste and run `001_initial_schema.sql` first.
3. Paste and run `002_seed_data.sql` second.

**Option B — Supabase CLI**

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

### 4.4 Auth — enable Email provider

**Supabase Dashboard → Authentication → Providers → Email**

- Enable the Email provider (it is on by default).
- Optionally disable "Confirm email" during local development to skip the confirmation step.

### 4.5 Row Level Security

RLS is enabled on all tables by migration `001`. You do not need to do anything extra. The `is_admin()` helper function is also created by the migration and drives admin-only write access.

### 4.6 Create an admin user

1. **Register normally** through the app at `/auth/register` to create a `profiles` row.
2. In the Supabase Dashboard, go to **Table Editor → profiles**.
3. Find the row for your user and set `is_admin = true`.

Alternatively, run this SQL in the SQL Editor (replace with your user's email):

```sql
update public.profiles
set is_admin = true
where email = 'your@email.com';
```

### 4.7 Regenerate TypeScript types (after schema changes)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

---

## 5. Stripe Setup

### 5.1 Create a Stripe account

Go to [stripe.com](https://stripe.com) and create an account. You can use Test mode for local development (no real payments).

### 5.2 Get API keys

**Stripe Dashboard → Developers → API keys**

- Copy **Secret key** → `STRIPE_SECRET_KEY`
  - Use `sk_test_...` for local/staging, `sk_live_...` for production.

### 5.3 Create a webhook endpoint

**Stripe Dashboard → Developers → Webhooks → Add endpoint**

| Field | Value |
|---|---|
| **Endpoint URL** | `https://your-domain.com/api/webhooks/stripe` (production) or use Stripe CLI for local testing |
| **Listen to** | Select specific events (see below) |

Events the app handles:

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Creates an order in the `orders` table with status `paid` |
| `payment_intent.payment_failed` | Logs the failure (extend here to notify customers) |

Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

### 5.4 Local webhook testing with Stripe CLI

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# The CLI prints a webhook signing secret — paste it into STRIPE_WEBHOOK_SECRET for local testing
```

---

## 6. Local Development Commands

```bash
npm run dev          # Start dev server at http://localhost:3000 (Turbopack enabled in Next 16)
npm run build        # Production build (output in .next/)
npm run start        # Serve the production build
npm run lint         # Run ESLint (config in eslint.config.mjs)
npx tsc --noEmit     # TypeScript type-check without emitting files
```

---

## 7. Vercel Deployment

### 7.1 First-time setup

```bash
npm i -g vercel       # Install Vercel CLI
vercel login          # Authenticate
vercel link           # Link to existing or new Vercel project
```

### 7.2 Add environment variables

Add every variable from Section 3 to Vercel:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

You can also manage variables at **Vercel Dashboard → Project → Settings → Environment Variables**.

### 7.3 Deploy

```bash
vercel          # Preview deployment
vercel --prod   # Production deployment
```

### 7.4 After deploying to production

- Update your Stripe webhook endpoint URL to the production domain.
- Make sure `STRIPE_WEBHOOK_SECRET` in Vercel matches the production webhook's signing secret.

---

## 8. Database Schema Overview

| Table | Purpose |
|---|---|
| `profiles` | One row per auth user. Extends `auth.users`. Holds `is_admin` flag, name, phone, avatar. |
| `products` | Product catalog — name, price, category, stock, variants, ingredients, images. |
| `categories` | Product categories with display order and cover image. |
| `cart_items` | Authenticated user shopping carts (per user/product/variant). |
| `favorites` | User-saved products (composite primary key `user_id + product_id`). |
| `orders` | Order header — status, payment status, shipping, totals, tracking. |
| `order_items` | Line items per order — snapshot of product name/price at time of purchase. |
| `appointments` | Salon appointment bookings — service, staff, date/time, client info, loyalty points. |
| `services` | Bookable salon services with category, price, duration. |
| `staff` | Team members with specialties and linked service IDs. |
| `extras` | Add-on services that can be bundled into an appointment. |
| `availability` | Weekly opening hours (one row per weekday 0–6). |
| `blocked_slots` | Admin-defined blocked time ranges (per day or per staff member). |
| `notifications` | In-app notifications per user — promo, order, loyalty, reminders. |
| `loyalty_points` | Per-user loyalty balance, total earned, and tier (bronze / argent / or / platine). |
| `loyalty_transactions` | Ledger of earn/redeem/expire/bonus events. |
| `home_sections` | App Builder sections rendered on the homepage — each has type, variant, targeting rules. |
| `popups` | Configurable marketing popups with trigger, frequency, audience, and countdown settings. |

---

## 9. Admin Panel Access

**URL:** `http://localhost:3000/admin/login`

Log in with a Supabase user that has `is_admin = true` in `profiles` (see Section 4.6).

### Admin modules

| Module | Route | Purpose |
|---|---|---|
| Dashboard | `/admin` | Overview metrics and quick navigation |
| App Builder | `/admin/app-builder` | Drag-and-drop editor for homepage sections |
| Popups | `/admin/popups` | Create and manage marketing popups |
| Products | `/admin/products` | Add, edit, and toggle products |
| Orders | `/admin/orders` | View and update order status |
| RDV (Calendar) | `/admin/rdv` | Manage salon appointments and availability |
| Customers | `/admin/customers` | View customer profiles and loyalty data |
| Settings | `/admin/settings` | Store configuration |

---

## 10. Troubleshooting

### "Hydration mismatch" warnings in the browser console

These happen when server-rendered HTML does not match client-rendered HTML. Common causes in this project:

- **localStorage access during SSR** — use `typeof window !== 'undefined'` guards, or use the `render-mode.ts` utility already in `src/lib/`.
- **Date/time differences** — avoid `new Date()` or `Date.now()` during initial render; derive them client-side inside a `useEffect`.

### Supabase connection errors (`Could not connect to Supabase`)

- Double-check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.
- Restart the dev server after editing `.env.local` — Next.js does not hot-reload env changes.
- Make sure the Supabase project is not paused (free tier projects pause after 1 week of inactivity; resume from the Dashboard).

### Build errors related to Tailwind v4

This project uses **Tailwind CSS v4** (`tailwindcss@^4`) with the PostCSS plugin (`@tailwindcss/postcss@^4`). The v4 config format and utility names differ from v3. If you see errors:

- Do not install the v3 `tailwindcss` config file (`tailwind.config.js`) — v4 is configured via CSS `@import "tailwindcss"` and `@theme` blocks.
- Check `postcss.config.mjs` uses `@tailwindcss/postcss`, not the old `tailwindcss` plugin.

### CSS Module classes not applying

- CSS Modules are scoped by filename. Make sure you import the `.module.css` file and access the class via the imported object (e.g., `styles.container`), not a plain string.
- After adding a new CSS Module file, a dev server restart may be needed.

### Stripe checkout not working locally

- Ensure `STRIPE_SECRET_KEY` is set and starts with `sk_test_` for test mode.
- For webhooks locally, you must run the Stripe CLI forwarder (see Section 5.4) and use the CLI-printed `whsec_` secret, not the Dashboard secret.

### PWA not working locally

PWA service workers require **HTTPS** in most browsers. `localhost` is an exception and is treated as a secure context, so the service worker should register at `http://localhost:3000`. If it does not:

- Open DevTools → Application → Service Workers and check for registration errors.
- Clear the browser cache and hard-reload.
- Safari on macOS requires the site to be added to the home screen or opened via a HTTPS URL for full PWA support.

### TypeScript errors after a schema change

Regenerate the database types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

---

_Last updated: June 2026_
