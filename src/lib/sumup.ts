/**
 * LN COS — SumUp API client
 * SERVER-SIDE ONLY. Never import in client components.
 *
 * Authentication: direct API key — Authorization: Bearer <SUMUP_CLIENT_SECRET>
 * No OAuth token exchange required with cc_classic_* / cc_sk_classic_* credentials.
 */

const API = "https://api.sumup.com";

/* ─── Types ──────────────────────────────────────────────────────── */

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

/* ─── Helpers ────────────────────────────────────────────────────── */

function apiKey(): string {
  const key = process.env.SUMUP_CLIENT_SECRET;
  if (!key) throw new Error("SUMUP_CLIENT_SECRET is not set");
  return key;
}

/**
 * Parse a SumUp error response into a structured object.
 * SumUp error bodies are JSON: { title, detail, status, trace_id }
 */
async function parseSumUpError(
  res: Response,
  context: string
): Promise<never> {
  const raw = await res.text();
  let detail = raw;
  try {
    const json = JSON.parse(raw) as { title?: string; detail?: string; status?: number };
    detail = json.detail ?? json.title ?? raw;
  } catch {
    // body was not JSON — use raw text
  }
  // Full details for server logs only
  console.error(`[SumUp] ${context} [${res.status}]:`, raw);
  throw new SumUpApiError(res.status, detail, context);
}

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
      return "La clé API SumUp est invalide ou expirée. Vérifiez la configuration SUMUP_CLIENT_SECRET.";
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

/* ─── Merchant code cache ────────────────────────────────────────── */

let _merchant: { code: string; email: string } | null = null;

async function getMerchant(): Promise<{ code: string; email: string }> {
  if (_merchant) return _merchant;

  const res = await fetch(`${API}/v0.1/me`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, "GET /me");
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
  const merchant = await getMerchant();

  const res = await fetch(`${API}/v0.1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkout_reference: params.reference,
      amount: params.amount,
      currency: params.currency ?? "EUR",
      merchant_code: merchant.code,
      description: params.description,
      return_url: params.returnUrl,
      redirect_url: params.returnUrl,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, "POST /checkouts");
  }

  const data: SumUpCheckout = await res.json();
  const checkoutUrl = `https://pay.sumup.com/b2c/${data.id}`;

  return { id: data.id, checkoutUrl };
}

/** Fetch current status of a checkout from SumUp (server-side verification). */
export async function getCheckoutStatus(checkoutId: string): Promise<SumUpCheckout> {
  const res = await fetch(`${API}/v0.1/checkouts/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    await parseSumUpError(res, `GET /checkouts/${checkoutId}`);
  }

  return res.json() as Promise<SumUpCheckout>;
}
