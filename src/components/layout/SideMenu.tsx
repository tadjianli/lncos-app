"use client";
/**
 * LN COS — Side menu drawer (from handoff app.jsx SideMenu)
 */

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";

const LINKS = [
  { i: "home",     t: "Accueil",             href: "/" },
  { i: "calendar", t: "Prendre rendez-vous", href: "/rdv" },
  { i: "grid",     t: "Catégories",          href: "/discover" },
  { i: "flame",    t: "Ventes Flash",         href: "/" },
  { i: "play",     t: "LN COS Beauté",       href: "/" },
  { i: "crown",    t: "Programme VIP",        overlay: "loyalty" as const },
  { i: "bag",      t: "Mes commandes",        overlay: "orders" as const },
  { i: "heart",    t: "Mes favoris",          href: "/favorites" },
  { i: "user",     t: "Mon profil",           href: "/profile" },
];

interface SideMenuProps {
  onClose: () => void;
}

export function SideMenu({ onClose }: SideMenuProps) {
  const openLoyalty = useStore((s) => s.openLoyalty);
  const openOrders  = useStore((s) => s.openOrders);
  const closeOverlay = useStore((s) => s.closeOverlay);

  function handleNav(item: typeof LINKS[0]) {
    closeOverlay();
    if (item.overlay === "loyalty") { setTimeout(openLoyalty, 50); }
    if (item.overlay === "orders")  { setTimeout(openOrders, 50); }
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
          padding: "60px 0 26px",
          /* Lux ease drawer — slightly longer for premium feel */
          animation: "drawerIn 0.36s cubic-bezier(0.22, 0.68, 0, 1) both",
          /* Soft elevation shadow */
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
          <button onClick={onClose} style={{ color: "var(--ink-soft)" }}>
            <Icon name="x" size={22} />
          </button>
        </div>

        {/* Links */}
        <div className="noscroll" style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
          {LINKS.map((l, i) =>
            l.href ? (
              <Link
                key={l.t}
                href={l.href}
                onClick={onClose}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  padding: "14px 14px",
                  borderRadius: "var(--r-sm)",
                  textDecoration: "none",
                  color: "var(--ink-soft)",
                  animation: `fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) ${0.08 + i * 0.035}s both`,
                }}
              >
                <Icon name={l.i} size={21} color="var(--gold)" />
                <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{l.t}</span>
              </Link>
            ) : (
              <button
                key={l.t}
                onClick={() => handleNav(l)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  padding: "14px 14px",
                  borderRadius: "var(--r-sm)",
                  textAlign: "left",
                  color: "var(--ink-soft)",
                  animation: `fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) ${0.08 + i * 0.035}s both`,
                }}
              >
                <Icon name={l.i} size={21} color="var(--gold)" />
                <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>{l.t}</span>
              </button>
            )
          )}
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
