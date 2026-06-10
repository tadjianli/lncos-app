"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { slugifyProductId } from "./product-catalog";
import { services as seedServices, type Service } from "./rdv-data";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  serviceCount?: number;
}

export interface CategoryFilterChip {
  id: string;
  name: string;
  count: number;
  icon?: string;
  color?: string;
}

type DbCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type DbServiceRow = {
  id: string;
  cat: string;
  category_id: string | null;
  name: string;
  price: number;
  duration?: number;
  min?: number;
  color: string;
  popular?: boolean;
  pop?: boolean;
  active: boolean;
  description?: string;
  desc?: string;
};

/* ─── Mappers ───────────────────────────────────────────────────────────── */

export function mapDbServiceCategory(row: DbCategoryRow): ServiceCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon || "scissors",
    color: row.color || "#D4AF37",
    sortOrder: row.sort_order ?? 0,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDbService(row: DbServiceRow): Service {
  return {
    id: row.id,
    categoryId: row.category_id ?? row.cat,
    name: row.name,
    price: Number(row.price),
    min: row.duration ?? row.min ?? 60,
    color: row.color || "#D4AF37",
    pop: row.popular ?? row.pop ?? false,
    active: row.active !== false,
    desc: row.description ?? row.desc ?? "",
  };
}

export function serviceToDb(s: Service): Record<string, unknown> {
  return {
    id: s.id,
    category_id: s.categoryId,
    cat: s.categoryId,
    name: s.name,
    price: s.price,
    duration: s.min,
    color: s.color,
    popular: Boolean(s.pop),
    active: s.active,
    description: s.desc ?? "",
  };
}

export function slugifyServiceCategory(name: string): string {
  return slugifyProductId(name);
}

export function buildCategoryFilters(
  categories: ServiceCategory[],
  serviceList: Service[],
  activeOnly = true
): CategoryFilterChip[] {
  const visibleServices = activeOnly ? serviceList.filter((s) => s.active) : serviceList;
  const sorted = [...categories]
    .filter((c) => (activeOnly ? c.isActive : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return [
    {
      id: "all",
      name: "Tout",
      count: visibleServices.length,
    },
    ...sorted.map((c) => ({
      id: c.id,
      name: c.name,
      count: visibleServices.filter((s) => s.categoryId === c.id).length,
      icon: c.icon,
      color: c.color,
    })),
  ];
}

export function categoryChipLabel(chip: CategoryFilterChip): string {
  if (chip.id === "all") return chip.name;
  return `${chip.name} (${chip.count})`;
}

function attachCounts(categories: ServiceCategory[], serviceList: Service[]): ServiceCategory[] {
  return categories.map((c) => ({
    ...c,
    serviceCount: serviceList.filter((s) => s.categoryId === c.id).length,
  }));
}

/* Canal realtime partagé — évite « cannot add callbacks after subscribe() » */
const RDV_CATALOG_CHANNEL = "rdv-catalog";

type RdvCatalogRealtimeState = {
  refCount: number;
  channel: RealtimeChannel | null;
  listeners: Set<() => void>;
};

const rdvCatalogRealtime: RdvCatalogRealtimeState = {
  refCount: 0,
  channel: null,
  listeners: new Set(),
};

function notifyRdvCatalogListeners() {
  rdvCatalogRealtime.listeners.forEach((fn) => fn());
}

/** Abonnement realtime mutualisé (plusieurs hooks / onglets admin). */
function useRdvCatalogRealtime(onChange: () => void) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    rdvCatalogRealtime.listeners.add(onChange);
    rdvCatalogRealtime.refCount += 1;

    if (rdvCatalogRealtime.refCount === 1) {
      rdvCatalogRealtime.channel = getSupabase()
        .channel(RDV_CATALOG_CHANNEL)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "service_categories" },
          notifyRdvCatalogListeners
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "services" },
          notifyRdvCatalogListeners
        )
        .subscribe();
    }

    return () => {
      rdvCatalogRealtime.listeners.delete(onChange);
      rdvCatalogRealtime.refCount -= 1;
      if (rdvCatalogRealtime.refCount <= 0) {
        if (rdvCatalogRealtime.channel) {
          getSupabase().removeChannel(rdvCatalogRealtime.channel);
        }
        rdvCatalogRealtime.channel = null;
        rdvCatalogRealtime.refCount = 0;
      }
    };
  }, [onChange]);
}

/* ─── Public catalog (client RDV) ─────────────────────────────────────────── */

