# Plan d'action GO LIVE — LN COS

**Objectif :** passer de NO GO LIVE à GO LIVE sans nouvelles fonctionnalités.  
**Date :** 12 juin 2026

---

## P0 — Obligatoire avant production

| # | Item | Statut | Fichiers / action |
|---|------|--------|-------------------|
| P0-1 | **Open redirect Stripe** — ignorer `returnUrl` client | ✅ Corrigé | `src/lib/stripe/checkout-origin.ts`, checkout + rdv-checkout |
| P0-2 | **Race webhook / `user_id`** — rattacher user sur commande existante | ✅ Corrigé | `src/lib/stripe/order-fulfillment.ts` (`attachUserIfMissing`) |
| P0-3 | **`create-account` sécurisé** — email = session Stripe, pas de link sans mot de passe, min 8 chars | ✅ Corrigé | `api/checkout/create-account`, `bag/page.tsx` |
| P0-4 | **Promo `max_uses` atomique** | ✅ Corrigé (migration) | `supabase/migrations/20260627_go_live_p0_hardening.sql` |
| P0-5 | **Annulation admin** — restock + remboursement Stripe | ✅ Corrigé | `src/lib/stripe/order-cancel.ts`, `api/admin/orders/[id]/status` |
| P0-6 | **Appliquer migration Supabase en prod** | ⏳ À faire | `supabase db push` ou dashboard |
| P0-7 | **Variables prod complètes** | ⏳ À faire | `NEXT_PUBLIC_SITE_URL`, `RESEND_*`, Stripe webhook |
| P0-8 | **QA manuelle checkout** (invité + connecté + annulation) | ⏳ À faire | Checklist ci-dessous |

> **Hors P0 (pas une correction, c'est une feature) :** retrait magasin / click & collect → reporté P2.

---

## P1 — Fortement recommandé (post-lancement ou semaine 1)

| # | Item |
|---|------|
| P1-1 | Rate limiting login / checkout / create-account |
| P1-2 | Sécuriser RDV checkout (auth ou token signé) — IDOR |
| P1-3 | Fidélité : désactiver `earnPoints` client-side ou persister en DB |
| P1-4 | Tests E2E Playwright (checkout Stripe test mode) |
| P1-5 | `NEXT_PUBLIC_SITE_URL` obligatoire en prod (fail build si absent) |
| P1-6 | Schema.org / SEO produit via `branding` (plus de "LN COS" hardcodé) |
| P1-7 | Piège focus overlays (a11y) |
| P1-8 | `.env.example` à jour (Stripe, Resend, VAPID) |
| P1-9 | Email confirmation invité : lien suivi sans login obligatoire |
| P1-10 | Brancher `isModuleRouteEnabled` au middleware |

---

## P2 — Améliorations futures

| # | Item |
|---|------|
| P2-1 | Retrait magasin / click & collect |
| P2-2 | Layout tablette / desktop |
| P2-3 | Template white-label complet (légal, prompts IA, cache PWA) |
| P2-4 | Bundle analyzer, migration images Next |
| P2-5 | MFA admin, audit log |
| P2-6 | Supprimer composants legacy home |
| P2-7 | Push notifications clients |

---

## Checklist QA manuelle (P0-8)

### Stripe
- [ ] Carte test `4242…` — achat invité complet
- [ ] Achat connecté — commande visible dans `/profile`
- [ ] Webhook Stripe CLI avant retour navigateur — `user_id` présent
- [ ] Promo avec `max_uses=1` — 2e tentative rejetée au fulfillment
- [ ] Admin → annuler commande — stock restauré + remboursement Stripe

### Commandes
- [ ] Invité + création compte post-paiement (email identique)
- [ ] Invité + email existant → erreur 409, pas de takeover
- [ ] Historique + détail commande

### Emails
- [ ] Confirmation commande (Resend configuré)
- [ ] Email expédition admin → statut shipped

### PWA
- [ ] `/manifest.webmanifest` valide
- [ ] Install iOS / Android
- [ ] Page `/offline` en mode avion

---

## Déploiement

1. Merger les correctifs P0  
2. Appliquer `20260627_go_live_p0_hardening.sql`  
3. Configurer env prod (13 vars `production-config.ts`)  
4. Exécuter checklist QA sur **staging** avec clés Stripe **test**  
5. Promouvoir en prod après checklist verte  
