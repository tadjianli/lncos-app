"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { Icon } from "@/components/shared/Icon";

const LEGAL_LINKS = [
  { href: "/faq", icon: "info", label: "FAQ", hint: "Commandes, livraisons, paiements" },
  { href: "/contact", icon: "mail", label: "Contact", hint: "Écrire à l'équipe LN COS" },
  { href: "/livraison", icon: "truck", label: "Livraison", hint: "Délais et zones" },
  { href: "/retours", icon: "bag", label: "Retours & remboursements", hint: "Droit de rétractation" },
  { href: "/cgv", icon: "tag", label: "Conditions Générales de Vente", hint: "Vente en ligne" },
  { href: "/confidentialite", icon: "lock", label: "Politique de confidentialité", hint: "Données personnelles" },
  { href: "/mentions-legales", icon: "shop", label: "Mentions légales", hint: "Éditeur et hébergement" },
] as const;

export default function InformationsPage() {
  const pathname = usePathname();

  return (
    <PageLayout variant="info" title="Informations légales" backHref="/" eyebrow="Informations">
      <p className="info-page__lead">
        FAQ, contact, livraison et documents légaux LN COS — tout au même endroit.
      </p>

      <nav className="info-hub" aria-label="Informations légales">
        {LEGAL_LINKS.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`info-hub__link${active ? " info-hub__link--active" : ""}`}
              style={{ animation: `fadeUp 0.4s cubic-bezier(0.22,0.68,0,1) ${i * 0.04}s both` }}
              aria-current={active ? "page" : undefined}
            >
              <span className="info-hub__icon">
                <Icon name={item.icon} size={20} color="var(--gold)" />
              </span>
              <span className="info-hub__text">
                <span className="info-hub__label">{item.label}</span>
                <span className="info-hub__hint">{item.hint}</span>
              </span>
              <Icon name="chevR" size={16} color="var(--ink-mute)" />
            </Link>
          );
        })}
      </nav>
    </PageLayout>
  );
}
