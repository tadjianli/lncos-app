/** Module commandes — panier, checkout, fulfillment */
export * from "@/lib/stripe/order-fulfillment";
export { sendOrderConfirmationEmail, sendOrderShippedEmail } from "@/lib/email/order-emails";
