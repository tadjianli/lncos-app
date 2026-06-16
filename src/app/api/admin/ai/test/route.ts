import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { classifyAnthropicError } from "@/lib/ai-anthropic-client";
import { estimateCostEur, testAiProvider } from "@/lib/ai-provider-client";
import {
  getAiEncryptionErrorMessage,
  isAiEncryptionConfigured,
} from "@/lib/ai-env";
import {
  loadAiSettingsServer,
  logAiUsage,
  markAiTestResult,
  saveAiSettingsServer,
} from "@/lib/ai-settings-server";
import { DEFAULT_AI_SETTINGS, type AiSettingsInput } from "@/lib/ai-settings";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  let provider = "anthropic";
  let model = "";

  try {
    const body = (await req.json()) as {
      settings?: Partial<AiSettingsInput>;
      apiKey?: string;
      provider?: string;
      model?: string;
    };

    const merged: AiSettingsInput = {
      ...DEFAULT_AI_SETTINGS,
      ...(body.settings ?? {}),
      ...(body.provider ? { provider: body.provider as AiSettingsInput["provider"] } : {}),
      ...(body.model ? { model: body.model } : {}),
    };
    delete (merged as { apiKeyMasked?: unknown }).apiKeyMasked;
    delete (merged as { hasApiKey?: unknown }).hasApiKey;
    delete (merged as { lastTestOk?: unknown }).lastTestOk;
    delete (merged as { lastTestAt?: unknown }).lastTestAt;

    try {
      await saveAiSettingsServer(merged, body.apiKey);
    } catch (saveErr) {
      const detail = saveErr instanceof Error ? saveErr.message : "Erreur de sauvegarde";
      const encryptionMsg = getAiEncryptionErrorMessage();
      const isEncryption = /AI_ENCRYPTION_KEY|SUPABASE_SERVICE_ROLE_KEY|Chiffrement|Configuration serveur/i.test(
        detail
      );
      return NextResponse.json(
        {
          ok: false,
          status: "api_error",
          error: isEncryption ? "Configuration serveur" : "Erreur API",
          detail: isEncryption ? encryptionMsg : `Sauvegarde Supabase échouée : ${detail}`,
          saved: false,
        },
        { status: isEncryption ? 503 : 500 }
      );
    }

    const { settings, apiKey } = await loadAiSettingsServer();
    provider = settings.provider;
    model = settings.model ?? "";

    if (!apiKey) {
      await markAiTestResult(false);
      const detail = isAiEncryptionConfigured()
        ? "Clé API absente — saisissez une clé admin ou définissez ANTHROPIC_API_KEY"
        : getAiEncryptionErrorMessage();
      await logAiUsage({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "test_connection",
        provider,
        model,
        tokensInput: 0,
        tokensOutput: 0,
        costEur: 0,
        errorDetail: detail,
      });
      return NextResponse.json(
        {
          ok: false,
          status: isAiEncryptionConfigured() ? "invalid_key" : "api_error",
          error: isAiEncryptionConfigured() ? "Clé invalide" : "Configuration serveur",
          detail,
          saved: true,
        },
        { status: 400 }
      );
    }

    const result = await testAiProvider(settings.provider, apiKey, model);
    const resolvedModel = result.resolvedModel ?? model;
    const ok = result.text.length > 0;

    if (ok && settings.provider === "anthropic" && resolvedModel && resolvedModel !== settings.model) {
      await saveAiSettingsServer({ ...settings, model: resolvedModel });
    }

    await markAiTestResult(ok);

    const costEur = estimateCostEur(settings.provider, result.tokensInput, result.tokensOutput);
    await logAiUsage({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "test_connection",
      provider: settings.provider,
      model: resolvedModel,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costEur,
      errorDetail: ok ? null : "Réponse vide du fournisseur",
    });

    if (!ok) {
      return NextResponse.json(
        {
          ok: false,
          status: "api_error",
          error: "Erreur API",
          detail: "Réponse vide du fournisseur Anthropic",
          saved: true,
          settings,
        },
        { status: 502 }
      );
    }

    const reloaded = await loadAiSettingsServer();

    return NextResponse.json({
      ok: true,
      status: "connected",
      message: result.autoSelected
        ? `Connecté — modèle ${resolvedModel} sélectionné automatiquement`
        : "Connecté",
      saved: true,
      preview: result.text.slice(0, 80),
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: resolvedModel,
      autoSelected: result.autoSelected ?? false,
      provider: settings.provider,
      settings: reloaded.settings,
    });
  } catch (e) {
    const classified = classifyAnthropicError(e);

    try {
      await markAiTestResult(false);
      await logAiUsage({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "test_connection",
        provider,
        model,
        tokensInput: 0,
        tokensOutput: 0,
        costEur: 0,
        errorDetail: classified.detail,
      });
    } catch {
      /* logs optionnels si table absente */
    }

    return NextResponse.json(
      {
        ok: false,
        status: classified.status,
        error: classified.message,
        detail: classified.detail,
        saved: true,
      },
      { status: classified.httpStatus }
    );
  }
}
