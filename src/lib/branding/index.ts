/**
 * API branding runtime — toujours importer depuis ici dans l'app.
 */
import { branding } from "@config/branding";
import { getActiveTheme } from "@config/themes";

export { branding, getActiveTheme };
export type { Branding, BrandingVertical } from "@config/branding";
export { isModuleEnabled, getEnabledModules, modules } from "@config/modules";
export type { ModuleId } from "@config/modules";
export { getAttributePresetForVertical } from "@config/product-attributes";

/** Nom court de l'application */
export function getAppName(): string {
  return branding.appName;
}

/** Titre de page avec template SEO */
export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle?.trim()) return branding.seo.homeTitle;
  return branding.seo.titleTemplate.replace("%s", pageTitle.trim());
}

/** Expéditeur emails transactionnels */
export function getTransactionalEmailFrom(): string {
  const fromEnv = process.env.RESEND_FROM?.trim();
  if (fromEnv) return fromEnv;
  return `${branding.appName} <${branding.ordersEmail}>`;
}

export function getLogoPath(): string {
  return branding.logo.path;
}

export function getLogoAlt(): string {
  return branding.appName;
}

export function getThemeColor(): string {
  return getActiveTheme().colors.themeColor;
}

/** Remplace les occurrences du nom app dans un texte template */
export function interpolateBrand(text: string): string {
  return text
    .replace(/\{\{appName\}\}/g, branding.appName)
    .replace(/\{\{companyName\}\}/g, branding.companyName);
}

/** Texte branding avec variables optionnelles */
export function brandCopy(
  key: keyof typeof branding.copy,
  vars?: { productName?: string; categoryName?: string }
): string {
  let text: string = branding.copy[key];
  text = text.replace(/\{\{appName\}\}/g, branding.appName);
  text = text.replace(/\{\{companyName\}\}/g, branding.companyName);
  if (vars?.productName) text = text.replace(/\{\{productName\}\}/g, vars.productName);
  if (vars?.categoryName) text = text.replace(/\{\{categoryName\}\}/g, vars.categoryName);
  return text;
}

/** Texte SEO page depuis branding.seo.pages */
export function pageSeo(key: keyof typeof branding.seo.pages): {
  title: string;
  description: string;
} {
  const page = branding.seo.pages[key];
  return {
    title: formatPageTitle(interpolateBrand(page.title)),
    description: interpolateBrand(page.description),
  };
}
