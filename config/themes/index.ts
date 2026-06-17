import { branding } from "../branding";
import { beautyTheme } from "./beauty";
import { electronicsTheme } from "./electronics";
import { fashionTheme } from "./fashion";
import { furnitureTheme } from "./furniture";
import { restaurantTheme } from "./restaurant";
import type { ThemeDefinition, ThemeId } from "./types";

export const themes: Record<ThemeId, ThemeDefinition> = {
  beauty: beautyTheme,
  fashion: fashionTheme,
  furniture: furnitureTheme,
  restaurant: restaurantTheme,
  electronics: electronicsTheme,
};

/** Thème actif — surcharge possible via NEXT_PUBLIC_ACTIVE_THEME */
export function getActiveThemeId(): ThemeId {
  const fromEnv = process.env.NEXT_PUBLIC_ACTIVE_THEME?.trim() as ThemeId | undefined;
  if (fromEnv && fromEnv in themes) return fromEnv;
  return branding.activeThemeId;
}

export function getActiveTheme(): ThemeDefinition {
  return themes[getActiveThemeId()];
}

/** CSS custom properties injectées dans :root */
export function themeToCssVariables(theme: ThemeDefinition): Record<string, string> {
  const { colors } = theme;
  return {
    "--gold": colors.primary,
    "--gold-soft": colors.primarySoft,
    "--gold-deep": colors.primaryDeep,
    "--pink": colors.secondary,
    "--pink-deep": colors.secondaryDeep,
    "--pink-light": colors.secondaryLight,
    "--nude": colors.accent,
    "--noir": colors.background,
    "--charcoal": colors.surface,
    "--brand-primary": colors.primary,
    "--brand-secondary": colors.secondary,
    "--brand-background": colors.background,
    "--brand-theme-color": colors.themeColor,
    "--gold-grad": `linear-gradient(135deg, ${colors.primarySoft} 0%, ${colors.primary} 42%, ${colors.primaryDeep} 100%)`,
    "--pink-grad": `linear-gradient(135deg, ${colors.secondaryLight} 0%, ${colors.secondary} 100%)`,
  };
}

export type { ThemeDefinition, ThemeId };
