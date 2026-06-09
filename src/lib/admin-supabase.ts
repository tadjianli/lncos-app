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
import { dbToSection, sectionToDb } from "./home-sections-db";
import type { Product } from "./data";
import type { ProductReview, ReviewStatus } from "./reviews";

/* ─── Type aliases ─────────────────────────────────────────────────────────── */

type DbPopup = Database["public"]["Tables"]["popups"]["Row"];
type DbAppointment = Database["public"]["Tables"]["appointments"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];

/* ─── Mappers: DB → UI ─────────────────────────────────────────────────────── */

function normalizePopupDaily(daily: unknown): number[] {
  if (Array.isArray(daily)) {
    return Array.from({ length: 14 }, (_, i) => Number(daily[i]) || 0);
  }
  return new Array(14).fill(0);
}

function dbToPopup(r: DbPopup): Popup {
  const stats = (r.stats ?? {}) as {
    views?: number; closes?: number; clicks?: number;
    copies?: number; conversions?: number; daily?: unknown;
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
      daily: normalizePopupDaily(stats.daily),
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
  const weekStartKey = weekStart.toISOString();

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
  }, [weekStartKey]);

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

/* ─── usePageSections (Supabase-backed, per page) ─────────────────────────── */

import type { PageSlug } from "./home-sections";
import { DEFAULT_SECTIONS_BY_PAGE } from "./page-sections";

