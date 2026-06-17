/**
 * Origin for Stripe redirect URLs — never trust client-supplied returnUrl.
 */
export function resolveCheckoutOrigin(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
  const hostname = host.split(",")[0].trim();
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (hostname.includes("localhost") || hostname.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${hostname}`;
}
