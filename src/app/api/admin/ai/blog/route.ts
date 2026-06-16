import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { aiErrorResponse } from "@/lib/ai-api-response";
import { generateBlogArticle } from "@/lib/ai-generate";
import { estimateCostEur } from "@/lib/ai-provider-client";
import { loadAiSettingsServer, logAiUsage } from "@/lib/ai-settings-server";
import type { AiTone } from "@/lib/ai-settings";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      topic?: string;
      title?: string;
      primaryKeyword?: string;
      wordCount?: number;
      tone?: AiTone;
      /** true = JSON structuré (défaut), false = markdown brut legacy */
      structured?: boolean;
    };

    const topic = (body.topic ?? body.title ?? "").trim();
    if (!topic) {
      return NextResponse.json({ error: "Sujet requis", ok: false }, { status: 400 });
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json({ error: "Configurez une clé API IA", ok: false }, { status: 400 });
    }
    if (!settings.blogEnabled) {
      return NextResponse.json(
        { error: "Génération blog IA désactivée dans les paramètres", ok: false },
        { status: 403 }
      );
    }

    const config = { apiKey, model: settings.model, settings };
    const structured = body.structured !== false;

    if (structured) {
      const wordCount =
        body.wordCount && [500, 1000, 1500, 2000].includes(body.wordCount)
          ? body.wordCount
          : settings.blogWordCount;

      const { data, meta } = await generateBlogArticle(config, {
        topic,
        title: body.title,
        primaryKeyword: body.primaryKeyword?.trim() || undefined,
        wordCount,
        tone: body.tone,
      });

      const costEur = estimateCostEur(
        meta.provider as "anthropic" | "openai" | "gemini" | "mistral",
        meta.tokensInput,
        meta.tokensOutput
      );
      await logAiUsage({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "blog_article",
        provider: meta.provider,
        model: meta.model,
        tokensInput: meta.tokensInput,
        tokensOutput: meta.tokensOutput,
        costEur,
      });

      return NextResponse.json({
        ok: true,
        data,
        tokensInput: meta.tokensInput,
        tokensOutput: meta.tokensOutput,
        model: meta.model,
        provider: meta.provider,
        costEur,
      });
    }

    const { generateBlogMarkdown } = await import("@/lib/ai-generate");
    const { content, meta } = await generateBlogMarkdown(config, topic);

    const costEur = estimateCostEur(
      meta.provider as "anthropic" | "openai" | "gemini" | "mistral",
      meta.tokensInput,
      meta.tokensOutput
    );
    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "blog_article",
      provider: meta.provider,
      model: meta.model,
      tokensInput: meta.tokensInput,
      tokensOutput: meta.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      ok: true,
      content,
      tokensInput: meta.tokensInput,
      tokensOutput: meta.tokensOutput,
      model: meta.model,
      provider: meta.provider,
      costEur,
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
