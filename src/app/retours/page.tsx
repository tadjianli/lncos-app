"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { InfoProse } from "@/components/info/InfoProse";

export default function RetoursPage() {
  return (
    <InfoPageLayout title="Retours et remboursements">
      <InfoProse>
        <p>
          Conformément à la réglementation en vigueur, vous disposez d&apos;un délai de 14 jours après
          réception de votre commande pour demander un retour.
        </p>
        <p>Le produit doit être retourné dans son état d&apos;origine.</p>
        <p>
          Après validation du retour, le remboursement est effectué via le moyen de paiement utilisé
          lors de la commande.
        </p>
      </InfoProse>
    </InfoPageLayout>
  );
}
