/** Identifiants de thèmes prédéfinis — clonables par secteur. */
export type ThemeId = "beauty" | "fashion" | "furniture" | "restaurant" | "electronics";

export interface ThemeColors {
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  secondary: string;
  secondaryDeep: string;
  secondaryLight: string;
  accent: string;
  background: string;
  surface: string;
  themeColor: string;
}

export interface ThemeTypography {
  /** Variable CSS font-family (ex. var(--font-montserrat)) */
  sans: string;
  heading: string;
  mono: string;
}

export interface ThemeHomeSectionPreset {
  id: string;
  enabled: boolean;
}

/** Thème visuel — couleurs, typo, sections d'accueil (sans logique métier). */
export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  /** Sections homepage suggérées pour ce secteur */
  homeSections: ThemeHomeSectionPreset[];
  /** Catégorie PWA manifest */
  pwaCategory?: string;
}
