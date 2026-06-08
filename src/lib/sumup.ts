/**
 * LN COS — SumUp API client
 * SERVER-SIDE ONLY. Never import in client components.
 *
 * Authentication: direct API key — Authorization: Bearer <SUMUP_CLIENT_SECRET>
 * No OAuth token exchange. No /me round-trip. Merchant code from SUMUP_MERCHANT_CODE.
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

/* ─── Credential helpers ─────────────────────────────────────────── */

function apiKey(): string {
  const key = process.env.SUMUP_CLIENT_SECRET;
  if (!key) throw new Error("SUMUP_CLIENT_SECRET is not set");
  return key;
}

function merchantCode(): string {
  const code = process.env.SUMUP_MERCHANT_CODE;
  if (!code) throw new Error("SUMUP_MERCHANT_CODE is not set — find it in SumUp Dashboard → Profile → Merchant account");
  return code;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json",
  };
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

  /** Human-readable message safe to show in the UI */
  userMessage(): string {
    if (this.statusCode === 401) {
      return "La clé API SumUp est invalide ou expirée. Vérifiez SUMUP_CLIENT_SECRET dans les variables d'environnement.";
    }
    if (this.statusCode === 403) {
      return "Accès refusé par SumUp. Vérifiez les permissions de la clé API.";
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
    const json = JSON.parse(raw) as { title?: string; detail?: string };
    detail = json.detail ?? json.title ?? raw;
  } catch {
    // body was not JSON — use raw text
  }
  console.error(`[SumUp] ${context} FAILED — status=${res.status} body=${raw} auth=Bearer`);
  throw new SumUpApiError(res.status, detail, context);
}

/* ─── Public helpers ─────────────────────────────────────────────── */

/**
 * Create a hosted SumUp checkout and return its id + redirect URL.
 * Uses direct API key auth (Bearer cc_sk_classic_*). No OAuth needed.
 */
export async function createCheckout(params: {
  reference: string;
  amount: number;
  currency?: string;
  description: string;
  returnUrl: string;
}): Promise<{ id: string; checkoutUrl: string }> {
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

  console.log(`[SumUp] POST ${url} auth=Bearer(cc_sk_classic_***) merchant=${payload.merchant_code} amount=${payload.amount} ref=${payload.checkout_reference}`);

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, "POST /checkouts");
  }

  const data: SumUpCheckout = await res.json();
  console.log(`[SumUp] POST /checkouts OK — id=${data.id} status=${data.status}`);

  const checkoutUrl = `https://pay.sumup.com/b2c/${data.id}`;
  return { id: data.id, checkoutUrl };
}

/** Fetch current status of a checkout from SumUp (server-side verification). */
export async function getCheckoutStatus(checkoutId: string): Promise<SumUpCheckout> {
  const url = `${API}/v0.1/checkouts/${checkoutId}`;
  console.log(`[SumUp] GET ${url} auth=Bearer(cc_sk_classic_***)`);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, `GET /checkouts/${checkoutId}`);
  }

  const data = await res.json() as SumUpCheckout;
  console.log(`[SumUp] GET /checkouts/${checkoutId} OK — status=${data.status} amount=${data.amount}`);
  return data;
}
