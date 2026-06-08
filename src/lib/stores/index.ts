/**
 * LN COS — Store barrel
 *
 * Import stores from here. Each store is independent — import only what you need.
 *
 * Core app store (cart, favs, toast, overlays):
 *   import { useStore } from "@/lib/store";      ← existing, unchanged
 *
 * Modular stores:
 *   import { useHomeSectionsStore } from "@/lib/stores";
 *   import { useNotificationStore } from "@/lib/stores";
 *   import { useLoyaltyStore }       from "@/lib/stores";
 */

export { useHomeSectionsStore, selectSectionsByType } from "./home-sections-store";
export { useNotificationStore }                        from "./notification-store";
export { useLoyaltyStore }                             from "./loyalty-store";
