/**
 * LN COS — Accès serveur ai_settings + logs
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/env";
import { decryptApiKey, encryptApiKey } from "@/lib/ai-crypto";
import {
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

const SETTINGS_ID = "default";

type AiSupabase = SupabaseClient<Database>;

/** Service role si disponible, sinon session admin (RLS is_admin). */
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
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const row = data as DbAiSettings | null;
  let apiKey: string | null = null;
  if (row?.api_key_encrypted) {
    try {
      apiKey = decryptApiKey(row.api_key_encrypted);
    } catch {
      apiKey = null;
    }
  }
  return {
    settings: dbToAiSettings(row, apiKey),
    apiKey,
  };
}

export async function saveAiSettingsServer(
  input: AiSettingsInput,
  apiKeyPlain?: string
): Promise<AiSettings> {
  const supabase = await createAiSupabaseClient();
  const { data: existing } = await supabase
    .from("ai_settings")
    .select("api_key_encrypted")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  let encrypted = (existing as { api_key_encrypted?: string | null } | null)?.api_key_encrypted ?? null;
  if (apiKeyPlain?.trim()) {
    encrypted = encryptApiKey(apiKeyPlain.trim());
  }

  const payload = {
    id: SETTINGS_ID,
    ...aiSettingsToDb(input, encrypted),
  };

  const { data, error } = await supabase
    .from("ai_settings")
    .upsert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const row = data as DbAiSettings;
  const key = encrypted ? decryptApiKey(encrypted) : null;
  return dbToAiSettings(row, key);
}

export async function markAiTestResult(ok: boolean): Promise<void> {
  const supabase = await createAiSupabaseClient();
  await supabase
    .from("ai_settings")
    .update({
      last_test_ok: ok,
      last_test_at: new Date().toISOString(),
    })
    .eq("id", SETTINGS_ID);
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
}): Promise<void> {
  const supabase = await createAiSupabaseClient();
  await supabase.from("ai_usage_logs").insert({
    user_id: opts.userId,
    user_email: opts.userEmail ?? null,
    action: opts.action,
    provider: opts.provider,
    model: opts.model,
    tokens_input: opts.tokensInput,
    tokens_output: opts.tokensOutput,
    cost_eur: opts.costEur,
  });
}

export async function fetchAiUsageLogs(limit = 50): Promise<AiUsageLogRow[]> {
  const supabase = await createAiSupabaseClient();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("id,user_email,action,provider,model,tokens_input,tokens_output,cost_eur,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AiUsageLogRow[];
}

export async function fetchAiUsageStats(): Promise<AiUsageStats> {
  const supabase = await createAiSupabaseClient();
  const { data, error } = await supabase
    .from("ai_usage_logs")
    .select("cost_eur, created_at");

  if (error) throw new Error(error.message);

  const now = Date.now();
  const dayMs = 86400000;
  let todayEur = 0;
  let weekEur = 0;
  let monthEur = 0;

  for (const row of data ?? []) {
    const cost = Number((row as { cost_eur: number }).cost_eur) || 0;
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
