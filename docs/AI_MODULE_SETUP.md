# Module IA LN COS — Installation

Guide d'installation du module Intelligence Artificielle (Anthropic Claude, chiffrement des clés, Supabase).

## Analyse de l'erreur courante

```
AI_ENCRYPTION_KEY ou SUPABASE_SERVICE_ROLE_KEY requis pour chiffrer les clés API
```

Cette erreur apparaît lorsque le **serveur Next.js** ne trouve aucun secret pour chiffrer/déchiffrer les clés API saisies dans l'admin.

| Variable | Rôle |
|----------|------|
| `AI_ENCRYPTION_KEY` | **Recommandée** — secret dédié au chiffrement AES-256-GCM des clés API en base |
| `SUPABASE_SERVICE_ROLE_KEY` | **Repli** — utilisée pour chiffrer si `AI_ENCRYPTION_KEY` est absente |
| `ANTHROPIC_API_KEY` | **Optionnelle** — clé Anthropic côté serveur (prioritaire sur la clé en base) |

> **Important** : ces variables ne doivent **jamais** être préfixées `NEXT_PUBLIC_`. Elles restent exclusivement sur le serveur (`.env.local`, Vercel, Render).

## Où sont-elles utilisées ?

| Fichier | Usage |
|---------|--------|
| `src/lib/ai-env.ts` | Lecture centralisée, diagnostic, démarrage |
| `src/lib/ai-crypto.ts` | Chiffrement / déchiffrement `api_key_encrypted` |
| `src/lib/ai-settings-server.ts` | Sauvegarde et lecture Supabase |
| `src/app/api/admin/ai/*` | Routes API admin (settings, test, generate, blog, diagnostic) |
| `instrumentation.ts` | Avertissement au démarrage du serveur |

## Procédure d'installation

### 1. Variables Supabase (obligatoires)

Dans `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Récupération : Supabase Dashboard → **Project Settings** → **API**.

### 2. Clé de chiffrement IA (fortement recommandée)

Générez une clé aléatoire (32+ caractères) :

```bash
openssl rand -base64 32
```

Ajoutez dans `.env.local` :

```bash
AI_ENCRYPTION_KEY=votre_secret_aleatoire_ici
```

Sans `AI_ENCRYPTION_KEY`, le module utilise `SUPABASE_SERVICE_ROLE_KEY` comme secret de chiffrement (fonctionnel mais moins isolé).

### 3. Clé Anthropic (une des deux options)

**Option A — Variable serveur (CI / production)**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Option B — Interface admin**

Paramètres → IA → saisir la clé → **Tester la connexion** (sauvegarde chiffrée en base).

### 4. Migration Supabase

Appliquez les migrations IA :

```bash
npx supabase db push
```

Fichiers concernés :

- `supabase/migrations/20260616120000_ai_settings.sql`
- `supabase/migrations/20260616120100_ai_usage_logs_error_detail.sql`

### 5. Vérification

1. Redémarrez le serveur de dev : `npm run dev`
2. Admin → **Paramètres** → section **Intelligence Artificielle**
3. Ouvrez **Diagnostic** — tous les contrôles doivent être verts (✓)
4. Cliquez **Tester la connexion**

### 6. Déploiement (Vercel / Render)

Ajoutez les mêmes variables dans le dashboard :

| Variable | Environnement |
|----------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview |
| `AI_ENCRYPTION_KEY` | Production + Preview |
| `ANTHROPIC_API_KEY` | Production (optionnel si clé en base) |

Redéployez après modification des variables.

## Diagnostic intégré

**Paramètres → IA → Diagnostic** affiche :

| Contrôle | Description |
|----------|-------------|
| SUPABASE_URL | `NEXT_PUBLIC_SUPABASE_URL` |
| SUPABASE_SERVICE_ROLE_KEY | Présence (pas la valeur) |
| AI_ENCRYPTION_KEY | Présence ou repli service role |
| ANTHROPIC_API_KEY | Optionnel si clé en base |
| Connexion Supabase | Lecture table `ai_settings` |
| Connexion Anthropic | Appel API test réel |

## Dépannage

| Symptôme | Solution |
|----------|----------|
| Erreur chiffrement à l'enregistrement | Ajouter `AI_ENCRYPTION_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`, redémarrer |
| Table `ai_settings` absente | Exécuter `supabase db push` |
| Test OK mais clé non lue après redémarrage | Même secret de chiffrement sur tous les environnements |
| Clé invalide | Vérifier la clé sur console.anthropic.com |
| Crédit insuffisant | Recharger le compte Anthropic |

## Sécurité

- Les clés API ne sont **jamais** renvoyées au navigateur (seul un masque `sk-••••abcd` est affiché).
- Le chiffrement utilise **AES-256-GCM** côté serveur uniquement.
- Les logs `ai_usage_logs` enregistrent les erreurs détaillées pour l'audit admin.
