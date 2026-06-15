"use client";
/**
 * LN COS — Side menu drawer (from handoff app.jsx SideMenu)
 */

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";

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
  const openOrders   = useStore((s) => s.openOrders);
  const closeOverlay = useStore((s) => s.closeOverlay);

  function handleNav(item: MenuLink) {
    closeOverlay();
    if (item.overlay === "orders") {
      setTimeout(openOrders, 50);
    }
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
          onClick={onClose}
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
        onClick={() => handleNav(l)}
        style={{ ...rowStyle, textAlign: "left", color: "var(--ink-soft)", background: "none", border: "none" }}
      >
        <Icon name={l.i} size={21} color="var(--gold)" />
        <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{l.t}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 90,
      }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          animation: "scrimIn 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 290,
          background: "linear-gradient(160deg, #151515, #0c0c0c)",
          borderRight: "1px solid rgba(212,175,55,.22)",
          display: "flex",
          flexDirection: "column",
          padding: "calc(var(--safe-top) + 12px) 0 var(--safe-bottom) 0",
          animation: "drawerIn 0.36s cubic-bezier(0.22, 0.68, 0, 1) both",
          boxShadow: "8px 0 48px rgba(0,0,0,.7)",
        }}
      >
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
            style={{
              margin: "18px 14px 10px",
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,.06)",
              animation: "fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) 0.32s both",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              Informations
            </span>
          </div>

          {INFO_LINKS.map((l, i) => renderLink(l, i, 0.36))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px 0", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12.5,
              color: "var(--gold)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <Icon name="sliders" size={17} color="var(--gold)" /> Espace commerçant →
          </Link>
        </div>
      </div>
    </div>
  );
}
