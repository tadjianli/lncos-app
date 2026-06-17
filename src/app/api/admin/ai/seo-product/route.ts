import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { aiErrorResponse } from "@/lib/ai-api-response";
import { estimateCostEur } from "@/lib/ai-provider-client";
import { loadAiSettingsServer, logAiUsage } from "@/lib/ai-settings-server";
import type { Product } from "@/lib/data";
import {
  analyzeProductSeoWithClaude,
  applySeoOptimizationPatch,
  buildReadOnlyProductSeoContext,
  optimizeProductSeoWithClaude,
} from "@/lib/seo-claude";

type SeoProductAction = "analyze" | "optimize";

interface SeoProductBody {
  action: SeoProductAction;
  product: Product;
  categoryName?: string;
}

/**
 * POST /api/admin/ai/seo-product
 * Assistant SEO Claude — analyse (read-only) ou optimisation (métadonnées SEO uniquement).
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as SeoProductBody;
    const { action, product, categoryName } = body;

    if (action !== "analyze" && action !== "optimize") {
      return NextResponse.json(
        { error: "action requise: analyze | optimize", ok: false },
        { status: 400 },
      );
    }

    if (!product?.name?.trim()) {
      return NextResponse.json({ error: "Nom produit requis", ok: false }, { status: 400 });
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configurez une clé API Anthropic", ok: false },
        { status: 400 },
      );
    }
    if (!settings.seoEnabled) {
      return NextResponse.json(
        { error: "Module SEO IA désactivé dans Paramètres → IA", ok: false },
        { status: 403 },
      );
    }

    const claudeSettings = { ...settings, provider: "anthropic" as const };
    const config = { apiKey, model: settings.model, settings: claudeSettings };
    const ctx = buildReadOnlyProductSeoContext(product, categoryName);

    if (action === "analyze") {
      const { data, meta } = await analyzeProductSeoWithClaude(config, ctx);
      const costEur = estimateCostEur("anthropic", meta.tokensInput, meta.tokensOutput);

      await logAiUsage({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "seo_analyze",
        provider: "anthropic",
        model: meta.model,
        tokensInput: meta.tokensInput,
        tokensOutput: meta.tokensOutput,
        costEur,
      });

      return NextResponse.json({
        ok: true,
        action: "analyze",
        analysis: data,
        provider: "anthropic",
        model: meta.model,
        costEur,
      });
    }

    const { data, meta } = await optimizeProductSeoWithClaude(config, ctx);
    const { patch, predictedScore } = applySeoOptimizationPatch(product, data);
    const costEur = estimateCostEur("anthropic", meta.tokensInput, meta.tokensOutput);

    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "seo_optimize",
      provider: "anthropic",
      model: meta.model,
      tokensInput: meta.tokensInput,
      tokensOutput: meta.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      ok: true,
      action: "optimize",
      patch,
      predictedScore,
      provider: "anthropic",
      model: meta.model,
      costEur,
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
