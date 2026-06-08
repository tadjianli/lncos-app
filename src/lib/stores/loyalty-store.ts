"use client";
/**
 * LN COS — Loyalty Store
 *
 * Manages loyalty points, tier progression, and transaction history.
 * Future: wire to Supabase loyalty tables.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getTierForPoints,
  getTierProgress,
  TIER_THRESHOLDS,
  type LoyaltyTier,
  type LoyaltyTransaction,
  type LoyaltyReward,
} from "@/lib/contracts/loyalty";

/* ─── Store ─────────────────────────────────────────────────────────── */

interface LoyaltyState {
  points: number;
  totalEarned: number;
  joinedAt: string;           // ISO
  transactions: LoyaltyTransaction[];
  rewards: LoyaltyReward[];   // available rewards catalog

  /* ── Computed (selectors) ─────────────────────────── */
  tier: () => LoyaltyTier;
  tierProgress: () => number;
  nextTierPoints: () => number | null;

  /* ── Mutations ────────────────────────────────────── */
  earnPoints: (pts: number, description: string, refId?: string) => void;
  redeemPoints: (pts: number, description: string, refId?: string) => void;
  /** Called after order/appointment to award points */
  awardOrderPoints: (orderId: string, orderTotal: number) => void;
  setRewards: (rewards: LoyaltyReward[]) => void;
}

const POINTS_PER_EURO = 2; // 2 pts per € spent

function nextTier(tier: LoyaltyTier): LoyaltyTier | null {
  const order: LoyaltyTier[] = ["bronze", "argent", "or", "platine"];
  const idx = order.indexOf(tier);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      points: 0,
      totalEarned: 0,
      joinedAt: new Date().toISOString(),
      transactions: [],
      rewards: [],

      tier: () => getTierForPoints(get().points),
      tierProgress: () => getTierProgress(get().points),
      nextTierPoints: () => {
        const nt = nextTier(get().tier());
        return nt ? TIER_THRESHOLDS[nt] : null;
      },

      earnPoints(pts, description, refId) {
        const tx: LoyaltyTransaction = {
          id: `tx-${Date.now()}`,
          type: "earn",
          pts,
          description,
          refId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          points: s.points + pts,
          totalEarned: s.totalEarned + pts,
          transactions: [tx, ...s.transactions],
        }));
      },

      redeemPoints(pts, description, refId) {
        const available = get().points;
        if (pts > available) return;
        const tx: LoyaltyTransaction = {
          id: `tx-${Date.now()}`,
          type: "redeem",
          pts: -pts,
          description,
          refId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          points: s.points - pts,
          transactions: [tx, ...s.transactions],
        }));
      },

      awardOrderPoints(orderId, orderTotal) {
        const pts = Math.floor(orderTotal * POINTS_PER_EURO);
        get().earnPoints(pts, `Commande #${orderId}`, orderId);
      },

      setRewards(rewards) {
        set({ rewards });
      },
    }),
    {
      name: "lncos-loyalty",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (s) => ({
        points: s.points,
        totalEarned: s.totalEarned,
        joinedAt: s.joinedAt,
        transactions: s.transactions,
      }),
    }
  )
);
