# Audit PWA iPhone — Catégories & Panier

**Date :** 12 juin 2026  
**Périmètre :** Boutique → Catégories → Catégorie → Produit → Panier → Retour → Bottom Bar  
**Environnement :** Next.js App Router, overlay Zustand, bottom nav portail `document.body`

---

## CRITIQUE

### C1 — Superposition « Mon panier » + overlay listing (ex. « Maquillage »)

**Symptôme :** Deux titres d’écran visibles simultanément lors du passage Catégories → listing → Panier.

**Cause :**
- `.mobile-screen-header` en `z-index: 100` au-dessus de `.overlay-screen` (`z-index: 80`)
- La bottom nav change la route sans fermer l’overlay Zustand (`listing`, `product`, etc.)

**Correctif :**
- `useOverlayRouteSync` — fermeture auto des overlays au changement de `pathname`
- `BottomNav` — `closeOverlay()` au clic sur chaque onglet
- `.overlay-screen` / `.pd-overlay` remontés à `z-index: 110`

---

### C2 — Dernier produit masqué par la bottom navigation

**Symptôme :** Le bouton « + » du dernier produit est partiellement inaccessible.

**Cause :** Zones scroll sans marge suffisante sous le contenu ; nav fixe en portal par-dessus le viewport.

**Correctif :**
- Classe `.app-scroll-page` avec `padding-bottom: calc(var(--bottom-nav-h) + 16px)` sur Discover, Boutique, Catégorie
- `.overlay-screen-scroll` — même marge renforcée
- `.bag-page-scroll` — marge pour la barre d’action « Passer la commande »

---

## MAJEUR

### M1 — Grille produits hétérogène (BUG #1)

**Symptôme :** Hauteurs/largeurs de cartes variables selon l’écran.

**Cause :** Bloc info flexible (`min-height: 110px`, titres hauteur auto), `min-height: 180px` sur images.

**Correctif :**
- Ratio image strict `4/5`, suppression du `min-height` fluide
- Bloc info fixe `118px`, titre clampé 2 lignes (`2.6em`)

---

### M2 — Historique de navigation instable (BUG #4)

**Symptôme :** Retour incohérent après Catégories → Produit → Panier ou changements d’onglet.

**Cause :** Overlay Zustand survivait aux transitions de route ; états internes panier (`cart|checkout|confirming`) hors historique navigateur.

**Correctif :**
- Fermeture systématique des overlays au changement de route (onglets)
- Navigation produit : `pushState` + `useProductOverlayHistory` (commit précédent `4c985e5`)

**Reste connu :** Étapes checkout panier toujours en state React local (pas d’entrées historique par étape).

---

### M3 — État panier après refresh (BUG #5)

**Symptôme :** Flash « panier vide » ou badge incohérent après rechargement.

**Cause :** `skipHydration: true` sans gate UI ; `cartCount` persisté sans recalcul à la réhydratation.

**Correctif :**
- Recalcul `cartCount` dans `onRehydrateStorage`
- Skeleton panier tant que `_storeHydrated === false`

---

## MINEUR

### m1 — Padding barre d’action panier en PWA

Barre « Passer la commande » : `padding-bottom` safe-area renforcé sur `.bottom-action-bar--in-shell`.

### m2 — Compte de test

Parcours manuel non exécuté avec identifiants réels (non fournis). Vérifier en staging : ajout/suppression articles, refresh `/bag`, navigation croisée.

### m3 — `PRODUCT_NAV_DEBUG`

Logs `[LN COS product-nav]` encore actifs — désactiver en production si bruit console gênant.

---

## Parcours de test recommandé

1. **Boutique** — scroll jusqu’au dernier produit, vérifier bouton « + »
2. **Catégories** — ouvrir une catégorie (listing overlay), retour
3. **Catégorie SEO** (`/categorie/[slug]`) — grille uniforme, scroll bas
4. **Produit** — ouverture, retour (historique)
5. **Panier** — ajout, suppression, refresh page
6. **Navigation** — Catégories → listing → Panier (un seul titre visible)
7. **Bottom bar** — chaque onglet ferme les overlays

---

## Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `src/lib/use-overlay-route-sync.ts` | Fermeture overlay sur changement route |
| `src/components/layout/AppShell.tsx` | Hook route sync |
| `src/components/layout/BottomNav.tsx` | `closeOverlay` au clic |
| `src/lib/store.ts` | Recalcul `cartCount` à la réhydratation |
| `src/app/globals.css` | z-index overlays, grilles, scroll padding |
| `src/app/discover/page.tsx` | `.app-scroll-page` |
| `src/app/boutique/page.tsx` | `.app-scroll-page` |
| `src/app/categorie/[slug]/page.tsx` | `.app-scroll-page` |
| `src/app/bag/page.tsx` | Hydration gate + `.bag-page-scroll` |
