import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { completeAi, estimateCostEur } from "@/lib/ai-provider-client";
import { buildBlogPrompt } from "@/lib/ai-prompts";
import { loadAiSettingsServer, logAiUsage } from "@/lib/ai-settings-server";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      topic?: string;
      title?: string;
    };

    const topic = (body.topic ?? body.title ?? "").trim();
    if (!topic) {
      return NextResponse.json({ error: "Sujet ou titre requis" }, { status: 400 });
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json({ error: "Configurez une clé API IA" }, { status: 400 });
    }
    if (!settings.blogEnabled) {
      return NextResponse.json({ error: "Génération blog IA désactivée dans les paramètres" }, { status: 403 });
    }

    const prompt = buildBlogPrompt({
      topic,
      tone: settings.tone,
      language: settings.language,
      wordCount: settings.blogWordCount,
      includeFaq: settings.blogIncludeFaq,
      includeSchema: settings.blogIncludeSchema,
      includeImages: settings.blogImageSuggestions,
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
      action: "blog_article",
      provider: settings.provider,
      model: settings.model,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      content: result.text,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: settings.model,
      provider: settings.provider,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Génération article échouée";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
