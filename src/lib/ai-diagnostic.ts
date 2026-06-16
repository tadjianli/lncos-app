/**
 * LN COS — Diagnostic module IA (serveur)
 */

import { anthropicTestConnection, classifyAnthropicError } from "@/lib/ai-anthropic-client";
import { decryptApiKey } from "@/lib/ai-crypto";
import {
  buildAiEnvStatus,
  getAnthropicApiKeyFromEnv,
  getAnthropicKeySource,
  isAiEncryptionConfigured,
  resolveAnthropicApiKey,
  type AiEnvStatus,
} from "@/lib/ai-env";
import { AI_SETTINGS_ROW_ID } from "@/lib/ai-settings";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/lib/database.types";

async function probeSupabase(): Promise<{ ok: boolean; hint: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, hint: "Supabase non configuré (URL ou anon key)" };
  }

  try {
    let client;
    try {
      client = createServiceClient();
    } catch {
      client = await createClient();
    }

    const { error } = await client
      .from("ai_settings")
      .select("id")
      .eq("id", AI_SETTINGS_ROW_ID)
      .maybeSingle();

    if (error) {
      if (/does not exist|ai_settings/i.test(error.message)) {
        return {
          ok: false,
          hint: "Table ai_settings absente — appliquez la migration 20260616120000_ai_settings.sql",
        };
      }
      return { ok: false, hint: error.message };
    }

    return { ok: true, hint: "Lecture ai_settings OK" };
  } catch (e) {
    return {
      ok: false,
      hint: e instanceof Error ? e.message : "Erreur connexion Supabase",
    };
  }
}

async function loadStoredAnthropicKey(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    let client;
    try {
      client = createServiceClient();
    } catch {
      client = await createClient();
    }

    const { data, error } = await client
      .from("ai_settings")
      .select("api_key_encrypted")
      .eq("id", AI_SETTINGS_ROW_ID)
      .maybeSingle();

    if (error || !data?.api_key_encrypted) return null;
    if (!isAiEncryptionConfigured()) return null;

    try {
      return decryptApiKey(data.api_key_encrypted);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

async function probeAnthropic(storedKey: string | null): Promise<{ ok: boolean; hint: string }> {
  const apiKey = resolveAnthropicApiKey(storedKey);
  if (!apiKey) {
    return {
      ok: false,
      hint: "Aucune clé — définissez ANTHROPIC_API_KEY (serveur) ou enregistrez une clé dans l'admin",
    };
  }

  try {
    const result = await anthropicTestConnection(apiKey);
    if (!result.text) {
      return { ok: false, hint: "Réponse Anthropic vide" };
    }
    const source = getAnthropicApiKeyFromEnv() ? "via ANTHROPIC_API_KEY" : "via clé chiffrée en base";
    return { ok: true, hint: `Test API réussi ${source}` };
  } catch (e) {
    const classified = classifyAnthropicError(e);
    return { ok: false, hint: `${classified.message} — ${classified.detail}` };
  }
}

export async function runAiDiagnostic(): Promise<AiEnvStatus> {
  const storedKey = await loadStoredAnthropicKey();
  const supabaseProbe = await probeSupabase();
  const anthropicProbe = await probeAnthropic(storedKey);
  const anthropicKeySource = getAnthropicKeySource(storedKey);

  return buildAiEnvStatus({
    checks: [],
    supabaseConnectionOk: supabaseProbe.ok,
    supabaseConnectionHint: supabaseProbe.hint,
    anthropicConnectionOk: anthropicProbe.ok,
    anthropicConnectionHint: anthropicProbe.hint,
    anthropicKeySource,
  });
}
