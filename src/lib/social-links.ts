/**
 * Réseaux sociaux — alimentés par config/branding.ts (surchargeables via env).
 */

import { branding } from "@config/branding";

export type SocialNetworkId = string;

export interface SocialNetworkLink {
  id: SocialNetworkId;
  name: string;
  handle: string;
  url: string;
  accent: string;
  followers?: number | null;
  latestPost?: string | null;
  latestVideo?: string | null;
}

const ENV_URL_KEYS: Record<string, string> = {
  instagram: "NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL",
  tiktok: "NEXT_PUBLIC_SOCIAL_TIKTOK_URL",
  facebook: "NEXT_PUBLIC_SOCIAL_FACEBOOK_URL",
  youtube: "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL",
  pinterest: "NEXT_PUBLIC_SOCIAL_PINTEREST_URL",
};

function resolveUrl(id: string, fallback: string): string {
  const key = ENV_URL_KEYS[id];
  const fromEnv = key ? process.env[key]?.trim() : undefined;
  return fromEnv || fallback;
}

/** Liens sociaux depuis branding — surchargeables par variable d'environnement */
export const SOCIAL_NETWORK_LINKS: SocialNetworkLink[] = branding.socialLinks.map((link) => ({
  id: link.id,
  name: link.name,
  handle: link.handle,
  url: resolveUrl(link.id, link.url),
  accent: link.accent ?? "#888888",
  followers: null,
  latestPost: null,
  latestVideo: null,
}));

export function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")} k`;
  return n.toLocaleString("fr-FR");
}
