/**
 * LN COS — Variables d'environnement module IA (serveur uniquement)
 */

import {
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export type AiEnvCheckId =
  | "supabase_url"
  | "supabase_service_role_key"
  | "ai_encryption_key"
  | "anthropic_api_key"
  | "supabase_connection"
  | "anthropic_connection";

export interface AiEnvCheckItem {
  id: AiEnvCheckId;
  label: string;
  ok: boolean;
  hint: string;
}

export interface AiEnvStatus {
  checks: AiEnvCheckItem[];
  encryptionReady: boolean;
  encryptionSource: "ai_encryption_key" | "service_role_fallback" | "none";
  canPersistApiKeys: boolean;
  anthropicKeySource: "env" | "database" | "none";
  ready: boolean;
}

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

function envHint(key: string, okMessage: string, missingMessage: string, emptyMessage: string): string {
  if (!(key in process.env)) return missingMessage;
  if (!readEnv(key)) return emptyMessage;
  return okMessage;
}

/** Secret de chiffrement — jamais exposé au client. */
export function getAiEncryptionSecret(): string | null {
  const dedicated = readEnv("AI_ENCRYPTION_KEY");
  if (dedicated) return dedicated;
  const service = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (service) return service;
  return null;
}

export function isAiEncryptionConfigured(): boolean {
  return getAiEncryptionSecret() !== null;
}

export function getEncryptionSource(): AiEnvStatus["encryptionSource"] {
  if (readEnv("AI_ENCRYPTION_KEY")) return "ai_encryption_key";
  if (readEnv("SUPABASE_SERVICE_ROLE_KEY")) return "service_role_fallback";
  return "none";
}

/** Clé Anthropic depuis l'environnement serveur (optionnelle). */
export function getAnthropicApiKeyFromEnv(): string | null {
  const key = readEnv("ANTHROPIC_API_KEY");
  return key || null;
}

/** Priorité : variable serveur, puis clé déchiffrée en base. */
export function resolveAnthropicApiKey(storedDecrypted: string | null): string | null {
  return getAnthropicApiKeyFromEnv() ?? storedDecrypted;
}

export function getAnthropicKeySource(
  storedDecrypted: string | null
): AiEnvStatus["anthropicKeySource"] {
  if (getAnthropicApiKeyFromEnv()) return "env";
  if (storedDecrypted) return "database";
  return "none";
}

export function assertAiEncryptionConfigured(): void {
  if (!isAiEncryptionConfigured()) {
    throw new Error(
      "Configuration serveur incomplète : définissez AI_ENCRYPTION_KEY (recommandé) ou SUPABASE_SERVICE_ROLE_KEY dans .env.local / variables Vercel. Ces secrets ne doivent jamais être préfixés NEXT_PUBLIC_."
    );
  }
}

export function getAiEncryptionErrorMessage(): string {
  return (
    "Chiffrement indisponible : ajoutez AI_ENCRYPTION_KEY (recommandé, 32+ caractères aléatoires) " +
    "ou SUPABASE_SERVICE_ROLE_KEY dans .env.local. Variables serveur uniquement — jamais NEXT_PUBLIC_."
  );
}

export function checkAiEnvStatic(): AiEnvCheckItem[] {
  const supabaseUrlOk = Boolean(SUPABASE_URL);
  const serviceRoleOk = Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const aiEncryptionOk = Boolean(readEnv("AI_ENCRYPTION_KEY"));
  const encryptionReady = isAiEncryptionConfigured();
  const anthropicEnvOk = Boolean(getAnthropicApiKeyFromEnv());

  return [
    {
      id: "supabase_url",
      label: "SUPABASE_URL",
      ok: supabaseUrlOk,
      hint: supabaseUrlOk
        ? "NEXT_PUBLIC_SUPABASE_URL configurée"
        : "Manquante — ajoutez NEXT_PUBLIC_SUPABASE_URL",
    },
    {
      id: "supabase_service_role_key",
      label: "SUPABASE_SERVICE_ROLE_KEY",
      ok: serviceRoleOk,
      hint: envHint(
        "SUPABASE_SERVICE_ROLE_KEY",
        "Clé service role présente (serveur)",
        "Manquante — Supabase Dashboard → Settings → API → service_role",
        "Ligne présente dans .env.local mais valeur vide — collez la clé service_role"
      ),
    },
    {
      id: "ai_encryption_key",
      label: "AI_ENCRYPTION_KEY",
      ok: aiEncryptionOk,
      hint: aiEncryptionOk
        ? "Clé de chiffrement dédiée configurée"
        : encryptionReady
          ? "Non définie — repli sur SUPABASE_SERVICE_ROLE_KEY pour le chiffrement"
          : envHint(
              "AI_ENCRYPTION_KEY",
              "Clé de chiffrement dédiée configurée",
              "Manquante — recommandée (openssl rand -base64 32) ou définir SUPABASE_SERVICE_ROLE_KEY",
              "Ligne présente mais valeur vide"
            ),
    },
    {
      id: "anthropic_api_key",
      label: "ANTHROPIC_API_KEY",
      ok: anthropicEnvOk,
      hint: anthropicEnvOk
        ? "Clé Anthropic serveur configurée (prioritaire sur la base)"
        : envHint(
            "ANTHROPIC_API_KEY",
            "Clé Anthropic serveur configurée",
            "Optionnelle si une clé est enregistrée chiffrée en base via l'admin",
            "Ligne présente mais valeur vide — ou saisissez la clé dans l'admin"
          ),
    },
  ];
}

export function buildAiEnvStatus(
  extras: Pick<AiEnvStatus, "checks"> & {
    supabaseConnectionOk: boolean;
    anthropicConnectionOk: boolean;
    anthropicKeySource: AiEnvStatus["anthropicKeySource"];
    supabaseConnectionHint: string;
    anthropicConnectionHint: string;
  }
): AiEnvStatus {
  const encryptionReady = isAiEncryptionConfigured();
  const encryptionSource = getEncryptionSource();
  const staticChecks = checkAiEnvStatic();

  const checks: AiEnvCheckItem[] = [
    ...staticChecks,
    {
      id: "supabase_connection",
      label: "Connexion Supabase",
      ok: extras.supabaseConnectionOk,
      hint: extras.supabaseConnectionHint,
    },
    {
      id: "anthropic_connection",
      label: "Connexion Anthropic",
      ok: extras.anthropicConnectionOk,
      hint: extras.anthropicConnectionHint,
    },
  ];

  const canPersistApiKeys = encryptionReady && extras.supabaseConnectionOk;
  const hasAnthropicKey =
    extras.anthropicKeySource === "env" || extras.anthropicKeySource === "database";

  return {
    checks,
    encryptionReady,
    encryptionSource,
    canPersistApiKeys,
    anthropicKeySource: extras.anthropicKeySource,
    ready: canPersistApiKeys && hasAnthropicKey,
  };
}

/** Journalise les manques au démarrage du serveur Node. */
export function logAiEnvStartupCheck(): void {
  const staticChecks = checkAiEnvStatic();
  const missing = staticChecks.filter((c) => !c.ok && c.id !== "anthropic_api_key");
  if (missing.length === 0) return;

  const lines = missing.map((c) => `  - ${c.label}: ${c.hint}`).join("\n");
  console.warn(
    `[lncos-ai] Variables d'environnement manquantes ou incomplètes :\n${lines}\n` +
      "  Voir docs/AI_MODULE_SETUP.md"
  );

  if (!isAiEncryptionConfigured()) {
    console.warn(
      "[lncos-ai] Sauvegarde des clés API IA impossible sans AI_ENCRYPTION_KEY ou SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}
