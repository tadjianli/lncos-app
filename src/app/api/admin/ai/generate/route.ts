import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { aiErrorResponse } from "@/lib/ai-api-response";
import {
  generateProductSEO,
  generateSingleField,
  type ProductSEOContext,
} from "@/lib/ai-generate";
import { estimateCostEur } from "@/lib/ai-provider-client";
import { loadAiSettingsServer, logAiUsage } from "@/lib/ai-settings-server";
import type { AiGenerateAction } from "@/lib/ai-settings";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as {
      mode?: "product_seo" | "single";
      action?: AiGenerateAction;
      context?: Record<string, unknown> & Partial<ProductSEOContext>;
    };

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json({ error: "Configurez une clé API IA", ok: false }, { status: 400 });
    }
    if (!settings.seoEnabled) {
      return NextResponse.json(
        { error: "Module SEO IA désactivé dans Paramètres → IA", ok: false },
        { status: 403 }
      );
    }

    const config = { apiKey, model: settings.model, settings };
    const mode = body.mode ?? (body.action ? "single" : "product_seo");

    if (mode === "product_seo") {
      const ctx = body.context ?? {};
      const productName = String(ctx.productName ?? ctx.title ?? "").trim();
      if (!productName) {
        return NextResponse.json(
          { error: "productName requis pour la génération SEO", ok: false },
          { status: 400 }
        );
      }

      const { data, meta } = await generateProductSEO(config, {
        productName,
        category: ctx.category ? String(ctx.category) : undefined,
        brand: ctx.brand ? String(ctx.brand) : undefined,
        price: ctx.price ? String(ctx.price) : undefined,
        ml: ctx.ml ? String(ctx.ml) : undefined,
        variants: Array.isArray(ctx.variants)
          ? ctx.variants.map((v) => String(v)).filter(Boolean)
          : undefined,
        tag: ctx.tag ? String(ctx.tag) : undefined,
        keywords: ctx.keywords ? String(ctx.keywords) : undefined,
        ingredients: ctx.ingredients ? String(ctx.ingredients) : undefined,
        benefits: ctx.benefits ? String(ctx.benefits) : undefined,
        usage: ctx.usage ? String(ctx.usage) : undefined,
        existingDescription: ctx.existingDescription
          ? String(ctx.existingDescription)
          : undefined,
        imageUrls: Array.isArray(ctx.imageUrls)
          ? ctx.imageUrls.map((u) => String(u)).filter(Boolean)
          : undefined,
        imageAltHint: ctx.imageAltHint ? String(ctx.imageAltHint) : undefined,
      });

      const costEur = estimateCostEur(
        meta.provider as "anthropic" | "openai" | "gemini" | "mistral",
        meta.tokensInput,
        meta.tokensOutput
      );
      await logAiUsage({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "product_seo",
        provider: meta.provider,
        model: meta.model,
        tokensInput: meta.tokensInput,
        tokensOutput: meta.tokensOutput,
        costEur,
      });

      return NextResponse.json({
        ok: true,
        mode: "product_seo",
        data,
        tokensInput: meta.tokensInput,
        tokensOutput: meta.tokensOutput,
        model: meta.model,
        provider: meta.provider,
        costEur,
        visionUsed: meta.visionUsed ?? false,
      });
    }

    if (!body.action) {
      return NextResponse.json(
        { error: "action requise en mode single", ok: false },
        { status: 400 }
      );
    }

    const { text, meta } = await generateSingleField(
      config,
      body.action,
      body.context ?? {}
    );

    const costEur = estimateCostEur(
      meta.provider as "anthropic" | "openai" | "gemini" | "mistral",
      meta.tokensInput,
      meta.tokensOutput
    );
    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: body.action,
      provider: meta.provider,
      model: meta.model,
      tokensInput: meta.tokensInput,
      tokensOutput: meta.tokensOutput,
      costEur,
    });

    return NextResponse.json({
      ok: true,
      mode: "single",
      action: body.action,
      text,
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
