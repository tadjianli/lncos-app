"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const triggerId = `faq-trigger-${index}`;

        return (
          <div
            key={item.question}
            className={`faq-accordion__item${isOpen ? " faq-accordion__item--open" : ""}`}
            style={{ animation: `fadeUp .4s cubic-bezier(.22,.68,0,1) ${0.06 + index * 0.05}s both` }}
          >
            <button
              type="button"
              id={triggerId}
              className="faq-accordion__trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span className="faq-accordion__question">{item.question}</span>
              <span className={`faq-accordion__chevron${isOpen ? " faq-accordion__chevron--open" : ""}`}>
                <Icon name="chevD" size={18} color="var(--gold)" />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="faq-accordion__panel"
              hidden={!isOpen}
            >
              <p className="faq-accordion__answer">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Combien de temps prend la livraison ?",
    answer:
      "Les commandes sont généralement expédiées sous 24 à 48 heures ouvrées. Les délais de réception varient ensuite selon le transporteur et votre destination.",
  },
  {
    question: "Puis-je retourner un produit ?",
    answer:
      "Oui, sous 14 jours après réception selon nos conditions de retour. Le produit doit être retourné dans son état d'origine, non utilisé et dans son emballage d'origine lorsque cela est possible.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      'Depuis la rubrique « Mes commandes », accessible depuis votre profil ou le menu latéral. Un numéro de suivi vous est communiqué par email dès qu\'il est disponible.',
  },
  {
    question: "Les paiements sont-ils sécurisés ?",
    answer:
      "Oui. Tous les paiements sont protégés et sécurisés via Stripe, prestataire certifié PCI-DSS. LN COS ne conserve jamais vos coordonnées bancaires complètes.",
  },
  {
    question: "Puis-je modifier une commande ?",
    answer:
      "Contactez-nous rapidement après votre achat à contact@lncos.fr. Nous ferons notre possible pour modifier votre commande avant son expédition.",
  },
];
