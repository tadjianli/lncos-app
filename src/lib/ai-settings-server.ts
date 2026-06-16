/**
 * LN COS — Accès serveur ai_settings + logs
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/env";
import { decryptApiKey, encryptApiKey } from "@/lib/ai-crypto";
import {
  assertAiEncryptionConfigured,
  getAiEncryptionErrorMessage,
  getAnthropicKeySource,
  resolveAnthropicApiKey,
} from "@/lib/ai-env";
import {
  AI_SETTINGS_ROW_ID,
  aiSettingsToDb,
  dbToAiSettings,
  type AiSettings,
  type AiSettingsInput,
  type AiUsageLogRow,
  type AiUsageStats,
  type DbAiSettings,
} from "@/lib/ai-settings";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type AiSupabase = SupabaseClient<Database>;

/** Client service role (recommandé) ou session admin (RLS). */
async function createAiSupabaseClient(): Promise<AiSupabase> {
  if (isSupabaseConfigured() && SUPABASE_SERVICE_ROLE_KEY) {
    return createServiceClient();
  }
  return createClient();
}

export async function loadAiSettingsServer(): Promise<{
  settings: AiSettings;
  apiKey: string | null;
}> {
  const supabase = await createAiSupabaseClient();
  const { data, error } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("id", AI_SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const row = data as DbAiSettings | null;
  let storedKey: string | null = null;
  if (row?.api_key_encrypted) {
    try {
      storedKey = decryptApiKey(row.api_key_encrypted);
    } catch {
      storedKey = null;
    }
  }

  const apiKey = resolveAnthropicApiKey(storedKey);
  const settings = dbToAiSettings(row, storedKey);
  settings.hasApiKey = getAnthropicKeySource(storedKey) !== "none";

  return { settings, apiKey };
}

export async function saveAiSettingsServer(
  input: AiSettingsInput,
  apiKeyPlain?: string
): Promise<AiSettings> {
  if (apiKeyPlain?.trim()) {
    assertAiEncryptionConfigured();
  }

  const supabase = await createAiSupabaseClient();
  const { data: existing } = await supabase
    .from("ai_settings")
    .select("api_key_encrypted")
    .eq("id", AI_SETTINGS_ROW_ID)
    .maybeSingle();

  let encrypted = (existing as { api_key_encrypted?: string | null } | null)?.api_key_encrypted ?? null;
  if (apiKeyPlain?.trim()) {
    try {
      encrypted = encryptApiKey(apiKeyPlain.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur chiffrement";
      if (/AI_ENCRYPTION_KEY|SUPABASE_SERVICE_ROLE_KEY/i.test(msg)) {
        throw new Error(getAiEncryptionErrorMessage());
      }
      throw e;
    }
  }

  const payload = {
    id: AI_SETTINGS_ROW_ID,
    ...aiSettingsToDb(input, encrypted),
  };

  const { data, error } = await supabase
    .from("ai_settings")
    .upsert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const row = data as DbAiSettings;
  let storedKey: string | null = null;
  if (encrypted) {
    try {
      storedKey = decryptApiKey(encrypted);
    } catch {
      storedKey = null;
    }
  }
  const settings = dbToAiSettings(row, storedKey);
  settings.hasApiKey = getAnthropicKeySource(storedKey) !== "none";
  return settings;
}

export async function markAiTestResult(ok: boolean): Promise<void> {
  const supabase = await createAiSupabaseClient();
  await supabase
    .from("ai_settings")
    .update({
      last_test_ok: ok,
      last_test_at: new Date().toISOString(),
    })
    .eq("id", AI_SETTINGS_ROW_ID);
}

export async function logAiUsage(opts: {
  userId: string;
  userEmail?: string;
  action: string;
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costEur: number;
  errorDetail?: string | null;
}): Promise<void> {
  const supabase = await createAiSupabaseClient();
  await supabase.from("ai_usage_logs").insert({
    user_id: opts.userId,
    user_email: opts.userEmail ?? null,
    action: opts.action,
    provider: opts.provider,
    model: opts.model,
    tokens: opts.tokensInput + opts.tokensOutput,
    estimated_cost: opts.costEur,
    error_detail: opts.errorDetail ?? null,
  });
}

export async function fetchAiUsageLogs(limit = 50): Promise<AiUsageLogRow[]> {
  const supabase = await createAiSupabaseClient();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id,user_email,action,provider,model,tokens,estimated_cost,error_detail,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AiUsageLogRow[];
}

export async function fetchAiUsageStats(): Promise<AiUsageStats> {
  const supabase = await createAiSupabaseClient();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("estimated_cost, created_at");

  if (error) throw new Error(error.message);

  const now = Date.now();
  const dayMs = 86400000;
  let todayEur = 0;
  let weekEur = 0;
  let monthEur = 0;

  for (const row of data ?? []) {
    const cost = Number((row as { estimated_cost: number }).estimated_cost) || 0;
    const created = new Date((row as { created_at: string }).created_at).getTime();
    const age = now - created;
    if (age <= dayMs) todayEur += cost;
    if (age <= 7 * dayMs) weekEur += cost;
    if (age <= 30 * dayMs) monthEur += cost;
  }

  return {
    todayEur: Number(todayEur.toFixed(4)),
    weekEur: Number(weekEur.toFixed(4)),
    monthEur: Number(monthEur.toFixed(4)),
    totalRequests: data?.length ?? 0,
  };
}

export { getAiEncryptionErrorMessage };
