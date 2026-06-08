# LN COS — Luxury Beauty & Cosmetics App

A mobile-first luxury cosmetics PWA built with Next.js 15 App Router. Includes a full customer storefront and a white-label admin panel.

---

## Architecture

### Framework — Next.js 15 App Router with Turbopack

The project uses Next.js 16.x (the version distributed as `next@16`) with the App Router. Development runs on Turbopack for fast HMR.

### Styling — Tailwind v4 + CSS Modules

Global utility classes come from Tailwind v4 (`@import "tailwindcss"` in `globals.css`). However, **Turbopack strips arbitrary Tailwind classes that appear only inside complex component logic at build time** when there is no JIT scan hit. For components that require deterministic, animation-heavy, or scroll-driven styles (e.g. `ReviewsSection`), a collocated **CSS Module** (`.module.css`) is used instead. This is intentional and not a workaround — CSS Modules give full scoping, no purge risk, and predictable class names for JS-driven animations.

The design system lives in `src/app/globals.css` via `@theme inline` tokens (`--color-gold`, `--color-pink-deep`, etc.). All design tokens are CSS custom properties mapped into Tailwind's theme at build time.

### Backend — Supabase

| Table | Purpose |
|-------|---------|
| `products` | Product catalog with variants, stock, images |
| `categories` | Hierarchical product categories |
| `profiles` | Customer profiles, loyalty points, `is_admin` flag |
| `orders` | Orders with status, total, SumUp checkout reference |
| `order_items` | Line items per order |
| `appointments` | RDV bookings (customer, service, slot, status) |
| `popups` | Promotional overlays (title, body, CTA, active flag) |
| `home_sections` | App Builder section config (type, position, visible, props) |

Two Supabase clients are used:
- `client-supabase.ts` — browser client (anon key, RLS-enforced)
- `supabase-server.ts` — server-side client (service role, used in API routes)
- `admin-supabase.ts` — admin panel client with service role for bypassing RLS

### Payments — SumUp

SumUp hosted checkout is wired end-to-end:
- `POST /api/sumup/checkout` — creates a SumUp hosted checkout session, returns redirect URL
- `POST /api/sumup/complete` — verifies payment server-side, creates order in Supabase
- `POST /api/sumup/webhook` — backup webhook handler for `CHECKOUT_STATUS_CHANGED` events
- `POST /api/orders` — direct order creation (used internally)

**Flow**: Cart → `/api/sumup/checkout` → SumUp hosted page → return to `/bag?checkout_id=xxx` → `/api/sumup/complete` → order created in Supabase → confirmation screen.

### PWA

`public/manifest.json` is a full Web App Manifest with icons (192/512), shortcuts (Boutique, RDV, Panier), and `display: standalone`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.x App Router |
| Styling | Tailwind v4 + CSS Modules |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password) |
| Payments | SumUp (Hosted Checkout + Webhooks) |
| Animations | Framer Motion v12 |
| State | Zustand v5 (persisted) |
| Deploy | Vercel |

---

## What's Implemented

### Customer App

| Screen | Route | Status |
|--------|-------|--------|
| Homepage | `/` | 12 sections driven by App Builder (hero, featured, editorial, philosophy, ritual, reviews, testimonials, newsletter, footer + more) |
| Product catalog | `/discover` | Listing + search + category filter, Supabase-backed |
| Product detail | (overlay) | Add-to-bag, variants, favorites |
| Bag / Cart | `/bag` | Zustand cart, SumUp hosted checkout |
| Orders | `/profile` (tab) | Real orders from Supabase |
| Loyalty | `/profile` (tab) | Points balance from `profiles.loyalty_points` |
| Favorites | `/favorites` | Persisted via Zustand |
| RDV booking | `/rdv` | Service picker + slot calendar + booking form |
| My appointments | `/rdv/appointments` | List of user appointments from Supabase |
| Profile / Auth | `/profile` | Supabase email/password sign-in, session management |
| Ritual | `/ritual` | Static editorial page |

