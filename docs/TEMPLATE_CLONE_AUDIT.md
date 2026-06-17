# Rapport d'audit — Template e-commerce clonable

**Date :** 12 juin 2026  
**Instance de référence :** LN COS (thème `beauty`)  
**Build :** `npm run build` — OK (70 routes générées)

---

## 1. Objectif atteint

Le projet est structuré comme **base e-commerce réutilisable** : une nouvelle boutique client se configure principalement via :

| Fichier | Rôle |
|---------|------|
| `config/branding.ts` | Nom, SEO, logo, couleurs, contacts, réseaux, textes par défaut |
| `config/themes/*.ts` | Palette, typo, sections d'accueil par secteur |
| `config/modules.ts` | Activation/désactivation des modules (RDV, blog, fidélité…) |
| `config/product-attributes.ts` | Presets d'attributs (taille, dimensions, ingrédients…) |

**API runtime :** `@/lib/branding` (`getAppName`, `formatPageTitle`, `brandCopy`, `pageSeo`, etc.)

---

## 2. Architecture branding & thèmes

### Centralisation
- **Layout racine** : metadata, viewport, icons, OG/Twitter depuis `branding`
- **ThemeStyles** : variables CSS injectées depuis le thème actif (`--gold`, `--pink`, etc.)
- **Manifest PWA** : `src/app/manifest.ts` → `/manifest.webmanifest`
- **SEO global** : `src/lib/seo-site.ts` (Organization, WebSite, sitelinks)
- **Emails** : `order-emails.ts`, `resend-client.ts`
- **Réseaux sociaux** : `social-links.ts` (+ surcharge env `NEXT_PUBLIC_SOCIAL_*`)
- **Layouts pages** : boutique, discover, blog, contact, profile, rdv… via `pageSeo()`

### Thèmes disponibles
| ID | Secteur |
|----|---------|
| `beauty` | Cosmétique (défaut LN COS) |
| `fashion` | Mode |
| `furniture` | Meubles / déco |
| `restaurant` | Restauration |
| `electronics` | High-tech |

Changer : `branding.activeThemeId` + `branding.vertical`.

---

## 3. Modules (`config/modules.ts` + `src/modules/`)

| Module | Activé | Admin | Storefront |
|--------|--------|-------|------------|
| products | ✅ | products, categories, fiche | boutique, produit, catégorie |
| orders | ✅ | orders | bag, profile/orders |
| customers | ✅ | customers | profile, login |
| seo | ✅ | seo | sitemap, robots |
| blog | ✅ | content-pages | /blog |
| delivery | ✅ | shipping | /livraison |
| payments | ✅ | promotions | checkout Stripe |
| reviews | ✅ | reviews | fiches produit |
| notifications | ✅ | popups, social-proof | PWA push |
| appointments | ✅ | rdv | /rdv |
| loyalty | ❌ | — | profile (VIP) |
| marketing | ✅ | hero, content-pages | accueil |

**Admin sidebar** filtrée via `getAdminNavGroups()` — libellé « Blog LN COS » remplacé par « Blog ».

---

## 4. Vérifications fonctionnelles

### Routes storefront (build)
Accueil, boutique, discover, blog, contact, bag, checkout, profile, favorites, rdv, pages légales, offline, promotions, flash-sales, produit/categorie dynamiques — **70 routes OK**.

### API
| Route | Statut |
|-------|--------|
| `/api/stripe/checkout`, `complete`, `webhook` | ✅ conservées |
| `/api/checkout/create-account` | ✅ |
| `/api/stripe/rdv-checkout`, `rdv-complete` | ✅ |
| `/api/admin/*` (AI, orders, upload) | ✅ |
| `/api/push/subscribe`, `/api/popups` | ✅ PWA |

### Admin
Universel : navigation modulaire, catégories configurables en base, pas de libellés cosmétiques obligatoires dans la nav.

