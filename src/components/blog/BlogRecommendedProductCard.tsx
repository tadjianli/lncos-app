"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { ProductImagePlaceholder } from "@/components/shared/ProductImagePlaceholder";
import type { Product } from "@/lib/data";
import {
  getProductStockLabel,
  getProductStorePath,
} from "@/lib/blog-products";
import { hasProductImage, resolveProductImage } from "@/lib/product-catalog";

interface BlogRecommendedProductCardProps {
  product: Product;
  onAdd: (p: Product) => void;
}

export function BlogRecommendedProductCard({
  product,
  onAdd,
}: BlogRecommendedProductCardProps) {
  const [popping, setPopping] = useState(false);
  const imgSrc = resolveProductImage(product);
  const showImage = hasProductImage(product) && imgSrc != null;
  const path = getProductStorePath(product);
  const stockLabel = getProductStockLabel(product);
  const outOfStock = product.stock <= 0;

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (outOfStock) return;
      onAdd(product);
      setPopping(true);
      setTimeout(() => setPopping(false), 500);
    },
    [onAdd, outOfStock, product]
  );

  return (
    <article className="blog-reco-card">
      <Link href={path} className="blog-reco-card__media">
        {showImage ? (
          <FadeImage
            src={imgSrc}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 480px) 72vw, 280px"
            style={{ objectFit: "cover" }}
            fallbackLabel={product.name}
          />
        ) : (
          <ProductImagePlaceholder label={product.name} />
        )}
        <span
          className={`blog-reco-card__stock${outOfStock ? " blog-reco-card__stock--out" : ""}`}
        >
          {stockLabel}
        </span>
      </Link>

      <div className="blog-reco-card__body">
        <Link href={path} className="blog-reco-card__name">
          {product.name}
        </Link>

        <div className="blog-reco-card__rating">
          <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="blog-reco-card__reviews">({product.reviews} avis)</span>
        </div>

        <div className="blog-reco-card__price-row">
          <span className="blog-reco-card__price">{product.price.toFixed(2)}&nbsp;€</span>
          {product.old != null ? (
            <span className="blog-reco-card__price-old">{product.old.toFixed(2)}&nbsp;€</span>
          ) : null}
        </div>

        <div className="blog-reco-card__actions">
          <button
            type="button"
            className={`blog-reco-card__add${popping ? " blog-reco-card__add--pop" : ""}`}
            onClick={handleAdd}
            disabled={outOfStock}
          >
            <Icon name="plus" size={15} color="#3a1020" stroke={2.4} />
            {outOfStock ? "Indisponible" : "Ajouter au panier"}
          </button>
          <Link href={path} className="blog-reco-card__view">
            Voir le produit
          </Link>
        </div>
      </div>
    </article>
  );
}
