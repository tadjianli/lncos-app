import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { isEncryptionConfigured } from "@/lib/ai-crypto";
import { fetchAiUsageLogs, fetchAiUsageStats, loadAiSettingsServer, saveAiSettingsServer } from "@/lib/ai-settings-server";
import { DEFAULT_AI_SETTINGS, type AiSettingsInput } from "@/lib/ai-settings";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const [{ settings }, logs, stats] = await Promise.all([
      loadAiSettingsServer(),
      fetchAiUsageLogs(50),
      fetchAiUsageStats(),
    ]);

    return NextResponse.json({
      settings: {
        ...settings,
        apiKeyMasked: settings.apiKeyMasked,
      },
      logs,
      stats,
      encryptionConfigured: isEncryptionConfigured(),
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Erreur serveur";
    const msg =
      raw.includes("SUPABASE_SERVICE_ROLE_KEY") || raw.includes("AI_ENCRYPTION_KEY")
        ? "Chiffrement indisponible : ajoutez AI_ENCRYPTION_KEY ou SUPABASE_SERVICE_ROLE_KEY dans .env.local"
        : raw.includes("ai_settings") || raw.includes("does not exist")
          ? "Table ai_settings absente — appliquez la migration Supabase 20260713_ai_settings.sql"
          : raw;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

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
    const raw = e instanceof Error ? e.message : "Erreur serveur";
    const msg =
      raw.includes("SUPABASE_SERVICE_ROLE_KEY") || raw.includes("AI_ENCRYPTION_KEY")
        ? "Chiffrement indisponible : ajoutez AI_ENCRYPTION_KEY ou SUPABASE_SERVICE_ROLE_KEY dans .env.local"
        : raw.includes("ai_settings") || raw.includes("does not exist")
          ? "Table ai_settings absente — appliquez la migration Supabase 20260713_ai_settings.sql"
          : raw;
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
