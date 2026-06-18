# LN COS — Comparaison Or vs Beige (#FFEED8)

Branche : `ui/lncos-beige-theme` · Glow atténué sur les éléments ciblés (CTA, tab bar, FAB, badges, fidélité).

## Zones modifiées

- Popup promotions
- CTA principaux (`.lncos-cta--gold`)
- Onglet actif tab bar + FAB panier
- Badges promotions Flash
- Carte fidélité (VIP + points)

**Conservé :** fond noir, structure, fonctionnalités.

## Captures

| # | Écran | Avant (or) | Après (beige) |
|---|-------|------------|---------------|
| 1 | Accueil | `before/01-accueil.png` | `after/01-accueil.png` |
| 2 | Popup promo | `before/02-popup-promo.png` | `after/02-popup-promo.png` |
| 3 | Fiche produit | `before/03-fiche-produit.png` | `after/03-fiche-produit.png` |
| 4 | Panier | `before/04-panier.png` | `after/04-panier.png` |
| 5 | Menu latéral | `before/05-menu-lateral.png` | `after/05-menu-lateral.png` |

Popup et menu latéral : injection markup avec les classes CSS prod (comparaison visuelle pure).

## Tunnel checkout (focus conversion)

| # | Étape | iPhone | Android |
|---|-------|--------|---------|
| 1 | Adresse | `checkout/iphone/01-adresse.png` | `checkout/android/01-adresse.png` |
| 2 | Livraison | `checkout/iphone/02-livraison.png` | `checkout/android/02-livraison.png` |
| 3 | Paiement | `checkout/iphone/03-paiement.png` | `checkout/android/03-paiement.png` |
| 4 | Confirmation | `checkout/iphone/04-confirmation.png` | `checkout/android/04-confirmation.png` |

Étapes 1–3 : navigation réelle `/bag` → checkout (panier seedé, tab bar masquée).  
Étape 4 : injection markup aligné `ConfirmedScreen` (sans appel Stripe).

```bash
npm run dev
npm run ui:screenshots:checkout
# Port alternatif :
UI_SCREENSHOT_BASE=http://127.0.0.1:3002 npm run ui:screenshots:checkout
# Un seul device :
node scripts/ui-checkout-screenshots.mjs --device iphone
```

Viewports : iPhone 390×844 · Android 412×915 · scale 2× / 2.625×.

## Regénérer (thème beige)

```bash
npm run dev
git stash push -m tmp -- src/app/globals.css src/app/profile/page.tsx src/components/layout/BottomNav.tsx src/components/profile/LoyaltyScreen.tsx
git checkout main && node scripts/ui-theme-screenshots.mjs --label before
git checkout ui/lncos-beige-theme && git stash pop
node scripts/ui-theme-screenshots.mjs --label after
```

Viewport : 390×844 · scale 2×.

## P2 — Cartes & fiches produit (premium)

Design épuré : produit dominant, glow −20 %, or réservé aux prix barrés, trust badges en ligne discrète.

| # | Écran | Avant | Après |
|---|-------|-------|-------|
| 1 | Carte produit | `p2/before/{iphone,android}/01-carte-produit.png` | `p2/after/{iphone,android}/01-carte-produit.png` |
| 2 | Liste boutique | `p2/before/.../02-liste-produits.png` | `p2/after/.../02-liste-produits.png` |
| 3 | Fiche produit | `p2/before/.../03-fiche-produit.png` | `p2/after/.../03-fiche-produit.png` |

```bash
npm run dev
# Avant (état courant) :
UI_SCREENSHOT_BASE=http://127.0.0.1:3002 node scripts/ui-p2-product-screenshots.mjs --label before
# Après modifications P2 :
UI_SCREENSHOT_BASE=http://127.0.0.1:3002 npm run ui:screenshots:p2
```

Viewports : iPhone 390×844 · Android 412×915.
