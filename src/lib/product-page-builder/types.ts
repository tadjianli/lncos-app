/**
 * LN COS — Product Page Builder
 * Layout global de la fiche produit (tous les produits du catalogue).
 */

import type { Json } from "@/lib/database.types";

export type ProductPageZone = "main" | "sticky";

export type ProductPageBlockType =
  | "gallery"
  | "product_info"
  | "variants"
  | "quantity"
  | "reference"
  | "live_viewers"
  | "stock_alert"
  | "reviews_summary"
  | "benefits"
  | "description"
  | "usage_tips"
  | "video"
  | "faq"
  | "custom"
  | "before_after"
  | "reviews"
  | "routine"
  | "recommendations"
  | "trust_badges"
  | "add_to_cart"
  | "sales_counter";

export interface ProductPageFaqItem {
  question: string;
  answer: string;
}

export interface ProductPageBlockSettings {
  showTag?: boolean;
  showBestSeller?: boolean;
  showCategory?: boolean;
  showStock?: boolean;
  label?: string;
  showPrice?: boolean;
  ctaLabel?: string;
  title?: string;
  maxItems?: number;
  autoplay?: boolean;
  videoUrl?: string;
  items?: ProductPageFaqItem[];
  body?: string;
  sectionType?: "text" | "list" | "steps";
  listItems?: string[];
}

export interface ProductPageBlock {
  id: string;
  type: ProductPageBlockType;
  title: string;
  settings: ProductPageBlockSettings;
  enabled: boolean;
  zone: ProductPageZone;
  position: number;
}

export interface ProductPageLayoutVersion {
  id: string;
  versionNumber: number;
  blocks: ProductPageBlock[];
  changeNote: string | null;
  createdAt: string;
}

export interface ProductPageLayoutMeta {
  publishedVersion: number;
  updatedAt: string;
}

export type ProductPageFieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "number"
  | "faq_list";

export interface ProductPageBlockFieldSchema {
  key: keyof ProductPageBlockSettings;
  label: string;
  type: ProductPageFieldType;
  placeholder?: string;
  helpText?: string;
}

export interface ProductPageBlockSchema {
  type: ProductPageBlockType;
  label: string;
  description: string;
  icon: string;
  zone: ProductPageZone;
  /** Blocs système non supprimables (galerie, CTA…) */
  locked?: boolean;
  fields: ProductPageBlockFieldSchema[];
}

export type DbProductPageBlock = {
  id: string;
  block_type: string;
  title: string;
  settings: Json;
  enabled: boolean;
  zone: string;
  position: number;
  is_draft: boolean;
};
