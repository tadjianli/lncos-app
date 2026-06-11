"use client";
/**
 * LN COS — Bloc réassurance premium (fiches produit)
 */

const REASSURANCE_CARDS = [
  { emoji: "🔒", title: "Paiement 100% sécurisé" },
  { emoji: "🚚", title: "Livraison express Réunion" },
  { emoji: "↩️", title: "Satisfait ou remboursé" },
  { emoji: "📦", title: "Expédition sous 24h" },
] as const;

export function TrustBadges() {
  return (
    <section className="trust-badges" aria-label="Garanties produit">
      <div className="trust-badges__cards">
        {REASSURANCE_CARDS.map((card) => (
          <div key={card.title} className="trust-badges__card">
            <span className="trust-badges__card-emoji" aria-hidden>
              {card.emoji}
            </span>
            <span className="trust-badges__card-title">{card.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
