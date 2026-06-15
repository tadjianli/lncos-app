import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { completeAi, estimateCostEur, testAiProvider } from "@/lib/ai-provider-client";
import {
  loadAiSettingsServer,
  logAiUsage,
  markAiTestResult,
} from "@/lib/ai-settings-server";
import type { AiProvider } from "@/lib/ai-settings";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      provider?: AiProvider;
      model?: string;
      apiKey?: string;
    };

    const { settings, apiKey: storedKey } = await loadAiSettingsServer();
    const provider = body.provider ?? settings.provider;
    const model = body.model ?? settings.model;
    const apiKey = body.apiKey?.trim() || storedKey;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 400 });
    }

    const result = await testAiProvider(provider, apiKey, model);
    const ok = result.text.length > 0;

    if (!body.apiKey && storedKey) {
      await markAiTestResult(ok);
    }

    const costEur = estimateCostEur(provider, result.tokensInput, result.tokensOutput);
    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "test_connection",
      provider,
      model,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      ok,
      message: ok ? "Connexion réussie" : "Réponse vide du fournisseur",
      preview: result.text.slice(0, 80),
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
    });
  } catch (e) {
    try {
      await markAiTestResult(false);
    } catch {
      /* table peut être absente en dev */
    }
    const msg = e instanceof Error ? e.message : "Test échoué";
    return NextResponse.json({ error: msg, ok: false }, { status: 502 });
  }
}
