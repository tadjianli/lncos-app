"use client";
/**
 * LN COS — Admin sidebar (groupes repliables)
 */

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useAdminOrderBadge } from "@/lib/admin-supabase";
import {
  getAdminNavGroups,
  findNavGroupForPath,
  isNavItemActive,
  type AdminNavGroup,
} from "@/lib/admin-nav-config";

interface AdminSidebarProps {
  onNav?: () => void;
  onClose?: () => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

function NavGroupSection({
  group,
  open,
  onToggle,
  pathname,
  search,
  orderBadge,
  onNav,
}: {
  group: AdminNavGroup;
  open: boolean;
  onToggle: () => void;
  pathname: string;
  search: URLSearchParams;
  orderBadge: number;
  onNav?: () => void;
}) {
  const panelId = `adm-nav-group-${group.id}`;

  return (
    <div className={`adm-nav-group${open ? " adm-nav-group--open" : ""}`}>
      <button
        type="button"
        className="adm-nav-group__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="adm-nav-group__sign" aria-hidden>
          {open ? "−" : "+"}
        </span>
        <span className="adm-nav-group__emoji" aria-hidden>
          {group.emoji}
        </span>
        <span className="adm-nav-group__label">{group.label}</span>
      </button>
      <div id={panelId} className="adm-nav-group__panel">
        {group.items.map((item) => {
          const active = isNavItemActive(item, pathname, search);
          const badge =
            item.badgeKey === "orders" && orderBadge > 0 ? orderBadge : undefined;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`adm-navitem adm-navitem--nested${active ? " on" : ""}`}
              onClick={onNav}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
              {item.live && <span className="adm-nav-live" title="Temps réel" />}
              {badge !== undefined && <span className="adm-navbadge">{badge}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar({ onNav, onClose, onLogout, loggingOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const search = useMemo(() => new URLSearchParams(searchKey), [searchKey]);
  const orderBadge = useAdminOrderBadge();

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const activeGroup = findNavGroupForPath(pathname, searchKey ? `?${searchKey}` : "");
    return activeGroup ? new Set([activeGroup]) : new Set();
  });

  useEffect(() => {
    const activeGroup = findNavGroupForPath(pathname, searchKey ? `?${searchKey}` : "");
    if (activeGroup) {
      setOpenGroups((prev) => {
        if (prev.has(activeGroup)) return prev;
        const next = new Set(prev);
        next.add(activeGroup);
        return next;
      });
    }
  }, [pathname, searchKey]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

      <nav className="adm-nav adm-nav--grouped">
        {getAdminNavGroups().map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            open={openGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            pathname={pathname}
            search={search}
            orderBadge={orderBadge}
            onNav={onNav}
          />
        ))}
      </nav>

      <div className="adm-side-foot">
        {onLogout && (
          <button
            type="button"
            className="adm-navitem adm-navitem-logout"
            onClick={onLogout}
            disabled={loggingOut}
            style={{
              border: "none",
              background: "transparent",
              cursor: loggingOut ? "default" : "pointer",
            }}
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
