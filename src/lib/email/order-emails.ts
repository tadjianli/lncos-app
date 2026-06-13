import type { OrderLineItem } from "@/lib/stripe/order-fulfillment";
import type { ShippingAddress } from "@/lib/stripe/shipping-address";
import { formatOrderRef } from "@/lib/order-ref";
import { absoluteUrl } from "@/lib/site-url";
import { getEmailFrom, getResendClient, isEmailConfigured } from "./resend-client";

function formatAddress(addr: ShippingAddress | null | undefined): string {
  if (!addr) return "—";
  const name = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  const lines = [name, addr.address, `${addr.zip} ${addr.city}`.trim(), addr.phone].filter(Boolean);
  return lines.join("\n");
}

function formatItems(items: OrderLineItem[]): string {
  return items
    .map((it) => {
      const variant = it.variant ? ` (${it.variant})` : "";
      return `• ${it.name}${variant} × ${it.qty} — ${(it.price * it.qty).toFixed(2)} €`;
    })
    .join("\n");
}

export async function sendOrderConfirmationEmail(input: {
  to: string;
  orderRef: string;
  total: number;
  items: OrderLineItem[];
  shippingAddress?: ShippingAddress | null;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation email");
    return false;
  }

  const resend = getResendClient();
  if (!resend) return false;

  const { to, orderRef, total, items, shippingAddress } = input;
  const ref = formatOrderRef(orderRef);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `Confirmation de commande #${ref} — LN COS`,
    text: [
      "Merci pour votre commande chez LN COS !",
      "",
      `Référence : #${ref}`,
      `Total payé : ${total.toFixed(2)} €`,
      "",
      "Articles :",
      formatItems(items),
      "",
      "Adresse de livraison :",
      formatAddress(shippingAddress),
      "",
      `Suivez votre commande : ${absoluteUrl("/profile")}`,
      "",
      "À très bientôt,",
      "L'équipe LN COS",
    ].join("\n"),
  });

  if (error) {
    console.error("[email] confirmation failed:", error);
    return false;
  }

  return true;
}

export async function sendOrderShippedEmail(input: {
  to: string;
  orderRef: string;
  trackingNumber?: string | null;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY not set — skipping shipped email");
    return false;
  }

  const resend = getResendClient();
  if (!resend) return false;

  const { to, orderRef, trackingNumber } = input;
  const ref = formatOrderRef(orderRef);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: `Votre commande #${ref} est expédiée — LN COS`,
    text: [
      "Bonne nouvelle — votre commande LN COS a été expédiée !",
      "",
      `Référence : #${ref}`,
      trackingNumber ? `Numéro de suivi : ${trackingNumber}` : "Numéro de suivi : communiqué prochainement",
      "",
      `Suivez votre commande : ${absoluteUrl("/profile")}`,
      "",
      "Merci de votre confiance,",
      "L'équipe LN COS",
    ].join("\n"),
  });

  if (error) {
    console.error("[email] shipped failed:", error);
    return false;
  }

  return true;
}
