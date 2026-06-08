"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ─── Product surface presets — luxury editorial palette ────────────────── */
export const PRODUCT_BG = {
  // Dusty mauve — muted, not saturated pink
  mauve:      "linear-gradient(155deg, #B8929E 0%, #D4AABB 45%, #C4A0AC 100%)",
  // Warm champagne — nude/skin tone
  champagne:  "linear-gradient(155deg, #BCA888 0%, #D4BC98 50%, #CCAE88 100%)",
  // Warm amber gold — editorial warmth
  amber:      "linear-gradient(155deg, #B89858 0%, #D0B070 50%, #C8A860 100%)",
  // Soft nude — barely-there warmth
  nude:       "linear-gradient(155deg, #C0B0A0 0%, #D8C8B8 50%, #CCBCAC 100%)",
  // Moody charcoal — dark luxury contrast (for hero items)
  noir:       "linear-gradient(155deg, #1C1814 0%, #28201A 50%, #201A14 100%)",
  // Pale rose — only slightly warmer than nude
  rose:       "linear-gradient(155deg, #B8A0A8 0%, #D0B8C0 50%, #C4ACBA 100%)",
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
  onAddToBag?: () => void;
  children?: React.ReactNode;
}

const TAG_LABELS: Record<string, string> = {
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
  bgGradient = PRODUCT_BG.mauve,
  isFavorited: initialFav = false,
  onAddToBag,
  children,
}: ProductGridCardProps) {
  const [fav, setFav] = useState(initialFav);

  const isNoir = bgGradient === PRODUCT_BG.noir;

  return (
    <div
      className="rounded-[1.15rem] overflow-hidden flex flex-col"
      style={{ background: "#1C1812" }}
    >
      {/* ── Image zone ── */}
      <div
        className="relative w-full"
        style={{ background: bgGradient, aspectRatio: "3 / 3.5" }}
      >
        {/* Very subtle bottom depth fade */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[rgba(0,0,0,0.22)] to-transparent pointer-events-none" />

        {/* Tag */}
        {tag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="inline-block text-[0.58rem] font-semibold tracking-[0.07em] text-white px-2 py-[0.22rem] rounded-full leading-none"
              style={{ background: "rgba(28,24,18,0.86)" }}
            >
              {TAG_LABELS[tagVariant] ?? tag}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setFav((v) => !v)}
          className="absolute top-2.5 right-2.5 z-10 w-[1.75rem] h-[1.75rem] rounded-full flex items-center justify-center transition-transform duration-100 active:scale-[0.85]"
          style={{ background: "rgba(28,24,18,0.82)" }}
          aria-label="Favori"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 11.5C6.5 11.5 1.5 8.5 1.5 5a2.75 2.75 0 015.5-.35A2.75 2.75 0 0111.5 5c0 3.5-5 6.5-5 6.5z"
              fill={fav ? "#C9A96E" : "none"}
              stroke={fav ? "#C9A96E" : "rgba(255,255,255,0.65)"}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Product illustration */}
        {children ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        ) : (
          /* Tasteful placeholder — slim bottle shape */
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-[4.5rem] rounded-lg"
              style={{
                background: isNoir
                  ? "rgba(201,169,110,0.12)"
                  : "rgba(0,0,0,0.18)",
                boxShadow: isNoir
                  ? "0 0 20px rgba(201,169,110,0.08)"
                  : "none",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Info zone ── */}
      <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-1.5">
        <p className="text-[0.875rem] font-bold text-white leading-snug tracking-[-0.01em]">
          {name}
        </p>

        {/* Stars + count */}
        {rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M5.5 1l1.1 2.3 2.5.36-1.8 1.76.43 2.48L5.5 6.65 3.27 7.9l.43-2.48L2 3.66l2.5-.36z"
                fill="#C9A96E"
              />
            </svg>
            <span className="text-[0.72rem] font-semibold text-white">{rating}</span>
            <span className="text-[0.68rem] text-[#666058]">({reviewCount})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[0.95rem] font-bold text-white">{price}</span>
            {originalPrice && (
              <span className="text-[0.72rem] text-[#5A5550] line-through">{originalPrice}</span>
            )}
          </div>

          {/* Add to bag — gold on noir, pink-nude otherwise */}
          <button
            onClick={onAddToBag}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-100 active:scale-[0.86]"
            style={{
              background: isNoir ? "#C9A96E" : "#C09AAE",
            }}
            aria-label="Ajouter au panier"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 2.5v8M2.5 6.5h8"
                stroke={isNoir ? "#1C1812" : "white"}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG Product Illustrations ─────────────────────────────────────────── */

export function PerfumeBottle() {
  return (
    <svg width="72" height="96" viewBox="0 0 72 96" fill="none">
      {/* Cap */}
      <rect x="24" y="7" width="24" height="9" rx="3.5" fill="#C9A820" opacity="0.9" />
      <rect x="28" y="3" width="16" height="6" rx="3" fill="#B89018" opacity="0.85" />
      {/* Neck */}
      <rect x="31" y="16" width="10" height="7" rx="2" fill="rgba(28,24,18,0.85)" />
      {/* Body */}
      <rect x="13" y="23" width="46" height="56" rx="9" fill="rgba(18,14,8,0.9)" />
      {/* Label */}
      <rect x="19" y="36" width="34" height="26" rx="4" fill="#C9A820" opacity="0.88" />
      <text x="36" y="48" textAnchor="middle" fill="rgba(18,14,0,0.9)" fontSize="10" fontWeight="700" fontFamily="Georgia, serif">L</text>
      <text x="36" y="57" textAnchor="middle" fill="rgba(18,14,0,0.7)" fontSize="5" letterSpacing="1" fontFamily="sans-serif">LN COS</text>
      {/* Shine */}
      <rect x="17" y="26" width="5" height="48" rx="2.5" fill="rgba(255,255,255,0.06)" />
      {/* Shadow */}
      <ellipse cx="36" cy="82" rx="20" ry="3.5" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export function LipstickBottle() {
  return (
    <svg width="44" height="104" viewBox="0 0 44 104" fill="none">
      {/* Bullet */}
      <path d="M17 20 Q22 7 27 20" fill="#B83858" />
      {/* Upper tube */}
      <rect x="16" y="20" width="12" height="16" rx="1.5" fill="#C04068" />
      {/* Body */}
      <rect x="12" y="36" width="20" height="56" rx="6" fill="#C9A820" />
      {/* Label window */}
      <rect x="15" y="50" width="14" height="20" rx="2" fill="rgba(255,255,255,0.12)" />
      <text x="22" y="61" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="8" fontWeight="700" fontFamily="Georgia, serif">L</text>
      <text x="22" y="68" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="4" letterSpacing="0.5" fontFamily="sans-serif">LN COS</text>
      {/* Shine */}
      <rect x="13" y="38" width="4" height="50" rx="2" fill="rgba(255,255,255,0.10)" />
      {/* Shadow */}
      <ellipse cx="22" cy="95" rx="12" ry="2.5" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function PaletteBox() {
  return (
    <svg width="108" height="76" viewBox="0 0 108 76" fill="none">
      {/* Body */}
      <rect x="4" y="12" width="100" height="54" rx="6" fill="rgba(18,14,8,0.88)" />
      {/* Brand band */}
      <rect x="4" y="12" width="100" height="11" rx="4" fill="#C9A820" opacity="0.88" />
      <text x="54" y="21" textAnchor="middle" fill="rgba(18,14,0,0.85)" fontSize="6" fontWeight="600" letterSpacing="1.5" fontFamily="sans-serif">L N  C O S</text>
      {/* Pans — 3×2 grid */}
      {[0,1,2,3,4,5].map((i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const fills = ["#C8A882","#D4B892","#B88A68","#DECA9A","#C09070","#CCA878"];
        return (
          <rect
            key={i}
            x={14 + col * 30} y={30 + row * 18}
            width="24" height="12" rx="2.5"
            fill={fills[i]}
          />
        );
      })}
      {/* Shadow */}
      <ellipse cx="54" cy="69" rx="36" ry="3.5" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

export function OilBottle() {
  return (
    <svg width="62" height="96" viewBox="0 0 62 96" fill="none">
      {/* Pump head */}
      <rect x="22" y="3" width="18" height="5" rx="2.5" fill="#C9A820" opacity="0.88" />
      <rect x="28" y="8" width="6" height="12" rx="2" fill="#C9A820" opacity="0.88" />
      {/* Nozzle */}
      <path d="M31 8 Q40 8 42 13" stroke="#C9A820" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Body */}
      <rect x="8" y="20" width="46" height="62" rx="10" fill="#D4C090" opacity="0.9" />
      {/* Shine */}
      <rect x="11" y="23" width="7" height="54" rx="3.5" fill="rgba(255,255,255,0.18)" />
      {/* Label */}
      <rect x="13" y="36" width="36" height="26" rx="4" fill="rgba(255,255,255,0.82)" />
      <text x="31" y="48" textAnchor="middle" fill="#C9A820" fontSize="10" fontWeight="700" fontFamily="Georgia, serif">L</text>
      <text x="31" y="57" textAnchor="middle" fill="#888" fontSize="5" letterSpacing="0.5" fontFamily="sans-serif">LN COS</text>
      {/* Shadow */}
      <ellipse cx="31" cy="85" rx="20" ry="3" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}
