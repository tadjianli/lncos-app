# CHECKLIST GO LIVE — LN COS (Staging)

**Objectif :** valider LN COS sur un environnement **staging miroir production** avant ouverture aux clients réels.

**Règle :** cocher une case **uniquement** si le test a été exécuté et réussi. Une case non testée = **NO GO LIVE**.

---

## Informations de session

| Champ | Valeur |
|-------|--------|
| Date | |
| Testeur | |
| URL staging | `https://________________` |
| Branche / commit | |
| Supabase project | |
| Stripe mode | ☐ Test (`sk_test_…`) — **obligatoire** ☐ Live (interdit pour cette checklist) |

---

## Phase 0 — Prérequis staging (bloquant)

Staging doit être **identique à la prod** : mêmes migrations, mêmes variables (sauf clés test), même build.

### 0.1 Déploiement & base de données

- [ ] **0.1.1** Staging déployé (Render / Vercel / autre) avec la dernière version du code P0
- [ ] **0.1.2** Toutes les migrations Supabase appliquées, dont `20260627_go_live_p0_hardening.sql`
- [ ] **0.1.3** `npm run build` OK sur la branche déployée (CI ou local)
- [ ] **0.1.4** Au moins 1 produit actif avec stock ≥ 2 et image
- [ ] **0.1.5** Au moins 1 code promo actif créé pour les tests (voir § 3)

### 0.2 Variables d'environnement staging

Vérifier dans le dashboard hébergeur (valeurs **non vides**) :

- [ ] **0.2.1** `NEXT_PUBLIC_SITE_URL` = URL staging exacte (ex. `https://staging.lncos.fr`)
- [ ] **0.2.2** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **0.2.3** `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement)
- [ ] **0.2.4** `STRIPE_SECRET_KEY` = clé **test** (`sk_test_…`)
- [ ] **0.2.5** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = clé **test** (`pk_test_…`)
- [ ] **0.2.6** `STRIPE_WEBHOOK_SECRET` = secret webhook **staging** (endpoint dédié)
- [ ] **0.2.7** `RESEND_API_KEY` + `RESEND_FROM` (domaine vérifié ou sandbox Resend)
- [ ] **0.2.8** `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`
- [ ] **0.2.9** Aucune clé secrète exposée en `NEXT_PUBLIC_*` (health admin si accès)

### 0.3 Stripe test mode

- [ ] **0.3.1** Dashboard Stripe en mode **Test** (interrupteur orange)
- [ ] **0.3.2** Webhook staging configuré : `https://<staging>/api/stripe/webhook`  
  Événements : `checkout.session.completed` (minimum)
- [ ] **0.3.3** Webhook test reçu avec succès (Stripe Dashboard → Webhooks → Recent events → 200)
- [ ] **0.3.4** Carte test notée : `4242 4242 4242 4242` · exp. future · CVC `123`

### 0.4 Comptes de test

| Rôle | Email | Mot de passe | Notes |
|------|-------|--------------|-------|
| Admin | | | `profiles.is_admin = true` |
| Client A (connecté) | | | Compte existant avant tests |
| Client B (invité) | | | Email unique, pas de compte |

- [ ] **0.4.1** Compte admin fonctionnel → `/login`
- [ ] **0.4.2** Compte client A créé et validé

### 0.5 Santé API

- [ ] **0.5.1** `GET https://<staging>/api/health` → 200
- [ ] **0.5.2** `GET https://<staging>/manifest.webmanifest` → JSON valide, `name` LN COS

**Phase 0 complète :** ☐ Oui → continuer · ☐ Non → **STOP — NO GO LIVE**

---

## Phase 1 — Checkout & commandes

### 1.1 Commande invité

**Produit test :** _________________ · Stock avant : _____

