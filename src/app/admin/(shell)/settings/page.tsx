import { Suspense } from "react";
import { SettingsModule } from "@/components/admin/SettingsModule";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="adm-content"><p style={{ padding: 20, color: "var(--adm-ink-mute)" }}>Chargement…</p></div>}>
      <SettingsModule />
    </Suspense>
  );
}
