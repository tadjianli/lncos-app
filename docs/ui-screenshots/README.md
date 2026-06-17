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

## Regénérer

```bash
npm run dev
git stash push -m tmp -- src/app/globals.css src/app/profile/page.tsx src/components/layout/BottomNav.tsx src/components/profile/LoyaltyScreen.tsx
git checkout main && node scripts/ui-theme-screenshots.mjs --label before
git checkout ui/lncos-beige-theme && git stash pop
node scripts/ui-theme-screenshots.mjs --label after
```

Viewport : 390×844 · scale 2×.
