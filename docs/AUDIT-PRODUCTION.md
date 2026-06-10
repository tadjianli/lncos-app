# Audit production — LN COS

Date : 8 juin 2026  
Build : ✅ `npm run build`  
Tests : ✅ `npm test` (12/12 shipping-rules)

---

## 1. Routes

| Statut | Détail |
|--------|--------|
| ✅ | 31 pages + 8 API + sitemap + robots |
| ✅ | Navigation principale (BottomNav, SideMenu) — liens valides |
| ✅ | Redirections legacy `/product/[id]` → `/produit/[slug]` |
| ✅ | Page `not-found.tsx` personnalisée |
| ⚠ | Footer (`FooterSection.tsx`) — liens placeholder `#` |
| ⚠ | `/ritual` orpheline (aucun lien entrant) |
| ⚠ | Catégories SEO `/categorie/[slug]` non liées en UI overlay |

---

## 2. Base de données

| Statut | Détail |
|--------|--------|
| ✅ | 22 migrations, FK principales, RLS activé |
| ✅ | Migration `20260619_production_hardening` : alignement colonnes |
| ⚠ | `products.cat` sans FK vers `categories` |
| ⚠ | `order_items.product_id` sans FK (snapshot volontaire) |
| ⚠ | Fichiers storage non nettoyés à la suppression produit |

---

## 3. Supabase

| Statut | Détail |
|--------|--------|
| ✅ | Client browser + server + service role |
| ✅ | Middleware refresh session |
| ✅ | Upload admin : auth + MIME + taille |
| ✅ | RLS admin via `is_admin()` |
| ✅ | Protection `is_admin` sur UPDATE profil (migration) |
| ⚠ | Produits inactifs lisibles en DB (filtré côté app) |

---

## 4. Admin

| Statut | Détail |
|--------|--------|
| ✅ | CRUD produits, catégories, commandes, promos, shipping |
| ✅ | Prévisualisation produit `/produit/[slug]?preview=1` |
| ✅ | Onglet SEO produit + dashboard SEO |
| ✅ | Upload images (buckets product-images, media) |
| ⚠ | Pas de gestion d'erreur centralisée sur tous les updates |

---

## 5. Produits

| Statut | Détail |
|--------|--------|
| ✅ | Variantes riches (`product_variants`) |
| ✅ | Galerie, image principale, engagements |
| ✅ | SEO : slug, title, meta, image alt |
| ✅ | `seo_slug` persisté à la sauvegarde |
| ✅ | Fallback image placeholder (`icon-192.png`) |
| ⚠ | Contenu SSR fiche produit minimal (overlay SPA ensuite) |

---

## 6. Checkout

| Statut | Détail |
|--------|--------|
| ✅ | Panier Zustand persisté |
| ✅ | Stripe Checkout Session |
| ✅ | Complete idempotent + order_items |
| ✅ | Remise promo recalculée serveur |
| ✅ | Prix articles vérifiés contre catalogue DB |
| ✅ | Route legacy `/api/orders` désactivée (410) |
| ⚠ | Adresse collectée mais non persistée |
| ⚠ | UI Apple Pay/PayPal mais Stripe = card only |

---

## 7. Livraisons

| Statut | Détail |
|--------|--------|
| ✅ | Seuil gratuit, min/max panier |
| ✅ | Filtre méthodes éligibles |
| ✅ | Revalidation serveur checkout |
| ✅ | 12 tests Vitest passants |
| ⚠ | Pas de tests intégration API checkout |

---

## 8. SEO

| Statut | Détail |
|--------|--------|
| ✅ | `/sitemap.xml` dynamique |
| ✅ | `/robots.txt` (disallow admin, bag, api) |
| ✅ | Metadata racine + OG + Twitter |
| ✅ | JSON-LD Product + Offer |
| ✅ | Pages produit/catégorie avec canonical |
| ⚠ | Pas de JSON-LD Organization site-wide |
| ⚠ | Sitemap dépend de Supabase (pas de fallback) |

---

## 9. Responsive

| Statut | Détail |
|--------|--------|
| ✅ | Layout mobile-first (max-width container) |
| ✅ | Grille boutique 3 colonnes |
| ✅ | Admin responsive (modales wide) |
| ⚠ | Pas de tests visuels automatisés multi-viewport |

---

## 10. Performance

| Statut | Détail |
|--------|--------|
| ✅ | `next/image` via FadeImage sur cartes |
| ✅ | Service Worker cache shell |
| ✅ | `/boutique` ajouté au cache offline |
| ⚠ | Pas d'audit Lighthouse automatisé |
| ⚠ | Pages produit 100 % dynamiques (pas d'ISR) |

---

## 11. Sécurité

| Statut | Détail |
|--------|--------|
| ✅ | Middleware protège `/admin/*` |
| ✅ | Upload réservé admin |
| ✅ | Webhook Stripe signature si `STRIPE_WEBHOOK_SECRET` |
| ✅ | Commandes user limitées à `payment_status = pending` |
| ✅ | Checkout : prix + promo validés serveur |
| ❌ | **Production** : vérifier env vars (voir checklist ci-dessous) |

### Checklist env production

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Appliquer migration `20260619_production_hardening.sql` sur Supabase distant

---

## 12. UX

| Statut | Détail |
|--------|--------|
| ✅ | États vides panier, favoris, admin |
| ✅ | Toasts admin |
| ✅ | Loaders sur fetch Supabase |
| ✅ | Messages erreur checkout Stripe |
| ✅ | « Produit introuvable » (pas de 404 brute) |
| ⚠ | Footer liens morts |

---

## 13. Synthèse production

| Catégorie | ✅ OK | ⚠ À corriger | ❌ Bloquant |
|-----------|-------|--------------|------------|
| Routes | 4 | 3 | 0 |
| BDD | 2 | 3 | 0 |
| Supabase | 5 | 1 | 0 |
| Admin | 4 | 1 | 0 |
| Produits | 5 | 1 | 0 |
| Checkout | 6 | 2 | 0 |
| Livraisons | 4 | 1 | 0 |
| SEO | 5 | 2 | 0 |
| Responsive | 3 | 1 | 0 |
| Performance | 3 | 2 | 0 |
| Sécurité | 5 | 0 | 1* |
| UX | 5 | 1 | 0 |

\* Bloquant = configuration production (env + migration distante), pas un défaut code bloquant le build.

### Verdict

**Prêt pour production** après application de la migration Supabase distante et configuration des variables d'environnement Stripe/Supabase.

### Priorités post-lancement

1. Persister l'adresse de livraison dans les commandes
2. Aligner UI paiement avec méthodes Stripe réelles
3. Enrichir SSR fiche produit pour le crawl
4. Remplacer les liens footer placeholder
5. Tests E2E checkout + admin
