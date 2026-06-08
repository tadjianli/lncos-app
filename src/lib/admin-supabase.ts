"use client";
/**
 * LN COS — Admin Supabase data layer
 * All CRUD + realtime hooks used by the admin modules.
 * Maps between DB snake_case rows and the camelCase UI types used in components.
 */

import { useEffect, useState, useCallback } from "react";
import { getSupabase } from "./supabase";
import type { Database, Json } from "./database.types";
import type { Popup, Appointment, Notification } from "./rdv-store";
import type { HomeSection } from "./home-sections";
import type { Product } from "./data";

/* ─── Type aliases ─────────────────────────────────────────────────────────── */

type DbPopup = Database["public"]["Tables"]["popups"]["Row"];
type DbAppointment = Database["public"]["Tables"]["appointments"]["Row"];
type DbSection = Database["public"]["Tables"]["home_sections"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];

/* ─── Mappers: DB → UI ─────────────────────────────────────────────────────── */

function dbToPopup(r: DbPopup): Popup {
  const stats = r.stats as {
    views: number; closes: number; clicks: number;
    copies: number; conversions: number; daily: number[];
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
    trigger: r.trigger_type,
    frequency: freq,
    audience: r.audience,
    device: r.device,
    pages: r.pages,
    countdown: cd,
    schedule: sch,
    stats: {
      views: stats.views ?? 0,
      closes: stats.closes ?? 0,
      clicks: stats.clicks ?? 0,
      copies: stats.copies ?? 0,
      conversions: stats.conversions ?? 0,
      daily: stats.daily ?? new Array(14).fill(0),
    },
  };
}

function popupToDb(p: Partial<Popup>): Partial<Database["public"]["Tables"]["popups"]["Update"]> {
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

function dbToAppointment(r: DbAppointment): Appointment {
  return {
    id: r.id,
    clientId: r.user_id ?? "",
    clientName: r.client_name,
    phone: r.client_phone ?? "",
    email: r.client_email ?? "",
    serviceId: r.service_id,
    staffId: r.staff_id,
    extras: r.extras_ids,
    start: r.start_at,
    durationMin: r.duration_min,
    price: Number(r.price),
    deposit: Number(r.deposit),
    paymentStatus: r.payment_status,
    status: r.status as Appointment["status"],
    source: r.source,
    notes: r.notes ?? "",
    createdAt: r.created_at,
  };
}

function dbToSection(r: DbSection): HomeSection {
  const sch = r.schedule as { enabled: boolean; start: string; end: string };
  return {
    id: r.id,
    type: r.type as HomeSection["type"],
    name: r.name,
    enabled: r.enabled,
    variant: r.variant,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    eyebrow: r.eyebrow ?? undefined,
    titleAccent: r.title_accent ?? undefined,
    cta: r.cta ?? undefined,
    source: r.source as HomeSection["source"] ?? undefined,
    img: r.img ?? undefined,
    device: r.device as HomeSection["device"],
    audience: r.audience as HomeSection["audience"],
    schedule: sch,
    views: r.views,
  };
}

function sectionToDb(s: HomeSection, isDraft: boolean, position: number): Database["public"]["Tables"]["home_sections"]["Insert"] {
  return {
    id: s.id,
    type: s.type,
    name: s.name,
    enabled: s.enabled,
    variant: s.variant,
    title: s.title,
    subtitle: s.subtitle ?? null,
    eyebrow: s.eyebrow ?? null,
    title_accent: s.titleAccent ?? null,
    cta: s.cta ?? null,
    source: s.source ?? null,
    img: s.img ?? null,
    device: s.device,
    audience: s.audience,
    schedule: s.schedule as unknown as Json,
    views: s.views ?? 0,
    position,
    is_draft: isDraft,
  };
}

function dbToProduct(r: DbProduct): Product {
  return {
    id: r.id,
    name: r.name,
    cat: r.cat,
    price: Number(r.price),
    old: r.old_price !== null ? Number(r.old_price) : null,
    ml: r.ml,
    rating: Number(r.rating),
    reviews: r.reviews,
    tag: r.tag,
    stock: r.stock,
    variants: r.variants,
    desc: r.description,
    ingredients: r.ingredients,
  };
}

function productToDb(p: Partial<Product>): Partial<Database["public"]["Tables"]["products"]["Update"]> {
  const db: Partial<Database["public"]["Tables"]["products"]["Update"]> = {};
  if (p.name !== undefined) db.name = p.name;
  if (p.cat !== undefined) db.cat = p.cat;
  if (p.price !== undefined) db.price = p.price;
  if ("old" in p) db.old_price = p.old ?? null;
  if (p.ml !== undefined) db.ml = p.ml;
  if (p.tag !== undefined) db.tag = p.tag;
  if (p.stock !== undefined) db.stock = p.stock;
  if (p.desc !== undefined) db.description = p.desc;
  if (p.variants !== undefined) db.variants = p.variants;
  if (p.ingredients !== undefined) db.ingredients = p.ingredients;
  return db;
}

/* ─── usePopups ────────────────────────────────────────────────────────────── */

export function usePopups() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase().from("popups").select("*").order("updated_at", { ascending: false });
    setPopups((data ?? []).map(dbToPopup));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("popups-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "popups" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updatePopup = useCallback(async (id: string, patch: Partial<Popup>) => {
    await getSupabase().from("popups").update(popupToDb(patch)).eq("id", id);
  }, []);

  const insertPopup = useCallback(async (data: Omit<Popup, "id">) => {
    const { id: _unused, ...rest } = data as Popup;
    void _unused;
    const dbData = popupToDb(rest);
    await getSupabase().from("popups").insert(dbData as Database["public"]["Tables"]["popups"]["Insert"]);
  }, []);

  const deletePopup = useCallback(async (id: string) => {
    await getSupabase().from("popups").delete().eq("id", id);
  }, []);

  return { popups, loading, updatePopup, insertPopup, deletePopup };
}

