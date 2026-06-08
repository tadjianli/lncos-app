/**
 * LN COS — SumUp API client
 * SERVER-SIDE ONLY. Never import in client components.
 *
 * Authentication: OAuth client_credentials flow.
 * cc_classic_* / cc_sk_classic_* are OAuth credentials, not direct API keys.
 * Flow: POST /token → access_token → Authorization: Bearer <access_token>
 */

const API = "https://api.sumup.com";

/* ─── Types ──────────────────────────────────────────────────────── */

export type SumUpCheckoutStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface SumUpCheckout {
  id: string;
  checkout_reference: string;
  amount: number;
  currency: string;
  status: SumUpCheckoutStatus;
  merchant_code: string;
}

/* ─── Error handling ─────────────────────────────────────────────── */

export class SumUpApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly context: string
  ) {
    super(detail);
    this.name = "SumUpApiError";
  }

  userMessage(): string {
    if (this.statusCode === 401) {
      return "Authentification SumUp échouée. Vérifiez SUMUP_CLIENT_ID et SUMUP_CLIENT_SECRET.";
    }
    if (this.statusCode === 403) {
      return "Accès refusé par SumUp. Vérifiez les permissions de l'application.";
    }
    if (this.statusCode >= 500) {
      return "SumUp rencontre une erreur temporaire. Réessayez dans quelques instants.";
    }
    return this.detail;
  }
}

async function parseSumUpError(res: Response, context: string): Promise<never> {
  const raw = await res.text();
  let detail = raw;
  try {
    const json = JSON.parse(raw) as { title?: string; detail?: string; error_description?: string; error?: string };
    detail = json.detail ?? json.error_description ?? json.title ?? json.error ?? raw;
  } catch {
    // not JSON
  }
  console.error(`[SumUp] ${context} FAILED — status=${res.status} body=${raw}`);
  throw new SumUpApiError(res.status, detail, context);
}

/* ─── OAuth token cache ──────────────────────────────────────────── */

interface TokenCache {
  accessToken: string;
  expiresAt: number; // ms timestamp
}

let _tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 60s safety margin)
  if (_tokenCache && _tokenCache.expiresAt - 60_000 > now) {
    return _tokenCache.accessToken;
  }

  const clientId = process.env.SUMUP_CLIENT_ID;
  const clientSecret = process.env.SUMUP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SUMUP_CLIENT_ID or SUMUP_CLIENT_SECRET is not set");
  }

  console.log(`[SumUp] POST /token — requesting OAuth access token for client_id=${clientId}`);

  const res = await fetch(`${API}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, "POST /token");
  }

  const data = await res.json() as {
    access_token: string;
    token_type: string;
    expires_in?: number;
  };

  const expiresIn = data.expires_in ?? 3600; // default 1h
  const expiresAt = now + expiresIn * 1000;

  console.log(`[SumUp] POST /token OK — token_type=${data.token_type} expires_in=${expiresIn}s expires_at=${new Date(expiresAt).toISOString()}`);

  _tokenCache = { accessToken: data.access_token, expiresAt };
  return _tokenCache.accessToken;
}

function merchantCode(): string {
  const code = process.env.SUMUP_MERCHANT_CODE;
  if (!code) throw new Error("SUMUP_MERCHANT_CODE is not set — find it in SumUp Dashboard → Profile → Merchant account");
  return code;
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
  const token = await getAccessToken();
  const url = `${API}/v0.1/checkouts`;
  const payload = {
    checkout_reference: params.reference,
    amount: params.amount,
    currency: params.currency ?? "EUR",
    merchant_code: merchantCode(),
    description: params.description,
    return_url: params.returnUrl,
    redirect_url: params.returnUrl,
  };

  console.log(`[SumUp] POST ${url} merchant=${payload.merchant_code} amount=${payload.amount} ref=${payload.checkout_reference}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, "POST /checkouts");
  }

  const data = await res.json() as SumUpCheckout;
  console.log(`[SumUp] POST /checkouts OK — id=${data.id} status=${data.status}`);

  return { id: data.id, checkoutUrl: `https://pay.sumup.com/b2c/${data.id}` };
}

/** Fetch current status of a checkout from SumUp (server-side verification). */
export async function getCheckoutStatus(checkoutId: string): Promise<SumUpCheckout> {
  const token = await getAccessToken();
  const url = `${API}/v0.1/checkouts/${checkoutId}`;

  console.log(`[SumUp] GET ${url}`);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, `GET /checkouts/${checkoutId}`);
  }

  const data = await res.json() as SumUpCheckout;
  console.log(`[SumUp] GET /checkouts/${checkoutId} OK — status=${data.status} amount=${data.amount}`);
  return data;
}
