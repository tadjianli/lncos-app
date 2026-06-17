/**
 * LN COS — Popups promotionnels côté client (éligibilité, fréquence, pages)
 */

import type { Popup } from "@/lib/rdv-store";
import { getPopupLocalStorage, getPopupSessionStorage } from "@/lib/popup-storage";

export const POPUP_FREQUENCY_STORAGE_PREFIX = "lncos-popup-dismissed:";
export const POPUP_VISIT_COUNT_KEY = "lncos-popup-visit-count";
export const POPUP_PROMO_DEBUG =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_PWA_DEBUG === "1";

export type PopupBlockReason =
  | "disabled"
  | "schedule_not_started"
  | "schedule_ended"
  | "wrong_page"
  | "wrong_device"
  | "wrong_audience"
  | "frequency_once"
  | "frequency_days"
  | "frequency_session"
  | "overlay_open"
  | "preview_mode"
  | "empty_content"
  | "promos_disabled";

export function popupLog(
  level: "info" | "warn" | "error",
  message: string,
  detail?: unknown
) {
  const prefix = "[PopupPromo]";
  if (level === "error") {
    console.error(prefix, message, detail ?? "");
    return;
  }
  if (!POPUP_PROMO_DEBUG && level === "info") return;
  if (level === "warn") console.warn(prefix, message, detail ?? "");
  else console.log(prefix, message, detail ?? "");
}

/** Slug page depuis le pathname (ex. /boutique → boutique, / → home). */
export function pathnameToPageSlug(pathname: string): string {
  if (!pathname || pathname === "/") return "home";
  return pathname.split("/").filter(Boolean)[0] ?? "home";
}

const PAGE_ALIASES: Record<string, string[]> = {
  home: ["/"],
  boutique: ["/boutique"],
  discover: ["/discover", "/categorie"],
  "flash-sales": ["/flash-sales"],
  favorites: ["/favorites"],
  profile: ["/profile"],
  bag: ["/bag"],
  promotions: ["/promotions"],
};

export function pathnameMatchesPopupPages(pathname: string, pages: string[]): boolean {
  if (!pages?.length) return true;
  const slug = pathnameToPageSlug(pathname);
  return pages.some((page) => {
    if (page === slug) return true;
    const prefixes = PAGE_ALIASES[page];
    if (!prefixes) return slug === page;
    return prefixes.some((prefix) =>
      prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  });
}

export function isPopupScheduleActive(
  schedule: Popup["schedule"],
  now = Date.now()
): { active: boolean; reason?: PopupBlockReason } {
  if (!schedule?.enabled) return { active: true };

  const startRaw = schedule.start?.trim();
  const endRaw = schedule.end?.trim();

  if (startRaw) {
    const start = Date.parse(startRaw);
    if (!Number.isNaN(start) && now < start) {
      return { active: false, reason: "schedule_not_started" };
    }
  }

  if (endRaw) {
    const end = Date.parse(endRaw);
    if (!Number.isNaN(end) && now > end) {
      return { active: false, reason: "schedule_ended" };
    }
  }

  return { active: true };
}

export function matchesPopupDevice(device: string): boolean {
  if (device === "all" || !device) return true;
  if (typeof window === "undefined") return true;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (device === "mobile") return mobile;
  if (device === "desktop") return !mobile;
  return true;
}

function readVisitCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(getPopupLocalStorage().getItem(POPUP_VISIT_COUNT_KEY) ?? "0") || 0;
  } catch {
    return 0;
  }
}

export function incrementPopupVisitCount(): void {
  if (typeof window === "undefined") return;
  try {
    const next = readVisitCount() + 1;
    getPopupLocalStorage().setItem(POPUP_VISIT_COUNT_KEY, String(next));
  } catch {
    /* ignore */
  }
}

export function matchesPopupAudience(audience: string): boolean {
  if (audience === "all" || !audience) return true;
  const visits = readVisitCount();
  if (audience === "new") return visits <= 1;
  if (audience === "returning") return visits > 1;
  /* VIP : nécessite auth — non bloquant si inconnu */
  if (audience === "vip") return false;
  return true;
}

type DismissRecord = { at: number; mode: string };

