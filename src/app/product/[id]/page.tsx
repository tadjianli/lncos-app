import { redirect } from "next/navigation";
import { fetchProductBySeoSlug } from "@/lib/seo-server";
import { getProductSeoPath } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
};

/** Redirection legacy /product/{id} → /produit/{slug} */
export default async function LegacyProductRedirect({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const preview = sp.preview === "1";
  const product = await fetchProductBySeoSlug(id, { preview });
  const slug = product ? getProductSeoPath(product).replace("/produit/", "") : id;
  const q = preview ? "?preview=1" : "";
  redirect(`/produit/${slug}${q}`);
}
