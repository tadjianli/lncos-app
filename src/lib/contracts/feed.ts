/**
 * LN COS — Feed / Reels contracts
 */

export type FeedItemType =
  | "reel"
  | "editorial"
  | "product_spotlight"
  | "ugc";

export interface FeedItemContract {
  id: string;
  type: FeedItemType;
  title: string;
  label?: string;           // short tag shown in the UI (#Routine)
  thumbnail?: string;       // image URL
  videoUrl?: string;
  durationSec?: number;
  views?: number;
  likes?: number;
  linkedProductIds?: string[];
  publishedAt: string;      // ISO
  expiresAt?: string;       // ISO
}
