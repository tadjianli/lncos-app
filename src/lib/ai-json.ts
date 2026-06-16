/**
 * LN COS — Extraction JSON depuis réponses LLM
 */

export function parseJsonFromLlm<T>(raw: string): T {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Réponse IA vide");
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim()) as T;
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as T;
    }
    throw new Error("Impossible de parser la réponse JSON du modèle");
  }
}
