import type { ThemeDefinition } from "./types";

/** Thème par défaut — cosmétique / beauté (palette LN COS actuelle). */
export const beautyTheme: ThemeDefinition = {
  id: "beauty",
  label: "Beauty",
  description: "Cosmétique, onglerie, parfumerie, soins",
  colors: {
    primary: "#D4AF37",
    primarySoft: "#E7C96B",
    primaryDeep: "#B8902B",
    secondary: "#F7C6D7",
    secondaryDeep: "#EFA9C0",
    secondaryLight: "#FFE6EE",
    accent: "#FBEFE4",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    themeColor: "#0A0A0A",
  },
  typography: {
    sans: "var(--font-montserrat)",
    heading: "var(--font-montserrat)",
    mono: "var(--font-geist-mono)",
  },
  homeSections: [
    { id: "hero", enabled: true },
    { id: "categories", enabled: true },
    { id: "bestsellers", enabled: true },
    { id: "reviews", enabled: true },
    { id: "blog", enabled: true },
  ],
  pwaCategory: "beauty",
};
