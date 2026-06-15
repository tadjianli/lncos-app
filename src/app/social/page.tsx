"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ScrollRegion } from "@/components/layout/ScrollRegion";
import { Icon } from "@/components/shared/Icon";
import { SocialNetworkCard } from "@/components/social/SocialNetworkCard";
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { usePublicPageSections } from "@/lib/client-supabase";
import { usePublicSocialContent } from "@/lib/content-pages-hooks";

export default function SocialPage() {
  const { pageSettings, links, loading: contentLoading } = usePublicSocialContent();
  const { getVisible, loading: sectionsLoading } = usePublicPageSections("social");

  const extraSections = useMemo(
    () =>
      getVisible({ isMobile: true }).filter(
        (s) => s.enabled && s.type !== "hero"
      ),
    [getVisible]
  );

  const loading = contentLoading || sectionsLoading;

  return (
    <AppShell>
      <ScrollRegion variant="page" insetX={18} className="social-page">
        <header className="social-hero">
          <div className="social-hero__glow" aria-hidden />
          <span className="social-hero__eyebrow">
            <Icon name="share" size={13} color="var(--gold)" />
            {pageSettings.heroEyebrow}
          </span>
          <h1 className="social-hero__title">{pageSettings.heroTitle}</h1>
          <p className="social-hero__sub">{pageSettings.heroSubtitle}</p>
        </header>

        {loading ? (
          <div className="flash-sales-loading" aria-busy="true">
            <div className="flash-sales-loading__bar" />
          </div>
        ) : (
          <div className="social-cards">
            {links.map((network, i) => (
              <SocialNetworkCard key={network.id} network={network} index={i} />
            ))}
          </div>
        )}

        {pageSettings.footnote ? (
          <p className="social-footnote">{pageSettings.footnote}</p>
        ) : null}

        {extraSections.length > 0 && <PageSectionsView sections={extraSections} />}
      </ScrollRegion>
    </AppShell>
  );
}
