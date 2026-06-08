# LN COS — Final Architecture

> Reference document for Cursor polish phase. Build, lint, and TypeScript are all green as of the last commit.

---

## Table of Contents

1. [App Structure](#app-structure)
2. [Stores](#stores)
3. [Supabase Integration](#supabase-integration)
4. [Admin Architecture](#admin-architecture)
5. [Motion System](#motion-system)
6. [Environment Variables](#environment-variables)
7. [Deployment Flow](#deployment-flow)
8. [Production Checklist](#production-checklist)

---

## App Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage (HomeSections renderer)
│   ├── bag/page.tsx              # Cart
│   ├── discover/page.tsx         # Category discovery
│   ├── favorites/page.tsx        # Saved products
│   ├── profile/page.tsx          # Auth + account
│   ├── rdv/page.tsx              # Booking wizard
│   ├── rdv/appointments/         # Appointment history
│   ├── ritual/page.tsx           # Ritual (favorites-based routine)
│   ├── admin/
│   │   ├── login/page.tsx        # Admin auth (Supabase email/password)
│   │   └── (shell)/              # Route group — all share AdminShell layout
│   │       ├── page.tsx          # Redirect → /admin/dashboard
│   │       ├── dashboard/
│   │       ├── analytics/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── orders/
│   │       ├── customers/
│   │       ├── rdv/
│   │       ├── popups/
│   │       ├── app-builder/
│   │       ├── promotions/
│   │       ├── reviews/
│   │       └── settings/
│   └── api/
│       ├── checkout/route.ts     # POST — create Stripe PaymentIntent
│       ├── orders/route.ts       # GET list / POST create order
│       └── webhooks/stripe/route.ts  # Stripe webhook handler
│
├── components/
│   ├── home/                     # Homepage section components
│   │   ├── SectionRenderer.tsx   # switch(type) → renders the right section
│   │   ├── HeroSection.tsx
│   │   ├── ReviewsSection.tsx    # Coverflow carousel (handoff-faithful)
│   │   ├── ReviewsSection.module.css
│   │   └── ...11 more sections
│   ├── admin/                    # Admin module components (one per route)
│   │   ├── AdminShell.tsx        # Layout wrapper: sidebar + main
│   │   ├── AdminSidebar.tsx      # Nav + logout button
│   │   └── ...11 module components
│   ├── commerce/                 # Product detail, search, listing
│   ├── layout/                   # AppShell, TopBar, BottomNav, SideMenu
│   ├── profile/                  # Auth, Orders, Loyalty, Appointments
│   ├── rdv/                      # Booking wizard components
│   ├── shared/                   # Icon, ProductCard, FadeImage, etc.
│   └── ui/                       # Primitive UI components
│
├── lib/
│   ├── store.ts                  # Zustand: cart, favorites, overlays
│   ├── home-sections.ts          # SectionType union + DEFAULT_HOME_SECTIONS
│   ├── section-registry.ts       # SECTION_SCHEMA_REGISTRY (App Builder)
│   ├── supabase.ts               # Client-side Supabase singleton
│   ├── supabase-server.ts        # Server-side Supabase (cookies)
│   ├── admin-supabase.ts         # Admin data hooks (useProducts, useOrders…)
│   ├── client-supabase.ts        # Customer-facing Supabase hooks
│   ├── motion.ts                 # Animation tokens (easing, duration, spring)
│   ├── data.ts                   # Static product/category data + types
│   ├── rdv-store.ts              # Simple pub/sub store for booking state
│   ├── rdv-data.ts               # Services, staff, availability data
│   ├── overlay-router.ts         # Imperative overlay open helpers
│   └── render-mode.ts            # live / draft toggle
│
├── middleware.ts                 # Supabase session refresh + admin auth guard
└── types/                        # Shared TypeScript types
```

### Key conventions

| Pattern | Rule |
|---------|------|
| `"use client"` | Required on any component using hooks, event handlers, or browser APIs |
| CSS Modules | Used for complex animated components (ReviewsSection) to prevent Turbopack dead-code elimination of custom CSS |
| Tailwind v4 | Used everywhere else — utility-first, no `@apply` |
| `src/lib/` | Pure logic/data files; no JSX |
| `src/components/` | All JSX components |

---

## Stores

### 1. Zustand App Store (`src/lib/store.ts`)

**Persistence**: `localStorage` via `zustand/middleware/persist`, key `lncos-app-store`

**Persisted slices**: `cart`, `cartCount`, `favs`

**Ephemeral slices**: `overlay`, `toast`, `_storeHydrated`

```ts
// Key selectors
const isFav    = useStore(s => s.isFav);          // gated behind _storeHydrated
const addToCart = useStore(s => s.addToCart);
const openProduct = useStore(s => s.openProduct); // opens the product drawer
const overlay  = useStore(s => s.overlay);        // { type, product?, category? }
```

**Hydration note**: `_storeHydrated` is `false` on the server and until `onRehydrateStorage` fires on the client. `isFav()` returns `false` until hydrated, preventing the SSR mismatch on heart icons.

**Overlay types**: `"product"` | `"booking"` | `"side-menu"` | `"search"` | `"listing"` | `"loyalty"` | `"notifications"` | `"orders"` | `"appointments"` | `"reels"` | `"auth"`

---

### 2. Home Sections Store (`src/lib/home-sections.ts` + Zustand)

**Persistence**: `localStorage`, key `lncos-home-sections`

**Purpose**: Drives the homepage section order/enable state. The App Builder admin module writes to both this store and to Supabase `home_sections`.

**Section types**: `"hero"` | `"trust"` | `"products"` | `"routine"` | `"promo"` | `"bento"` | `"quote"` | `"reviews"` | `"reels"` | `"newsletter"` | `"editorial"` | `"philosophy"`

Each section has `{ id, type, name, enabled, config? }`.

**Flow**: App Builder → `saveDraft()` → Supabase `home_sections` → `SectionRenderer` in `page.tsx` → `switch(type)` → component

> **Important**: If stale persisted data blocks new section types from appearing, clear with `localStorage.removeItem('lncos-home-sections')` and reload.

---

### 3. RDV Store (`src/lib/rdv-store.ts`)

Lightweight pub/sub store for booking wizard state (no Zustand, no persistence). Used to share appointment data between `rdv/page.tsx` and `rdv/appointments/page.tsx`.

---

### 4. Admin localStorage stores

These exist because no Supabase tables exist for these features yet:

| Key | Used by | Contents |
|-----|---------|----------|
| `lncos-promos` | PromotionsModule | PromoCode[] |
| `lncos-avail` | RdvModule (Availability view) | Availability[] |
| `lncos-services` | RdvModule (Services view) | Service[] |
| `lncos-admin-settings` | SettingsModule | SettingValues |

---

## Supabase Integration

### Project

- **URL**: `https://svxgeoklhylqivszedel.supabase.co`
- **Dashboard**: [supabase.com/dashboard/project/svxgeoklhylqivszedel](https://supabase.com/dashboard/project/svxgeoklhylqivszedel)

### Tables

| Table | Description | Key columns |
|-------|-------------|-------------|
| `products` | Product catalog | `id`, `name`, `cat`, `price`, `old_price`, `stock`, `rating`, `reviews`, `tag`, `variants`, `description`, `ingredients` |
| `categories` | Product categories | `id`, `name`, `count`, `cover_url`, `position` |
| `orders` | Customer orders | `id`, `user_id`, `items`, `total`, `status`, `stripe_payment_intent`, `created_at` |
| `appointments` | RDV bookings | `id`, `client_id`, `service_id`, `staff_id`, `start_at`, `end_at`, `status`, `notes` |
| `popups` | Marketing popups | `id`, `name`, `type`, `title`, `subtitle`, `cta`, `bg_color`, `active`, `trigger`, `delay_ms` |
| `home_sections` | Homepage layout | `id`, `type`, `name`, `enabled`, `position`, `config` |
| `profiles` | User profiles | `id` (= auth.uid), `full_name`, `phone`, `loyalty_points`, `loyalty_tier` |

### Auth

- **Method**: Supabase email/password (magic link not yet wired)
- **Session refresh**: Handled in `src/middleware.ts` — reads/writes cookies on every request using `@supabase/ssr`
- **Admin guard**: Middleware checks `user.email` against `ADMIN_EMAILS` array; redirects to `/admin/login` if not authorized
- **Client singleton**: `src/lib/supabase.ts` — `getSupabase()` returns memoized client

### Data access layers

| Layer | File | Usage |
|-------|------|-------|
| Admin hooks | `admin-supabase.ts` | `useProducts`, `useOrders`, `usePopups`, `useAppointments` — realtime via Supabase channels |
| Client hooks | `client-supabase.ts` | `useUserProfile`, `useLoyalty`, `useUserOrders` |
| Server | `supabase-server.ts` | API routes + middleware only |

---

## Admin Architecture

The admin panel is a fully independent desktop-style dashboard that shares no CSS or layout with the client app.

### Layout

```
/admin/(shell)/layout.tsx
  └── AdminShell.tsx
        ├── AdminSidebar.tsx    # Left nav (240px fixed)
        └── <main>              # Scrollable content area
              └── {children}    # Module component
```

**CSS isolation**: All admin styles in `src/app/admin/globals.css` using `.adm-*` and `.ab-*` prefixes.

### Admin modules

| Route | Module | Backend |
|-------|--------|---------|
| `/admin/dashboard` | — | Supabase realtime stats |
| `/admin/analytics` | `AnalyticsModule` | Supabase aggregations |
| `/admin/products` | `ProductsModule` | Supabase `products` + `categories` |
| `/admin/categories` | `CategoriesModule` | Supabase `categories` |
| `/admin/orders` | `OrdersModule` | Supabase `orders` |
| `/admin/customers` | `CustomersModule` | Supabase `profiles` |
| `/admin/rdv` | `RdvModule` | Supabase `appointments` + localStorage |
| `/admin/popups` | `PopupsModule` | Supabase `popups` |
| `/admin/app-builder` | `AppBuilder` | Supabase `home_sections` + localStorage draft |
| `/admin/promotions` | `PromotionsModule` | localStorage (`lncos-promos`) |
| `/admin/reviews` | `ReviewsModule` | Placeholder (Supabase reviews table pending) |
| `/admin/settings` | `SettingsModule` | localStorage (`lncos-admin-settings`) |

### CRUD patterns

- **Supabase-backed**: optimistic local state update + Supabase write; realtime channel re-syncs
- **localStorage-backed**: read on mount, write on every mutation
- **Delete confirm**: inline "Confirmer" button on first click (no native `confirm()`)
- **Toast notifications**: `.adm-toast` CSS class, 2500ms auto-dismiss, rendered at module root

---

## Motion System

### Tokens (`src/lib/motion.ts`)

```ts
ease.out     = [0.2, 0.8, 0.2, 1]       // standard enter/exit
ease.spring  = [0.34, 1.56, 0.64, 1]    // subtle overshoot
ease.lux     = [0.22, 0.68, 0, 1]       // editorial cinematic glide
ease.snap    = [0.4, 0, 0.2, 1]         // instant feedback

dur.fast     = 180ms
dur.base     = 250ms
dur.slow     = 400ms
dur.drift    = 700ms
```

### Framer Motion usage

Used for overlay drawers, product cards, page transitions, navigation, and most micro-interactions.

Key patterns:
- `AnimatePresence` for overlay enter/exit
- `useMotionValue` + `useTransform` for drag-based parallax
- `whileTap` / `whileHover` on interactive elements

### Reviews coverflow (`ReviewsSection.tsx`)

The reviews carousel is a **faithful port of the Claude Design handoff** — it uses **pure React pointer events + CSS transitions** (not Framer Motion) to match the exact handoff physics:

| Property | Value | Source |
|----------|-------|--------|
| Card width | `min(288, vw × 0.75)` | handoff |
| Card spacing | `cardW × 0.79` | handoff |
| Scale falloff | `max(0.8, 1 − aPos × 0.13)` | handoff |
| Opacity falloff | `max(0, 1 − aPos × 0.46)` | handoff |
| Blur falloff | `min(6, (aPos − 0.25) × 3.2)px` | handoff |
| Dark veil | `min(0.62, aPos × 0.38)` | handoff |
| CSS transition | `transform .6s cubic-bezier(.22,.7,0,1)` | handoff |
| Autoplay | 5200ms, pauses on hover/drag | handoff |
| Skeleton | 650ms loading state | handoff |
| Float animation | 6.5s ease-in-out, −5px at 50% | handoff |
| Dot transition | `.45s cubic-bezier(.22,.68,0,1)` | handoff |
| Active dot width | 22px gold gradient | handoff |
| Momentum snap | `vel × 6` clamped ±1 | handoff |

**CSS lives in `ReviewsSection.module.css`** (not globals.css) to prevent Tailwind v4 + Turbopack dead-code elimination.

---

## Environment Variables

All variables documented in `.env.local.example`.

| Variable | Required | Used in | How to get |
|----------|----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | All Supabase client calls | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | All Supabase client calls | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | API routes (server only) | Supabase dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | ✅ for checkout | `/api/checkout`, `/api/orders` | Stripe dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | ✅ for payments | `/api/webhooks/stripe` | `stripe listen --print-secret` |

> **Security**: `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` must never be exposed to the browser. They have no `NEXT_PUBLIC_` prefix and are only accessible in server-side code.

---

## Deployment Flow

### Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev                         # starts on http://localhost:3000
```

### Vercel deployment

1. Push to `main` — Vercel auto-deploys
2. Set all env variables in Vercel dashboard → Settings → Environment Variables
3. For Stripe webhooks in production: create an endpoint in Stripe dashboard pointing to `https://your-domain.com/api/webhooks/stripe`

### Build checks (all must pass before deploy)

```bash
npm run build    # Next.js production build — zero errors
npm run lint     # ESLint — zero errors (warnings OK)
npx tsc --noEmit # TypeScript — zero errors
```

### Supabase migrations

Migrations live in `supabase/migrations/`. To apply:

```bash
npx supabase db push   # against remote project
# or
npx supabase db reset  # local dev only (destructive)
```

### Admin access

Admin routes are protected by `src/middleware.ts`. Add admin email addresses to the `ADMIN_EMAILS` array in that file.

---

## Production Checklist

### P0 — Blocks launch

- [ ] **Stripe PaymentElement** — checkout form in `/bag` is not wired; `PaymentElement` from `@stripe/stripe-js` needs to be rendered with the `clientSecret` from `/api/checkout`
- [ ] **Stripe webhook idempotency** — `/api/webhooks/stripe` should check `stripe_payment_intent` before creating duplicate orders on retry
- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** — set the actual value in `.env.local` and Vercel env
- [ ] **`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`** — set real keys for production

### P1 — Important

- [ ] **Supabase Row Level Security** — verify RLS policies on `orders`, `profiles`, `appointments` allow users to only read their own data
- [ ] **Admin middleware auth** — `ADMIN_EMAILS` is hardcoded in `middleware.ts`; move to env var or Supabase role check
- [ ] **Product images** — all product images fall back to placeholders; add real images to `/public/assets/products/{id}.png`
- [ ] **Stripe webhook endpoint** — register production URL in Stripe dashboard

### P2 — Polish phase (Cursor)

- [ ] Reviews Module — connect to a real `reviews` Supabase table
- [ ] Promotions Module — sync with Stripe Coupons API
- [ ] Settings Module — wire store/hours to a Supabase config table
- [ ] Staff management — add/edit/delete staff in RDV module
- [ ] Analytics — wire real Supabase aggregation queries
- [ ] Loyalty tiers — implement automatic tier upgrade logic
- [ ] Push notifications — wire `pushEnabled` setting to Web Push API
