"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ─── Image background presets matching Claude Design ───────────────────── */
export const PRODUCT_BG = {
  pink:     "linear-gradient(160deg, #C8A0B8 0%, #EFBDD0 60%, #DDA8C0 100%)",
  pinkWarm: "linear-gradient(160deg, #C498B0 0%, #E8B4C8 60%, #D4A0BC 100%)",
  gold:     "linear-gradient(160deg, #C8A870 0%, #E0C890 60%, #D4B878 100%)",
  cream:    "linear-gradient(160deg, #D8C098 0%, #EDD8A8 60%, #E4CC98 100%)",
  rose:     "linear-gradient(160deg, #B89090 0%, #DDB0B0 60%, #C89898 100%)",
};

interface ProductGridCardProps {
  name: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  reviewCount?: number;
  tag?: string;
  tagVariant?: "limited" | "bestseller" | "flash" | "new";
  bgGradient?: string;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onAddToBag?: () => void;
  /** Product illustration slot (optional) */
  children?: React.ReactNode;
}

const TAG_STYLES: Record<string, string> = {
  limited:    "ÉDITION LIMITÉE",
  bestseller: "BEST-SELLER",
  flash:      "FLASH",
  new:        "NOUVEAU",
};

export function ProductGridCard({
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  tag,
  tagVariant = "limited",
  bgGradient = PRODUCT_BG.pink,
  isFavorited: initialFav = false,
  onAddToBag,
  children,
}: ProductGridCardProps) {
  const [fav, setFav] = useState(initialFav);

  return (
    <div
      className="rounded-[1.1rem] overflow-hidden flex flex-col"
      style={{ background: "#1E1812" }}
    >
      {/* Image area */}
      <div
        className="relative w-full flex items-end justify-center"
        style={{ background: bgGradient, aspectRatio: "1 / 1.05" }}
      >
        {/* Tag */}
        {tag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="text-[0.6rem] font-semibold tracking-[0.06em] text-white px-2.5 py-1 rounded-full"
              style={{ background: "rgba(42,38,38,0.90)" }}
            >
              {TAG_STYLES[tagVariant] ?? tag}
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={() => setFav((v) => !v)}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform duration-100"
          style={{ background: "rgba(42,38,38,0.88)" }}
          aria-label="Toggle favorite"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 12.5C7 12.5 1.5 9 1.5 5a3 3 0 016-0.4A3 3 0 0112.5 5c0 4-5.5 7.5-5.5 7.5z"
              fill={fav ? "#E898B8" : "none"}
              stroke={fav ? "#E898B8" : "rgba(255,255,255,0.7)"}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Product illustration */}
        {children ? (
          <div className="relative z-0 flex items-center justify-center h-full w-full pb-3">
            {children}
          </div>
        ) : (
          /* Placeholder silhouette */
          <div className="relative z-0 flex items-center justify-center w-full pb-4 pt-6">
            <div
              className="w-14 h-20 rounded-lg opacity-30"
              style={{ background: "rgba(0,0,0,0.35)" }}
            />
          </div>
        )}

        {/* Bottom shadow for card depth */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[rgba(0,0,0,0.18)] to-transparent" />
      </div>

      {/* Info area */}
      <div className="px-3 pt-3 pb-3 flex flex-col gap-1.5">
        <p className="text-[0.9rem] font-bold text-white leading-snug">{name}</p>

        {/* Stars */}
        {rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1l1.24 2.51L10 3.88 7.74 6.08l.52 3.04L6 7.78 3.74 9.12l.52-3.04L2 3.88l2.76-.37L6 1z"
                fill="#D4A820"
              />
            </svg>
            <span className="text-[0.75rem] font-medium text-white">{rating}</span>
            <span className="text-[0.7rem] text-[--cream-muted]">({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[1rem] font-bold text-white">{price}</span>
            {originalPrice && (
              <span className="text-[0.78rem] text-[--cream-muted] line-through">{originalPrice}</span>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={onAddToBag}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-[0.88] transition-transform duration-100"
            style={{ background: "#CC96AE" }}
            aria-label="Add to bag"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── LN COS Product Illustrations ─────────────────────────────────────── */

export function PerfumeBottle() {
  return (
    <div className="relative flex items-end justify-center w-full h-full py-4">
      <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
        {/* Cap */}
        <rect x="26" y="8" width="28" height="10" rx="4" fill="#C9A820" />
        <rect x="30" y="4" width="20" height="6" rx="3" fill="#B89010" />
        {/* Neck */}
        <rect x="33" y="18" width="14" height="8" rx="2" fill="#1A1510" />
        {/* Body */}
        <rect x="16" y="26" width="48" height="58" rx="8" fill="#111008" />
        {/* Label */}
        <rect x="22" y="40" width="36" height="28" rx="4" fill="#C9A820" opacity="0.9" />
        <text x="40" y="52" textAnchor="middle" fill="#1A1200" fontSize="9" fontWeight="bold" fontFamily="serif">L</text>
        <text x="40" y="62" textAnchor="middle" fill="#1A1200" fontSize="5" fontFamily="sans-serif">LN COS</text>
        {/* Shadow */}
        <ellipse cx="40" cy="88" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />
      </svg>
    </div>
  );
}

export function LipstickBottle() {
  return (
    <div className="relative flex items-end justify-center w-full h-full py-4">
      <svg width="50" height="110" viewBox="0 0 50 110" fill="none">
        {/* Lipstick tip */}
        <path d="M20 18 Q25 6 30 18" fill="#C04060" />
        {/* Upper tube */}
        <rect x="18" y="18" width="14" height="18" rx="2" fill="#C04060" />
        {/* Body */}
        <rect x="14" y="36" width="22" height="58" rx="6" fill="#C9A820" />
        {/* Label */}
        <rect x="17" y="52" width="16" height="22" rx="2" fill="rgba(255,255,255,0.15)" />
        <text x="25" y="62" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">L</text>
        <text x="25" y="70" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="4">LN COS</text>
        {/* Shadow */}
        <ellipse cx="25" cy="98" rx="14" ry="3" fill="rgba(0,0,0,0.2)" />
      </svg>
    </div>
  );
}

export function PaletteBox() {
  return (
    <div className="relative flex items-center justify-center w-full h-full py-4">
      <svg width="110" height="80" viewBox="0 0 110 80" fill="none">
        {/* Palette body */}
        <rect x="6" y="14" width="98" height="56" rx="6" fill="#1A1200" />
        {/* Top brand strip */}
        <rect x="6" y="14" width="98" height="12" rx="4" fill="#C9A820" />
        <text x="55" y="23" textAnchor="middle" fill="#1A1200" fontSize="6" fontWeight="bold" fontFamily="sans-serif">L — LN COS</text>
        {/* Pan grid: 6 pans 3×2 */}
        {[0,1,2,3,4,5].map((i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const colors = ["#C8A080","#D4B090","#B89070","#E0C0A0","#C0906A","#D0A878"];
          return (
            <rect key={i}
              x={16 + col * 30} y={32 + row * 20}
              width="24" height="14" rx="3"
              fill={colors[i]}
            />
          );
        })}
        {/* Shadow */}
        <ellipse cx="55" cy="73" rx="38" ry="4" fill="rgba(0,0,0,0.2)" />
      </svg>
    </div>
  );
}

export function OilBottle() {
  return (
    <div className="relative flex items-end justify-center w-full h-full py-4">
      <svg width="68" height="100" viewBox="0 0 68 100" fill="none">
        {/* Pump head */}
        <rect x="25" y="4" width="18" height="6" rx="3" fill="#C9A820" />
        <rect x="30" y="10" width="8" height="14" rx="2" fill="#C9A820" />
        {/* Pump nozzle */}
        <path d="M34 10 Q42 10 44 14" stroke="#C9A820" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Body */}
        <rect x="10" y="24" width="48" height="60" rx="10" fill="#E8D098" />
        {/* Shine */}
        <rect x="14" y="28" width="8" height="48" rx="4" fill="rgba(255,255,255,0.2)" />
        {/* Label */}
        <rect x="16" y="40" width="36" height="28" rx="4" fill="white" opacity="0.85" />
        <text x="34" y="52" textAnchor="middle" fill="#C9A820" fontSize="9" fontWeight="bold" fontFamily="serif">L</text>
        <text x="34" y="62" textAnchor="middle" fill="#888" fontSize="5" fontFamily="sans-serif">LN COS</text>
        {/* Shadow */}
        <ellipse cx="34" cy="88" rx="22" ry="4" fill="rgba(0,0,0,0.18)" />
      </svg>
    </div>
  );
}
