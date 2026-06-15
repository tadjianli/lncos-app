"use client";
/**
 * LN COS — Global Zustand store
 * Cart · Favorites · Toast · Navigation overlays · Booking intent
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./data";
import { effectivePrice, findVariantByName } from "./product-catalog";
import type { ProductNavSource } from "./product-navigation";
import {
  buildReturnContext,
  logProductNav,
  pushProductOverlayHistory,
} from "./product-navigation";
import { preloadProductImages } from "./image-session-cache";
import { pushOverlayHistory, shouldPushOverlayHistory } from "./overlay-history";
import {
  clearListingUrlParam,
  pushListingOverlayHistory,
  replaceListingUrl,
} from "./listing-route-sync";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CartItem extends Product {
  key: string;   // product.id + "|" + variant
  qty: number;
  variant: string;
}

export type OverlayType =
  | "product"
  | "booking"
  | "side-menu"
  | "search"
  | "listing"
  | "loyalty"
  | "notifications"
  | "orders"
  | "appointments"
  | "reels"
  | "auth"
  | "settings";

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface OverlayState {
  type: OverlayType;
  product?: Product;
  serviceId?: string | null;
  resumeFlag?: boolean;
  category?: Category | null;
  /** Contexte de retour lorsque type === "product" */
  productReturn?: import("./product-navigation").ProductReturnContext;
}

export interface ToastState {
  msg: string;
  icon?: string;
}

function stackOverlayHistory(current: OverlayState | null, nextType: OverlayType) {
  if (typeof window === "undefined") return;
  if (current?.type === nextType) return;
  if (shouldPushOverlayHistory(nextType)) {
    pushOverlayHistory(nextType);
  }
}

/* ─── Store ──────────────────────────────────────────────────────────── */

interface AppStore {
  /* Hydration sentinel — false until persist rehydrates from localStorage */
  _storeHydrated: boolean;

