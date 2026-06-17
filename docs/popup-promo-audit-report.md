# Audit — Système pop-up promotionnel LN COS

**Date :** 12 juin 2026

---

## Résumé exécutif

| Point vérifié | Statut avant | Statut après |
|---------------|--------------|--------------|
| 1. Récupération Supabase popups actifs | ⚠️ Admin seulement | ✅ `usePublicPopups()` + Realtime |
| 2. API renvoie les données | ❌ Aucune route | ✅ `GET /api/popups` |
| 3. Composant `PopupPromo` monté | ❌ **Absent** | ✅ Monté dans `AppShell` |
| 4. Conditions d'affichage | ❌ Non implémentées | ✅ Pages, device, audience, schedule, overlay |
| 5. localStorage / sessionStorage | ❌ Non géré | ✅ Fréquence once / days / session |
| 6. Dates de validité | ❌ Non vérifiées | ✅ `schedule.start` / `schedule.end` |
| 7. Logs console | ❌ Aucun | ✅ Préfixe `[PopupPromo]` |

---

## Cause racine

Le système pop-up était **complet côté admin** (`PopupsModule`, table `popups`, RLS public read) mais **jamais branché côté client**.

- Aucun fichier `PopupPromo.tsx`
- Aucun hook public (`usePublicPopups`)
- Aucune route API publique
- `AppShell` ne montait aucun composant marketing popup

Les popups étaient bien en base et éditables en admin, mais **invisibles pour les utilisatrices**.

---

## Correctifs appliqués

### Données
- `src/lib/popups-mapper.ts` — mapping DB partagé admin + client
- `src/lib/popups-public.ts` — éligibilité, fréquence, pages, logs
- `src/lib/client-supabase.ts` — `usePublicPopups()` avec Realtime

### API
- `GET /api/popups` — liste des popups actifs (debug / intégrations)

### UI
- `src/components/marketing/PopupPromo.tsx` — overlay premium, CTA copie code, countdown interne
- Montage dans `AppShell` (mode `live` uniquement, pas d'overlay ouvert)
- Styles `globals.css` — `.popup-promo-*`

### Déclencheurs supportés
| Trigger | Comportement |
|---------|--------------|
| `delay` | Affichage après `delaySec` |
| `immediate` | Affichage instantané |
| `scroll` | Après 35 % de scroll |
| `exit` | Intention de sortie (desktop) |

### Fréquence (localStorage / sessionStorage)
| Mode | Stockage | Effet |
|------|----------|-------|
| `once` | localStorage | Ne réaffiche jamais après fermeture |
| `days` | localStorage + timestamp | Réaffiche après N jours |
| `session` | sessionStorage | Une fois par session |
| `always` | — | Réaffiche à chaque visite éligible |

Clé : `lncos-popup-dismissed:{popupId}`

---

## Vérification manuelle

1. Admin → Popups → popup active, pages `home`, délai 3 s
2. Ouvrir `/` en navigation privée (ou vider `localStorage` clés `lncos-popup-*`)
3. Console : `[PopupPromo] popups fetched: 1`
4. Après délai : `[PopupPromo] showing popup`
5. `GET /api/popups` → `{ ok: true, count: N }`
6. Fermer → ne réapparaît pas si mode `once`

---

## Débogage console

En développement, logs `[PopupPromo]` actifs automatiquement.  
En PWA : ajouter `NEXT_PUBLIC_PWA_DEBUG=1` au build pour les logs sur iPhone/Android.

## Application mobile (PWA iOS / Android)

LN COS mobile **n'est pas une app native** (pas de Capacitor / React Native).  
C'est la **même PWA Next.js** installée via « Ajouter à l'écran d'accueil » (`manifest.json`, `display: standalone`).

| Point | Web | PWA iOS | PWA Android |
|-------|-----|---------|-------------|
| `PopupPromo` monté dans `AppShell` | ✅ | ✅ (même bundle) | ✅ |
| Supabase fetch + Realtime | ✅ | ✅ | ✅ |
| Stockage fréquence | localStorage + sessionStorage | ✅ WKWebView | ✅ WebView |
| Repli si storage bloqué | ✅ mémoire (`popup-storage.ts`) | ✅ | ✅ |
| Toggle Paramètres « Promotions & offres » | ✅ `notifPromos` | ✅ | ✅ |
| Déclencheur délai accueil | ✅ | ✅ | ✅ |
| Déclencheur scroll | ✅ conteneurs internes | ✅ | ✅ |

**Test iPhone :** vider clés `lncos-popup-*` → Safari Web Inspector → logs `[PopupPromo]`.  
Les erreurs Supabase sont toujours loguées (`console.error`).

Pour tester malgré un dismiss précédent :
```js
Object.keys(localStorage).filter(k => k.startsWith('lncos-popup')).forEach(k => localStorage.removeItem(k))
```
