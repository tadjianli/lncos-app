/**
 * LN COS — Navigation admin groupée (sidebar repliable)
 */

export interface AdminNavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  live?: boolean;
  badgeKey?: "orders";
}

export interface AdminNavGroup {
  id: string;
  label: string;
  emoji: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
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
      { id: "products", href: "/admin/products", icon: "tag", label: "Produits" },
      { id: "categories", href: "/admin/categories", icon: "grid", label: "Catégories" },
      {
        id: "product-page-builder",
        href: "/admin/product-page-builder",
        icon: "grid",
        label: "Fiche produit",
        live: true,
      },
      { id: "promotions", href: "/admin/promotions", icon: "sparkle", label: "Promotions" },
      {
        id: "flash-sales",
        href: "/admin/content-pages?tab=flash",
        icon: "flame",
        label: "Ventes Flash",
        live: true,
      },
    ],
  },
  {
    id: "commandes",
    label: "Commandes",
    emoji: "📦",
    items: [
      { id: "orders", href: "/admin/orders", icon: "bag", label: "Commandes", badgeKey: "orders" },
      { id: "shipping", href: "/admin/shipping", icon: "truck", label: "Livraison" },
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
      { id: "customers", href: "/admin/customers", icon: "user", label: "Clients" },
      { id: "reviews", href: "/admin/reviews", icon: "star", label: "Avis" },
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
      },
      {
        id: "blog",
        href: "/admin/content-pages?tab=blog",
        icon: "edit",
        label: "Blog LN COS",
        live: true,
      },
      {
        id: "social-content",
        href: "/admin/content-pages?tab=social",
        icon: "share",
        label: "Réseaux sociaux",
        live: true,
      },
      {
        id: "hero-carousel",
        href: "/admin/hero-carousel",
        icon: "sparkle",
        label: "Hero Carousel",
        live: true,
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    emoji: "📢",
    items: [
      { id: "social-proof", href: "/admin/social-proof", icon: "bolt", label: "Social Proof", live: true },
      { id: "popups", href: "/admin/popups", icon: "gift", label: "Popups Marketing", live: true },
      { id: "seo", href: "/admin/seo", icon: "search", label: "SEO", live: true },
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
      { id: "rdv", href: "/admin/rdv", icon: "calendar", label: "Rendez-vous", live: true },
      {
        id: "service-categories",
        href: "/admin/service-categories",
        icon: "grid",
        label: "Catégories prestations",
        live: true,
      },
    ],
  },
];

export function findNavGroupForPath(pathname: string, search: string): string | null {
  const params = new URLSearchParams(search);
  for (const group of ADMIN_NAV_GROUPS) {
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
