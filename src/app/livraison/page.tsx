"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { InfoProse } from "@/components/info/InfoProse";

export default function LivraisonPage() {
  return (
    <InfoPageLayout title="Informations de livraison">
      <InfoProse>
        <p>LN COS livre principalement à La Réunion.</p>
        <p>Les commandes sont préparées sous 24 à 48 heures ouvrées.</p>
        <p>Les délais de livraison peuvent varier selon le transporteur et la destination.</p>
        <p>Un numéro de suivi est communiqué lorsque celui-ci est disponible.</p>
      </InfoProse>
    </InfoPageLayout>
  );
}
