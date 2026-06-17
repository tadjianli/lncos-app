# Audit SEO — Google Search Appearance LN COS

**Date :** 12 juin 2026  
**Commit :** (après déploiement)

---

## Résumé

| Élément | Avant | Après |
|---------|-------|-------|
| Title accueil | `LN COS — Beauté & Cosmétique` | `LN COS \| Cosmétiques, Ongles, Beauté & Accessoires à La Réunion` |
| Meta description | `Cosmétiques premium. Formulés en France.` (~45 car.) | Description cible ~155 car. avec vernis, ongles, La Réunion |
| Schema.org | Produits + blog uniquement | **Organization** (global) + **WebSite** + **BreadcrumbList** + **SiteNavigationElement** + **SearchAction** (accueil) |
| Open Graph | Générique, sans locale | `fr_FR`, title/description alignés, image 512px |
| Canonical accueil | `/` (relatif) | URL absolue via `absoluteUrl("/")` |
| Sitelinks | Peu de signaux internes | Nav crawlable accueil + menu latéral + sitemap priorités 0.95 |
| SearchAction | Absent | `/boutique?q={search_term_string}` + ouverture recherche |

---

## 1. Title SEO accueil

**Avant :** défini dans `src/app/layout.tsx` pour tout le site — trop court, sans mots-clés géo/métier.

**Après :** `src/app/(home)/layout.tsx` avec `HOME_SEO_TITLE` dans `src/lib/seo-site.ts`.

```
LN COS | Cosmétiques, Ongles, Beauté & Accessoires à La Réunion
```

Longueur : ~58 caractères (zone idéale Google).

---

## 2. Meta Description

**Avant :** « Cosmétiques premium. Formulés en France. »

**Après :**

```
Découvrez LN COS : vernis semi-permanents, accessoires ongles, maquillage, soins beauté et nouveautés. Livraison rapide à La Réunion et en France.
```

Alignée Open Graph, Twitter Card et Schema `WebSite`.

---

## 3. Données Schema.org

### Global (toutes pages) — `layout.tsx`
- **Organization** : nom, URL, logo, email, adresse Saint-Louis (974), zone desservie FR + La Réunion

### Accueil — `(home)/layout.tsx` (@graph)
| Type | Rôle |
|------|------|
| `Organization` | Entité LN COS (réf. `@id`) |
| `WebSite` | Site + publisher |
| `SearchAction` | Recherche boutique `?q=` |
| `BreadcrumbList` | Accueil |
| `ItemList` / `SiteNavigationElement` | 6 liens sitelinks prioritaires |

Fichier source : `src/lib/seo-site.ts`  
Injection : `src/components/seo/JsonLd.tsx`

---

## 4. Open Graph

| Champ | Après |
|-------|-------|
| `og:type` | `website` |
| `og:locale` | `fr_FR` |
| `og:url` | Canonical absolu accueil |
| `og:title` | Title SEO complet |
| `og:description` | Meta description cible |
| `og:image` | `/assets/icon-512.png` 512×512 |

---

## 5. Canonical

| Page | Canonical |
|------|-----------|
| Accueil | `https://www.lncos.fr/` |
| Boutique | `/boutique` |
| Nouveautés | `/discover` |
| Contact | `/contact` |
| Blog | `/blog` (existant) |

`metadataBase` = `getSiteUrl()` pour résolution absolue.

---

## 6. Sitelinks Google (signaux internes)

Google génère les sitelinks automatiquement. Optimisations appliquées :

| Lien cible | URL | Signaux |
|------------|-----|---------|
| Nouveautés | `/discover` | Nav accueil, menu, sitemap 0.95 |
| Meilleures ventes | `/boutique` | Nav accueil, menu, meta boutique |
| Vernis semi-permanent | `/boutique` | Nav accueil, menu, mots-clés title |
| Accessoires ongles | `/categorie/accessoires` | Nav accueil, menu, sitemap 0.95 |
| Blog beauté | `/blog` | Nav accueil, menu, sitemap 0.95 |
| Contact | `/contact` | Nav accueil, menu, layout dédié |

Composants :
- `HomeSitelinksNav` — liste `<nav>` crawlable en bas de l'accueil
- `SideMenu` — section Boutique enrichie
- `sitemap.ts` — priorités 0.95 pour URLs sitelinks

---

## 7. SearchAction (recherche Google)

URL template : `https://www.lncos.fr/boutique?q={search_term_string}`

Implémentation :
- `BoutiqueSearchFromUrl` ouvre l'overlay recherche avec la requête
- `openSearch(initialQuery?)` dans le store Zustand

---

## Fichiers modifiés / créés

| Fichier | Action |
|---------|--------|
| `src/lib/seo-site.ts` | **Créé** — constants + builders Schema |
| `src/components/seo/JsonLd.tsx` | **Créé** |
| `src/components/seo/HomeSitelinksNav.tsx` | **Créé** |
| `src/app/(home)/layout.tsx` | **Créé** — metadata accueil + JSON-LD |
| `src/app/(home)/page.tsx` | **Déplacé** depuis `app/page.tsx` |
| `src/app/layout.tsx` | Organization schema + defaults SEO |
| `src/app/contact/layout.tsx` | **Créé** |
| `src/app/discover/layout.tsx` | Meta « Nouveautés » |
| `src/app/boutique/layout.tsx` | Meta enrichie |
| `src/components/layout/SideMenu.tsx` | Maillage sitelinks |
| `src/components/commerce/BoutiqueSearchFromUrl.tsx` | **Créé** |
| `src/lib/store.ts` | `openSearch(q?)` |
| `src/app/sitemap.ts` | Priorités sitelinks |
| `src/app/globals.css` | Styles `.home-sitelinks` |

---

## Actions post-déploiement

1. [Google Search Console](https://search.google.com/search-console) → Inspection URL accueil → Demander l'indexation
2. Valider JSON-LD : [Rich Results Test](https://search.google.com/test/rich-results)
3. Vérifier OG : [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
4. Sitelinks : délai 2–8 semaines après recrawl (non garanti)

---

## Note catégorie « Vernis semi-permanent »

Le lien pointe vers `/boutique` en attendant une catégorie dédiée en base (`seo_slug: vernis-semi-permanent`). Créer la catégorie en admin permettra de cibler une URL unique pour ce sitelink.
