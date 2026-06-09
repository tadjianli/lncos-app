"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { usePublicPageSections } from "@/lib/client-supabase";
export default function BoutiquePage() {
  const { getVisible } = usePublicPageSections("boutique");
  const sections = getVisible({ isMobile: true });

  return (
    <AppShell>
      <div className="noscroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
        <PageSectionsView sections={sections} />
      </div>
    </AppShell>
  );
}
