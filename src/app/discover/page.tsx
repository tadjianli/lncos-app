"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { usePublicPageSections } from "@/lib/client-supabase";
import { useDiscoverListingSync } from "@/lib/use-discover-listing-sync";
import { PageSectionsView } from "@/components/page/PageSectionsView";

export default function DiscoverPage() {
  const openSearch  = useStore((s) => s.openSearch);
  const { getVisible } = usePublicPageSections("discover");
  const sections = getVisible({ isMobile: true });

  useDiscoverListingSync();

  return (
    <AppShell>
      <div className="noscroll app-scroll-page">

        <PageSectionsView sections={sections.filter((s) => s.type !== "categories")} />

        {/* ── Search bar ─────────────────────────────────────── */}
        <div style={{ padding: "0 18px 20px" }}>
          <button
            onClick={() => openSearch()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "14px 18px",
              borderRadius: "var(--r-pill)",
              background: "var(--charcoal)",
              border: "1px solid rgba(212,175,55,.22)",
              textAlign: "left",
            }}
          >
            <Icon name="search" size={17} color="var(--gold)" />
            <span style={{ flex: 1, fontSize: 14, color: "var(--ink-mute)", fontWeight: 400 }}>
              Rechercher un produit…
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--gold)",
                background: "rgba(212,175,55,.1)",
                padding: "4px 10px",
                borderRadius: "var(--r-pill)",
                letterSpacing: ".04em",
              }}
            >
              RECHERCHE
            </span>
          </button>
        </div>

        <PageSectionsView sections={sections.filter((s) => s.type === "categories")} />

      </div>
    </AppShell>
  );
}
