# Audit mobile — Safe Areas & Headers LN COS

**Date :** 8 juin 2026  
**Viewport :** `viewport-fit=cover` (`layout.tsx`)  
**Variables :** `--safe-top`, `--safe-header-top` (= safe-top + 12px), `--bottom-nav-h`

## Architecture globale

| Composant | Rôle |
|-----------|------|
| `AppShell` / `app-shell-main` | Safe-top pour pages in-flow |
| `SafeAreaLayout` | Padding `env(safe-area-inset-*)` par bord |
| `MobilePageLayout` | Header `SubHeader` + body scrollable + overlay |
| `SubHeader` / `MobileBackButton` | Retour 44×44, `handleSmartBack()` → `/profile` |
| `overlay-screen` (z-80) | Overlays dans `main` |
| `overlay-shell` (z-90) | Modales hors `main` (Auth, RDV wizard, SideMenu scrim) |

## Hiérarchie z-index

| Couche | z-index |
|--------|---------|
| BottomNav | 40 |
| Social proof | 74 |
| Toast | 75 |
| Overlays contenu | 80 |
| Shell modals (menu, reels, auth, RDV) | 90 |
| ReviewSubmitModal | 120 |
| Stripe overlay (bag) | 999 |
| Product lightbox | 9999 |

---

## ✅ Pages conformes

| Page / écran | Safe area | Retour 44px | Notes |
|--------------|-----------|-------------|-------|
| Accueil (`/`) | Shell + TopBar | Menu/favoris/panier 44px | |
| Boutique (`/boutique`) | Shell | — | Pas de header retour (tab) |
| Catégories (`/discover`) | Shell | — | Barre recherche OK |
| Favoris (`/favorites`) | Shell | SubHeader 44px | |
| Profil (`/profile`) | Shell | Cloche 44px | Tab root, pas de retour |
| Mes commandes (overlay) | `--safe-header-top` | SubHeader 44px | |
| Paramètres, Notifications, Fidélité | `--safe-header-top` | SubHeader 44px | |
| Listing, Recherche (overlay) | `--safe-header-top` | 44px | |
| Détail produit (overlay) | `--safe-header-top` | Flottants 44px | |
| Panier / checkout (`/bag`) | Shell | SubHeader 44px | |
| RDV rendez-vous (`/rdv/appointments`) | Shell | SubHeader 44px | |
| Connexion overlay (`AuthScreen`) | `overlay-shell` | MobileBackButton 44px | |
| Reels (`ReelsScreen`) | `--safe-header-top` | Close 44px | |
| Menu latéral (`SideMenu`) | safe-top drawer | Close 44px | |
| Admin mobile (`admin/**`) | `env(safe-area-inset-*)` | Hamburger 44px | |
| Admin login (`/login`) | safe insets | Bouton min 44px | |
| BottomNav | `safe-bottom` | Items ≥52px | |
| Catégorie SEO (`/categorie/[slug]`) | Shell | SubHeader ajouté | |

---

## ⚠️ Pages à surveiller (non bloquant)

| Page | Problème résiduel | Recommandation |
|------|-------------------|----------------|
| Panier (`/bag`) | Boutons poubelle / qty steppers < 44px | Agrandir hit area si retours UX |
| `ProductCard` (grille dense) | Fav/add 24–32px en `prodbento--3` | Compromis layout vs HIG |
| Pages SEO produit (`/produit/[slug]`) | Ouvre overlay store, pas de header page | Comportement voulu |
| Ritual, Offline, Discover | Pas de bouton retour | Navigation par bottom nav |
| Toast « Voir » | Lien texte petit | `pointer-events` sur bouton si actif |

---

## ❌ Corrigé dans ce commit (étaient cassés)

| Écran | Problème | Correctif |
|-------|----------|-----------|
| Mes commandes | Retour sous barre système | `--safe-header-top` = calc(safe-top + 12px) |
| AuthScreen | Pas de safe-area, back < 44px | `overlay-shell` + `MobileBackButton` |
| ReelsScreen | Close 40px, top fixe 54px | 44px + `var(--safe-header-top)` |
| SideMenu | Pas de safe-top, close petit | `calc(var(--safe-top) + 12px)` + `touch-target` |
| RDV BookingWizard | Header 56px fixe, icônes seules | `overlay-shell` + `MobileBackButton` |
| TopBar (Accueil) | Menu 30px, actions 40px | `touch-target` 44px |
| Admin login | Pas de safe-area | Padding env(safe-area-inset-*) |

---

## Tests responsive recommandés

- iPhone SE (375×667) — safe-top faible
- iPhone 13 (390×844) — encoche standard
- iPhone 15 Pro Max (430×932) — Dynamic Island
- Android petit (360×640) — Chrome + Samsung Internet
- Android grand (412×915)
- Tablette (768px+) — admin sidebar desktop

## Fichiers clés

- `src/components/layout/SafeAreaLayout.tsx`
- `src/components/layout/MobilePageLayout.tsx`
- `src/components/shared/ActionButtons.tsx`
- `src/app/globals.css` (classes `mobile-screen-header*`, `overlay-*`, `touch-target`)
