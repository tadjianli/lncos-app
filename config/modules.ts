/**
 * Registre des modules métier — activer / désactiver sans toucher à la logique.
 * Chaque module mappe vers src/modules/<id>/.
 */

export type ModuleId =
  | "products"
  | "orders"
  | "customers"
  | "seo"
  | "blog"
  | "delivery"
  | "payments"
  | "reviews"
  | "notifications"
  | "appointments"
  | "loyalty"
  | "marketing";

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  description: string;
  enabled: boolean;
  /** Routes admin associées (pour filtrer la sidebar) */
  adminRoutes?: string[];
  /** Routes storefront associées */
  storefrontRoutes?: string[];
}

export const modules: Record<ModuleId, ModuleDefinition> = {
  products: {
    id: "products",
    label: "Produits",
    description: "Catalogue, variantes, fiches produit, catégories",
    enabled: true,
    adminRoutes: ["/admin/products", "/admin/categories", "/admin/product-page-builder"],
    storefrontRoutes: ["/boutique", "/produit", "/categorie", "/discover"],
  },
  orders: {
    id: "orders",
    label: "Commandes",
    description: "Panier, checkout, suivi commandes",
    enabled: true,
    adminRoutes: ["/admin/orders"],
    storefrontRoutes: ["/bag", "/profile/orders"],
  },
  customers: {
    id: "customers",
    label: "Clients",
    description: "Comptes, profils, authentification",
    enabled: true,
    adminRoutes: ["/admin/customers"],
    storefrontRoutes: ["/profile", "/login"],
  },
  seo: {
    id: "seo",
    label: "SEO",
    description: "Sitemap, Schema.org, score SEO, génération IA",
    enabled: true,
    adminRoutes: ["/admin/seo"],
  },
  blog: {
    id: "blog",
    label: "Blog",
    description: "Articles, catégories blog, SEO contenu",
    enabled: true,
    adminRoutes: ["/admin/content-pages"],
    storefrontRoutes: ["/blog"],
  },
  delivery: {
    id: "delivery",
    label: "Livraison",
    description: "Modes de livraison, zones, retrait magasin",
    enabled: true,
    adminRoutes: ["/admin/shipping"],
    storefrontRoutes: ["/livraison"],
  },
  payments: {
    id: "payments",
    label: "Paiements",
    description: "Stripe, promotions, codes promo",
    enabled: true,
    adminRoutes: ["/admin/promotions"],
  },
  reviews: {
    id: "reviews",
    label: "Avis",
    description: "Avis produits, modération",
    enabled: true,
    adminRoutes: ["/admin/reviews"],
  },
  notifications: {
    id: "notifications",
    label: "Notifications",
    description: "Push PWA, emails transactionnels, popups",
    enabled: true,
    adminRoutes: ["/admin/popups", "/admin/social-proof"],
  },
  appointments: {
    id: "appointments",
    label: "Rendez-vous",
    description: "Prise de RDV, prestations (optionnel selon secteur)",
    enabled: true,
    adminRoutes: ["/admin/rdv", "/admin/service-categories"],
    storefrontRoutes: ["/rdv"],
  },
  loyalty: {
    id: "loyalty",
    label: "Fidélité",
    description: "Programme VIP / points (désactivé par défaut)",
    enabled: false,
    storefrontRoutes: ["/profile"],
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Hero carousel, pages contenu, réseaux sociaux",
    enabled: true,
    adminRoutes: ["/admin/hero-carousel", "/admin/content-pages"],
  },
};

export function isModuleEnabled(id: ModuleId): boolean {
  return modules[id]?.enabled ?? false;
}

export function getEnabledModules(): ModuleDefinition[] {
  return Object.values(modules).filter((m) => m.enabled);
}
