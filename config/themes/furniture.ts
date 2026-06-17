import type { ThemeDefinition } from "./types";

export const furnitureTheme: ThemeDefinition = {
  id: "furniture",
  label: "Furniture",
  description: "Meubles, décoration, aménagement intérieur",
  colors: {
    primary: "#8B7355",
    primarySoft: "#A89078",
    primaryDeep: "#6B5740",
    secondary: "#D4C4B0",
    secondaryDeep: "#B8A690",
    secondaryLight: "#EDE6DC",
    accent: "#3D3D3D",
    background: "#111110",
    surface: "#1E1D1B",
    themeColor: "#111110",
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
    { id: "reviews", enabled: true },
  ],
  pwaCategory: "shopping",
};