export function usePublicRdvCatalog() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      const cats: ServiceCategory[] = [
        { id: "manucure", name: "Manucure", slug: "manucure", icon: "scissors", color: "#D4AF37", sortOrder: 1, isActive: true, createdAt: "", updatedAt: "" },
        { id: "extensions", name: "Extensions", slug: "extensions", icon: "sparkle", color: "#6FA8C9", sortOrder: 2, isActive: true, createdAt: "", updatedAt: "" },
      ];
      setCategories(cats);
      setServices(seedServices.filter((s) => s.active));
      setLoading(false);
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const [catRes, svcRes] = await Promise.all([
      sb.from("service_categories").select("*").eq("is_active", true).order("sort_order"),
      sb.from("services").select("*").eq("active", true).order("name"),
    ]);

    if (catRes.error) console.warn("[rdv-catalog] categories:", catRes.error.message);
    if (svcRes.error) console.warn("[rdv-catalog] services:", svcRes.error.message);

    const catRows = (catRes.data ?? []) as DbCategoryRow[];
    const svcRows = (svcRes.data ?? []) as DbServiceRow[];
    setCategories(catRows.map(mapDbServiceCategory));
    setServices(svcRows.map(mapDbService));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRdvCatalogRealtime(load);

  const filters = useMemo(
    () => buildCategoryFilters(categories, services, true),
    [categories, services]
  );

  return { categories, services, filters, loading, reload: load };
}

/* ─── Admin hooks ─────────────────────────────────────────────────────────── */

export function useAdminServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCategories([]);
      setServices(seedServices);
      setLoading(false);
      return;
    }

    setLoading(true);
    const sb = getSupabase();
    const [catRes, svcRes] = await Promise.all([
      sb.from("service_categories").select("*").order("sort_order"),
      sb.from("services").select("*").order("name"),
    ]);

    if (catRes.error) console.warn("[admin-service-categories]", catRes.error.message);
    if (svcRes.error) console.warn("[admin-services]", svcRes.error.message);

    const svcList = ((svcRes.data ?? []) as DbServiceRow[]).map(mapDbService);
    const cats = attachCounts(
      ((catRes.data ?? []) as DbCategoryRow[]).map(mapDbServiceCategory),
      svcList
    );
    setCategories(cats);
    setServices(svcList);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRdvCatalogRealtime(load);

  const insertCategory = useCallback(
    async (input: Omit<ServiceCategory, "createdAt" | "updatedAt" | "serviceCount">) => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      const { error } = await getSupabase().from("service_categories").insert({
        id: input.id,
        name: input.name,
        slug: input.slug,
        icon: input.icon,
        color: input.color,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      });
      if (!error) await load();
      return { error: error?.message ?? null };
    },
    [load]
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<ServiceCategory>) => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      const db = {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
        ...(patch.icon !== undefined ? { icon: patch.icon } : {}),
        ...(patch.color !== undefined ? { color: patch.color } : {}),
        ...(patch.sortOrder !== undefined ? { sort_order: patch.sortOrder } : {}),
        ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
      };
      const { error } = await getSupabase().from("service_categories").update(db).eq("id", id);
      if (!error) await load();
      return { error: error?.message ?? null };
    },
    [load]
  );

  const reorderCategories = useCallback(
    async (orderedIds: string[]) => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      await Promise.all(
        orderedIds.map((id, i) =>
          getSupabase().from("service_categories").update({ sort_order: i + 1 }).eq("id", id)
        )
      );
      await load();
      return { error: null };
    },
    [load]
  );

  const deleteCategory = useCallback(
    async (id: string, transferToId?: string): Promise<{ error: string | null; serviceCount?: number }> => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      const count = services.filter((s) => s.categoryId === id).length;
      if (count > 0 && !transferToId) {
        return { error: "TRANSFER_REQUIRED", serviceCount: count };
      }
      if (count > 0 && transferToId) {
        const target = categories.find((c) => c.id === transferToId);
        const { error: moveErr } = await getSupabase()
          .from("services")
          .update({ category_id: transferToId, cat: target?.slug ?? transferToId })
          .eq("category_id", id);
        if (moveErr) return { error: moveErr.message };
      }
      const { error } = await getSupabase().from("service_categories").delete().eq("id", id);
      if (!error) await load();
      return { error: error?.message ?? null };
    },
    [categories, services, load]
  );

  const upsertService = useCallback(
    async (service: Service) => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      const cat = categories.find((c) => c.id === service.categoryId);
      const row = serviceToDb(service);
      if (cat) row.cat = cat.slug;
      const { error } = await getSupabase().from("services").upsert(row as never);
      if (!error) await load();
      return { error: error?.message ?? null };
    },
    [categories, load]
  );

  const deleteService = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured()) return { error: "Supabase non configuré" };
      const { error } = await getSupabase().from("services").delete().eq("id", id);
      if (!error) await load();
      return { error: error?.message ?? null };
    },
    [load]
  );

  return {
    categories,
    services,
    loading,
    reload: load,
    insertCategory,
    updateCategory,
    reorderCategories,
    deleteCategory,
    upsertService,
    deleteService,
  };
}