export function useSupabasePageSections(pageSlug: PageSlug) {
  const [published, setPublished] = useState<HomeSection[]>([]);
  const [draft, setDraft] = useState<HomeSection[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("home_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .order("position");
    if (!data) return;
    const pub = data.filter((r) => !r.is_draft).map(dbToSection);
    setPublished(pub.length > 0 ? pub : DEFAULT_SECTIONS_BY_PAGE[pageSlug] ?? []);
    const draftRows = data.filter((r) => r.is_draft);
    setDraft(draftRows.length > 0 ? draftRows.map(dbToSection) : null);
    setLoading(false);
  }, [pageSlug]);

  useEffect(() => {
    setLoading(true);
    load();
    const channel = getSupabase()
      .channel(`home-sections-admin-${pageSlug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "home_sections" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load, pageSlug]);

  const withSlug = useCallback(
    (sections: HomeSection[]) =>
      sections.map((s) => ({ ...s, pageSlug: s.pageSlug ?? pageSlug })),
    [pageSlug]
  );

  const beginDraft = useCallback(async (sections: HomeSection[]) => {
    const supabase = getSupabase();
    const scoped = withSlug(sections);
    const { error: delErr } = await supabase
      .from("home_sections")
      .delete()
      .eq("page_slug", pageSlug)
      .eq("is_draft", true);
    if (delErr) return { error: delErr.message };
    const rows = scoped.map((s, i) => sectionToDb(s, true, i));
    const { error: insErr } = await supabase.from("home_sections").insert(rows);
    if (insErr) return { error: insErr.message };
    setDraft(scoped);
    return { error: null };
  }, [pageSlug, withSlug]);

  const saveDraft = useCallback(async (sections: HomeSection[]) => {
    const supabase = getSupabase();
    const scoped = withSlug(sections);
    const { error: delErr } = await supabase
      .from("home_sections")
      .delete()
      .eq("page_slug", pageSlug)
      .eq("is_draft", true);
    if (delErr) return { error: delErr.message };
    const rows = scoped.map((s, i) => sectionToDb(s, true, i));
    const { error: insErr } = await supabase.from("home_sections").insert(rows);
    if (insErr) return { error: insErr.message };
    setDraft(scoped);
    return { error: null };
  }, [pageSlug, withSlug]);

  const publishDraft = useCallback(async (sections: HomeSection[]) => {
    const supabase = getSupabase();
    const scoped = withSlug(sections);
    const { error: delPubErr } = await supabase
      .from("home_sections")
      .delete()
      .eq("page_slug", pageSlug)
      .eq("is_draft", false);
    if (delPubErr) return { error: delPubErr.message };

    const publishedRows = scoped.map((s, i) => sectionToDb(s, false, i));
    const { error: pubErr } = await supabase.from("home_sections").insert(publishedRows);
    if (pubErr) return { error: pubErr.message };

    const { error: delDraftErr } = await supabase
      .from("home_sections")
      .delete()
      .eq("page_slug", pageSlug)
      .eq("is_draft", true);
    if (delDraftErr) return { error: delDraftErr.message };

    const draftRows = scoped.map((s, i) => sectionToDb(s, true, i));
    const { error: draftErr } = await supabase.from("home_sections").insert(draftRows);
    if (draftErr) return { error: draftErr.message };

    setPublished(scoped);
    setDraft(scoped);
    return { error: null };
  }, [pageSlug, withSlug]);

  const discardDraft = useCallback(async () => {
    const supabase = getSupabase();
    const { error: delErr } = await supabase
      .from("home_sections")
      .delete()
      .eq("page_slug", pageSlug)
      .eq("is_draft", true);
    if (delErr) return { error: delErr.message };

    const { data } = await supabase
      .from("home_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("is_draft", false)
      .order("position");

    if (data && data.length > 0) {
      const draftSections = data.map(dbToSection);
      const draftRows = draftSections.map((s, i) => sectionToDb(s, true, i));
      const { error: insErr } = await supabase.from("home_sections").insert(draftRows);
      if (insErr) return { error: insErr.message };
      setDraft(draftSections);
    } else {
      setDraft(null);
    }
    return { error: null };
  }, [pageSlug]);

  return { published, draft, loading, beginDraft, saveDraft, publishDraft, discardDraft };
}

/** @deprecated use useSupabasePageSections("home") */
export function useSupabaseHomeSections() {
  return useSupabasePageSections("home");
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

  const insertProduct = useCallback(async (p: Omit<Product, "id" | "rating" | "reviews">) => {
    const { data } = await getSupabase().from("products").insert({
      name: p.name,
      cat: p.cat,
      price: p.price,
      old_price: p.old ?? null,
      ml: p.ml,
      tag: p.tag,
      stock: p.stock,
      description: p.desc,
      variants: p.variants,
      ingredients: p.ingredients,
      rating: 5,
      reviews: 0,
    }).select().single();
    if (data) {
      setProducts((prev) => [...prev, dbToProduct(data as DbProduct)]);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await getSupabase().from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { products, loading, updateProduct, insertProduct, deleteProduct, reload: load };
}

/* ─── useAdminOrderBadge (sidebar — temps réel) ───────────────────────────── */

/** Nombre total de commandes (temps réel Supabase) */
export function useAdminOrderBadge() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const { count: total, error } = await getSupabase()
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (!error && total !== null) setCount(total);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("admin-order-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [load]);

  return count;
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
    const [orderCountRes, orders, appointments, popups] = await Promise.all([
      sb.from("orders").select("*", { count: "exact", head: true }),
      sb.from("orders").select("id, status, total, created_at").order("created_at", { ascending: false }).limit(50),
      sb.from("appointments").select("id, client_name, service_id, start_at, status, price").order("start_at", { ascending: false }).limit(50),
      sb.from("popups").select("id, enabled"),
    ]);

    const orderRows = orders.data ?? [];
    const apptRows = appointments.data ?? [];
    const popupRows = popups.data ?? [];

    setKpis({
      totalOrders: orderCountRes.count ?? orderRows.length,
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

/* ─── ShippingMethod type ─────────────────────────────────────────────────── */

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
  isActive: boolean;
  isFree: boolean;
  sortOrder: number;
  createdAt: string;
}

type DbShipping = Database["public"]["Tables"]["shipping_methods"]["Row"];

function dbToShipping(r: DbShipping): ShippingMethod {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    estimatedDays: r.estimated_days,
    icon: r.icon,
    isActive: r.is_active,
    isFree: r.is_free,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

function shippingToDb(m: Partial<ShippingMethod>): Partial<Database["public"]["Tables"]["shipping_methods"]["Update"]> {
  const db: Partial<Database["public"]["Tables"]["shipping_methods"]["Update"]> = {};
  if (m.name !== undefined) db.name = m.name;
  if (m.description !== undefined) db.description = m.description;
  if (m.price !== undefined) db.price = m.price;
  if (m.estimatedDays !== undefined) db.estimated_days = m.estimatedDays;
  if (m.icon !== undefined) db.icon = m.icon;
  if (m.isActive !== undefined) db.is_active = m.isActive;
  if (m.isFree !== undefined) db.is_free = m.isFree;
  if (m.sortOrder !== undefined) db.sort_order = m.sortOrder;
  return db;
}

/* ─── useShippingMethods (admin — full CRUD) ─────────────────────────────── */

export function useShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("shipping_methods")
      .select("*")
      .order("sort_order");
    setMethods((data ?? []).map(dbToShipping));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("shipping-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipping_methods" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updateMethod = useCallback(async (id: string, patch: Partial<ShippingMethod>) => {
    const { error } = await getSupabase()
      .from("shipping_methods")
      .update(shippingToDb(patch))
      .eq("id", id);
    if (error) {
      console.error("[shipping] update error:", error);
      throw new Error(error.message);
    }
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, ...patch } : m));
  }, []);

  const insertMethod = useCallback(async (m: Omit<ShippingMethod, "id" | "createdAt">) => {
    const { data, error } = await getSupabase()
      .from("shipping_methods")
      .insert({
        name: m.name,
        description: m.description,
        price: m.price,
        estimated_days: m.estimatedDays,
        icon: m.icon,
        is_active: m.isActive,
        is_free: m.isFree,
        sort_order: m.sortOrder,
      })
      .select()
      .single();
    if (error) {
      console.error("[shipping] insert error:", error);
      throw new Error(error.message);
    }
    if (data) setMethods((prev) => [...prev, dbToShipping(data as DbShipping)].sort((a, b) => a.sortOrder - b.sortOrder));
  }, []);

  const deleteMethod = useCallback(async (id: string) => {
    const { error } = await getSupabase()
      .from("shipping_methods")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[shipping] delete error:", error);
      throw new Error(error.message);
    }
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const reorderMethods = useCallback(async (reordered: ShippingMethod[]) => {
    setMethods(reordered);
    const results = await Promise.all(
      reordered.map((m, i) =>
        getSupabase().from("shipping_methods").update({ sort_order: i }).eq("id", m.id)
      )
    );
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) console.error("[shipping] reorder error:", firstError);
  }, []);

  return { methods, loading, updateMethod, insertMethod, deleteMethod, reorderMethods, reload: load };
}

/* ─── useActiveShippingMethods (checkout — read-only) ────────────────────── */

export function useActiveShippingMethods() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("shipping_methods")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    setMethods((data ?? []).map(dbToShipping));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("shipping-checkout")
      .on("postgres_changes", { event: "*", schema: "public", table: "shipping_methods" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  return { methods, loading };
}

/* ─── Promo type ──────────────────────────────────────────────────────────── */

export interface Promo {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  isActive: boolean;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  freeShipping: boolean;
  minimumOrder: number;
  createdAt: string;
}

type DbPromo = Database["public"]["Tables"]["promotions"]["Row"];

function dbToPromo(r: DbPromo): Promo {
  return {
    id: r.id,
    code: r.code,
    description: r.description,
    type: r.type,
    value: Number(r.value),
    isActive: r.is_active,
    expiresAt: r.expires_at,
    maxUses: r.max_uses,
    currentUses: r.current_uses,
    freeShipping: r.free_shipping,
    minimumOrder: Number(r.minimum_order),
    createdAt: r.created_at,
  };
}

function promoToDb(p: Partial<Promo>): Partial<Database["public"]["Tables"]["promotions"]["Update"]> {
  const db: Partial<Database["public"]["Tables"]["promotions"]["Update"]> = {};
  if (p.code !== undefined) db.code = p.code;
  if (p.description !== undefined) db.description = p.description;
  if (p.type !== undefined) db.type = p.type;
  if (p.value !== undefined) db.value = p.value;
  if (p.isActive !== undefined) db.is_active = p.isActive;
  if ("expiresAt" in p) db.expires_at = p.expiresAt ?? null;
  if ("maxUses" in p) db.max_uses = p.maxUses ?? null;
  if (p.currentUses !== undefined) db.current_uses = p.currentUses;
  if (p.freeShipping !== undefined) db.free_shipping = p.freeShipping;
  if (p.minimumOrder !== undefined) db.minimum_order = p.minimumOrder;
  return db;
}

/* ─── usePromos (admin — full CRUD) ──────────────────────────────────────── */

export function usePromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos((data ?? []).map(dbToPromo));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("promos-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "promotions" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updatePromo = useCallback(async (id: string, patch: Partial<Promo>) => {
    const { error } = await getSupabase()
      .from("promotions")
      .update(promoToDb(patch))
      .eq("id", id);
    if (error) {
      console.error("[promos] update error:", error);
      throw new Error(error.message);
    }
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const insertPromo = useCallback(async (p: Omit<Promo, "id" | "currentUses" | "createdAt">) => {
    const { data, error } = await getSupabase()
      .from("promotions")
      .insert({
        code: p.code.toUpperCase().trim(),
        description: p.description,
        type: p.type,
        value: p.value,
        is_active: p.isActive,
        expires_at: p.expiresAt ?? null,
        max_uses: p.maxUses ?? null,
        free_shipping: p.freeShipping,
        minimum_order: p.minimumOrder,
      })
      .select()
      .single();
    if (error) {
      console.error("[promos] insert error:", error);
      throw new Error(error.message);
    }
    if (data) setPromos((prev) => [dbToPromo(data as DbPromo), ...prev]);
  }, []);

  const deletePromo = useCallback(async (id: string) => {
    const { error } = await getSupabase()
      .from("promotions")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[promos] delete error:", error);
      throw new Error(error.message);
    }
    setPromos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { promos, loading, updatePromo, insertPromo, deletePromo, reload: load };
}

/* ─── validatePromoCode (cart — client-side) ─────────────────────────────── */

export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<{ promo: Promo } | { error: string }> {
  const { data, error } = await getSupabase()
    .from("promotions")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (error || !data) return { error: "Code introuvable" };

  const promo = dbToPromo(data as DbPromo);

  if (!promo.isActive) return { error: "Ce code est inactif" };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { error: "Ce code a expiré" };
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
    return { error: "Ce code a atteint sa limite d'utilisation" };
  }
  if (promo.minimumOrder > 0 && subtotal < promo.minimumOrder) {
    return { error: `Minimum de commande : ${promo.minimumOrder.toFixed(2)} €` };
  }

  return { promo };
}

/** Compute item discount (excludes shipping). */
export function computePromoDiscount(promo: Promo, subtotal: number): number {
  if (promo.type === "shipping") return 0;
  if (promo.type === "percentage") return parseFloat((subtotal * (promo.value / 100)).toFixed(2));
  if (promo.type === "fixed") return Math.min(promo.value, subtotal);
  return 0;
}

/** True when the promo grants free shipping (either type=shipping or freeShipping flag). */
export function promoGrantsFreeShipping(promo: Promo): boolean {
  return promo.type === "shipping" || promo.freeShipping;
}

/* ─── Product reviews (admin) ───────────────────────────────────────────── */

type DbProductReview = Database["public"]["Tables"]["product_reviews"]["Row"];

function dbToProductReview(r: DbProductReview): ProductReview {
  return {
    id: r.id,
    userId: r.user_id,
    orderId: r.order_id,
    productId: r.product_id,
    productName: r.product_name,
    authorName: r.author_name,
    rating: r.rating,
    body: r.body,
    status: r.status as ReviewStatus,
    verified: r.verified,
    featured: r.featured,
    pinned: r.pinned,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function reviewToDb(r: Partial<ProductReview>): Partial<Database["public"]["Tables"]["product_reviews"]["Update"]> {
  const db: Partial<Database["public"]["Tables"]["product_reviews"]["Update"]> = {};
  if (r.authorName !== undefined) db.author_name = r.authorName;
  if (r.productName !== undefined) db.product_name = r.productName;
  if (r.rating !== undefined) db.rating = r.rating;
  if (r.body !== undefined) db.body = r.body;
  if (r.status !== undefined) db.status = r.status;
  if (r.verified !== undefined) db.verified = r.verified;
  if (r.featured !== undefined) db.featured = r.featured;
  if (r.pinned !== undefined) db.pinned = r.pinned;
  return db;
}

export function useProductReviewsAdmin() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviews((data ?? []).map((r) => dbToProductReview(r as DbProductReview)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = getSupabase()
      .channel("reviews-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_reviews" }, load)
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, [load]);

  const updateReview = useCallback(async (id: string, patch: Partial<ProductReview>) => {
    const { error } = await getSupabase()
      .from("product_reviews")
      .update(reviewToDb(patch))
      .eq("id", id);
    if (!error) setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    return { error: error?.message ?? null };
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    const { error } = await getSupabase().from("product_reviews").delete().eq("id", id);
    if (!error) setReviews((prev) => prev.filter((r) => r.id !== id));
    return { error: error?.message ?? null };
  }, []);

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    published: reviews.filter((r) => r.status === "published").length,
    avg:
      reviews.filter((r) => r.status === "published").length > 0
        ? reviews
            .filter((r) => r.status === "published")
            .reduce((s, r) => s + r.rating, 0) /
          reviews.filter((r) => r.status === "published").length
        : 0,
  };

  return { reviews, loading, stats, updateReview, deleteReview, reload: load };
}
