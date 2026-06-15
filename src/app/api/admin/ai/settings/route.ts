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
    const msg = e instanceof Error ? e.message : "Erreur serveur";
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
    const msg = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
