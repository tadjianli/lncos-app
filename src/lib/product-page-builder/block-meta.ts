import type { ProductPageBlockType } from "./types";

export interface BlockVisualMeta {
  icon: string;
  color: string;
  bg: string;
}

export const PRODUCT_PAGE_BLOCK_META: Record<ProductPageBlockType, BlockVisualMeta> = {
  gallery: { icon: "camera", color: "#D4AF37", bg: "rgba(212,175,55,.16)" },
  product_info: { icon: "tag", color: "#E879A8", bg: "rgba(194,85,122,.16)" },
  variants: { icon: "grid", color: "#E879A8", bg: "rgba(194,85,122,.14)" },
  quantity: { icon: "plus", color: "#837C72", bg: "rgba(124,117,107,.14)" },
  reference: { icon: "info", color: "#837C72", bg: "rgba(124,117,107,.14)" },
  live_viewers: { icon: "eye", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  stock_alert: { icon: "bell", color: "#C77A33", bg: "rgba(199,122,51,.14)" },
  reviews_summary: { icon: "star", color: "#D4AF37", bg: "rgba(212,175,55,.14)" },
  benefits: { icon: "check", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  description: { icon: "info", color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
  usage_tips: { icon: "heart", color: "#E879A8", bg: "rgba(194,85,122,.14)" },
  video: { icon: "play", color: "#E879A8", bg: "rgba(194,85,122,.16)" },
  faq: { icon: "info", color: "#3B7DD8", bg: "rgba(59,125,216,.14)" },
  custom: { icon: "sparkle", color: "#D4AF37", bg: "rgba(212,175,55,.16)" },
  before_after: { icon: "camera", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
  reviews: { icon: "star", color: "#D4AF37", bg: "rgba(212,175,55,.14)" },
  routine: { icon: "heart", color: "#E879A8", bg: "rgba(194,85,122,.14)" },
  recommendations: { icon: "bag", color: "#E879A8", bg: "rgba(194,85,122,.14)" },
  sales_counter: { icon: "bolt", color: "#C77A33", bg: "rgba(199,122,51,.14)" },
  add_to_cart: { icon: "bag", color: "#E879A8", bg: "rgba(194,85,122,.18)" },
  trust_badges: { icon: "check", color: "#2F9E68", bg: "rgba(47,158,104,.14)" },
};

export function blockVisualMeta(type: ProductPageBlockType): BlockVisualMeta {
  return PRODUCT_PAGE_BLOCK_META[type] ?? {
    icon: "grid",
    color: "#837C72",
    bg: "rgba(124,117,107,.14)",
  };
}
