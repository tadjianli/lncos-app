"use client";
/**
 * LN COS — LNRdvStore TypeScript port
 * localStorage + BroadcastChannel realtime.
 * Exposes the same API as supabase/rdv-supabase.js so the swap is drop-in.
 *
 * Tables: services · staff · extras · availability · blocked_slots
 *         · appointments · notifications · popups
 *         · home_sections · home_sections_draft
 */

import {
  services as SEED_SERVICES,
  extras as SEED_EXTRAS,
  staff as SEED_STAFF,
  availability as SEED_AVAIL,
} from "./rdv-data";
import { DEFAULT_HOME_SECTIONS } from "./home-sections";
import type { HomeSection } from "./home-sections";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  email: string;
  serviceId: string;
  staffId: string;
  extras: string[];
  start: string; // ISO
  durationMin: number;
  price: number;
  deposit: number;
  paymentStatus: "unpaid" | "deposit" | "paid";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  source: "client" | "admin";
  notes: string;
  inspo?: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  apptId: string;
  type: "new" | "cancel" | "move" | "update";
  clientName: string;
  serviceId: string;
  read: boolean;
  ts: string;
}

export interface Popup {
  id: string;
  name: string;
  enabled: boolean;
  type: string;
  layout: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  code: string;
  ctaLabel: string;
  ctaAction: string;
  emailCapture: boolean;
  accent: string;
  image: boolean;
  imageId: string;
  delaySec: number;
  trigger: string;
  frequency: { mode: string; days: number };
  audience: string;
  device: string;
  pages: string[];
  countdown: { enabled: boolean; minutes: number };
  schedule: { enabled: boolean; start: string; end: string };
  stats: { views: number; closes: number; clicks: number; copies: number; conversions: number; daily: number[] };
}

type TableName =
  | "services"
  | "staff"
  | "extras"
  | "availability"
  | "blocked_slots"
  | "appointments"
  | "notifications"
  | "popups"
  | "home_sections"
  | "home_sections_draft";

type Listener = (event: { table: string; action: string; row: unknown }) => void;

/* ─── DB key & channel ───────────────────────────────────────────────── */

const DB_KEY = "lncos-rdv-db-v7";
const CHAN_NAME = "lncos-rdv";

function uid(): string {
  return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ─── Seed ───────────────────────────────────────────────────────────── */

function buildSeed(): Record<string, unknown[]> {
  return {
    services: SEED_SERVICES,
    staff: SEED_STAFF,
    extras: SEED_EXTRAS,
    availability: SEED_AVAIL,
    blocked_slots: [],
    appointments: [],
    notifications: [],
    popups: [DEFAULT_POPUP],
    home_sections: DEFAULT_HOME_SECTIONS,
    home_sections_draft: JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS)),
  };
}

const DEFAULT_POPUP: Popup = {
  id: "pop_welcome",
  name: "Bienvenue · -10%",
  enabled: true,
  type: "promo_code",
  layout: "centered",
  eyebrow: "Offre de bienvenue",
  title: "−10% sur votre première commande",
  subtitle: "Inscrivez-vous et recevez votre code exclusif.",
  code: "BIENVENUE10",
  ctaLabel: "Copier le code",
  ctaAction: "copy",
  emailCapture: false,
  accent: "#D4AF37",
  image: false,
  imageId: "pop_welcome_img",
  delaySec: 7,
  trigger: "delay",
  frequency: { mode: "once", days: 7 },
  audience: "all",
  device: "all",
  pages: ["home"],
  countdown: { enabled: false, minutes: 30 },
  schedule: { enabled: false, start: "", end: "" },
  stats: { views: 0, closes: 0, clicks: 0, copies: 0, conversions: 0, daily: new Array(14).fill(0) },
};

/* ─── Store class ────────────────────────────────────────────────────── */

class RdvStore {
  private db: Record<string, unknown[]> = {};
  private subs: { table: string; cb: Listener }[] = [];
  private channel: BroadcastChannel | null = null;
  private selfId = Math.random().toString(36).slice(2);

  constructor() {
    if (typeof window === "undefined") return;
    this._load();
    try {
      this.channel = new BroadcastChannel(CHAN_NAME);
      this.channel.onmessage = (ev) => {
        if (ev.data?.sender === this.selfId) return;
        if (ev.data?.type === "sync") this._load();
      };
    } catch {
      // BroadcastChannel not available (SSR, old browser)
    }
  }