- [ ] **1.1.1** Navigation privée / déconnecté
- [ ] **1.1.2** Ajout au panier → `/bag` — articles et total corrects
- [ ] **1.1.3** Checkout : adresse complète + email invité `________________`
- [ ] **1.1.4** Redirection Stripe Checkout (URL contient `checkout.stripe.com`, mode test)
- [ ] **1.1.5** Paiement carte `4242…` → retour `/bag` → écran confirmation
- [ ] **1.1.6** URL de retour = domaine staging (pas de redirect externe)
- [ ] **1.1.7** Panier vidé après succès
- [ ] **1.1.8** Supabase `orders` : nouvelle ligne `payment_status = paid`, `user_id` NULL
- [ ] **1.1.9** Supabase `order_items` : lignes correspondantes
- [ ] **1.1.10** Stock produit décrémenté (noter stock après : _____)

**Réf. commande invité :** `#________________`

---

### 1.2 Commande connectée

**Produit test :** _________________ · Connecté en **Client A**

- [ ] **1.2.1** Connexion via overlay profil (compte Client A)
- [ ] **1.2.2** Achat complet même flux que 1.1
- [ ] **1.2.3** Supabase `orders.user_id` = UUID Client A
- [ ] **1.2.4** `/profile` → onglet commandes → commande visible
- [ ] **1.2.5** Détail commande + tracking accessibles

**Réf. commande connectée :** `#________________`

---

### 1.3 Code promo

**Promo test :** code `________` · type ________ · `max_uses` = _____

- [ ] **1.3.1** Promo appliquée au panier — remise affichée
- [ ] **1.3.2** Total panier = total recalculé (cohérent avec admin)
- [ ] **1.3.3** Paiement Stripe réussi avec montant réduit
- [ ] **1.3.4** Supabase `orders.promo_code` + `discount` corrects
- [ ] **1.3.5** (Si `max_uses = 1`) Deuxième commande avec même code → rejet checkout **ou** promo non incrémentée au-delà de la limite

**Réf. commande promo :** `#________________`

---

### 1.4 Webhook (race condition — recommandé)

- [ ] **1.4.1** Commande connectée : fermer l’onglet **avant** retour `/bag` (ou Stripe CLI seul)
- [ ] **1.4.2** Webhook `checkout.session.completed` → 200
- [ ] **1.4.3** Commande créée ; après reconnexion Client A → visible dans `/profile` (`user_id` rattaché)

---

## Phase 2 — Emails

Boîte de réception test : `________________`

### 2.1 Email confirmation

- [ ] **2.1.1** Email reçu ≤ 5 min après commande invité (§ 1.1)
- [ ] **2.1.2** Objet contient référence commande
- [ ] **2.1.3** Montant et articles cohérents
- [ ] **2.1.4** Expéditeur = `RESEND_FROM` configuré
- [ ] **2.1.5** Supabase `orders.confirmation_email_sent_at` renseigné

### 2.2 Email expédition

- [ ] **2.2.1** Admin → `/admin/orders` → commande test → statut **Expédié**
- [ ] **2.2.2** Numéro de suivi renseigné (optionnel : transporteur)
- [ ] **2.2.3** Email expédition reçu par le client
- [ ] **2.2.4** Lien suivi fonctionnel
- [ ] **2.2.5** Supabase `orders.shipped_email_sent_at` renseigné

---

## Phase 3 — Historique & admin (remboursement + restock)

Utiliser la **commande invité** § 1.1 (ou une commande dédiée).

**Produit + variante :** _________________ · **Stock avant annulation :** _____

### 3.1 Historique commande (client)

- [ ] **3.1.1** Invité : pas d’historique `/profile` sans compte (comportement attendu)
- [ ] **3.1.2** Client A : toutes les commandes § 1.2 visibles avec bon statut
- [ ] **3.1.3** Page tracking `/profile/orders/<ref>/tracking` s’affiche si expédié

### 3.2 Remboursement admin

- [ ] **3.2.1** Admin → commande payée → statut **Annulé**
- [ ] **3.2.2** Réponse API succès (`refunded: true` dans réseau ou pas d’erreur UI)
- [ ] **3.2.3** Stripe Dashboard (test) → paiement **Remboursé**
- [ ] **3.2.4** Supabase `orders.payment_status = refunded`, `status = cancelled`

