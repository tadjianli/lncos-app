/**
 * Registre modules — point d'entrée unique pour la structure modulaire.
 * Chaque module ré-exporte le code existant sans duplication.
 */
export { isModuleEnabled, getEnabledModules, modules } from "@config/modules";
export type { ModuleId, ModuleDefinition } from "@config/modules";

export { isModuleRouteEnabled } from "./route-guard";
