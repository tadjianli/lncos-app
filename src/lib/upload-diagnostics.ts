/**
 * LN COS — Helpers de diagnostic upload (logs + classification observable)
 */

export type UploadFailureKind =
  | "frontend-network"
  | "json-parse"
  | "vercel-timeout-or-crash"
  | "api-client-error"
  | "api-server-error"
  | "api-success";

export function logUploadChannel(
  channel: "[admin/upload]" | "[product-image-pipeline]" | "[admin-media]",
  phase: string,
  detail?: Record<string, unknown>
) {
  const payload = detail ? ` ${JSON.stringify(detail)}` : "";
  console.log(`${channel} ${phase}${payload}`);
}

export function logUploadChannelError(
  channel: "[admin/upload]" | "[product-image-pipeline]" | "[admin-media]",
  phase: string,
  err: unknown,
  detail?: Record<string, unknown>
) {
  const extra = detail ? ` ${JSON.stringify(detail)}` : "";
  if (err instanceof Error) {
    console.error(`${channel} ${phase}${extra}`, err.message);
    if (err.stack) console.error(err.stack);
    return;
  }
  console.error(`${channel} ${phase}${extra}`, err);
}

/** Classification basée uniquement sur des faits observables (pas de supposition). */
export function classifyHttpResponse(status: number, isJson: boolean): UploadFailureKind {
  if (!isJson) {
    if (status === 502 || status === 504 || status === 503) return "vercel-timeout-or-crash";
    return "json-parse";
  }
  if (status >= 500) return "api-server-error";
  if (status >= 400) return "api-client-error";
  return "api-success";
}

export function formatNonJsonUploadError(status: number, statusText: string, body: string): string {
  const preview = body.slice(0, 500);
  return `[Réponse non-JSON] HTTP ${status} ${statusText} — ${preview || "(corps vide)"}`;
}

export function formatFetchUploadError(err: unknown): string {
  if (err instanceof Error) {
    return `[Échec fetch] ${err.message}${err.stack ? `\n${err.stack}` : ""}`;
  }
  return `[Échec fetch] ${String(err)}`;
}