  private _load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.db = { ...buildSeed(), ...parsed };
      } else {
        this.db = buildSeed();
        this._save();
      }
    } catch {
      this.db = buildSeed();
    }
  }

  private _save() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.db));
      this.channel?.postMessage({ type: "sync", sender: this.selfId });
    } catch {}
  }

  private _emit(table: string, action: string, row: unknown) {
    this.subs.forEach((s) => {
      if (s.table === "*" || s.table === table) {
        try { s.cb({ table, action, row }); } catch {}
      }
    });
  }

  get<T = unknown>(table: TableName): T[] {
    return ((this.db[table] ?? []) as T[]).map((x) => ({ ...(x as object) })) as T[];
  }

  find<T = unknown>(table: TableName, id: string): T | null {
    const arr = this.db[table] as (T & { id: string })[] | undefined;
    return (arr?.find((x) => x.id === id) as T) ?? null;
  }

  insert<T extends { id?: string }>(table: TableName, row: T, opts?: { silent?: boolean }): T & { id: string } {
    const record = { ...row, id: row.id ?? uid(), createdAt: row.id ? undefined : new Date().toISOString() } as T & { id: string };
    if (!this.db[table]) this.db[table] = [];
    (this.db[table] as unknown[]).push(record);
    this._save();
    if (!opts?.silent) this._emit(table, "INSERT", record);
    return record;
  }

  update<T extends { id: string }>(table: TableName, id: string, patch: Partial<T>): T | null {
    const arr = this.db[table] as T[] | undefined;
    if (!arr) return null;
    const idx = arr.findIndex((x) => x.id === id);
    if (idx < 0) return null;
    arr[idx] = { ...arr[idx], ...patch };
    this._save();
    this._emit(table, "UPDATE", arr[idx]);
    return arr[idx];
  }

  remove(table: TableName, id: string): boolean {
    const arr = this.db[table];
    if (!arr) return false;
    const idx = (arr as { id: string }[]).findIndex((x) => x.id === id);
    if (idx < 0) return false;
    const [removed] = arr.splice(idx, 1);
    this._save();
    this._emit(table, "DELETE", removed);
    return true;
  }

  /** Replace an entire table (used by AppBuilder) */
  setTable(table: TableName, rows: unknown[]): void {
    this.db[table] = rows;
    this._save();
    this._emit(table, "RESET", null);
  }

  on(table: string, cb: Listener): () => void {
    const sub = { table: table ?? "*", cb };
    this.subs.push(sub);
    return () => {
      const i = this.subs.indexOf(sub);
      if (i >= 0) this.subs.splice(i, 1);
    };
  }

  notify(n: Omit<Notification, "id" | "read" | "ts">): void {
    this.insert<Record<string, unknown>>("notifications", { ...n, read: false, ts: new Date().toISOString() });
  }

  async markAllRead(): Promise<void> {
    const arr = this.db.notifications as Notification[];
    arr.forEach((n) => { n.read = true; });
    this._save();
    this._emit("notifications", "UPDATE", null);
  }

  /* Slot availability helpers */
  slotState(dateStr: string, hhmm: string, staffId?: string): "free" | "taken" | "blocked" | "closed" {
    const d = new Date(dateStr + "T00:00:00");
    const avArr = this.db.availability as { day: number; closed: boolean; open: string; close: string }[];
    const av = avArr.find((a) => a.day === d.getDay());
    if (!av || av.closed) return "closed";
    const toM = (s: string) => +s.split(":")[0] * 60 + +s.split(":")[1];
    const mins = toM(hhmm);
    if (mins < toM(av.open) || mins >= toM(av.close)) return "closed";
    const blocked = this.db.blocked_slots as { date: string; start: string; end: string; staffId?: string }[];
    if (blocked.some((b) => b.date === dateStr && (!b.staffId || !staffId || b.staffId === staffId) && mins >= toM(b.start) && mins < toM(b.end))) return "blocked";
    const appts = this.db.appointments as Appointment[];
    const taken = appts.some((a) => {
      if (a.status === "cancelled") return false;
      if (staffId && staffId !== "any" && a.staffId !== staffId) return false;
      const s = new Date(a.start);
      if (s.toISOString().slice(0, 10) !== dateStr) return false;
      const sm = s.getHours() * 60 + s.getMinutes();
      return mins >= sm && mins < sm + (a.durationMin ?? 60);
    });
    return taken ? "taken" : "free";
  }

  isClosed(date: Date): boolean {
    const avArr = this.db.availability as { day: number; closed: boolean }[];
    return avArr.find((a) => a.day === date.getDay())?.closed ?? true;
  }

  dayFull(date: Date, staffId?: string): boolean {
    const dateStr = date.toISOString().slice(0, 10);
    const avArr = this.db.availability as { day: number; closed: boolean; open: string; close: string }[];
    const av = avArr.find((a) => a.day === date.getDay());
    if (!av || av.closed) return true;
    const toM = (s: string) => +s.split(":")[0] * 60 + +s.split(":")[1];
    for (let m = toM(av.open); m < toM(av.close); m += 30) {
      const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      if (this.slotState(dateStr, hhmm, staffId) === "free") return false;
    }
    return true;
  }

  svcMin(serviceId: string, extraIds: string[] = []): number {
    const s = (this.db.services as { id: string; min: number }[]).find((x) => x.id === serviceId);
    if (!s) return 60;
    const exArr = this.db.extras as { id: string; min: number }[];
    return s.min + extraIds.reduce((t, id) => t + (exArr.find((e) => e.id === id)?.min ?? 0), 0);
  }

  svcPrice(serviceId: string, extraIds: string[] = []): number {
    const s = (this.db.services as { id: string; price: number }[]).find((x) => x.id === serviceId);
    if (!s) return 0;
    const exArr = this.db.extras as { id: string; price: number }[];
    return s.price + extraIds.reduce((t, id) => t + (exArr.find((e) => e.id === id)?.price ?? 0), 0);
  }

  service(id: string) { return (this.db.services as { id: string }[]).find((s) => s.id === id) ?? null; }
  staffById(id: string) { return (this.db.staff as { id: string }[]).find((s) => s.id === id) ?? null; }
  extra(id: string) { return (this.db.extras as { id: string }[]).find((e) => e.id === id) ?? null; }
}

/* ─── Singleton ──────────────────────────────────────────────────────── */

let _store: RdvStore | null = null;

export function getRdvStore(): RdvStore {
  if (typeof window === "undefined") {
    // SSR — return a no-op stub
    return new RdvStore();
  }
  if (!_store) _store = new RdvStore();
  return _store;
}

/** React hook — returns the store and forces re-render on any table change */
export { RdvStore };
