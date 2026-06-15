import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { completeAi, estimateCostEur } from "@/lib/ai-provider-client";
import { buildGeneratePrompt } from "@/lib/ai-prompts";
import { loadAiSettingsServer, logAiUsage } from "@/lib/ai-settings-server";
import type { AiGenerateAction } from "@/lib/ai-settings";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      action: AiGenerateAction;
      context?: Record<string, unknown>;
    };

    if (!body.action) {
      return NextResponse.json({ error: "Action requise" }, { status: 400 });
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json({ error: "Configurez une clé API IA" }, { status: 400 });
    }

    const prompt = buildGeneratePrompt({
      action: body.action,
      tone: settings.tone,
      language: settings.language,
      descriptionLength: settings.descriptionLength,
      context: body.context ?? {},
    });

    const result = await completeAi({
      provider: settings.provider,
      apiKey,
      model: settings.model,
      system: prompt.system,
      user: prompt.user,
      maxTokens: prompt.maxTokens,
    });

    const costEur = estimateCostEur(settings.provider, result.tokensInput, result.tokensOutput);
    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: body.action,
      provider: settings.provider,
      model: settings.model,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      text: result.text,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: settings.model,
      provider: settings.provider,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Génération échouée";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
