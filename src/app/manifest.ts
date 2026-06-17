import type { MetadataRoute } from "next";
import { branding } from "@config/branding";
import { getActiveTheme } from "@config/themes";

/** Manifest PWA dynamique — synchronisé avec config/branding.ts */
export default function manifest(): MetadataRoute.Manifest {
  const theme = getActiveTheme();
  const pwaCategory = theme.pwaCategory ?? branding.pwa.categories[0] ?? "shopping";

  return {
    name: `${branding.appName} — ${branding.tagline}`,
    short_name: branding.appShortName,
    description: branding.appDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: theme.colors.background,
    theme_color: theme.colors.themeColor,
    lang: branding.language,
    categories: [pwaCategory, ...branding.pwa.categories.filter((c) => c !== pwaCategory)],
    icons: [
      {
        src: branding.icons.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: branding.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: branding.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: branding.icons.appleTouchIcon,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: branding.pwa.shortcuts.map((s) => ({
      name: s.name,
      url: s.url,
      description: s.description,
    })),
  };
}
