import type { Json } from "@/lib/database.types";
import type {
  DbProductPageBlock,
  ProductPageBlock,
  ProductPageBlockSettings,
  ProductPageBlockType,
  ProductPageZone,
} from "./types";
import { DEFAULT_PRODUCT_PAGE_BLOCKS } from "./defaults";

function parseSettings(raw: unknown): ProductPageBlockSettings {
  if (!raw || typeof raw !== "object") return {};
  return raw as ProductPageBlockSettings;
}

export function dbToProductPageBlock(row: DbProductPageBlock): ProductPageBlock {
  return {
    id: row.id,
    type: row.block_type as ProductPageBlockType,
    title: row.title,
    settings: parseSettings(row.settings),
    enabled: row.enabled,
    zone: (row.zone === "sticky" ? "sticky" : "main") as ProductPageZone,
    position: row.position,
  };
}

export function productPageBlockToDb(
  block: ProductPageBlock,
  isDraft: boolean,
  position: number
): DbProductPageBlock {
  return {
    id: block.id,
    block_type: block.type,
    title: block.title,
    settings: block.settings as Json,
    enabled: block.enabled,
    zone: block.zone,
    position,
    is_draft: isDraft,
  };
}

export function normalizeProductPageBlocks(raw: unknown): ProductPageBlock[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_PRODUCT_PAGE_BLOCKS.map((b) => ({ ...b }));
  }
  return raw
    .filter((item) => item && typeof item === "object")
    .map((item, index) => {
      const row = item as Record<string, unknown>;
      const type = row.type as ProductPageBlockType;
      return {
        id: typeof row.id === "string" ? row.id : `ppb-fallback-${index}`,
        type,
        title: typeof row.title === "string" ? row.title : type,
        settings: parseSettings(row.settings),
        enabled: row.enabled !== false,
        zone: row.zone === "sticky" ? "sticky" : "main",
        position: typeof row.position === "number" ? row.position : index,
      } satisfies ProductPageBlock;
    });
}

export function snapshotBlocks(blocks: ProductPageBlock[]): ProductPageBlock[] {
  return blocks.map((b) => ({
    ...b,
    settings: { ...b.settings, items: b.settings.items?.map((i) => ({ ...i })) },
  }));
}
