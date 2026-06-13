"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FaqAccordion, FAQ_ITEMS } from "@/components/info/FaqAccordion";

export default function FaqPage() {
  return (
    <InfoPageLayout title="FAQ">
      <p className="info-page__lead">
        Retrouvez les réponses aux questions les plus fréquentes sur vos commandes, livraisons et paiements.
      </p>
      <FaqAccordion items={FAQ_ITEMS} />
    </InfoPageLayout>
  );
}
