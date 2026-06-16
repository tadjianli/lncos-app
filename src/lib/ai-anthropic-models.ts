/**
 * LN COS — Découverte dynamique des modèles Anthropic (API /v1/models)
 */

import type { AiProviderModel } from "@/lib/ai-settings";

export const ANTHROPIC_MODELS_REQUEST_TIMEOUT_MS = 90_000;

export interface AnthropicModelInfo {
  id: string;
  label: string;
  createdAt?: string;
}

type ModelsPage = {
  data?: { id: string; display_name?: string; created_at?: string }[];
  has_more?: boolean;
  last_id?: string;
};

export async function fetchAnthropicModels(apiKey: string): Promise<AnthropicModelInfo[]> {
  const models: AnthropicModelInfo[] = [];
  let afterId: string | undefined;

  do {
    const url = new URL("https://api.anthropic.com/v1/models");
    url.searchParams.set("limit", "100");
    if (afterId) url.searchParams.set("after_id", afterId);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ANTHROPIC_MODELS_REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    const body = (await res.json()) as ModelsPage & { error?: { message?: string; type?: string } };
    if (!res.ok) {
      const msg = body.error?.message ?? `Anthropic models HTTP ${res.status}`;
      throw new Error(msg);
    }

    for (const item of body.data ?? []) {
      models.push({
        id: item.id,
        label: item.display_name?.trim() || item.id,
        createdAt: item.created_at,
      });
    }

    afterId = body.has_more && body.last_id ? body.last_id : undefined;
  } while (afterId);

  return models;
}

export function toProviderModels(models: AnthropicModelInfo[]): AiProviderModel[] {
  return models.map((m) => ({ id: m.id, label: m.label }));
}

/** Premier modèle Sonnet disponible (API trie du plus récent au plus ancien). */
export function pickFirstSonnetModel(models: AnthropicModelInfo[]): AnthropicModelInfo | null {
  if (models.length === 0) return null;
  return (
    models.find((m) => /sonnet/i.test(m.id) || /sonnet/i.test(m.label)) ?? models[0]
  );
}

/**
 * Résout le modèle à utiliser : préféré s'il existe, sinon premier Sonnet, sinon le plus récent.
 */
export async function resolveAnthropicModel(
  apiKey: string,
  preferred?: string | null
): Promise<{ model: string; models: AnthropicModelInfo[]; autoSelected: boolean }> {
  const models = await fetchAnthropicModels(apiKey);
  if (models.length === 0) {
    throw new Error("Aucun modèle Anthropic disponible pour ce compte");
  }

  const trimmed = preferred?.trim();
  if (trimmed && models.some((m) => m.id === trimmed)) {
    return { model: trimmed, models, autoSelected: false };
  }

  const sonnet = pickFirstSonnetModel(models);
  if (!sonnet) {
    throw new Error("Impossible de sélectionner un modèle Anthropic");
  }

  return { model: sonnet.id, models, autoSelected: true };
}

export function isAnthropicModelNotFoundError(error: unknown): boolean {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  return /not_found|model.*not found|invalid model|does not exist/i.test(text);
}
