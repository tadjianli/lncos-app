/**
 * LN COS — Client Anthropic (SDK officiel, serveur uniquement)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  APIConnectionTimeoutError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { resolveAnthropicModel } from "@/lib/ai-anthropic-models";

export const ANTHROPIC_REQUEST_TIMEOUT_MS = 90_000;

export interface AnthropicCompletionResult {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
}

export interface AiHttpErrorShape {
  message: string;
  status: number;
  code?: string;
}

import type { AiConnectionStatus } from "@/lib/ai-settings";

export type { AiConnectionStatus } from "@/lib/ai-settings";

export function formatAnthropicErrorDetail(error: unknown): string {
  if (error instanceof APIError) {
    const body = error.error;
    if (body && typeof body === "object") {
      try {
        return JSON.stringify(body);
      } catch {
        return error.message;
      }
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isInsufficientCreditMessage(text: string): boolean {
  return /credit|billing|balance|payment|purchase|insufficient.?quota|too low|exceeded.*quota|plan.*limit|spend limit/i.test(
    text
  );
}

export function classifyAnthropicError(error: unknown): {
  status: AiConnectionStatus;
  message: string;
  detail: string;
  httpStatus: number;
} {
  const detail = formatAnthropicErrorDetail(error);
  const mapped = mapAnthropicError(error);

  if (error instanceof AuthenticationError || mapped.code === "auth") {
    return { status: "invalid_key", message: "Clé invalide", detail, httpStatus: 401 };
  }

  if (
    isInsufficientCreditMessage(detail) ||
    (error instanceof APIError && error.status === 402)
  ) {
    const httpStatus = error instanceof APIError ? (error.status ?? 402) : 402;
    return { status: "insufficient_credit", message: "Crédit insuffisant", detail, httpStatus };
  }

  if (mapped.code === "model_not_found") {
    return {
      status: "api_error",
      message: "Modèle Anthropic introuvable",
      detail,
      httpStatus: 404,
    };
  }

  if (mapped.code === "timeout") {
    return { status: "api_error", message: "Erreur API", detail, httpStatus: 504 };
  }

  return { status: "api_error", message: "Erreur API", detail, httpStatus: mapped.status };
}

export function mapAnthropicError(error: unknown): AiHttpErrorShape {
  if (error instanceof APIConnectionTimeoutError) {
    return {
      message: "Délai dépassé — l'API Anthropic n'a pas répondu à temps",
      status: 504,
      code: "timeout",
    };
  }
  if (error instanceof RateLimitError) {
    return {
      message: "Quota ou limite de débit Anthropic atteint — réessayez dans quelques instants",
      status: 429,
      code: "rate_limit",
    };
  }
  if (error instanceof AuthenticationError) {
    return {
      message: "Clé API Anthropic invalide ou expirée",
      status: 401,
      code: "auth",
    };
  }
  if (error instanceof APIError) {
    const status = error.status ?? 502;
    const body = error.error;
    const errorType =
      body && typeof body === "object" && "type" in body
        ? String((body as { type?: string }).type ?? "")
        : "";
    if (status === 404 || errorType === "not_found_error") {
      return {
        message: "Modèle Anthropic introuvable ou obsolète",
        status: 404,
        code: "model_not_found",
      };
    }
    if (status === 529 || status === 503) {
      return {
        message: "Service Anthropic temporairement indisponible",
        status: 503,
        code: "overloaded",
      };
    }
    return {
      message: error.message || `Erreur Anthropic (${status})`,
      status: status >= 400 && status < 600 ? status : 502,
      code: "api_error",
    };
  }
  if (error instanceof Error) {
    if (/abort|timeout/i.test(error.message)) {
      return { message: "Requête IA expirée", status: 504, code: "timeout" };
    }
    if (/not_found|model.*not found/i.test(error.message)) {
      return {
        message: "Modèle Anthropic introuvable ou obsolète",
        status: 404,
        code: "model_not_found",
      };
    }
    return { message: error.message, status: 502, code: "unknown" };
  }
  return { message: "Erreur IA inconnue", status: 502, code: "unknown" };
}

function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    timeout: ANTHROPIC_REQUEST_TIMEOUT_MS,
    maxRetries: 1,
  });
}

export async function anthropicComplete(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AnthropicCompletionResult> {
  const client = createAnthropicClient(opts.apiKey);

  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  return mapAnthropicResponse(response);
}

export async function anthropicCompleteWithVision(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  images: { mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string }[];
}): Promise<AnthropicCompletionResult> {
  const client = createAnthropicClient(opts.apiKey);

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    ...opts.images.map((image) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: image.mediaType,
        data: image.data,
      },
    })),
    { type: "text" as const, text: opts.user },
  ];

  const response = await client.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [{ role: "user", content }],
  });

  return mapAnthropicResponse(response);
}

function mapAnthropicResponse(response: Anthropic.Message): AnthropicCompletionResult {
  const text =
    response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

  return {
    text,
    tokensInput: response.usage.input_tokens,
    tokensOutput: response.usage.output_tokens,
    model: response.model,
  };
}

export async function anthropicTestConnection(
  apiKey: string,
  model?: string
): Promise<AnthropicCompletionResult & { resolvedModel: string; autoSelected: boolean }> {
  const { model: resolvedModel, autoSelected } = await resolveAnthropicModel(apiKey, model);
  const result = await anthropicComplete({
    apiKey,
    model: resolvedModel,
    system: "Tu es un assistant de test LN COS. Réponds uniquement par le mot OK.",
    user: "Test connexion. Réponds OK.",
    maxTokens: 16,
  });
  return { ...result, resolvedModel, autoSelected };
}

/** Résout un modèle Anthropic valide pour les appels de génération. */
export async function resolveAnthropicModelForGeneration(
  apiKey: string,
  preferred?: string | null
): Promise<string> {
  const { model } = await resolveAnthropicModel(apiKey, preferred);
  return model;
}
