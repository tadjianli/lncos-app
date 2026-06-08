/**
 * LN COS — Loyalty contracts
 * Tier thresholds align with LoyaltyScreen mock data.
 */

export type LoyaltyTier = "bronze" | "argent" | "or" | "platine";

export const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze:  0,
  argent:  500,
  or:      1_500,
  platine: 3_000,
};

export const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze:  "Bronze",
  argent:  "Argent",
  or:      "Or",
  platine: "Platine",
};

export function getTierForPoints(pts: number): LoyaltyTier {
  if (pts >= TIER_THRESHOLDS.platine) return "platine";
  if (pts >= TIER_THRESHOLDS.or)      return "or";
  if (pts >= TIER_THRESHOLDS.argent)  return "argent";
  return "bronze";
}

export function getTierProgress(pts: number): number {
  const tier = getTierForPoints(pts);
  const thresholds: LoyaltyTier[] = ["bronze", "argent", "or", "platine"];
  const idx = thresholds.indexOf(tier);
  if (idx === thresholds.length - 1) return 1; // platine = full
  const current = TIER_THRESHOLDS[tier];
  const next    = TIER_THRESHOLDS[thresholds[idx + 1]];
  return Math.min(1, (pts - current) / (next - current));
}

export interface LoyaltyContract {
  userId?: string;
  points: number;
  tier: LoyaltyTier;
  tierProgress: number;   // 0 – 1 progress to next tier
  nextTierPoints?: number;
  totalEarned: number;
  joinedAt: string;       // ISO
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  ptsRequired: number;
  category: "shipping" | "discount" | "gift" | "experience";
  imageUrl?: string;
  available: boolean;
  expiresAt?: string;     // ISO
}

export type LoyaltyTransactionType = "earn" | "redeem" | "expire" | "bonus";

export interface LoyaltyTransaction {
  id: string;
  type: LoyaltyTransactionType;
  pts: number;
  description: string;
  refId?: string;         // orderId or appointmentId
  createdAt: string;      // ISO
}