### 3.3 Restock automatique

- [ ] **3.3.1** Stock produit après annulation = stock avant commande (§ 1.1) ± 0
- [ ] **3.3.2** Supabase `orders.stock_adjusted = false` après annulation
- [ ] **3.3.3** (Variante) Stock variante correct si produit avec variantes

**Réf. commande annulée :** `#________________`

---

## Phase 4 — PWA

URL de test : `https://<staging>/`

### 4.1 PWA Android (Chrome)

Appareil : _________________

- [ ] **4.1.1** Chrome → site staging → menu « Ajouter à l’écran d’accueil » proposé
- [ ] **4.1.2** Icône LN COS correcte sur l’écran d’accueil
- [ ] **4.1.3** Lancement standalone (sans barre d’adresse Chrome)
- [ ] **4.1.4** Navigation : accueil → boutique → panier OK
- [ ] **4.1.5** Mode avion → page `/offline` ou message hors ligne acceptable
- [ ] **4.1.6** Retour en ligne → rechargement / navigation OK

### 4.2 PWA iPhone (Safari)

Appareil : _________________ · iOS _____

- [ ] **4.2.1** Safari → Partager → « Sur l’écran d’accueil »
- [ ] **4.2.2** Icône et nom d’app corrects
- [ ] **4.2.3** Lancement standalone (status bar cohérente)
- [ ] **4.2.4** Safe area bas (tab bar) — contenu non masqué sur accueil et panier
- [ ] **4.2.5** Fiche produit plein écran — CTA visible au-dessus de la tab bar
- [ ] **4.2.6** Mode avion → comportement offline acceptable

---

## Phase 5 — SEO

URL staging : `https://<staging>`

### 5.1 Sitemap

- [ ] **5.1.1** `GET /sitemap.xml` → 200, XML valide
- [ ] **5.1.2** Contient `/` (accueil)
- [ ] **5.1.3** Contient au moins 1 URL produit `/produit/…`
- [ ] **5.1.4** Contient `/boutique`, `/blog` (si module actif)
- [ ] **5.1.5** URLs utilisent le domaine staging (`NEXT_PUBLIC_SITE_URL`), pas `lncos.fr` par défaut
- [ ] **5.1.6** `GET /sitemap-blog.xml` → 200 (si blog activé)

### 5.2 Robots

- [ ] **5.2.1** `GET /robots.txt` → 200
- [ ] **5.2.2** `Disallow: /admin` présent
- [ ] **5.2.3** `Disallow: /bag` ou routes privées présentes
- [ ] **5.2.4** Ligne `Sitemap:` pointe vers staging `/sitemap.xml`

### 5.3 Schema.org / JSON-LD

