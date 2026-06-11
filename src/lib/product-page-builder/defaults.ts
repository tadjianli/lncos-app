import type { ProductPageBlock, ProductPageBlockSettings, ProductPageBlockType } from "./types";
import { PRODUCT_PAGE_BLOCK_REGISTRY } from "./registry";

function blockId(type: ProductPageBlockType, suffix?: string): string {
  return `ppb-${type}${suffix ? `-${suffix}` : ""}`;
}

function defaultSettings(type: ProductPageBlockType): ProductPageBlockSettings {
  switch (type) {
    case "gallery":
      return { showTag: true };
    case "product_info":
      return { showBestSeller: true, showCategory: true, showStock: true };
    case "quantity":
      return { label: "Quantité" };
    case "video":
      return { autoplay: false };
    case "faq":
      return { items: [] };
    case "routine":
      return { title: "Complétez votre rituel" };
    case "reviews":
      return { title: "Avis clients" };
    case "recommendations":
      return { title: "Vous aimerez aussi", maxItems: 8 };
    case "add_to_cart":
      return { showPrice: true };
    case "custom":
      return { title: "Section", sectionType: "text", body: "" };
    default:
      return {};
  }
}

function makeBlock(
  type: ProductPageBlockType,
  position: number,
  id?: string
): ProductPageBlock {
  const schema = PRODUCT_PAGE_BLOCK_REGISTRY[type];
  return {
    id: id ?? blockId(type),
    type,
    title: schema.label,
    settings: defaultSettings(type),
    enabled: true,
    zone: schema.zone,
    position,
  };
}

export const DEFAULT_PRODUCT_PAGE_BLOCKS: ProductPageBlock[] = [
  makeBlock("gallery", 0, "ppb-gallery"),
  makeBlock("product_info", 1, "ppb-info"),
  makeBlock("stock_alert", 2, "ppb-stock-alert"),
  makeBlock("reviews_summary", 3, "ppb-reviews-summary"),
  makeBlock("reference", 4, "ppb-reference"),
  makeBlock("live_viewers", 5, "ppb-live-viewers"),
  makeBlock("variants", 6, "ppb-variants"),
  makeBlock("quantity", 7, "ppb-quantity"),
  makeBlock("benefits", 8, "ppb-benefits"),
  makeBlock("description", 9, "ppb-description"),
  makeBlock("usage_tips", 10, "ppb-usage-tips"),
  makeBlock("video", 11, "ppb-video"),
  makeBlock("faq", 12, "ppb-faq"),
  makeBlock("routine", 13, "ppb-routine"),
  makeBlock("before_after", 14, "ppb-before-after"),
  makeBlock("reviews", 15, "ppb-reviews"),
  makeBlock("recommendations", 16, "ppb-recommendations"),
  makeBlock("sales_counter", 0, "ppb-sales-counter"),
  makeBlock("add_to_cart", 1, "ppb-add-to-cart"),
  makeBlock("trust_badges", 2, "ppb-trust"),
];

export function newCustomBlock(position: number): ProductPageBlock {
  const suffix = `${Date.now().toString(36)}`;
  return {
    ...makeBlock("custom", position),
    id: blockId("custom", suffix),
    title: "Section personnalisée",
  };
}

export function createBlockOfType(type: ProductPageBlockType, position: number): ProductPageBlock {
  const suffix = Date.now().toString(36);
  return {
    ...makeBlock(type, position, `ppb-${type}-${suffix}`),
  };
}

export function reindexBlocks(blocks: ProductPageBlock[]): ProductPageBlock[] {
  const main = blocks.filter((b) => b.zone === "main");
  const sticky = blocks.filter((b) => b.zone === "sticky");
  const sort = (arr: ProductPageBlock[]) =>
    arr
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((b, i) => ({ ...b, position: i }));
  return [...sort(main), ...sort(sticky)];
}

export function blocksByZone(
  blocks: ProductPageBlock[],
  zone: ProductPageBlock["zone"]
): ProductPageBlock[] {
  return blocks
    .filter((b) => b.enabled && b.zone === zone)
    .sort((a, b) => a.position - b.position);
}

export function isBlockEnabled(
  blocks: ProductPageBlock[],
  type: ProductPageBlockType
): boolean {
  return blocks.some((b) => b.type === type && b.enabled);
}
