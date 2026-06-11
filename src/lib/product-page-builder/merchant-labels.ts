import type { ProductPageBlockType } from "./types";
import { blockIconName } from "./block-meta";

/** Libellés visibles par le commerçant — vocabulaire boutique, pas technique. */
export const MERCHANT_BLOCK_LABELS: Record<ProductPageBlockType, string> = {
  gallery: "Galerie images",
  product_info: "Titre, prix et stock",
  variants: "Variantes",
  quantity: "Quantité",
  description: "Description",
  benefits: "Points forts",
  usage_tips: "Conseils d'utilisation",
  video: "Vidéo",
  faq: "FAQ",
  custom: "Texte libre",
  before_after: "Photos avant / après",
  reference: "Référence produit",
  reviews_summary: "Note moyenne",
  reviews: "Avis clients",
  live_viewers: "Visiteurs en ce moment",
  stock_alert: "Stock limité",
  routine: "Autres produits similaires",
  recommendations: "Produits recommandés",
  add_to_cart: "Bouton Ajouter au panier",
  trust_badges: "Livraison et paiement",
  sales_counter: "Achats récents",
};

export function merchantBlockLabel(type: ProductPageBlockType): string {
  return MERCHANT_BLOCK_LABELS[type];
}

/** Icônes + couleurs — alignées sur l'App Builder (accueil). */
export const PRODUCT_BLOCK_TYPE_META: Record<
  ProductPageBlockType,
  { icon: string; color: string; bg: string }
> = Object.fromEntries(
  (Object.keys(MERCHANT_BLOCK_LABELS) as ProductPageBlockType[]).map((type) => {
    const icon = blockIconName(type);
    const warm = ["gallery", "product_info", "reviews_summary", "reviews", "faq", "custom"];
    const pink = ["variants", "add_to_cart", "recommendations", "routine", "video", "usage_tips"];
    const green = ["trust_badges", "benefits", "before_after", "live_viewers"];
    let color = "#7C756B";
    let bg = "rgba(124,117,107,.14)";
    if (warm.includes(type)) {
      color = "#B8902B";
      bg = "rgba(212,175,55,.14)";
    } else if (pink.includes(type)) {
      color = "#C2557A";
      bg = "rgba(194,85,122,.14)";
    } else if (green.includes(type)) {
      color = "#2F9E68";
      bg = "rgba(47,158,104,.14)";
    }
    return [type, { icon, color, bg }];
  })
) as Record<ProductPageBlockType, { icon: string; color: string; bg: string }>;

export function productBlockMeta(type: ProductPageBlockType) {
  return PRODUCT_BLOCK_TYPE_META[type];
}

/** Ordre dans « Ajouter une section ». */
export const ADDABLE_MERCHANT_ORDER: ProductPageBlockType[] = [
  "description",
  "faq",
  "video",
  "benefits",
  "usage_tips",
  "reviews",
  "recommendations",
  "routine",
  "before_after",
  "live_viewers",
  "stock_alert",
  "reference",
  "variants",
  "quantity",
  "custom",
];