Outil : [Google Rich Results Test](https://search.google.com/test/rich-results) ou inspecteur

- [ ] **5.3.1** Accueil `/` — JSON-LD `Organization` + `WebSite` détecté
- [ ] **5.3.2** Fiche produit `/produit/<slug>` — JSON-LD `Product` détecté
- [ ] **5.3.3** Pas d’erreur critique Rich Results (avertissements mineurs acceptés)
- [ ] **5.3.4** Article blog `/blog/<slug>` — JSON-LD article (si blog publié)

### 5.4 Meta & Open Graph (échantillon)

- [ ] **5.4.1** Accueil — `<title>`, `description`, `og:image` présents
- [ ] **5.4.2** Produit — canonical = URL staging `/produit/…`
- [ ] **5.4.3** Partage link preview (Slack / iMessage / WhatsApp) — titre + image OK

---

## Phase 6 — Responsive

**Critère LN COS :** app mobile-first 480px centrée ; tablette/desktop = bandes latérales acceptées, **pas de contenu coupé ni de CTA inaccessible**.

### 6.1 Mobile (375 × 812 — iPhone)

- [ ] **6.1.1** Accueil — hero, scroll, tab bar visibles
- [ ] **6.1.2** Boutique — listing + recherche utilisables
- [ ] **6.1.3** Fiche produit overlay — galerie + bouton ajouter panier accessible
- [ ] **6.1.4** Panier / checkout — formulaire adresse + payer sans scroll bloqué
- [ ] **6.1.5** Profil + commandes lisibles

### 6.2 Tablette (768 × 1024 — iPad)

- [ ] **6.2.1** Shell centré, pas de débordement horizontal
- [ ] **6.2.2** Tab bar alignée avec le shell
- [ ] **6.2.3** Checkout et admin (si testé mobile admin) utilisables

### 6.3 Desktop (1440 × 900)

- [ ] **6.3.1** Shell 480px centré — pas de layout cassé
- [ ] **6.3.2** Navigation souris : menus, panier, liens footer OK
- [ ] **6.3.3** Popups marketing ne masquent pas les CTA critiques

---

## Phase 7 — Récapitulatif par bloc

| Bloc | Cases OK | Cases total | % | Bloquant |
|------|----------|-------------|---|----------|
| 0 — Prérequis | | 20 | | Oui |
| 1 — Checkout | | | | Oui |
| 2 — Emails | | 10 | | Oui |
| 3 — Admin / restock | | | | Oui |
| 4 — PWA | | 12 | | Oui |
| 5 — SEO | | | | Oui |
| 6 — Responsive | | 13 | | Oui |

**Cases bloquantes échouées (lister) :**

1. 
2. 
3. 

---

## Verdict final

### Règles de décision

| Condition | Verdict |
|-----------|---------|
| **100 %** des cases Phase 0 + **100 %** des cases § 1.1, 1.2, 1.3, 2.1, 2.2, 3.2, 3.3 cochées | Éligible GO LIVE |
| Stripe en mode **live** pendant les tests | **NO GO LIVE** automatique |
| Une case bloquante non cochée | **NO GO LIVE** |
| PWA ou SEO : ≥ 1 échec sur cases obligatoires | **NO GO LIVE** |
| Responsive : CTA checkout/panier inaccessible sur mobile | **NO GO LIVE** |

### Cases obligatoires minimum (résumé)

- [ ] Stripe test mode validé (§ 0.3)
- [ ] Commande invité (§ 1.1)
- [ ] Commande connectée (§ 1.2)
- [ ] Code promo (§ 1.3)
- [ ] Email confirmation (§ 2.1)
- [ ] Email expédition (§ 2.2)
- [ ] Historique commande (§ 3.1)
- [ ] Remboursement admin (§ 3.2)
- [ ] Restock automatique (§ 3.3)
- [ ] PWA Android (§ 4.1)
- [ ] PWA iPhone (§ 4.2)
- [ ] Sitemap (§ 5.1)
- [ ] Robots (§ 5.2)
- [ ] Schema.org (§ 5.3)
- [ ] Responsive mobile (§ 6.1)
- [ ] Responsive tablette (§ 6.2)
- [ ] Responsive desktop (§ 6.3)

---

## Décision

Cocher **une seule** case :

- [ ] **GO LIVE READY** — Toutes les cases obligatoires cochées · Staging validé · Prêt promotion prod
- [ ] **NO GO LIVE** — Échecs listés ci-dessus · Corrections requises avant prod

**Signé :** ________________ **Date :** ________________

**Commentaires :**

```




```

---

## Annexe — Commandes utiles

```bash
# Webhook local → staging (dev uniquement)
stripe listen --forward-to https://<staging>/api/stripe/webhook

# Vérifier health
curl -s https://<staging>/api/health | jq .

# Vérifier sitemap
curl -sI https://<staging>/sitemap.xml

# Vérifier robots
curl -s https://<staging>/robots.txt
```

### Promo test suggérée (admin)

| Champ | Valeur exemple |
|-------|----------------|
| Code | `STAGING10` |
| Type | `percent` · 10 % |
| max_uses | `1` (pour tester § 1.3.5) |
| minimum_order | `0` |

---

*Document : `docs/GO_LIVE_CHECKLIST.md` · À dupliquer par session de test (copier en `GO_LIVE_CHECKLIST-YYYY-MM-DD.md` si archivage).*
