"use client";

import { useState, memo, useCallback } from "react";
import { Icon } from "./Icon";
import { FadeImage } from "./FadeImage";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import type { Product } from "@/lib/data";
import { hasProductImage, resolveProductImage } from "@/lib/product-catalog";

interface ProductCardProps {
  p: Product;
  onOpen?: (p: Product) => void;
  onFav?: (id: string) => void;
  isFav?: boolean;
  onAdd?: (p: Product) => void;
  priority?: boolean;
  /** Grille boutique 2 colonnes — format premium */
  layout?: "default" | "grid-2" | "grid-3";
}

export const ProductCard = memo(function ProductCard({
  p,
  onOpen,
  onFav,
  isFav = false,
  onAdd,
  priority = false,
  layout = "default",
}: ProductCardProps) {
  const [pops, setPops] = useState<number[]>([]);
  const [popping, setPopping] = useState(false);
  const isBoutiqueGrid = layout === "grid-2" || layout === "grid-3";

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd?.(p);
    setPopping(true);
    setTimeout(() => setPopping(false), 500);
    const id = Date.now();
    setPops((list) => [...list, id]);
    setTimeout(() => setPops((list) => list.filter((x) => x !== id)), 900);
  }, [onAdd, p]);

  const imgSrc = resolveProductImage(p);
  const showImage = hasProductImage(p) && imgSrc != null;

  const favIconSize = layout === "grid-2" ? 15 : layout === "grid-3" ? 13 : 16;
  const starSize = layout === "grid-2" ? 11 : layout === "grid-3" ? 10 : 12;
  const plusSize = layout === "grid-2" ? 16 : layout === "grid-3" ? 14 : 16;
  const imageSizes =
    layout === "grid-2"
      ? "(max-width: 480px) 48vw, 190px"
      : layout === "grid-3"
        ? "(max-width: 480px) 31vw, 120px"
        : "(max-width: 480px) 180px, 190px";

  return (
    <div
      onClick={() => onOpen?.(p)}
      className={`prod-card snap${isBoutiqueGrid ? ` prod-card--${layout}` : ""}`}
    >
      <div className="prod-imgwrap">
        {showImage ? (
          <FadeImage
            src={imgSrc}
            alt={p.name}
            fill
            sizes={imageSizes}
            style={{ objectFit: "cover" }}
            fallbackLabel={p.name}
            priority={priority}
          />
        ) : (
          <ProductImagePlaceholder label={p.name} />
        )}

        {p.tag && (
          <span className={`prod-tag${p.tag === "Flash" ? " prod-tag--flash" : ""}`}>
            {p.tag}
          </span>
        )}

        <button
          type="button"
          className={`prod-fav-btn${isFav ? " prod-fav-btn--on" : ""}`}
          onClick={(e) => { e.stopPropagation(); onFav?.(p.id); }}
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFav}
        >
          <Icon
            name="heart"
            size={favIconSize}
            color={isFav ? "var(--pink)" : "#fff"}
            fill={isFav ? "var(--pink)" : "none"}
          />
        </button>
      </div>

      <div className="prod-card-info">
        <div className="prod-card-title">{p.name}</div>

        <div className="prod-card-rating">
          <Icon name="star" size={starSize} color="var(--gold)" fill="var(--gold)" />
          <span>{p.rating}</span>
          <span className="prod-card-reviews">({p.reviews})</span>
        </div>

        <div className="prod-card-price-row">
          <div className="prod-card-prices">
            <span className="prod-card-price">{p.price.toFixed(2)}&nbsp;€</span>
            {p.old != null && (
              <span className="prod-card-price-old">{p.old.toFixed(2)}&nbsp;€</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`prod-add prod-card-add${popping ? " pop" : ""}`}
            aria-label="Ajouter au panier"
          >
            <Icon name="plus" size={plusSize} color="#3a1020" stroke={2.4} />
            {pops.map((id) => (
              <span key={id} className="prod-plusone">
                +1
              </span>
            ))}
          </button>
        </div>
      </div>
    </div>
  );
});
