import { modules, type ModuleId } from "@config/modules";

/** Vérifie si une route admin/storefront appartient à un module activé */
export function isModuleRouteEnabled(pathname: string): boolean {
  for (const mod of Object.values(modules)) {
    if (!mod.enabled) {
      const routes = [...(mod.adminRoutes ?? []), ...(mod.storefrontRoutes ?? [])];
      if (routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
        return false;
      }
    }
  }
  return true;
}

/** Retourne l'ID module associé à une route admin (si trouvé) */
export function findModuleForAdminRoute(pathname: string): ModuleId | null {
  for (const mod of Object.values(modules)) {
    if (mod.adminRoutes?.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
      return mod.id;
    }
  }
  return null;
}
