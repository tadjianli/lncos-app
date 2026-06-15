import { Suspense } from "react";
import { ContentPagesAdminModule } from "@/components/admin/ContentPagesAdminModule";

export default function ContentPagesAdminPage() {
  return (
    <Suspense fallback={<div className="adm-content"><p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p></div>}>
      <ContentPagesAdminModule />
    </Suspense>
  );
}
