"use client";

import type { SocialNetworkId } from "@/lib/social-links";

const BRAND_PATHS: Record<SocialNetworkId, string> = {
  instagram:
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm4.9-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
  tiktok:
    "M15 5.2c.9.7 2 1.1 3.2 1.2V9.4c-1.1 0-2.1-.3-3-.8v6.9a4.5 4.5 0 1 1-4.5-4.5c.2 0 .5 0 .7.1v2.6a1.9 1.9 0 1 0 1.3 1.8V5.2H15z",
  facebook: "M14 8h3l-.4 3H14v9h-4v-9H8V8h2V6.2C10 4.4 11.2 3 13.5 3H16v3h-1.4c-.9 0-1 .5-1 1.2V8z",
  youtube:
    "M21.6 8.2a2.5 2.5 0 0 0-1.8-1.8C17.8 6 12 6 12 6s-5.8 0-7.8.4A2.5 2.5 0 0 0 2.4 8.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.8 1.8C6.2 18 12 18 12 18s5.8 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.8zM10 15.5v-7l6 3.5-6 3.5z",
  pinterest:
    "M12 3c-4.4 0-8 3.4-8 7.6 0 3.2 2 5.9 4.8 6.9-.1-.6-.1-1.5.1-2.2.1-.5.7-3.3.7-3.3s-.2-.5-.2-1.2c0-1.1.6-2 1.4-2 .7 0 1 .5 1 1.2 0 .7-.5 1.8-.7 2.8-.2 1 .5 1.8 1.4 1.8 1.7 0 2.9-2.4 2.9-5.2 0-2.2-1.5-3.9-4.2-3.9-3.1 0-4.9 2.3-4.9 4.7 0 .9.3 1.5.8 1.9.1.1.1.1.1 0 .1-.3.2-.7.3-1 0-.1 0-.2-.1-.3-.3-.4-.5-1-.5-1.7 0-2.2 1.6-4.3 4.7-4.3 2.5 0 4.1 1.7 4.1 3.9 0 2.6-1.4 4.6-3.5 4.6-.7 0-1.3-.4-1.5-.8 0 0-.4 1.5-.5 1.8-.2.6-.6 1.3-.9 1.7.7.2 1.4.3 2.2.3 4.4 0 8-3.4 8-7.6S16.4 3 12 3z",
};

interface SocialBrandIconProps {
  network: SocialNetworkId;
  size?: number;
  color?: string;
}

export function SocialBrandIcon({ network, size = 24, color = "currentColor" }: SocialBrandIconProps) {
  const d = BRAND_PATHS[network];
  if (!d) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