### Admin Panel (`/admin`)

| Module | Route | Status |
|--------|-------|--------|
| Dashboard | `/admin/dashboard` | KPIs from Supabase (revenue, orders, appointments) |
| Products | `/admin/products` | Full CRUD — create, edit, delete, image URL, stock |
| Categories | `/admin/categories` | Full CRUD |
| Orders | `/admin/orders` | Real-time list, status update |
| Customers | `/admin/customers` | Read — profiles list from Supabase |
| RDV | `/admin/rdv` | Calendar view, appointments list, services CRUD, availability grid. Staff CRUD — UI present, write actions stubbed ("bientôt disponible") |
| App Builder | `/admin/app-builder` | Drag-drop section reorder, visibility toggle, publish to `home_sections` table |
| Popups | `/admin/popups` | Full CRUD — create/edit/delete/activate |
| Promotions | `/admin/promotions` | Promo code CRUD — persisted in `localStorage` (Supabase sync pending) |
| Analytics | `/admin/analytics` | Charts from real Supabase data (orders, appointments, top products) |
| Reviews | `/admin/reviews` | Stub — "Système d'avis bientôt disponible" |
| Settings | `/admin/settings` | Expandable forms (store info, SumUp config, email sender). Persisted in `localStorage` — no server write yet |

### Auth

- Customer: Supabase email/password via `AuthScreen`
- Admin: `/admin/login` checks `profiles.is_admin = true` after sign-in; middleware protects `/admin/*` routes

---

## Folder Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── (shell)/          # Admin route group with AdminShell layout
│   │   │   ├── analytics/
│   │   │   ├── app-builder/
│   │   │   ├── categories/
│   │   │   ├── customers/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── popups/
│   │   │   ├── products/
│   │   │   ├── promotions/
│   │   │   ├── rdv/
│   │   │   ├── reviews/
│   │   │   └── settings/
│   │   ├── login/
│   │   └── globals.css       # Admin-specific styles
│   ├── api/
│   │   ├── orders/           # Direct order creation
│   │   └── sumup/            # SumUp: checkout · complete · webhook
│   ├── bag/
│   ├── discover/
│   ├── favorites/
│   ├── profile/
│   ├── rdv/
│   │   └── appointments/
│   └── ritual/
├── components/
│   ├── admin/                # One file per admin module
│   ├── commerce/             # ListingScreen, ProductDetail, SearchScreen, ReelsScreen
│   ├── home/                 # Section components + SectionRenderer
│   ├── layout/               # AppShell, TopBar, BottomNav, SideMenu, Toast
│   ├── profile/              # AuthScreen, OrdersScreen, LoyaltyScreen
│   ├── shared/               # Button, Card, ProductCard, Icon, Logo, Skeleton…
│   └── ui/                   # shadcn primitives
├── lib/
│   ├── contracts/            # TypeScript interfaces (product, order, appointment…)
│   ├── stores/               # Zustand stores (home-sections, loyalty, notifications)
│   ├── client-supabase.ts
│   ├── supabase-server.ts
│   ├── admin-supabase.ts
│   ├── database.types.ts     # Generated Supabase types
│   ├── store.ts              # Cart + favorites Zustand store
│   └── section-registry.ts   # Maps section type → component
└── middleware.ts              # Admin auth guard
```

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# SumUp
SUMUP_CLIENT_ID
SUMUP_CLIENT_SECRET
SUMUP_WEBHOOK_SECRET    # optional
```

---

## Local Development

```bash
npm install
npm run dev          # Turbopack dev server on http://localhost:3000
npm run build        # Production build
npx tsc --noEmit     # Type check
```

---

## Deploy

Deploys to Vercel. Set all environment variables in the Vercel project dashboard. Configure the SumUp webhook endpoint (`https://<domain>/api/sumup/webhook`) in SumUp Dashboard → Integrations → Webhooks.
