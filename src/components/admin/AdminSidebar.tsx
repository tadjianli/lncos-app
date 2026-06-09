"use client";
/**
 * LN COS — Admin sidebar
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useAdminOrderBadge } from "@/lib/admin-supabase";

interface NavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  live?: boolean;
  badgeKey?: "orders";
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",   href: "/admin/dashboard",    icon: "home",     label: "Tableau de bord" },
  { id: "rdv",         href: "/admin/rdv",           icon: "calendar", label: "Rendez-vous",         live: true },
  { id: "popups",      href: "/admin/popups",        icon: "gift",     label: "Popups Marketing",    live: true },
  { id: "appbuilder",  href: "/admin/app-builder",   icon: "grid",     label: "Personnaliser l'app", live: true },
  { id: "orders",      href: "/admin/orders",        icon: "bag",      label: "Commandes",           badgeKey: "orders" },
  { id: "products",    href: "/admin/products",      icon: "tag",      label: "Produits" },
  { id: "shipping",    href: "/admin/shipping",       icon: "truck",    label: "Livraison" },
  { id: "categories",  href: "/admin/categories",    icon: "grid",     label: "Catégories" },
  { id: "customers",   href: "/admin/customers",     icon: "user",     label: "Clients" },
  { id: "promotions",  href: "/admin/promotions",    icon: "sparkle",  label: "Promotions" },
  { id: "reviews",     href: "/admin/reviews",       icon: "star",     label: "Avis" },
  { id: "social-proof", href: "/admin/social-proof", icon: "bolt",    label: "Social Proof", live: true },
  { id: "analytics",   href: "/admin/analytics",     icon: "sliders",  label: "Statistiques" },
  { id: "settings",    href: "/admin/settings",      icon: "sliders",  label: "Paramètres" },
];

interface AdminSidebarProps {
  onNav?: () => void;
  onClose?: () => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

export function AdminSidebar({ onNav, onClose, onLogout, loggingOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const orderBadge = useAdminOrderBadge();

  return (
    <aside className="adm-sidebar">
      {onClose && (
        <button
          type="button"
          className="adm-sidebar-close"
          onClick={onClose}
          aria-label="Fermer le menu"
        >
          <Icon name="x" size={18} color="#fff" />
        </button>
      )}

      <div className="adm-logo">
        <Logo size={26} />
      </div>

      <nav className="adm-nav">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          const badge =
            item.badgeKey === "orders" && orderBadge > 0 ? orderBadge : undefined;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`adm-navitem${active ? " on" : ""}`}
              onClick={onNav}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.live && <span className="adm-nav-live" title="Temps réel" />}
              {badge !== undefined && (
                <span className="adm-navbadge">{badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="adm-side-foot">
        {onLogout && (
          <button
            className="adm-navitem adm-navitem-logout"
            onClick={onLogout}
            disabled={loggingOut}
            style={{ border: "none", background: "transparent", cursor: loggingOut ? "default" : "pointer" }}
          >
            <Icon name="x" size={17} />
            <span>{loggingOut ? "Déconnexion…" : "Déconnexion"}</span>
          </button>
        )}
        <Link href="/" className="adm-navitem" onClick={onNav}>
          <Icon name="arrowR" size={18} />
          <span>Voir la boutique</span>
        </Link>
      </div>
    </aside>
  );
}
