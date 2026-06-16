import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { aiErrorResponse } from "@/lib/ai-api-response";
import { fetchAnthropicModels, toProviderModels } from "@/lib/ai-anthropic-models";
import { loadAiSettingsServer } from "@/lib/ai-settings-server";
import { AI_PROVIDER_MODELS, type AiProvider } from "@/lib/ai-settings";

export async function GET(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const provider = (searchParams.get("provider") ?? "anthropic") as AiProvider;

    if (provider !== "anthropic") {
      return NextResponse.json({
        provider,
        models: AI_PROVIDER_MODELS[provider] ?? [],
        source: "static",
      });
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API Anthropic manquante", models: [] },
        { status: 400 }
      );
    }

    const models = await fetchAnthropicModels(apiKey);
    const selected =
      settings.model && models.some((m) => m.id === settings.model)
        ? settings.model
        : null;

    return NextResponse.json({
      provider: "anthropic",
      models: toProviderModels(models),
      selected,
      source: "anthropic_api",
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
