/**
 * LN COS — SumUp API client
 * SERVER-SIDE ONLY. Never import in client components.
 */

const API = "https://api.sumup.com";

/* ─── Types ──────────────────────────────────────────────────────── */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MerchantResponse {
  merchant_code: string;
  email: string;
  business_name: string;
}

export type SumUpCheckoutStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface SumUpCheckout {
  id: string;
  checkout_reference: string;
  amount: number;
  currency: string;
  status: SumUpCheckoutStatus;
  merchant_code: string;
}

/* ─── In-process token cache ─────────────────────────────────────── */

let _token: string | null = null;
let _tokenExp = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExp - 60_000) return _token;

  const res = await fetch(`${API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SUMUP_CLIENT_ID!,
      client_secret: process.env.SUMUP_CLIENT_SECRET!,
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SumUp token [${res.status}]: ${body}`);
  }

  const data: TokenResponse = await res.json();
  _token = data.access_token;
  _tokenExp = Date.now() + data.expires_in * 1000;
  return _token;
}

/* ─── Merchant code cache ────────────────────────────────────────── */

let _merchant: { code: string; email: string } | null = null;

async function getMerchant(token: string): Promise<{ code: string; email: string }> {
  if (_merchant) return _merchant;

  const res = await fetch(`${API}/v0.1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SumUp /me [${res.status}]: ${body}`);
  }

  const data: MerchantResponse = await res.json();
  _merchant = { code: data.merchant_code, email: data.email };
  return _merchant;
}

/* ─── Public helpers ─────────────────────────────────────────────── */

/** Create a hosted SumUp checkout and return its id + redirect URL. */
export async function createCheckout(params: {
  reference: string;
  amount: number;
  currency?: string;
  description: string;
  returnUrl: string;
}): Promise<{ id: string; checkoutUrl: string }> {
  const token = await getToken();
  const merchant = await getMerchant(token);

  const res = await fetch(`${API}/v0.1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkout_reference: params.reference,
      amount: params.amount,
      currency: params.currency ?? "EUR",
      merchant_code: merchant.code,
      description: params.description,
      return_url: params.returnUrl,
      redirect_url: params.returnUrl, // some API versions use this key
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SumUp createCheckout [${res.status}]: ${err}`);
  }

  const data: SumUpCheckout = await res.json();
  // Hosted payment page — SumUp appends ?checkout_id=id on redirect back
  const checkoutUrl = `https://pay.sumup.com/b2c/${data.id}`;

  return { id: data.id, checkoutUrl };
}

/** Fetch current status of a checkout from SumUp (server-side verification). */
export async function getCheckoutStatus(checkoutId: string): Promise<SumUpCheckout> {
  const token = await getToken();

  const res = await fetch(`${API}/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SumUp getCheckout [${res.status}]: ${err}`);
  }

  return res.json() as Promise<SumUpCheckout>;
}
