"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { InfoCard, InfoProse } from "@/components/info/InfoProse";
import { GoldBtn } from "@/components/shared/ActionButtons";
import { Icon } from "@/components/shared/Icon";
import { LEGAL_ADDRESS, LEGAL_CONTACT_EMAIL } from "@/lib/legal-settings";

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contactez-nous">
      <InfoProse>
        <p>
          Vous avez une question concernant une commande, un produit ou votre compte LN COS ?
          Notre équipe est disponible pour vous accompagner.
        </p>
      </InfoProse>

      <div className="info-stack">
        <InfoCard icon={<Icon name="mail" size={22} color="var(--gold)" />}>
          <p className="info-card__label">Email</p>
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="info-link">
            {LEGAL_CONTACT_EMAIL}
          </a>
        </InfoCard>

        <InfoCard icon={<Icon name="pin" size={22} color="var(--gold)" />}>
          <p className="info-card__label">Adresse</p>
          <p className="info-card__text">
            {LEGAL_ADDRESS.line1}
            <br />
            {LEGAL_ADDRESS.line2}
            <br />
            {LEGAL_ADDRESS.region}
          </p>
        </InfoCard>

        <InfoCard icon={<Icon name="clock" size={22} color="var(--gold)" />}>
          <p className="info-card__label">Délai de réponse</p>
          <p className="info-card__text">Sous 24 à 48 heures ouvrées.</p>
        </InfoCard>
      </div>

      <div className="info-page__cta">
        <GoldBtn
          icon="send"
          onClick={() => {
            window.location.href = `mailto:${LEGAL_CONTACT_EMAIL}?subject=Contact%20LN%20COS`;
          }}
        >
          Nous écrire
        </GoldBtn>
      </div>
    </InfoPageLayout>
  );
}
