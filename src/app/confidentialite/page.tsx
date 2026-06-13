"use client";

import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { LegalSection } from "@/components/info/InfoProse";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal-settings";

export default function ConfidentialitePage() {
  return (
    <InfoPageLayout title="Politique de confidentialité">
      <p className="info-page__lead">
        LN COS s&apos;engage à protéger vos données personnelles conformément au Règlement Général sur la
        Protection des Données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <LegalSection title="Données collectées">
        <p>Nous collectons les données suivantes dans le cadre de l&apos;utilisation de l&apos;application :</p>
        <ul>
          <li>Identité et coordonnées : nom, prénom, adresse email, adresse postale, numéro de téléphone ;</li>
          <li>Données de commande : historique d&apos;achats, montants, produits commandés ;</li>
          <li>Données de compte : identifiants de connexion, préférences ;</li>
          <li>Données techniques : type d&apos;appareil, navigateur, adresse IP, cookies de session ;</li>
          <li>Données de paiement : traitées exclusivement par Stripe (LN COS ne stocke pas vos coordonnées bancaires).</li>
        </ul>
      </LegalSection>

      <LegalSection title="Utilisation des données">
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Traiter et livrer vos commandes ;</li>
          <li>Gérer votre compte client et le programme de fidélité ;</li>
          <li>Vous envoyer des confirmations de commande, notifications d&apos;expédition et communications liées à votre achat ;</li>
          <li>Améliorer nos services et l&apos;expérience utilisateur ;</li>
          <li>Respecter nos obligations légales et comptables.</li>
        </ul>
        <p>
          Nous ne vendons ni ne louons vos données personnelles à des tiers. Certaines données peuvent
          être partagées avec nos prestataires techniques (hébergement, paiement, envoi d&apos;emails) dans
          le strict cadre de l&apos;exécution de nos services.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité des données">
        <p>
          LN COS met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos
          données contre tout accès non autorisé, perte, destruction ou divulgation. Les échanges sont
          chiffrés (HTTPS) et les paiements sont sécurisés via Stripe, certifié PCI-DSS.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          L&apos;application utilise des cookies et stockages locaux nécessaires à son fonctionnement
          (session, panier, préférences, authentification). Des cookies analytiques peuvent être utilisés
          pour mesurer l&apos;audience de manière anonymisée. Vous pouvez configurer votre navigateur pour
          refuser les cookies non essentiels, sous réserve d&apos;une dégradation de certaines fonctionnalités.
        </p>
      </LegalSection>

      <LegalSection title="Droits des utilisateurs">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d&apos;accès à vos données personnelles ;</li>
          <li>Droit de rectification des données inexactes ;</li>
          <li>Droit à l&apos;effacement (« droit à l&apos;oubli ») ;</li>
          <li>Droit à la limitation du traitement ;</li>
          <li>Droit à la portabilité de vos données ;</li>
          <li>Droit d&apos;opposition au traitement pour motifs légitimes.</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée ci-dessous. Vous pouvez également
          introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>
      </LegalSection>

      <LegalSection title="Suppression des données">
        <p>
          Vous pouvez demander la suppression de votre compte et de vos données associées en nous
          contactant par email. Certaines données peuvent être conservées pour répondre à nos obligations
          légales (facturation, comptabilité) pendant la durée légale requise.
        </p>
      </LegalSection>

      <LegalSection title="Contact RGPD">
        <p>
          Pour toute question relative à la protection de vos données personnelles, contactez notre
          responsable du traitement à{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="info-link">
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </InfoPageLayout>
  );
}
