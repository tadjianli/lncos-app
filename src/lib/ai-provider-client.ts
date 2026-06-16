/**
 * LN COS — Client unifié fournisseurs IA (serveur)
 */

import {
  anthropicComplete as sdkAnthropicComplete,
  anthropicTestConnection,
} from "@/lib/ai-anthropic-client";
import { estimateAiCostEur } from "@/lib/ai-cost-estimate";
import type { AiProvider } from "./ai-settings";

export interface AiCompletionResult {
  text: string;
  tokensInput: number;
  tokensOutput: number;
  resolvedModel?: string;
  autoSelected?: boolean;
}

export async function testAiProvider(
  provider: AiProvider,
  apiKey: string,
  model: string
): Promise<AiCompletionResult> {
  if (provider === "anthropic") {
    const result = await anthropicTestConnection(apiKey, model || undefined);
    return {
      text: result.text,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      resolvedModel: result.resolvedModel,
      autoSelected: result.autoSelected,
    };
  }
  return completeAi({
    provider,
    apiKey,
    model,
    system: "Tu es un assistant de test. Réponds uniquement par OK.",
    user: "Test connexion LN COS. Réponds OK.",
    maxTokens: 16,
  });
}

export async function completeAi(opts: {
  provider: AiProvider;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AiCompletionResult> {
  switch (opts.provider) {
    case "anthropic":
      return anthropicComplete(opts);
    case "openai":
      return openaiComplete(opts);
    case "gemini":
      return geminiComplete(opts);
    case "mistral":
      return mistralComplete(opts);
    default:
      throw new Error("Fournisseur IA inconnu");
  }
}

async function anthropicComplete(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AiCompletionResult> {
  const result = await sdkAnthropicComplete(opts);
  return {
    text: result.text,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
  };
}

async function openaiComplete(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AiCompletionResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `OpenAI HTTP ${res.status}`);
  }
  return {
    text: data.choices?.[0]?.message?.content?.trim() ?? "",
    tokensInput: data.usage?.prompt_tokens ?? 0,
    tokensOutput: data.usage?.completion_tokens ?? 0,
  };
}

async function geminiComplete(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AiCompletionResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: [{ role: "user", parts: [{ text: opts.user }] }],
      generationConfig: { maxOutputTokens: opts.maxTokens ?? 1024 },
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Gemini HTTP ${res.status}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return {
    text,
    tokensInput: data.usageMetadata?.promptTokenCount ?? 0,
    tokensOutput: data.usageMetadata?.candidatesTokenCount ?? 0,
  };
}

async function mistralComplete(opts: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AiCompletionResult> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });
  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Mistral HTTP ${res.status}`);
  }
  return {
    text: data.choices?.[0]?.message?.content?.trim() ?? "",
    tokensInput: data.usage?.prompt_tokens ?? 0,
    tokensOutput: data.usage?.completion_tokens ?? 0,
  };
}

/** Estimation grossière EUR (usage interne dashboard) */
export function estimateCostEur(
  provider: AiProvider,
  tokensInput: number,
  tokensOutput: number
): number {
  return estimateAiCostEur(provider, tokensInput, tokensOutput);
}
