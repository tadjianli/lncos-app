"use client";
/**
 * LN COS — Sélecteur de variantes premium (teintes / contenances)
 * Swatches visuels avec image Supabase + mise à jour instantanée
 */

import { FadeImage } from "@/components/shared/FadeImage";
import type { Product } from "@/lib/data";
import {
  effectiveStock,
  findVariantByName,
  hasRichVariants,
  resolveProductImage,
  variantLabels,
} from "@/lib/product-catalog";

interface VariantSwatchesProps {
  product: Product;
  selectedName: string;
  onSelect: (name: string) => void;
}

export function VariantSwatches({ product, selectedName, onSelect }: VariantSwatchesProps) {
  const labels = variantLabels(product);
  if (labels.length === 0) return null;

  const rich = hasRichVariants(product);
  const showSwatches = rich && product.productVariants!.some((v) => v.imageUrl);

  return (
    <div className="pd-variants">
      <div className="pd-variants-head">
        <span className="pd-variants-label">{rich ? "Teinte" : "Contenance"}</span>
        <span className="pd-variants-selected">{selectedName}</span>
      </div>

      {showSwatches ? (
        <div className="pd-swatch-grid" role="listbox" aria-label="Choisir une teinte">
          {product.productVariants!.map((v) => {
            const selected = selectedName === v.name;
            const stock = effectiveStock(product, v);
            const out = stock <= 0;
            const img = resolveProductImage(product, v);

            return (
              <button
                key={v.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={out}
                className={`pd-swatch${selected ? " is-selected" : ""}${out ? " is-out" : ""}`}
                onClick={() => onSelect(v.name)}
                title={out ? `${v.name} — rupture` : v.name}
              >
                <span className="pd-swatch-ring">
                  <span className="pd-swatch-img">
                    <FadeImage
                      src={img}
                      alt={v.name}
                      fill
                      sizes="56px"
                      style={{ objectFit: "cover" }}
                      unoptimized={img.includes("supabase.co")}
                    />
                  </span>
                </span>
                <span className="pd-swatch-name">{v.name}</span>
                {out && <span className="pd-swatch-out">Épuisé</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="pd-variant-pills">
          {labels.map((name) => {
            const variant = findVariantByName(product, name);
            const out = variant ? effectiveStock(product, variant) <= 0 : false;
            return (
              <button
                key={name}
                type="button"
                className={`pd-variant-pill${selectedName === name ? " is-selected" : ""}${out ? " is-out" : ""}`}
                onClick={() => onSelect(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
