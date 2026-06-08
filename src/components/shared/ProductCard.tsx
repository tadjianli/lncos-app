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

  return (
    <div
      onClick={() => onOpen?.(p)}
      className="prod-card"
      style={{
        flex: wide ? "1 1 0" : "0 0 150px",
        width: wide ? "auto" : 150,
        cursor: "pointer",
        background: "var(--charcoal)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.05)",
      }}
    >
      {/* Image area */}
      <div
        className="prod-imgwrap"
        style={{
          height: wide ? 150 : 140,
          position: "relative",
          background: "#181818",
          overflow: "hidden",
        }}
      >
        <FadeImage
          src={imgSrc}
          alt={p.name}
          fill
          sizes="(max-width: 480px) 50vw, 150px"
          style={{ objectFit: "cover" }}
          fallbackLabel={p.name}
          priority={priority}
        />

        {/* Tag */}
        {p.tag && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "4px 9px",
              borderRadius: "var(--r-pill)",
              background: p.tag === "Flash" ? "var(--gold-grad)" : "rgba(0,0,0,.55)",
              backdropFilter: "blur(6px)",
              color: p.tag === "Flash" ? "#1a1306" : "var(--pink)",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              border: p.tag === "Flash" ? "none" : "1px solid rgba(247,198,215,.25)",
            }}
          >
            {p.tag}
          </span>
        )}

        {/* Fav */}
        <button
          onClick={(e) => { e.stopPropagation(); onFav?.(p.id); }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,.45)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon
            name="heart"
            size={16}
            color={isFav ? "var(--pink)" : "#fff"}
            fill={isFav ? "var(--pink)" : "none"}
          />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "11px 12px 13px" }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 33,
          }}
        >
          {p.name}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "6px 0 9px" }}>
          <Icon name="star" size={12} color="var(--gold)" fill="var(--gold)" />
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.rating}</span>
          <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>({p.reviews})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              {p.price.toFixed(2)} €
            </span>
            {p.old && (
              <span style={{ fontSize: 11, color: "var(--ink-mute)", textDecoration: "line-through" }}>
                {p.old.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`prod-add${popping ? " pop" : ""}`}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--pink-grad)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
              position: "relative",
            }}
          >
            <Icon name="plus" size={16} color="#3a1020" stroke={2.4} />
            {pops.map((id) => (
              <span key={id} className="prod-plusone" style={{ right: 4, top: -6 }}>
                +1
              </span>
            ))}
          </button>
        </div>
      </div>
    </div>
  );
});
