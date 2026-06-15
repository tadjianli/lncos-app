"use client";
/**
 * LN COS — Side menu drawer (from handoff app.jsx SideMenu)
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import {
  hasOverlayHistoryState,
  navigateAfterOverlayDismiss,
} from "@/lib/overlay-history";

type MenuLink = {
  i: string;
  t: string;
  href?: string;
  overlay?: "orders";
};

const MAIN_LINKS: MenuLink[] = [
  { i: "home",     t: "Accueil",             href: "/" },
  { i: "calendar", t: "Prendre rendez-vous", href: "/rdv" },
  { i: "grid",     t: "Catégories",          href: "/discover" },
  { i: "flame",    t: "Ventes Flash",         href: "/flash-sales" },
  { i: "play",     t: "Vidéos Beauté",        href: "/videos" },
  { i: "edit",     t: "Blog LN COS",          href: "/blog" },
  { i: "share",    t: "Réseaux sociaux",      href: "/social" },
  { i: "bag",      t: "Mes commandes",        overlay: "orders" },
  { i: "heart",    t: "Mes favoris",          href: "/favorites" },
  { i: "user",     t: "Mon profil",           href: "/profile" },
];

const INFO_LINKS: MenuLink[] = [
  { i: "info",   t: "FAQ",                          href: "/faq" },
  { i: "mail",   t: "Contact",                      href: "/contact" },
  { i: "truck",  t: "Livraison",                    href: "/livraison" },
  { i: "bag",    t: "Retours & Remboursements",     href: "/retours" },
  { i: "tag",    t: "Conditions Générales de Vente", href: "/cgv" },
  { i: "lock",   t: "Politique de Confidentialité", href: "/confidentialite" },
  { i: "shop",   t: "Mentions Légales",             href: "/mentions-legales" },
];

interface SideMenuProps {
  onClose: () => void;
}

export function SideMenu({ onClose }: SideMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const openOrders   = useStore((s) => s.openOrders);
  const closeOverlay = useStore((s) => s.closeOverlay);

  const isInfoRoute = INFO_LINKS.some((l) => l.href === pathname);
  const [infoOpen, setInfoOpen] = useState(isInfoRoute);

  useEffect(() => {
    if (isInfoRoute) setInfoOpen(true);
  }, [isInfoRoute]);

  /** Ferme le menu dans le store uniquement (sans retirer l'entrée historique). */
  function closeMenuOnly() {
    closeOverlay();
  }

  /** Navigation depuis le menu : retire l'entrée overlay avant de changer de route. */
  function navigateFromMenu(href: string) {
    if (pathname === href) {
      onClose();
      return;
    }
    navigateAfterOverlayDismiss(closeMenuOnly, () => router.push(href));
  }

  function handleMenuLinkClick(e: React.MouseEvent, href: string) {
    e.preventDefault();
    navigateFromMenu(href);
  }

  function handleOrders() {
    closeMenuOnly();
    if (typeof window !== "undefined" && hasOverlayHistoryState()) {
      window.history.back();
    }
    setTimeout(openOrders, 50);
  }

  function renderLink(l: MenuLink, index: number, baseDelay: number) {
    const anim = `fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) ${baseDelay + index * 0.035}s both`;
    const rowStyle = {
      width: "100%" as const,
      display: "flex" as const,
      alignItems: "center" as const,
      gap: 15,
      padding: "14px 14px",
      borderRadius: "var(--r-sm)",
      animation: anim,
    };

    if (l.href) {
      return (
        <Link
          key={l.t}
          href={l.href}
          onClick={(e) => handleMenuLinkClick(e, l.href!)}
          className="side-menu-link"
          style={{ ...rowStyle, textDecoration: "none", color: "var(--ink-soft)" }}
        >
          <Icon name={l.i} size={21} color="var(--gold)" />
          <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{l.t}</span>
        </Link>
      );
    }

    return (
      <button
        key={l.t}
        type="button"
        onClick={handleOrders}
        className="side-menu-link"
        style={{ ...rowStyle, textAlign: "left", color: "var(--ink-soft)", background: "none", border: "none", cursor: "pointer" }}
      >
        <Icon name={l.i} size={21} color="var(--gold)" />
        <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{l.t}</span>
      </button>
    );
  }

  function renderInfoLink(l: MenuLink) {
    const active = l.href === pathname;
    return (
      <Link
        key={l.t}
        href={l.href!}
        onClick={(e) => handleMenuLinkClick(e, l.href!)}
        className={`side-menu-link side-menu-info-link${active ? " side-menu-info-link--active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <Icon name={l.i} size={18} color="var(--gold)" />
        <span>{l.t}</span>
      </Link>
    );
  }

  return (
    <div className="side-menu-root">
      {/* Scrim — clic = fermer */}
      <div
        className="side-menu-scrim"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer — au-dessus du scrim, reçoit les touches */}
      <div className="side-menu-drawer">
        {/* Header */}
        <div
          style={{
            padding: "0 24px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <Logo size={28} />
          <button type="button" onClick={onClose} className="touch-target" style={{ color: "var(--ink-soft)" }} aria-label="Fermer le menu">
            <Icon name="x" size={22} />
          </button>
        </div>

        {/* Links */}
        <div className="noscroll" style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
          {MAIN_LINKS.map((l, i) => renderLink(l, i, 0.08))}

          <div
            className="side-menu-info"
            style={{ animation: "fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) 0.32s both" }}
          >
            <button
              type="button"
              className="side-menu-info-toggle"
              onClick={() => setInfoOpen((o) => !o)}
              aria-expanded={infoOpen}
              aria-controls="side-menu-info-panel"
            >
              <span className="side-menu-info-toggle__label">
                <Icon name="info" size={21} color="var(--gold)" />
                Informations
              </span>
              <Icon
                name="chevD"
                size={18}
                color="var(--ink-soft)"
                style={{
                  transition: "transform 0.22s ease",
                  transform: infoOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <div
              id="side-menu-info-panel"
              className={`side-menu-info-panel${infoOpen ? " side-menu-info-panel--open" : ""}`}
              aria-hidden={!infoOpen}
            >
              <div className="side-menu-info-panel__inner">
                {INFO_LINKS.map((l) => renderInfoLink(l))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px 0", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <Link
            href="/admin"
            onClick={(e) => handleMenuLinkClick(e, "/admin")}
            className="side-menu-link side-menu-link--footer"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12.5,
              color: "var(--gold)",
              textDecoration: "none",
              fontWeight: 600,
              padding: "12px 0",
            }}
          >
            <Icon name="sliders" size={17} color="var(--gold)" /> Espace commerçant →
          </Link>
        </div>
      </div>
    </div>
  );
}
