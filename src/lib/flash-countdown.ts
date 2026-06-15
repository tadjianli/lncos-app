/**
 * LN COS — Compte à rebours ventes flash (config admin + calcul client)
 */

export type FlashCountdownMode = "duration" | "end_at";
export type FlashCountdownOnExpire = "reset" | "hide" | "zeros";

export interface FlashSalesCountdown {
  enabled: boolean;
  mode: FlashCountdownMode;
  hours: number;
  minutes: number;
  seconds: number;
  /** ISO 8601 — utilisé en mode end_at */
  endAt: string | null;
  /** Comportement quand le timer atteint zéro (mode duration : reset boucle) */
  onExpire: FlashCountdownOnExpire;
}

export const DEFAULT_FLASH_SALES_COUNTDOWN: FlashSalesCountdown = {
  enabled: true,
  mode: "duration",
  hours: 4,
  minutes: 12,
  seconds: 34,
  endAt: null,
  onExpire: "reset",
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function parseFlashCountdown(raw: unknown): FlashSalesCountdown {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_FLASH_SALES_COUNTDOWN };

  const r = raw as Record<string, unknown>;
  const mode = r.mode === "end_at" ? "end_at" : "duration";
  const onExpire =
    r.on_expire === "hide" || r.on_expire === "zeros" || r.on_expire === "reset"
      ? r.on_expire
      : DEFAULT_FLASH_SALES_COUNTDOWN.onExpire;

  const endAtRaw = r.end_at ?? r.endAt;
  const endAt =
    typeof endAtRaw === "string" && endAtRaw.trim() && !Number.isNaN(Date.parse(endAtRaw))
      ? endAtRaw
      : null;

  return {
    enabled: r.enabled !== false,
    mode,
    hours: clampInt(r.hours, 0, 99, DEFAULT_FLASH_SALES_COUNTDOWN.hours),
    minutes: clampInt(r.minutes, 0, 59, DEFAULT_FLASH_SALES_COUNTDOWN.minutes),
    seconds: clampInt(r.seconds, 0, 59, DEFAULT_FLASH_SALES_COUNTDOWN.seconds),
    endAt,
    onExpire,
  };
}

export function flashCountdownToDb(c: FlashSalesCountdown) {
  return {
    enabled: c.enabled,
    mode: c.mode,
    hours: c.hours,
    minutes: c.minutes,
    seconds: c.seconds,
    end_at: c.endAt,
    on_expire: c.onExpire,
  };
}

export function durationTotalSeconds(c: Pick<FlashSalesCountdown, "hours" | "minutes" | "seconds">): number {
  return c.hours * 3600 + c.minutes * 60 + c.seconds;
}

export function splitSeconds(total: number): { h: number; m: number; s: number } {
  const clamped = Math.max(0, Math.floor(total));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return { h, m, s };
}

/** Secondes restantes en mode end_at (null si date invalide). */
export function endAtRemainingSeconds(endAt: string, now = Date.now()): number | null {
  const end = Date.parse(endAt);
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.floor((end - now) / 1000));
}

/** Valeur pour input datetime-local (heure locale). */
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