/* ─── useAppointments ─────────────────────────────────────────────────────── */

export function useAppointments(weekStart: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("appointments")
      .select("*")
      .gte("start_at", weekStart.toISOString())
      .lt("start_at", weekEnd.toISOString())
      .order("start_at");
    setAppointments((data ?? []).map(dbToAppointment));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart.toISOString()]);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("appointments-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updateStatus = useCallback(async (id: string, status: Appointment["status"]) => {
    await getSupabase().from("appointments").update({ status }).eq("id", id);
  }, []);

  const insertAppointment = useCallback(async (appt: Omit<Appointment, "id" | "createdAt">) => {
    await getSupabase().from("appointments").insert({
      user_id: appt.clientId || null,
      client_name: appt.clientName,
      client_phone: appt.phone || null,
      client_email: appt.email || null,
      service_id: appt.serviceId,
      staff_id: appt.staffId,
      extras_ids: appt.extras,
      start_at: appt.start,
      duration_min: appt.durationMin,
      price: appt.price,
      deposit: appt.deposit,
      payment_status: appt.paymentStatus,
      status: appt.status,
      source: appt.source,
      notes: appt.notes || null,
      confirmation_ref: `LN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    });
  }, []);

  return { appointments, loading, updateStatus, insertAppointment, reload: load };
}

/* ─── useAllAppointments (dashboard) ─────────────────────────────────────── */

export function useAllAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("appointments")
      .select("*")
      .order("start_at", { ascending: false })
      .limit(200);
    setAppointments((data ?? []).map(dbToAppointment));
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("appointments-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updateStatus = useCallback(async (id: string, status: Appointment["status"]) => {
    await getSupabase().from("appointments").update({ status }).eq("id", id);
  }, []);

  return { appointments, updateStatus };
}

/* ─── useRdvNotifications ─────────────────────────────────────────────────── */

export function useRdvNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("appointments")
      .select("id, client_name, service_id, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    // Derive RDV notifications from recent appointments
    const notifs: Notification[] = (data ?? []).map((r) => ({
      id: `notif-${r.id}`,
      apptId: r.id,
      type: r.status === "cancelled" ? "cancel" : "new" as Notification["type"],
      clientName: r.client_name,
      serviceId: r.service_id,
      read: false,
      ts: r.created_at,
    }));
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("rdv-notifs")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  return { notifications };
}

/* ─── useHomeSections (Supabase-backed) ───────────────────────────────────── */

export function useSupabaseHomeSections() {
  const [published, setPublished] = useState<HomeSection[]>([]);
  const [draft, setDraft] = useState<HomeSection[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("home_sections")
      .select("*")
      .order("position");
    if (!data) return;
    setPublished(data.filter((r) => !r.is_draft).map(dbToSection));
    const draftRows = data.filter((r) => r.is_draft);
    setDraft(draftRows.length > 0 ? draftRows.map(dbToSection) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("home-sections-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "home_sections" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const beginDraft = useCallback(async (sections: HomeSection[]) => {
    // Delete existing draft rows then insert fresh
    await getSupabase().from("home_sections").delete().eq("is_draft", true);
    const rows = sections.map((s, i) => sectionToDb(s, true, i));
    await getSupabase().from("home_sections").insert(rows);
  }, []);

  const saveDraft = useCallback(async (sections: HomeSection[]) => {
    // Upsert all draft rows
    await getSupabase().from("home_sections").delete().eq("is_draft", true);
    const rows = sections.map((s, i) => sectionToDb(s, true, i));
    await getSupabase().from("home_sections").insert(rows);
  }, []);

  const publishDraft = useCallback(async (sections: HomeSection[]) => {
    await getSupabase().from("home_sections").delete().eq("is_draft", false);
    const rows = sections.map((s, i) => sectionToDb(s, false, i));
    await getSupabase().from("home_sections").insert(rows);
    // Replace draft too
    await getSupabase().from("home_sections").delete().eq("is_draft", true);
    const draftRows = sections.map((s, i) => sectionToDb(s, true, i));
    await getSupabase().from("home_sections").insert(draftRows);
  }, []);

  const discardDraft = useCallback(async () => {
    await getSupabase().from("home_sections").delete().eq("is_draft", true);
    // Rebuild draft from published
    const { data } = await getSupabase()
      .from("home_sections")
      .select("*")
      .eq("is_draft", false)
      .order("position");
    if (data && data.length > 0) {
      const draftRows = data.map((r) => ({ ...r, is_draft: true }));
      await getSupabase().from("home_sections").insert(draftRows);
    }
  }, []);

  return { published, draft, loading, beginDraft, saveDraft, publishDraft, discardDraft };
}

/* ─── useProducts ─────────────────────────────────────────────────────────── */

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("products")
      .select("*")
      .order("name");
    setProducts((data ?? []).map(dbToProduct));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateProduct = useCallback(async (id: string, patch: Partial<Product>) => {
    await getSupabase().from("products").update(productToDb(patch)).eq("id", id);
    // Optimistic update
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await getSupabase().from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { products, loading, updateProduct, deleteProduct, reload: load };
}

/* ─── useDashboardKPIs ────────────────────────────────────────────────────── */

export interface DashboardKPIs {
  totalOrders: number;
  totalRevenue: number;
  totalAppointments: number;
  activePopups: number;
  recentOrders: Array<{ id: string; status: string; total: number; created_at: string }>;
  recentAppointments: Array<{ id: string; client_name: string; service_id: string; start_at: string; status: string }>;
}

export function useDashboardKPIs() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  const load = useCallback(async () => {
    const sb = getSupabase();
    const [orders, appointments, popups] = await Promise.all([
      sb.from("orders").select("id, status, total, created_at").order("created_at", { ascending: false }).limit(50),
      sb.from("appointments").select("id, client_name, service_id, start_at, status, price").order("start_at", { ascending: false }).limit(50),
      sb.from("popups").select("id, enabled"),
    ]);

    const orderRows = orders.data ?? [];
    const apptRows = appointments.data ?? [];
    const popupRows = popups.data ?? [];

    setKpis({
      totalOrders: orderRows.length,
      totalRevenue: orderRows.reduce((t, r) => t + Number(r.total), 0),
      totalAppointments: apptRows.length,
      activePopups: popupRows.filter((p) => p.enabled).length,
      recentOrders: orderRows.slice(0, 5),
      recentAppointments: apptRows.slice(0, 5),
    });
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("dashboard-kpis")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  return { kpis, reload: load };
}
