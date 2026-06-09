"use client";
/**
 * LN COS — Global Zustand store
 * Cart · Favorites · Toast · Navigation overlays · Booking intent
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./data";
import { effectivePrice, findVariantByName } from "./product-catalog";

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
}

export interface ToastState {
  msg: string;
  icon?: string;
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
  openProduct: (product: Product) => void;
  openSearch: () => void;
  openSideMenu: () => void;
  openListing: (category: Category | null) => void;
  openBooking: (serviceId?: string | null, resume?: boolean) => void;
  openLoyalty: () => void;
  openNotifications: () => void;
  openOrders: () => void;
  openAppointments: () => void;
  openReels: () => void;
  openAuth: () => void;
  openSettings: () => void;
  closeOverlay: () => void;
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

      openProduct(product) {
        set({ overlay: { type: "product", product } });
      },
      openSearch() {
        set({ overlay: { type: "search" } });
      },
      openSideMenu() {
        set({ overlay: { type: "side-menu" } });
      },
      openListing(category) {
        set({ overlay: { type: "listing", category } });
      },
      openBooking(serviceId = null, resume = false) {
        set({ overlay: { type: "booking", serviceId, resumeFlag: resume } });
      },
      openLoyalty() {
        set({ overlay: { type: "loyalty" } });
      },
      openNotifications() {
        set({ overlay: { type: "notifications" } });
      },
      openOrders() {
        set({ overlay: { type: "orders" } });
      },
      openAppointments() {
        set({ overlay: { type: "appointments" } });
      },
      openReels() {
        set({ overlay: { type: "reels" } });
      },
      openAuth() {
        set({ overlay: { type: "auth" } });
      },
      openSettings() {
        set({ overlay: { type: "settings" } });
      },
      closeOverlay() {
        set({ overlay: null });
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
        if (state) state._storeHydrated = true;
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
