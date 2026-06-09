"use client";

import { useState, memo, useCallback } from "react";
import { Icon } from "./Icon";
import { FadeImage } from "./FadeImage";
import type { Product } from "@/lib/data";

interface ProductCardProps {
  p: Product;
  onOpen?: (p: Product) => void;
  onFav?: (id: string) => void;
  isFav?: boolean;
  onAdd?: (p: Product) => void;
  wide?: boolean;
  priority?: boolean;
}

export const ProductCard = memo(function ProductCard({
  p,
  onOpen,
  onFav,
  isFav = false,
  onAdd,
  wide = false,
  priority = false,
}: ProductCardProps) {
  const [pops, setPops] = useState<number[]>([]);
  const [popping, setPopping] = useState(false);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd?.(p);
    setPopping(true);
    setTimeout(() => setPopping(false), 500);
    const id = Date.now();
    setPops((list) => [...list, id]);
    setTimeout(() => setPops((list) => list.filter((x) => x !== id)), 900);
  }, [onAdd, p]);

  const imgSrc = `/assets/products/${p.id}.png`;
  const initials = p.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={() => onOpen?.(p)}
      className={`prod-card snap${wide ? " prod-card--wide" : ""}`}
    >
      <div className={`prod-imgwrap${wide ? " prod-imgwrap--wide" : ""}`}>
        <div className="prod-img-fallback" aria-hidden>
          {initials}
        </div>
        <FadeImage
          src={imgSrc}
          alt={p.name}
          fill
          sizes={wide ? "(max-width: 480px) 50vw, 240px" : "(max-width: 480px) 42vw, 164px"}
          style={{ objectFit: "cover" }}
          fallbackLabel={p.name}
          priority={priority}
        />

        {p.tag && (
          <span className={`prod-tag${p.tag === "Flash" ? " prod-tag--flash" : ""}`}>
            {p.tag}
          </span>
        )}

        <button
          type="button"
          className="prod-fav-btn"
          onClick={(e) => { e.stopPropagation(); onFav?.(p.id); }}
          aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Icon
            name="heart"
            size={16}
            color={isFav ? "var(--pink)" : "#fff"}
            fill={isFav ? "var(--pink)" : "none"}
          />
        </button>
      </div>

      <div className="prod-card-info">
        <div className="prod-card-title">{p.name}</div>

        <div className="prod-card-rating">
          <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" />
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
            <Icon name="plus" size={16} color="#3a1020" stroke={2.4} />
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
