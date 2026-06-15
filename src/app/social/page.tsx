"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { SocialNetworkCard } from "@/components/social/SocialNetworkCard";
import { SOCIAL_NETWORK_LINKS } from "@/lib/social-links";

export default function SocialPage() {
  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18}>
        <header className="social-hero">
          <div className="social-hero__glow" aria-hidden />
          <span className="social-hero__eyebrow">
            <Icon name="share" size={13} color="var(--gold)" />
            Communauté LN COS
          </span>
          <h1 className="social-hero__title">Réseaux sociaux</h1>
          <p className="social-hero__sub">
            Suivez LN COS au quotidien — inspiration beauté, coulisses, tutoriels et lancements en exclusivité.
          </p>
        </header>

        <div className="social-cards">
          {SOCIAL_NETWORK_LINKS.map((network, i) => (
            <SocialNetworkCard key={network.id} network={network} index={i} />
          ))}
        </div>

        <p className="social-footnote">
          Statistiques et dernières publications affichées automatiquement dès la connexion admin.
        </p>
      </ScrollRegion>
    </AppShell>
  );
}
