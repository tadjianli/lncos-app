"use client";

import { useMemo } from "react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/shared/ProductCard";
import { FadeImage } from "@/components/shared/FadeImage";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import { Icon } from "@/components/shared/Icon";
import { resolveProductImage } from "@/lib/product-catalog";

interface ProductImageStorefrontPreviewProps {
  product: Product;
}

function CartLinePreview({ product }: { product: Product }) {
  const imgSrc = resolveProductImage(product, null, "thumb");
  const variant = product.variants[0] ?? "Standard";

  return (
    <div className="adm-sf-cart-row">
      <div className="adm-sf-cart-thumb">
        {imgSrc ? (
          <FadeImage src={imgSrc} alt={product.imageAlt ?? product.name} fill sizes="56px" style={{ objectFit: "cover" }} />
        ) : (
          <ProductImagePlaceholder label={product.name} />
        )}
      </div>
      <div className="adm-sf-cart-body">
        <div className="adm-sf-cart-name">{product.name}</div>
        <div className="adm-sf-cart-variant">{variant}</div>
        <div className="adm-sf-cart-footer">
          <span className="adm-sf-cart-price">{product.price.toFixed(2)} €</span>
          <div className="adm-sf-cart-qty">
            <span className="adm-sf-cart-qty-btn" aria-hidden>
              <Icon name="minus" size={11} />
            </span>
            <span>1</span>
            <span className="adm-sf-cart-qty-btn adm-sf-cart-qty-btn--plus" aria-hidden>
              <Icon name="plus" size={11} stroke={2.4} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductImageStorefrontPreview({ product }: ProductImageStorefrontPreviewProps) {
  const cardProduct = useMemo(() => ({ ...product, mainImageUrl: product.mainImageUrl ?? product.imageUrl ?? null }), [product]);
  const bestSellerProduct = useMemo(() => ({ ...cardProduct, tag: "Best-seller" as const }), [cardProduct]);

  const previews = [
    {
      id: "card",
      label: "Carte produit",
      node: <ProductCard p={cardProduct} layout="grid-2" priority />,
    },
    {
      id: "best",
      label: "Best Seller",
      node: <ProductCard p={bestSellerProduct} layout="grid-2" priority />,
    },
    {
      id: "fav",
      label: "Favoris",
      node: <ProductCard p={cardProduct} layout="grid-2" isFav priority />,
    },
    {
      id: "cart",
      label: "Panier",
      node: <CartLinePreview product={cardProduct} />,
    },
  ];

  return (
    <div className="adm-sf-preview-section">
      <div className="adm-form-section-title" style={{ marginTop: 0 }}>
        Aperçu réel
      </div>
      <p className="adm-form-section-desc" style={{ marginBottom: 12 }}>
        Rendu exact dans l&apos;application — mis à jour en temps réel.
      </p>
      <div className="adm-sf-preview adm-sf-preview-grid">
        {previews.map((item) => (
          <div key={item.id} className="adm-sf-preview-cell">
            <div className="adm-sf-preview-frame">{item.node}</div>
            <div className="adm-sf-preview-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
