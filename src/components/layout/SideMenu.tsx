"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

type MenuSection = {
  label: string;
  links: MenuLink[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    label: "Boutique",
    links: [
      { i: "home", t: "Accueil", href: "/" },
      { i: "grid", t: "Catégories", href: "/discover" },
      { i: "sparkle", t: "Promotions", href: "/promotions" },
      { i: "flame", t: "Ventes Flash", href: "/flash-sales" },
    ],
  },
  {
    label: "Découvrir",
    links: [
      { i: "play", t: "Vidéos Beauté", href: "/videos" },
      { i: "edit", t: "Blog LN COS", href: "/blog" },
      { i: "share", t: "Réseaux sociaux", href: "/social" },
    ],
  },
  {
    label: "Mon compte",
    links: [
      { i: "bag", t: "Mes commandes", overlay: "orders" },
      { i: "heart", t: "Favoris", href: "/favorites" },
      { i: "user", t: "Profil", href: "/profile" },
    ],
  },
];

const LEGAL_HUB: MenuLink = {
  i: "info",
  t: "Informations légales",
  href: "/informations",
};

const LEGAL_PATHS = new Set([
  "/informations",
  "/faq",
  "/contact",
  "/livraison",
  "/retours",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
]);

interface SideMenuProps {
  onClose: () => void;
}

export function SideMenu({ onClose }: SideMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const openOrders = useStore((s) => s.openOrders);
  const closeOverlay = useStore((s) => s.closeOverlay);

  function closeMenuOnly() {
    closeOverlay();
  }

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
    const anim = `fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) ${baseDelay + index * 0.03}s both`;

    if (l.href) {
      const active = pathname === l.href;
      return (
        <Link
          key={l.t}
          href={l.href}
          onClick={(e) => handleMenuLinkClick(e, l.href!)}
          className={`side-menu-link side-menu-row${active ? " side-menu-row--active" : ""}`}
          style={{ animation: anim }}
          aria-current={active ? "page" : undefined}
        >
          <Icon name={l.i} size={20} color="var(--gold)" />
          <span className="side-menu-row__label">{l.t}</span>
        </Link>
      );
    }

    return (
      <button
        key={l.t}
        type="button"
        onClick={handleOrders}
        className="side-menu-link side-menu-row"
        style={{ animation: anim }}
      >
        <Icon name={l.i} size={20} color="var(--gold)" />
        <span className="side-menu-row__label">{l.t}</span>
      </button>
    );
  }

  let linkIndex = 0;

  return (
    <div className="side-menu-root">
      <div className="side-menu-scrim" onClick={onClose} aria-hidden />

      <div className="side-menu-drawer">
        <div className="side-menu-drawer__header">
          <Logo size={28} />
          <button
            type="button"
            onClick={onClose}
            className="touch-target"
            style={{ color: "var(--ink-soft)" }}
            aria-label="Fermer le menu"
          >
            <Icon name="x" size={22} />
          </button>
        </div>

        <div className="side-menu-drawer__scroll noscroll">
          {MENU_SECTIONS.map((section, si) => (
            <div key={section.label} className="side-menu-section">
              <p
                className="side-menu-section__label"
                style={{ animation: `fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) ${0.06 + si * 0.04}s both` }}
              >
                {section.label}
              </p>
              {section.links.map((l) => {
                const node = renderLink(l, linkIndex, 0.08 + si * 0.05);
                linkIndex += 1;
                return node;
              })}
            </div>
          ))}

          <div className="side-menu-section side-menu-section--legal">
            <Link
              href={LEGAL_HUB.href!}
              onClick={(e) => handleMenuLinkClick(e, LEGAL_HUB.href!)}
              className={`side-menu-link side-menu-row side-menu-row--legal${
                LEGAL_PATHS.has(pathname) ? " side-menu-row--active" : ""
              }`}
              style={{ animation: "fadeUp 0.38s cubic-bezier(0.22,0.68,0,1) 0.34s both" }}
            >
              <Icon name={LEGAL_HUB.i} size={20} color="var(--gold)" />
              <span className="side-menu-row__label">{LEGAL_HUB.t}</span>
              <span className="side-menu-row__chevron" aria-hidden>
                <Icon name="chevR" size={16} color="var(--ink-mute)" />
              </span>
            </Link>
          </div>
        </div>

        <div className="side-menu-drawer__footer">
          <Link
            href="/admin"
            onClick={(e) => handleMenuLinkClick(e, "/admin")}
            className="side-menu-link side-menu-link--footer"
          >
            <Icon name="sliders" size={17} color="var(--gold)" />
            Espace commerçant →
          </Link>
        </div>
      </div>
    </div>
  );
}
