"use client";

import { useEffect, useState } from "react";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { InfoDefinitionList } from "@/components/info/InfoProse";
import { useLegalSettings } from "@/lib/legal-settings-db";
import { LEGAL_ADDRESS, LEGAL_CONTACT_EMAIL } from "@/lib/legal-settings";

export default function MentionsLegalesPage() {
  const { settings, loading } = useLegalSettings();
  const [appVersion, setAppVersion] = useState<string>("…");

  useEffect(() => {
    fetch("/api/app-version", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { version?: string }) => setAppVersion(data.version ?? "—"))
      .catch(() => setAppVersion("—"));
  }, []);

  const hostingDisplay =
    !loading && settings.hostingInfo.trim()
      ? settings.hostingInfo
      : "Non renseigné — configurable depuis l'espace commerçant";

  return (
    <InfoPageLayout title="Mentions légales">
      <InfoDefinitionList
        items={[
          { label: "Nom", value: "LN COS" },
          {
            label: "Adresse",
            value: (
              <>
                {LEGAL_ADDRESS.line1}
                <br />
                {LEGAL_ADDRESS.line2}
                <br />
                {LEGAL_ADDRESS.region}
              </>
            ),
          },
          {
            label: "Email",
            value: (
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="info-link">
                {LEGAL_CONTACT_EMAIL}
              </a>
            ),
          },
          { label: "Hébergement", value: hostingDisplay },
          { label: "Version de l'application", value: appVersion },
        ]}
      />
    </InfoPageLayout>
  );
}