  /* Cart */
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product, qty?: number, variant?: string) => void;
  removeFromCart: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;

  /* Favorites */
  favs: string[];
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;

  /* Toast */
  toast: ToastState | null;
  showToast: (msg: string, icon?: string) => void;
  _toastTimer: ReturnType<typeof setTimeout> | null;

  /* Overlay / modal stack */
  overlay: OverlayState | null;
  openProduct: (product: Product, opts?: { source?: ProductNavSource; fromRecommendations?: boolean }) => void;
  openSearch: () => void;
  openSideMenu: () => void;
  openListing: (category: Category | null, opts?: { fromUrl?: boolean }) => void;
  openBooking: (serviceId?: string | null, resume?: boolean) => void;
  openLoyalty: () => void;
  openNotifications: () => void;
  openOrders: () => void;
  openAppointments: () => void;
  openReels: () => void;
  openAuth: () => void;
  openSettings: () => void;
  closeOverlay: () => void;
  restoreOverlay: (overlay: OverlayState) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      /* ── Hydration ───────────────────────────── */
      _storeHydrated: false,

      /* ── Cart ────────────────────────────────── */
      cart: [],
      cartCount: 0,

      addToCart(product, qty = 1, variant) {
        const v = variant ?? product.variants[0];
        const key = product.id + "|" + v;
        const variantRow = findVariantByName(product, v);
        const price = effectivePrice(product, variantRow);
        set((s) => {
          const existing = s.cart.find((it) => it.key === key);
          const newCart = existing
            ? s.cart.map((it) => it.key === key ? { ...it, qty: it.qty + qty } : it)
            : [...s.cart, { ...product, key, qty, variant: v, price }];
          return { cart: newCart, cartCount: newCart.reduce((t, i) => t + i.qty, 0) };
        });
        get().showToast(`${product.name} ajouté ✨`);
      },

      removeFromCart(key) {
        set((s) => {
          const newCart = s.cart.filter((it) => it.key !== key);
          return { cart: newCart, cartCount: newCart.reduce((t, i) => t + i.qty, 0) };
        });
      },

      setQty(key, qty) {
        set((s) => {
          const newCart = qty <= 0
            ? s.cart.filter((it) => it.key !== key)
            : s.cart.map((it) => it.key === key ? { ...it, qty } : it);
          return { cart: newCart, cartCount: newCart.reduce((t, i) => t + i.qty, 0) };
        });
      },

      clearCart() {
        set({ cart: [], cartCount: 0 });
      },

      /* ── Favorites ───────────────────────────── */
      favs: [],

      toggleFav(id) {
        const adding = !get().favs.includes(id);
        set((s) => ({
          favs: adding ? [...s.favs, id] : s.favs.filter((x) => x !== id),
        }));
        get().showToast(
          adding ? "Ajouté aux favoris" : "Retiré des favoris",
          "heart"
        );
      },

      isFav(id) {
        return get().favs.includes(id);
      },

      /* ── Toast ───────────────────────────────── */
      toast: null,
      _toastTimer: null,

      showToast(msg, icon) {
        const prev = get()._toastTimer;
        if (prev) clearTimeout(prev);
        const timer = setTimeout(() => set({ toast: null, _toastTimer: null }), 2000);
        set({ toast: { msg, icon }, _toastTimer: timer });
      },

      /* ── Overlay ─────────────────────────────── */
      overlay: null,

      openProduct(product, opts) {
        preloadProductImages(product);

        const current = get().overlay;
        const productReturn = buildReturnContext(current, opts);

        logProductNav("open", {
          routeSource: productReturn.pathname + productReturn.search,
          routeDestination: product.id,
          source: productReturn.source,
          previousOverlay: productReturn.previousOverlay?.type ?? null,
          historyBefore: typeof window !== "undefined" ? window.history.length : null,
          replacesProduct: current?.type === "product",
        });

        if (current?.type === "product") {
          set({ overlay: { type: "product", product, productReturn } });
          logProductNav("open-after-replace", {
            historyAfter: typeof window !== "undefined" ? window.history.length : null,
          });
          return;
        }

        if (typeof window !== "undefined") {
          pushProductOverlayHistory(product.id);
          logProductNav("open-after", {
            historyAfter: window.history.length,
          });
        }

        set({ overlay: { type: "product", product, productReturn } });
      },
      openSearch() {
        const current = get().overlay;
        stackOverlayHistory(current, "search");
        set({ overlay: { type: "search" } });
      },
      openSideMenu() {
        const current = get().overlay;
        stackOverlayHistory(current, "side-menu");
        set({ overlay: { type: "side-menu" } });
      },
      openListing(category, opts) {
        const current = get().overlay;
        const categoryId = category?.id ?? null;

        if (current?.type === "listing") {
          if (typeof window !== "undefined") replaceListingUrl(categoryId);
          set({ overlay: { type: "listing", category } });
          return;
        }

        if (typeof window !== "undefined" && !opts?.fromUrl) {
          pushListingOverlayHistory(categoryId);
        } else if (typeof window !== "undefined" && opts?.fromUrl) {
          replaceListingUrl(categoryId);
        }

        set({ overlay: { type: "listing", category } });
      },
      openBooking(serviceId = null, resume = false) {
        set({ overlay: { type: "booking", serviceId, resumeFlag: resume } });
      },
      openLoyalty() {
        const current = get().overlay;
        stackOverlayHistory(current, "loyalty");
        set({ overlay: { type: "loyalty" } });
      },
      openNotifications() {
        const current = get().overlay;
        stackOverlayHistory(current, "notifications");
        set({ overlay: { type: "notifications" } });
      },
      openOrders() {
        const current = get().overlay;
        stackOverlayHistory(current, "orders");
        set({ overlay: { type: "orders" } });
      },
      openAppointments() {
        const current = get().overlay;
        stackOverlayHistory(current, "appointments");
        set({ overlay: { type: "appointments" } });
      },
      openReels() {
        const current = get().overlay;
        stackOverlayHistory(current, "reels");
        set({ overlay: { type: "reels" } });
      },
      openAuth() {
        const current = get().overlay;
        stackOverlayHistory(current, "auth");
        set({ overlay: { type: "auth" } });
      },
      openSettings() {
        const current = get().overlay;
        stackOverlayHistory(current, "settings");
        set({ overlay: { type: "settings" } });
      },
      closeOverlay() {
        if (typeof window !== "undefined") {
          clearListingUrlParam();
        }
        set({ overlay: null });
      },

      restoreOverlay(overlay: OverlayState) {
        switch (overlay.type) {
          case "product":
            if (overlay.product) {
              set({ overlay: { type: "product", product: overlay.product, productReturn: overlay.productReturn } });
            }
            break;
          case "search":
            set({ overlay: { type: "search" } });
            break;
          case "listing":
            set({ overlay: { type: "listing", category: overlay.category ?? null } });
            break;
          case "side-menu":
            set({ overlay: { type: "side-menu" } });
            break;
          case "loyalty":
            set({ overlay: { type: "loyalty" } });
            break;
          case "notifications":
            set({ overlay: { type: "notifications" } });
            break;
          case "orders":
            set({ overlay: { type: "orders" } });
            break;
          case "appointments":
            set({ overlay: { type: "appointments" } });
            break;
          case "reels":
            set({ overlay: { type: "reels" } });
            break;
          case "auth":
            set({ overlay: { type: "auth" } });
            break;
          case "settings":
            set({ overlay: { type: "settings" } });
            break;
          default:
            break;
        }
      },
    }),
    {
      name: "lncos-app-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // Persist cart + favs; ephemeral state (overlay, toast, hydration sentinel) is not persisted
      partialize: (s) => ({ cart: s.cart, cartCount: s.cartCount, favs: s.favs }),
      // Skip automatic rehydration on store creation — localStorage is read synchronously
      // which causes a hydration mismatch because React sees the real favs before the SSR
      // HTML is patched. We manually call rehydrate() in a useEffect (see AppShell).
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._storeHydrated = true;
          state.cartCount = state.cart.reduce((t, i) => t + i.qty, 0);
        }
      },
    }
  )
);

/* ─── Selectors ──────────────────────────────────────────────────────── */

export const selectCart = (s: AppStore) => s.cart;
export const selectCartCount = (s: AppStore) => s.cartCount;
export const selectFavs = (s: AppStore) => s.favs;
export const selectToast = (s: AppStore) => s.toast;
export const selectOverlay = (s: AppStore) => s.overlay;
