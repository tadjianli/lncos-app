"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { LegalSection } from "@/components/info/InfoProse";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal-settings";

export default function CgvPage() {
  return (
    <InfoPageLayout title="Conditions Générales de Vente">
      <p className="info-page__lead">
        Les présentes Conditions Générales de Vente régissent les relations contractuelles entre LN COS
        et tout client effectuant un achat sur l&apos;application lncos.fr.
      </p>

      <LegalSection title="Objet">
        <p>
          Les présentes CGV ont pour objet de définir les droits et obligations des parties dans le cadre
          de la vente en ligne de produits de beauté, nail art et accessoires proposés par LN COS,
          société exerçant à Saint-Louis (La Réunion).
        </p>
      </LegalSection>

      <LegalSection title="Produits">
        <p>
          Les produits présentés sur l&apos;application sont décrits avec la plus grande exactitude possible.
          Les photographies et visuels n&apos;engagent pas LN COS au-delà de la description figurant sur la
          fiche produit. LN COS se réserve le droit de modifier son catalogue à tout moment.
        </p>
      </LegalSection>

      <LegalSection title="Prix">
        <p>
          Les prix sont indiqués en euros (€), toutes taxes comprises (TTC), hors frais de livraison
          mentionnés avant validation de la commande. LN COS se réserve le droit de modifier ses prix à
          tout moment, étant entendu que le prix applicable est celui en vigueur au moment de la
          validation de la commande par le client.
        </p>
      </LegalSection>

      <LegalSection title="Commandes">
        <p>
          Toute commande passée sur l&apos;application implique l&apos;acceptation sans réserve des présentes CGV.
          La vente ne sera considérée comme définitive qu&apos;après confirmation du paiement et envoi d&apos;un
          email de confirmation de commande. LN COS se réserve le droit d&apos;annuler ou de refuser toute
          commande en cas de litige antérieur, d&apos;anomalie ou de suspicion de fraude.
        </p>
      </LegalSection>

      <LegalSection title="Paiement">
        <p>
          Le règlement s&apos;effectue en ligne par carte bancaire via la plateforme sécurisée Stripe.
          Le débit intervient au moment de la validation de la commande. LN COS ne conserve aucune
          coordonnée bancaire complète.
        </p>
      </LegalSection>

      <LegalSection title="Livraison">
        <p>
          LN COS livre principalement à La Réunion. Les commandes sont préparées sous 24 à 48 heures
          ouvrées. Les délais de livraison varient selon le transporteur et la destination. Un numéro de
          suivi est communiqué lorsque disponible. Le transfert de propriété et des risques intervient à
          la remise du colis au transporteur.
        </p>
      </LegalSection>

      <LegalSection title="Droit de rétractation">
        <p>
          Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose
          d&apos;un délai de 14 jours à compter de la réception de sa commande pour exercer son droit de
          rétractation, sans avoir à justifier de motifs ni à payer de pénalités, sous réserve que les
          produits soient retournés dans leur état d&apos;origine, non utilisés et dans leur emballage
          d&apos;origine lorsque cela est possible.
        </p>
      </LegalSection>

      <LegalSection title="Retours">
        <p>
          Pour initier un retour, le client doit contacter LN COS à {LEGAL_CONTACT_EMAIL} en indiquant
          son numéro de commande. Les frais de retour sont à la charge du client sauf en cas de produit
          défectueux ou d&apos;erreur imputable à LN COS. Le remboursement intervient dans un délai maximal
          de 14 jours après réception et validation du retour, via le même moyen de paiement que celui
          utilisé lors de l&apos;achat.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          LN COS ne saurait être tenue responsable des dommages résultant d&apos;une mauvaise utilisation
          des produits, d&apos;une incompatibilité non signalée par le client ou de cas de force majeure.
          La responsabilité de LN COS est limitée au montant de la commande concernée.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Pour toute question relative à une commande, un produit ou l&apos;application des présentes CGV,
          contactez-nous à{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="info-link">
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </InfoPageLayout>
  );
}
