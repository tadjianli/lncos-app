import type { ThemeDefinition } from "./types";

export const restaurantTheme: ThemeDefinition = {
  id: "restaurant",
  label: "Restaurant",
  description: "Restauration, pizzeria, livraison repas, click & collect",
  colors: {
    primary: "#E85D04",
    primarySoft: "#F48C06",
    primaryDeep: "#DC2F02",
    secondary: "#FFE8D6",
    secondaryDeep: "#FFD6A5",
    secondaryLight: "#FFF5EB",
    accent: "#370617",
    background: "#0F0E0E",
    surface: "#1A1918",
    themeColor: "#0F0E0E",
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
    { id: "trust", enabled: true },
  ],
  pwaCategory: "food",
};
