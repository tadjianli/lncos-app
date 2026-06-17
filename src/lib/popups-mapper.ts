/**
 * LN COS — Mapping popups DB ↔ UI (admin + client)
 */

import type { Database, Json } from "@/lib/database.types";
import type { Popup } from "@/lib/rdv-store";

type DbPopup = Database["public"]["Tables"]["popups"]["Row"];

function normalizePopupDaily(daily: unknown): number[] {
  if (Array.isArray(daily)) {
    return Array.from({ length: 14 }, (_, i) => Number(daily[i]) || 0);
  }
  return new Array(14).fill(0);
}

export function dbToPopup(r: DbPopup): Popup {
  const stats = (r.stats ?? {}) as {
    views?: number;
    closes?: number;
    clicks?: number;
    copies?: number;
    conversions?: number;
    daily?: unknown;
  };
  const freq = r.frequency as { mode: string; days: number };
  const cd = r.countdown as { enabled: boolean; minutes: number };
  const sch = r.schedule as { enabled: boolean; start: string; end: string };

  return {
    id: r.id,
    name: r.name,
    enabled: r.enabled,
    type: r.type,
    layout: r.layout,
    eyebrow: r.eyebrow,
    title: r.title,
    subtitle: r.subtitle,
    code: r.code,
    ctaLabel: r.cta_label,
    ctaAction: r.cta_action,
    emailCapture: r.email_capture,
    accent: r.accent,
    image: r.image,
    imageId: r.image_id,
    delaySec: r.delay_sec,
    trigger: r.trigger_type ?? "delay",
    frequency: freq?.mode ? freq : { mode: "once", days: 7 },
    audience: r.audience,
    device: r.device,
    pages: Array.isArray(r.pages) ? r.pages : ["home"],
    countdown: cd?.enabled != null ? cd : { enabled: false, minutes: 30 },
    schedule: sch?.enabled != null ? sch : { enabled: false, start: "", end: "" },
    stats: {
      views: stats.views ?? 0,
      closes: stats.closes ?? 0,
      clicks: stats.clicks ?? 0,
      copies: stats.copies ?? 0,
      conversions: stats.conversions ?? 0,
      daily: normalizePopupDaily(stats.daily),
    },
  };
}

export function popupToDb(
  p: Partial<Popup>
): Partial<Database["public"]["Tables"]["popups"]["Update"]> {
  const db: Partial<Database["public"]["Tables"]["popups"]["Update"]> = {};
  if (p.name !== undefined) db.name = p.name;
  if (p.enabled !== undefined) db.enabled = p.enabled;
  if (p.type !== undefined) db.type = p.type;
  if (p.layout !== undefined) db.layout = p.layout;
  if (p.eyebrow !== undefined) db.eyebrow = p.eyebrow;
  if (p.title !== undefined) db.title = p.title;
  if (p.subtitle !== undefined) db.subtitle = p.subtitle;
  if (p.code !== undefined) db.code = p.code;
  if (p.ctaLabel !== undefined) db.cta_label = p.ctaLabel;
  if (p.ctaAction !== undefined) db.cta_action = p.ctaAction;
  if (p.emailCapture !== undefined) db.email_capture = p.emailCapture;
  if (p.accent !== undefined) db.accent = p.accent;
  if (p.image !== undefined) db.image = p.image;
  if (p.imageId !== undefined) db.image_id = p.imageId;
  if (p.delaySec !== undefined) db.delay_sec = p.delaySec;
  if (p.trigger !== undefined) db.trigger_type = p.trigger;
  if (p.frequency !== undefined) db.frequency = p.frequency as Json;
  if (p.audience !== undefined) db.audience = p.audience;
  if (p.device !== undefined) db.device = p.device;
  if (p.pages !== undefined) db.pages = p.pages;
  if (p.countdown !== undefined) db.countdown = p.countdown as Json;
  if (p.schedule !== undefined) db.schedule = p.schedule as Json;
  if (p.stats !== undefined) db.stats = p.stats as Json;
  return db;
}
