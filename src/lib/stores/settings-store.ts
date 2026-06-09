"use client";
/**
 * LN COS — Client account preferences (local persistence)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ClientSettings {
  notifPromos: boolean;
  notifOrders: boolean;
  notifRdv: boolean;
  notifNewsletter: boolean;
  marketingEmails: boolean;
}

interface SettingsStore extends ClientSettings {
  set: <K extends keyof ClientSettings>(key: K, value: ClientSettings[K]) => void;
  reset: () => void;
}

const DEFAULTS: ClientSettings = {
  notifPromos: true,
  notifOrders: true,
  notifRdv: true,
  notifNewsletter: false,
  marketingEmails: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set(key, value) {
        set({ [key]: value });
      },
      reset() {
        set(DEFAULTS);
      },
    }),
    {
      name: "lncos-client-settings",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);
