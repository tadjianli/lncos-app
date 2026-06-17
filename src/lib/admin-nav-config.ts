/**
 * Navigation admin groupée — filtrée par modules activés (config/modules.ts).
 */

import { isModuleEnabled, type ModuleId } from "@config/modules";

export interface AdminNavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  live?: boolean;
  badgeKey?: "orders";
  /** Module requis — masqué si désactivé */
  module?: ModuleId;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  emoji: string;
  items: AdminNavItem[];
}

const ALL_ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "analyse",
    label: "Analyse",
    emoji: "📊",
    items: [
      { id: "dashboard", href: "/admin/dashboard", icon: "home", label: "Tableau de bord" },
      { id: "analytics", href: "/admin/analytics", icon: "sliders", label: "Statistiques" },
    ],
  },
  {
    id: "boutique",
    label: "Boutique",
    emoji: "🛍",
    items: [
      { id: "products", href: "/admin/products", icon: "tag", label: "Produits", module: "products" },
      { id: "categories", href: "/admin/categories", icon: "grid", label: "Catégories", module: "products" },
      {
        id: "product-page-builder",
        href: "/admin/product-page-builder",
        icon: "grid",
        label: "Fiche produit",
        live: true,
        module: "products",
      },
      { id: "promotions", href: "/admin/promotions", icon: "sparkle", label: "Promotions", module: "payments" },
      {
        id: "flash-sales",
        href: "/admin/content-pages?tab=flash",
        icon: "flame",
        label: "Ventes Flash",
        live: true,
        module: "marketing",
      },
    ],
  },
  {
    id: "commandes",
    label: "Commandes",
    emoji: "📦",
    items: [
      {
        id: "orders",
        href: "/admin/orders",
        icon: "bag",
        label: "Commandes",
        badgeKey: "orders",
        module: "orders",
      },
      { id: "shipping", href: "/admin/shipping", icon: "truck", label: "Livraison", module: "delivery" },
      {
        id: "returns",
        href: "/admin/settings?section=legal",
        icon: "arrowR",
        label: "Retours & remboursements",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    emoji: "👥",
    items: [
      { id: "customers", href: "/admin/customers", icon: "user", label: "Clients", module: "customers" },
      { id: "reviews", href: "/admin/reviews", icon: "star", label: "Avis", module: "reviews" },
    ],
  },
  {
    id: "contenu",
    label: "Contenu",
    emoji: "📖",
    items: [
      {
        id: "content-pages",
        href: "/admin/content-pages",
        icon: "edit",
        label: "Pages contenu",
        live: true,
        module: "marketing",
      },
      {
        id: "blog",
        href: "/admin/content-pages?tab=blog",
        icon: "edit",
        label: "Blog",
        live: true,
        module: "blog",
      },
      {
        id: "social-content",
        href: "/admin/content-pages?tab=social",
        icon: "share",
        label: "Réseaux sociaux",
        live: true,
        module: "marketing",
      },
      {
        id: "hero-carousel",
        href: "/admin/hero-carousel",
        icon: "sparkle",
        label: "Hero Carousel",
        live: true,
        module: "marketing",
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "📢",
    items: [
      {
        id: "social-proof",
        href: "/admin/social-proof",
        icon: "bolt",
        label: "Social Proof",
        live: true,
        module: "notifications",
      },
      { id: "popups", href: "/admin/popups", icon: "gift", label: "Popups Marketing", live: true, module: "notifications" },
      { id: "seo", href: "/admin/seo", icon: "search", label: "SEO", live: true, module: "seo" },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    emoji: "⚙️",
    items: [
      { id: "appbuilder", href: "/admin/app-builder", icon: "grid", label: "Personnaliser l'application", live: true },
      { id: "settings", href: "/admin/settings", icon: "sliders", label: "Paramètres" },
    ],
  },
  {
    id: "services",
    label: "Services",
    emoji: "📅",
    items: [
      { id: "rdv", href: "/admin/rdv", icon: "calendar", label: "Rendez-vous", live: true, module: "appointments" },
      {
        id: "service-categories",
        href: "/admin/service-categories",
        icon: "grid",
        label: "Catégories prestations",
        live: true,
        module: "appointments",
      },
    ],
  },
];

function isNavItemVisible(item: AdminNavItem): boolean {
  if (!item.module) return true;
  return isModuleEnabled(item.module);
}

/** Navigation admin filtrée selon les modules activés */
export function getAdminNavGroups(): AdminNavGroup[] {
  return ALL_ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(isNavItemVisible),
  })).filter((group) => group.items.length > 0);
}

/** @deprecated Utiliser getAdminNavGroups() — conservé pour compatibilité tests */
export const ADMIN_NAV_GROUPS = getAdminNavGroups();

export function findNavGroupForPath(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search);
  for (const group of getAdminNavGroups()) {
    for (const item of group.items) {
      if (isNavItemActive(item, pathname, params)) return group.id;
    }
  }
  return null;
}

export function isNavItemActive(
  item: AdminNavItem,
  pathname: string,
  search: URLSearchParams
): boolean {
  if (item.href.includes("?")) {
    const [path, qs] = item.href.split("?");
    if (pathname !== path) return false;
    const expected = new URLSearchParams(qs);
    for (const [key, value] of expected.entries()) {
      if (search.get(key) !== value) return false;
    }
    return true;
  }

  if (item.id === "content-pages") {
    if (pathname !== "/admin/content-pages") return false;
    const tab = search.get("tab");
    return !tab || tab === "overview";
  }

  if (item.id === "settings") {
    if (pathname !== "/admin/settings") return false;
    return !search.get("section");
  }

  return (
    pathname === item.href ||
    (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`))
  );
}
