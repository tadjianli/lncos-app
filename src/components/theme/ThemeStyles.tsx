import { getActiveTheme, themeToCssVariables } from "@config/themes";

/**
 * Injecte les variables CSS du thème actif dans :root (server component).
 */
export function ThemeStyles() {
  const vars = themeToCssVariables(getActiveTheme());
  const css = `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;

  return <style id="brand-theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
