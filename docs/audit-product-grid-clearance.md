# Audit grilles produits — clearance bottom nav

**Date :** 12 juin 2026  
**Composant central :** `ProductGrid` + `ScrollRegion`

## Pages auditées

| Page | Composant | Clearance |
|------|-----------|-----------|
| Boutique | `PageSectionsView` → `ProductGrid` | Section : `app-scroll-page` ; grille : `bottomClearance={false}` |
| Catégories (overlay) | `ListingScreen` → `ProductGrid` | Grille + `ScrollRegion padBottom={false}` |
| Catégorie SEO | `CategoryProductGrid` → `ProductGrid variant=category` | Grille + `ScrollRegion padBottom={false}` |
| Recherche | `SearchScreen` → `ProductGrid` | Grille + `ScrollRegion padBottom={false}` |
| Favoris | `ProductGrid` | Grille + `ScrollRegion padBottom={false}` |
| Recommandés (accueil) | `ProductGrid bottomClearance={false}` | `home-scroll` / sections |

## Formule CSS

```css
--product-grid-bottom-clearance: var(--app-scroll-pad-bottom);
--app-scroll-pad-bottom: calc(bottom-nav-bar-h + safe-bottom + 24px);
/* PWA standalone : + 3px (nav remontée) */
```

## Règles

1. **`ProductGrid`** — `product-grid--clear-bottom` par défaut (`bottomClearance={true}`)
2. **`ScrollRegion`** — padding horizontal via classes, jamais `padding` shorthand
3. **`padBottom={false}`** quand la grille porte le clearance (évite double marge)
4. Sections mid-page (boutique, accueil) : `bottomClearance={false}` + `app-scroll-page`

## Cause racine corrigée

`padding: "0 16px 24px"` en inline **écrasait** le `padding-bottom` CSS des zones scroll.
