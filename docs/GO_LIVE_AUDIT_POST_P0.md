# Audit post-P0 — LN COS

**Date :** 12 juin 2026  
**Référence :** audit initial 61/100 — NO GO LIVE  
**Périmètre :** corrections P0 uniquement (aucune nouvelle feature)

---

## 1. Correctifs P0 appliqués

| ID | Problème | Correction |
|----|----------|------------|
| C1 | Open redirect `returnUrl` | `resolveCheckoutOrigin()` — origin = `NEXT_PUBLIC_SITE_URL` ou host local uniquement |
| C2 | Race `user_id` webhook/complete | `attachUserIfMissing()` sur commande existante |
| C4 | `create-account` ouvert | Email obligatoire = session Stripe ; compte existant → 409 ; mot de passe min 8 |
| C5 | Promo `max_uses` race | RPC `increment_promo_uses` retourne boolean + garde SQL |
| C6 | Annulation sans restock/refund | Annulation admin → `increment_order_items_stock` + `stripe.refunds.create` |

**Non traité (feature, pas bug) :** retrait magasin (P2).

---

## 2. Vérifications automatisées

| Check | Résultat |
|-------|----------|
| `npm run build` | ✅ 70 routes |
| `npm test` | ✅ **100 tests** (+3 checkout-origin) |
| TypeScript | ✅ |

---

## 3. Vérifications opérationnelles (environnement local)

| Check | Résultat | Note |
|-------|----------|------|
| Stripe API | ⚠️ Clé **live** détectée (`sk_live…`) — pas de paiement test exécuté | Utiliser staging + clés test pour QA |
| `NEXT_PUBLIC_SITE_URL` | ❌ Absent localement | **Obligatoire prod** (canonical, redirects Stripe) |
| `RESEND_API_KEY` | ❌ Absent localement | Emails non testables ici |
| Supabase | ✅ URL + service role présents | |
| VAPID push | ✅ Présent | Push admin non testé en device |
| Migration P0 promo | ⏳ Fichier créé — **à appliquer** sur Supabase prod/staging |

---

## 4. Scénarios checkout (analyse code post-fix)

| Scénario | Statut code | Test runtime |
|----------|-------------|--------------|
| Panier → Stripe → complete | ✅ Validation serveur inchangée | ⏳ QA manuelle |
| Commande invité | ✅ `user_id` null OK | ⏳ QA manuelle |
| Commande connectée | ✅ `user_id` sur insert + attach sur existing | ⏳ QA manuelle |
| Webhook avant redirect (connecté) | ✅ **Corrigé** — attach user | ⏳ Stripe CLI |
| create-account invité | ✅ Email vérifié | ⏳ QA manuelle |
| create-account email existant | ✅ 409 `account_exists` | ⏳ QA manuelle |
| Annulation + remboursement | ✅ **Implémenté** | ⏳ Admin + Stripe dashboard |
| Emails confirmation | ✅ Code OK | ❌ Resend absent en local |
| PWA manifest | ✅ `/manifest.webmanifest` dynamique | ⏳ Device |

---

## 5. Notes par domaine (post-P0)

| Domaine | Avant | Après | Δ |
|---------|-------|-------|---|
| Checkout / commandes | 55 | **78** | +23 |
| Sécurité | 48 | **68** | +20 |
| API | 65 | **74** | +9 |
| Global | **61** | **74** | +13 |

Domaines inchangés (hors P0) : frontend a11y 52, perf 52, template 55, PWA device testing 65.

---

## 6. Niveau de préparation

| Critère | Avant | Après |
|---------|-------|-------|
| Production LN COS | NO GO LIVE | **GO LIVE conditionnel** |
| Template commercial | NOT READY | NOT READY |
| Clients réels (volume) | Non | Oui après checklist P0-6 à P0-8 |

---

## 7. Blocages restants avant prod réelle

1. **Appliquer migration** `20260627_go_live_p0_hardening.sql`
2. **Configurer `NEXT_PUBLIC_SITE_URL`** en prod
3. **Configurer Resend** (`RESEND_API_KEY`, `RESEND_FROM`)
4. **QA manuelle** checklist (Stripe test mode sur staging)
5. **Webhook Stripe** pointant vers prod/staging
6. P1 recommandés : RDV IDOR, rate limiting, fidélité client-side

---

## 8. Verdict final

### **GO LIVE conditionnel**

Le code des **blocages P0 est corrigé**. LN COS peut passer en production **dès que** :

- la migration Supabase est appliquée ;
- les variables prod sont complètes ;
- la checklist QA manuelle (8 scénarios checkout) est validée sur **staging avec clés Stripe test**.

**Verdict strict sans QA opérationnelle :** encore **NO GO LIVE production immédiate** — uniquement pour absence de tests runtime, pas pour des failles P0 ouvertes dans le code.

### Nouvelle note globale : **74 / 100**

### Classification : **ALMOST READY → GO LIVE conditionnel**

---

## 9. Prochaines actions (ordre)

1. `supabase db push` (migration promo)  
2. Staging + `NEXT_PUBLIC_SITE_URL` + Stripe **test**  
3. Exécuter checklist `docs/GO_LIVE_ACTION_PLAN.md`  
4. Promouvoir prod  
5. Planifier sprint P1 (2 semaines)
