import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-auth";

const DISABLED_MESSAGE =
  "La génération automatique de contenu produit est désactivée. Utilisez l'onglet SEO → « Analyser le SEO » / « Optimiser le SEO » (Claude uniquement, métadonnées SEO).";

/**
 * @deprecated Route legacy — product_seo et single désactivés pour protéger le contenu marketing.
 * Utiliser POST /api/admin/ai/seo-product
 */
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  void req;

  return NextResponse.json({ error: DISABLED_MESSAGE, ok: false }, { status: 410 });
}