### Checkout
Stripe, panier, promotions, livraison, retrait magasin, connexion inline — **inchangé** (sessions précédentes).

### SEO
- Sitemap `/sitemap.xml`, blog `/sitemap-blog.xml`
- `robots.txt`
- Schema.org (Organization, WebSite, produit, blog)
- Open Graph / Twitter Cards
- Score SEO admin + génération IA produit — **conservés**, metadata produit/catégorie via branding

### PWA
- Manifest dynamique `/manifest.webmanifest`
- Service worker `public/sw.js` (généré)
- Page offline, push, mode standalone — **conservés**
- Note : `public/manifest.json` statique legacy — peut être supprimé (Next sert `manifest.ts`)

### Responsivité & perf
- Tab bar, overlay produit plein écran — corrigés (commits précédents)
- Build Turbopack ~6s compile, pas de régression TypeScript

---

## 5. Attributs produits extensibles

`config/product-attributes.ts` — presets par vertical :
- **fashion** : taille, couleur
- **furniture** : dimensions, matière
- **restaurant** : ingrédients, suppléments
- **electronics** : specs techniques
- **beauty** : volume, teinte, finition

Lier au clonage : `branding.vertical`.

---

## 6. Guide clonage rapide (Client Template)

```bash
# 1. Cloner le repo
git clone … nouvelle-boutique && cd nouvelle-boutique

# 2. Personnaliser
# config/branding.ts → appName, logo, emails, SEO, copy
# config/branding.ts → activeThemeId, vertical
# config/modules.ts → désactiver RDV, blog, etc. si besoin
# public/assets/ → logo, favicon, icons

# 3. Environnement
cp .env.example .env.local
# Supabase, Stripe, Resend…

# 4. Vérifier
npm run build && npm run dev
```

**Sans toucher au code métier** pour une boutique standard.

---

## 7. Références « LN COS » restantes

Après migration, ~**130 occurrences** subsistent dans `src/` — principalement :
- **Commentaires d'en-tête** de fichiers (`* LN COS — …`) — cosmétique, sans impact UI
- **Pages légales** (`cgv`, `confidentialite`, `mentions-legales`) — contenu métier LN COS en base/admin
- **Prompts IA** (`ai-prompts.ts`, `seo-product-generator.ts`) — à paramétrer au clonage
- **Données statiques fallback** (`data.ts`, `rdv-settings.ts`) — remplacées par Supabase en prod

**Chemins critiques migrés :** layout, SEO, emails, auth, admin title, home, blog teaser, offline, metadata layouts.

**Prochaine passe recommandée :** remplacer les prompts IA et pages légales par des templates `{{appName}}` ou contenu admin-only.

---

## 8. Dépendances

Aucune nouvelle dépendance npm. Alias TypeScript `@config/*` ajouté dans `tsconfig.json` et `vitest.config.ts`.

---

## 9. Checklist finale

| # | Item | Statut |
|---|------|--------|
| 1 | Routes | ✅ Build 70 routes |
| 2 | API | ✅ Liste ci-dessus |
| 3 | Admin | ✅ Nav modulaire |
| 4 | Checkout | ✅ Stripe intact |
| 5 | SEO | ✅ Branding branché |
| 6 | PWA | ✅ Manifest dynamique |
| 7 | Responsive | ✅ Fixes récents tab bar / overlay |
| 8 | Performances | ✅ Build OK |
| 9 | Dépendances | ✅ Aucune inutile ajoutée |
| 10 | Rapport clonage | ✅ Ce document |

---

## 10. Fichiers clés créés / modifiés

```
config/
  branding.ts, modules.ts, product-attributes.ts, themes/
src/lib/branding/index.ts
src/components/theme/ThemeStyles.tsx
src/app/manifest.ts
src/modules/          # registry + re-exports
docs/TEMPLATE_CLONE_AUDIT.md
```

**Prêt pour commit** sur branche dédiée ou `main` selon votre workflow.
