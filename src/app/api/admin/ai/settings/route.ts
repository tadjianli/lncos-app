import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { isEncryptionConfigured } from "@/lib/ai-crypto";
import {
  checkAiEnvStatic,
  getAiEncryptionErrorMessage,
  isAiEncryptionConfigured,
} from "@/lib/ai-env";
import {
  fetchAiUsageLogs,
  fetchAiUsageStats,
  loadAiSettingsServer,
  saveAiSettingsServer,
} from "@/lib/ai-settings-server";
import { DEFAULT_AI_SETTINGS, type AiSettingsInput } from "@/lib/ai-settings";

function mapSettingsError(e: unknown): string {
  const raw = e instanceof Error ? e.message : "Erreur serveur";
  if (
    raw.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    raw.includes("AI_ENCRYPTION_KEY") ||
    raw.includes("Chiffrement indisponible") ||
    raw.includes("Configuration serveur incomplète")
  ) {
    return getAiEncryptionErrorMessage();
  }
  if (raw.includes("ai_settings") || raw.includes("does not exist")) {
    return "Table ai_settings absente — appliquez la migration Supabase 20260616120000_ai_settings.sql";
  }
  return raw;
}

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const [{ settings }, logs, stats] = await Promise.all([
      loadAiSettingsServer(),
      fetchAiUsageLogs(50),
      fetchAiUsageStats(),
    ]);

    const envChecks = checkAiEnvStatic();

    return NextResponse.json({
      settings: {
        ...settings,
        apiKeyMasked: settings.apiKeyMasked,
      },
      logs,
      stats,
      encryptionConfigured: isEncryptionConfigured(),
      envChecks,
      canPersistApiKeys: isAiEncryptionConfigured(),
      encryptionErrorMessage: isAiEncryptionConfigured() ? null : getAiEncryptionErrorMessage(),
    });
  } catch (e) {
    return NextResponse.json({ error: mapSettingsError(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  if (!isAiEncryptionConfigured()) {
    return NextResponse.json({ error: getAiEncryptionErrorMessage(), ok: false }, { status: 503 });
  }

  try {
    const body = (await req.json()) as AiSettingsInput & { apiKey?: string };
    const merged: AiSettingsInput = {
      ...DEFAULT_AI_SETTINGS,
      ...body,
    };
    delete (merged as { apiKeyMasked?: unknown }).apiKeyMasked;
    delete (merged as { hasApiKey?: unknown }).hasApiKey;

    const settings = await saveAiSettingsServer(merged, body.apiKey);
    return NextResponse.json({
      settings: {
        ...settings,
        apiKey: undefined,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: mapSettingsError(e) }, { status: 500 });
  }
}
