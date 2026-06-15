"use client";

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Product, Category } from "./data";
import { products as STATIC_PRODUCTS, categories as STATIC_CATEGORIES } from "./data";
import { normalizeHomeVisibility } from "./product-home-visibility";
import { withFlashSaleFlag } from "./flash-sales";
import { fetchActiveProductsFromDb } from "./fetch-active-products";
import { applyCategoryProductCounts } from "./category-product-counts";

type Listener = () => void;

const initialProducts: Product[] = [...STATIC_PRODUCTS].reverse().map((p) =>
  withFlashSaleFlag({
    ...p,
    homeVisibility: normalizeHomeVisibility(p.homeVisibility, p.tag),
  })
);

type CatalogState = {
  products: Product[];
  categories: Category[];
  productsLoading: boolean;
  categoriesLoading: boolean;
  productsError: string | null;
  categoriesError: string | null;
  productsFetched: boolean;
  categoriesFetched: boolean;
};

let state: CatalogState = {
  products: initialProducts,
  categories: applyCategoryProductCounts(STATIC_CATEGORIES, initialProducts),
  productsLoading: false,
  categoriesLoading: false,
  productsError: null,
  categoriesError: null,
  productsFetched: false,
  categoriesFetched: false,
};

const listeners = new Set<Listener>();
let productsInFlight: Promise<void> | null = null;
let categoriesInFlight: Promise<void> | null = null;
let productsRealtimeSubscribed = false;

function recomputeCategoryCounts() {
  state = {
    ...state,
    categories: applyCategoryProductCounts(state.categories, state.products),
  };
}

function ensureProductsRealtime() {
  if (!isSupabaseConfigured() || productsRealtimeSubscribed) return;
  productsRealtimeSubscribed = true;
  try {
    getSupabase()
      .channel("public-catalog-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          void loadProducts(true);
        },
      )
      .subscribe();
  } catch {
    // Realtime indisponible — revalidation manuelle / navigation
  }
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CatalogState {
  return state;
}

function setProductsLoading(active: boolean) {
  if (state.products.length === 0) {
    state = { ...state, productsLoading: active };
  } else {
    state = { ...state, productsLoading: false };
  }
  notify();
}

async function loadProducts(force = false): Promise<void> {
  ensureProductsRealtime();

  if (!isSupabaseConfigured()) {
    state = {
      ...state,
      productsLoading: false,
      productsError: null,
      productsFetched: true,
    };
    notify();
    return;
  }

  if (productsInFlight && !force) return productsInFlight;
  if (state.productsFetched && !force) return;

  setProductsLoading(true);
  state = { ...state, productsError: null };
  notify();

  productsInFlight = (async () => {
    try {
      const loaded = await fetchActiveProductsFromDb();
      if (loaded) {
        state = { ...state, products: loaded };
        recomputeCategoryCounts();
      }
    } catch {
      if (state.products.length === 0) {
        state = {
          ...state,
          productsError: "Impossible de charger les produits. Vérifiez votre connexion.",
        };
      }
    } finally {
      state = {
        ...state,
        productsLoading: false,
        productsFetched: true,
      };
      productsInFlight = null;
      notify();
    }
  })();

  return productsInFlight;
}

async function loadCategories(force = false): Promise<void> {
  if (!isSupabaseConfigured()) {
    state = {
      ...state,
      categoriesLoading: false,
      categoriesError: null,
      categoriesFetched: true,
    };
    notify();
    return;
  }

  if (categoriesInFlight && !force) return categoriesInFlight;
  if (state.categoriesFetched && !force) return;

  if (state.categories.length === 0) {
    state = { ...state, categoriesLoading: true };
  }
  state = { ...state, categoriesError: null };
  notify();

  categoriesInFlight = (async () => {
    try {
      const { data, error: fetchErr } = await getSupabase()
        .from("categories")
        .select("id,name,cover_url,position")
        .order("position");
      if (fetchErr) throw fetchErr;
      if (data && data.length > 0) {
        const base: Category[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          count: 0,
          coverUrl: row.cover_url ?? null,
        }));
        state = {
          ...state,
          categories: applyCategoryProductCounts(base, state.products),
        };
      }
    } catch {
      if (state.categories.length === 0) {
        state = {
          ...state,
          categoriesError: "Impossible de charger les catégories.",
        };
      }
    } finally {
      state = {
        ...state,
        categoriesLoading: false,
        categoriesFetched: true,
      };
      categoriesInFlight = null;
      notify();
    }
  })();

  return categoriesInFlight;
}

export function usePublicCatalogProducts() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void loadProducts();
  }, []);

  const reload = useCallback(() => loadProducts(true), []);

  const loading = snap.productsLoading && snap.products.length === 0;
  const byId = (id: string) => snap.products.find((p) => p.id === id) ?? null;

  return {
    products: snap.products,
    loading,
    isRefreshing: snap.productsLoading && snap.products.length > 0,
    error: snap.productsError,
    reload,
    byId,
  };
}

export function usePublicCatalogCategories() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void loadCategories();
  }, []);

  const reload = useCallback(() => loadCategories(true), []);

  const loading = snap.categoriesLoading && snap.categories.length === 0;

  return {
    categories: snap.categories,
    loading,
    isRefreshing: snap.categoriesLoading && snap.categories.length > 0,
    error: snap.categoriesError,
    reload,
  };
}
