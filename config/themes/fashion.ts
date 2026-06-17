import type { ThemeDefinition } from "./types";

export const fashionTheme: ThemeDefinition = {
  id: "fashion",
  label: "Fashion",
  description: "Mode, lingerie, vêtements, accessoires",
  colors: {
    primary: "#E8E0D5",
    primarySoft: "#F5F0EA",
    primaryDeep: "#C9B8A8",
    secondary: "#C45B7A",
    secondaryDeep: "#A84362",
    secondaryLight: "#F8E8ED",
    accent: "#2C2C2C",
    background: "#0C0C0C",
    surface: "#181818",
    themeColor: "#0C0C0C",
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
    { id: "editorial", enabled: true },
    { id: "reviews", enabled: true },
  ],
  pwaCategory: "shopping",
};
