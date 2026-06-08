"use client";
/**
 * LN COS — Notification Store
 *
 * Standalone store for in-app notifications.
 * Future: wire to Supabase realtime subscription on notifications table.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NotificationContract } from "@/lib/contracts";

/* ─── Store ─────────────────────────────────────────────────────────── */

interface NotificationState {
  notifications: NotificationContract[];
  /** Total unread count */
  unreadCount: () => number;
  /** Mark a single notification as read */
  markRead: (id: string) => void;
  /** Mark all as read */
  markAllRead: () => void;
  /** Prepend a new notification (e.g. from realtime push) */
  addNotification: (n: NotificationContract) => void;
  /** Remove expired notifications */
  pruneExpired: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      unreadCount: () => get().notifications.filter((n) => n.unread).length,

      markRead(id) {
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, unread: false } : n
          ),
        }));
      },

      markAllRead() {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, unread: false })),
        }));
      },

      addNotification(n) {
        set((s) => ({ notifications: [n, ...s.notifications] }));
      },

      pruneExpired() {
        const now = new Date();
        set((s) => ({
          notifications: s.notifications.filter((n) => {
            if (!n.expiresAt) return true;
            return new Date(n.expiresAt) > now;
          }),
        }));
      },
    }),
    {
      name: "lncos-notifications",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (s) => ({ notifications: s.notifications }),
    }
  )
);
