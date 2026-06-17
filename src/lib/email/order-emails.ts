import type { OrderLineItem } from "@/lib/stripe/order-fulfillment";
import type { ShippingAddress } from "@/lib/stripe/shipping-address";
import { formatOrderRef } from "@/lib/order-ref";
import { carrierLabel, resolveOrderTrackingUrl } from "@/lib/order-tracking";
import { absoluteUrl } from "@/lib/site-url";
import { getAppName, interpolateBrand } from "@/lib/branding";
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

  const appName = getAppName();

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: interpolateBrand(`Confirmation de commande #${ref} — {{appName}}`),
    text: [
      interpolateBrand("Merci pour votre commande chez {{appName}} !"),
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
      interpolateBrand("L'équipe {{appName}}"),
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
  carrier?: string | null;
  trackingUrl?: string | null;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY not set — skipping shipped email");
    return false;
  }

  const resend = getResendClient();
  if (!resend) return false;

  const { to, orderRef, trackingNumber, carrier, trackingUrl } = input;
  const ref = formatOrderRef(orderRef);
  const carrierName = carrierLabel(carrier);
  const trackingLine = trackingNumber?.trim()
    ? `Numéro de suivi : ${trackingNumber.trim()}`
    : "Numéro de suivi : communiqué prochainement";
  const carrierLine = carrierName ? `Transporteur : ${carrierName}` : null;
  const linkLine = trackingUrl?.trim() ? `Suivi complet : ${trackingUrl.trim()}` : null;

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to,
    subject: interpolateBrand(`Votre commande #${ref} est expédiée — {{appName}}`),
    text: [
      interpolateBrand("Bonne nouvelle — votre commande {{appName}} a été expédiée !"),
      "",
      `Référence : #${ref}`,
      carrierLine,
      trackingLine,
      linkLine,
      "",
      `Suivre dans l'app : ${absoluteUrl(`/profile/orders/${encodeURIComponent(ref)}/tracking`)}`,
      "",
      "Merci de votre confiance,",
      interpolateBrand("L'équipe {{appName}}"),
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("[email] shipped failed:", error);
    return false;
  }

  return true;
}