function readDismissRecord(popupId: string): DismissRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = getPopupLocalStorage().getItem(`${POPUP_FREQUENCY_STORAGE_PREFIX}${popupId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DismissRecord;
    if (typeof parsed?.at !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function readSessionDismissed(popupId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      getPopupSessionStorage().getItem(`${POPUP_FREQUENCY_STORAGE_PREFIX}${popupId}`) === "1"
    );
  } catch {
    return false;
  }
}

/** Enregistre la fermeture pour respecter la fréquence configurée. */
export function markPopupDismissed(popup: Popup): void {
  if (typeof window === "undefined") return;
  const mode = popup.frequency?.mode ?? "once";

  if (mode === "always") return;

  if (mode === "session") {
    try {
      getPopupSessionStorage().setItem(`${POPUP_FREQUENCY_STORAGE_PREFIX}${popup.id}`, "1");
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    getPopupLocalStorage().setItem(
      `${POPUP_FREQUENCY_STORAGE_PREFIX}${popup.id}`,
      JSON.stringify({ at: Date.now(), mode })
    );
  } catch {
    /* ignore */
  }
}

export function isPopupFrequencyBlocked(popup: Popup): PopupBlockReason | null {
  const mode = popup.frequency?.mode ?? "once";

  if (mode === "always") return null;

  if (mode === "session") {
    return readSessionDismissed(popup.id) ? "frequency_session" : null;
  }

  const record = readDismissRecord(popup.id);
  if (!record) return null;

  if (mode === "once") return "frequency_once";

  if (mode === "days") {
    const days = Math.max(1, popup.frequency?.days ?? 7);
    const elapsed = Date.now() - record.at;
    if (elapsed < days * 86_400_000) return "frequency_days";
    return null;
  }

  return null;
}

export function popupHasDisplayContent(popup: Popup): boolean {
  return Boolean(
    popup.title?.trim() ||
      popup.subtitle?.trim() ||
      popup.code?.trim() ||
      popup.eyebrow?.trim()
  );
}

export interface PopupEligibilityContext {
  pathname: string;
  overlayOpen: boolean;
  previewMode: boolean;
  /** Préférence Paramètres → Promotions & offres ( défaut : true ) */
  promosEnabled?: boolean;
  now?: number;
}

export function getPopupBlockReason(
  popup: Popup,
  ctx: PopupEligibilityContext
): PopupBlockReason | null {
  if (!popup.enabled) return "disabled";
  if (ctx.previewMode) return "preview_mode";
  if (ctx.overlayOpen) return "overlay_open";
  if (ctx.promosEnabled === false) return "promos_disabled";
  if (!popupHasDisplayContent(popup)) return "empty_content";

  const schedule = isPopupScheduleActive(popup.schedule, ctx.now);
  if (!schedule.active) return schedule.reason ?? "schedule_ended";

  if (!pathnameMatchesPopupPages(ctx.pathname, popup.pages)) return "wrong_page";
  if (!matchesPopupDevice(popup.device)) return "wrong_device";
  if (!matchesPopupAudience(popup.audience)) return "wrong_audience";

  return isPopupFrequencyBlocked(popup);
}

/** Délai avant affichage — uniquement pour le déclencheur « délai ». */
export function getPopupShowDelayMs(
  popup: Pick<Popup, "trigger" | "delaySec">
): number {
  if (popup.trigger === "delay") {
    return Math.max(0, (popup.delaySec ?? 7) * 1000);
  }
  return 0;
}

/** Seuil scroll (0–1) pour le déclencheur « scroll ». */
export const POPUP_SCROLL_TRIGGER_RATIO = 0.35;

/** Conteneur scroll AppShell (PWA iOS : scroll interne, pas window). */
export const POPUP_SCROLL_ROOT_SELECTOR =
  ".app-scroll-page, .home-scroll, .overlay-screen-scroll, .mobile-page-layout__body";

export function getPopupScrollProgress(): number {
  if (typeof document === "undefined") return 0;

  const root =
    document.querySelector(POPUP_SCROLL_ROOT_SELECTOR) ??
    document.querySelector(".app-shell-main");

  if (root instanceof HTMLElement && root.scrollHeight > root.clientHeight + 1) {
    const max = root.scrollHeight - root.clientHeight;
    if (max <= 0) return 1;
    return root.scrollTop / max;
  }

  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 1;
  return window.scrollY / max;
}

/** Choisit la première popup éligible (ordre Supabase : updated_at desc). */
export function pickEligiblePopup(
  popups: Popup[],
  ctx: PopupEligibilityContext
): { popup: Popup | null; reasons: Record<string, PopupBlockReason | null> } {
  const reasons: Record<string, PopupBlockReason | null> = {};
  for (const popup of popups) {
    const reason = getPopupBlockReason(popup, ctx);
    reasons[popup.id] = reason;
    if (!reason) return { popup, reasons };
  }
  return { popup: null, reasons };
}
