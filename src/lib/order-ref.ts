/**
 * Référence commande affichable — source unique client / admin / emails / push.
 * Les ids Postgres sont déjà du type LN-2593 (cf. migration default).
 */
export function formatOrderRef(orderId: string | null | undefined): string {
  const trimmed = (orderId ?? "").trim();
  if (!trimmed) return "LN-????";

  const upper = trimmed.toUpperCase();
  if (/^LN-/i.test(trimmed)) {
    return upper;
  }

  return `LN-${upper}`;
}

/** Alias conservé pour l’admin et les imports existants. */
export const orderRef = formatOrderRef;
