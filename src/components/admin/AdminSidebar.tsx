"use client";
/**
 * LN COS — Admin sidebar (exact from handoff admin/components.jsx Sidebar)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";

interface NavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  live?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",   href: "/admin/dashboard",    icon: "home",     label: "Tableau de bord" },
  { id: "rdv",         href: "/admin/rdv",           icon: "calendar", label: "Rendez-vous",         live: true },
  { id: "popups",      href: "/admin/popups",        icon: "gift",     label: "Popups Marketing",    live: true },
  { id: "appbuilder",  href: "/admin/app-builder",   icon: "grid",     label: "Personnaliser l'app", live: true },
  { id: "orders",      href: "/admin/orders",        icon: "bag",      label: "Commandes",           badge: 12 },
  { id: "products",    href: "/admin/products",      icon: "tag",      label: "Produits" },
  { id: "categories",  href: "/admin/categories",    icon: "grid",     label: "Catégories" },
  { id: "customers",   href: "/admin/customers",     icon: "user",     label: "Clients" },
  { id: "promotions",  href: "/admin/promotions",    icon: "sparkle",  label: "Promotions" },
  { id: "reviews",     href: "/admin/reviews",       icon: "star",     label: "Avis" },
  { id: "analytics",   href: "/admin/analytics",     icon: "sliders",  label: "Statistiques" },
  { id: "settings",    href: "/admin/settings",      icon: "sliders",  label: "Paramètres" },
];

interface AdminSidebarProps {
  onNav?: () => void;
}

export function AdminSidebar({ onNav }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="adm-sidebar">
      {/* Logo */}
      <div className="adm-logo">
        <Logo size={26} />
      </div>

      {/* Nav */}
      <nav className="adm-nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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
              {item.badge && (
                <span className="adm-navbadge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="adm-side-foot">
        <Link href="/" className="adm-navitem">
          <Icon name="arrowR" size={18} />
          <span>Voir la boutique</span>
        </Link>
      </div>
    </aside>
  );
}
