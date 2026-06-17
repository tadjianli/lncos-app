import type { ThemeDefinition } from "./types";

export const electronicsTheme: ThemeDefinition = {
  id: "electronics",
  label: "Electronics",
  description: "High-tech, électronique, accessoires tech",
  colors: {
    primary: "#00D4FF",
    primarySoft: "#5CE1FF",
    primaryDeep: "#0099CC",
    secondary: "#7B61FF",
    secondaryDeep: "#5A45D6",
    secondaryLight: "#E8E4FF",
    accent: "#0D1117",
    background: "#050608",
    surface: "#12151A",
    themeColor: "#050608",
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
  pwaCategory: "shopping",
};
