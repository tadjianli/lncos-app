/**
 * LN COS — Réseaux sociaux (config statique → futur admin / API)
 */

export type SocialNetworkId =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "pinterest";

export interface SocialNetworkLink {
  id: SocialNetworkId;
  name: string;
  handle: string;
  url: string;
  /** Couleur d'accent pour la carte */
  accent: string;
  /** Nombre d'abonnés — affiché quand défini (futur sync API) */
  followers?: number | null;
  /** Dernière publication — texte libre ou ISO date */
  latestPost?: string | null;
  /** Dernière vidéo — titre ou label */
  latestVideo?: string | null;
}

function envUrl(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v || fallback;
}

/** Liens officiels LN COS — surchargeables via variables d'environnement */
export const SOCIAL_NETWORK_LINKS: SocialNetworkLink[] = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@lncos",
    url: envUrl("NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL", "https://www.instagram.com/lncos/"),
    accent: "#E1306C",
    followers: null,
    latestPost: null,
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@lncos",
    url: envUrl("NEXT_PUBLIC_SOCIAL_TIKTOK_URL", "https://www.tiktok.com/@lncos"),
    accent: "#69C9D0",
    followers: null,
    latestVideo: null,
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "LN COS",
    url: envUrl("NEXT_PUBLIC_SOCIAL_FACEBOOK_URL", "https://www.facebook.com/lncos"),
    accent: "#1877F2",
    followers: null,
    latestPost: null,
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@lncos",
    url: envUrl("NEXT_PUBLIC_SOCIAL_YOUTUBE_URL", "https://www.youtube.com/@lncos"),
    accent: "#FF0000",
    followers: null,
    latestVideo: null,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    handle: "lncos",
    url: envUrl("NEXT_PUBLIC_SOCIAL_PINTEREST_URL", "https://www.pinterest.fr/lncos/"),
    accent: "#E60023",
    followers: null,
    latestPost: null,
  },
];

export function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".0", "")} k`;
  return n.toLocaleString("fr-FR");
}
