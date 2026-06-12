"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageSectionsView } from "@/components/page/PageSectionsView";
import { usePublicPageSections } from "@/lib/client-supabase";
export default function BoutiquePage() {
  const { getVisible } = usePublicPageSections("boutique");
  const sections = getVisible({ isMobile: true });

  return (
    <AppShell>
      <div className="noscroll app-scroll-page">
        <PageSectionsView sections={sections} />
      </div>
    </AppShell>
  );
}
