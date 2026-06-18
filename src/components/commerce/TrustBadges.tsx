"use client";
/**
 * LN COS — Ligne réassurance discrète (fiches produit)
 */

const TRUST_ITEMS = [
  "Livraison rapide",
  "Retours faciles",
  "Paiement sécurisé",
] as const;

export function TrustBadges() {
  return (
    <section className="trust-badges" aria-label="Garanties produit">
      <ul className="trust-badges__line">
        {TRUST_ITEMS.map((label) => (
          <li key={label} className="trust-badges__line-item">
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
