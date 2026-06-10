"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import { Icon } from "@/components/shared/Icon";
import { useStore } from "@/lib/store";
import { products } from "@/lib/data";

/* ─── Reel data ───────────────────────────────────────────────────────── */

const REELS = [
  {
    id: 1,
    img: "/assets/icon-192.png",
    title: "Rituel Éclat Parfait",
    creator: "@lncos_beaute",
    likes: "4.2K",
    saves: "1.8K",
    desc: "Notre sérum signature pour un teint lumineux en 7 jours ✨",
    product: { id: "serum-eclat", name: "Sérum Éclat Parfait", price: 49.90 },
    tag: "SOIN",
    progress: 0.42,
  },
  {
    id: 2,
    img: "/assets/icon-192.png",
    title: "Nuit d'Or — Le Parfum",
    creator: "@lncos_beaute",
    likes: "8.7K",
    saves: "3.1K",
    desc: "Une fragrance boisée envoûtante. L'essence du luxe.",
    product: { id: "parfum-noir", name: "Parfum Nuit d'Or", price: 79.90 },
    tag: "PARFUM",
    progress: 0.28,
  },
  {
    id: 3,
    img: "/assets/icon-192.png",
    title: "Rouge Matte Perfection",
    creator: "@lncos_beaute",
    likes: "6.3K",
    saves: "2.4K",
    desc: "La tenue ultime pour vos lèvres. 16h de confort.",
    product: { id: "rouge-mat", name: "Rouge à Lèvres Mat", price: 24.80 },
    tag: "MAQUILLAGE",
    progress: 0.65,
  },
  {
    id: 4,
    img: "/assets/icon-192.png",
    title: "Masque Argile Rose",
    creator: "@lncos_beaute",
    likes: "3.9K",
    saves: "1.2K",
    desc: "Pores affinés, teint purifié. Le rituel du vendredi.",
    product: { id: "masque-argile", name: "Masque Argile Rose", price: 34.90 },
    tag: "SOIN",
    progress: 0.18,
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function parseLikes(s: string): number {
  if (s.endsWith("K")) return Math.round(parseFloat(s) * 1000);
  return parseInt(s, 10);
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

/* ─── Tag chip ────────────────────────────────────────────────────────── */

function TagChip({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "5px 10px",
        background: "rgba(0,0,0,.50)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.15)",
        fontSize: 11,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────────────────── */

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(var(--safe-header-top) + 44px)",
        left: "max(16px, var(--safe-left))",
        right: "max(16px, var(--safe-right))",
        zIndex: 10,
        height: 2.5,
        background: "rgba(255,255,255,.25)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          background: "#fff",
          borderRadius: 2,
          animation: "reelProg 6s linear infinite",
          willChange: "width",
        }}
      />
    </div>
  );
}

/* ─── Action button ───────────────────────────────────────────────────── */

interface ActionBtnProps {
  icon: string;
  label: string;
  active?: boolean;
  activeColor?: string;
  onTap: () => void;
  popping?: boolean;
}

function ActionBtn({
  icon,
  label,
  active,
  activeColor = "#fff",
  onTap,
  popping,
}: ActionBtnProps) {
  return (
    <button
      onClick={onTap}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        willChange: "transform",
        transform: popping ? "scale(1.35)" : "scale(1)",
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <Icon
        name={icon}
        size={26}
        color={active ? activeColor : "#fff"}
        stroke={active ? 0 : 1.8}
      />
      <span
        style={{
          fontSize: 11,
          color: "#fff",
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Product tag card ────────────────────────────────────────────────── */

interface ProductTagProps {
  productRef: { id: string; name: string; price: number };
  img: string;
  onTap: () => void;
}

function ProductTag({ productRef, img, onTap }: ProductTagProps) {
  return (
    <button
      onClick={onTap}
      style={{
        position: "absolute",
        bottom: 108,
        left: 16,
        right: 80,
        zIndex: 10,
        background: "rgba(0,0,0,.60)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.15)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      {/* Product thumbnail */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#1A1A1A",
        }}
      >
        <FadeImage
          src={img}
          alt={productRef.name}
          width={40}
          height={40}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          fallbackLabel={productRef.name}
        />
      </div>

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "Montserrat, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {productRef.name}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#D4AF37",
            fontFamily: "Montserrat, sans-serif",
            marginTop: 2,
          }}
        >
          {productRef.price.toFixed(2)} €
        </div>
      </div>

      {/* Bag icon in gold circle */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#F0D98C 0%,#D4AF37 42%,#B8902B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 12px -4px rgba(212,175,55,.55)",
        }}
      >
        <Icon name="bag" size={14} color="#0A0A0A" stroke={2} />
      </div>
    </button>
  );
}

/* ─── Single reel card ────────────────────────────────────────────────── */

interface ReelCardProps {
  reel: (typeof REELS)[0];
  liked: boolean;
  saved: boolean;
  likeCount: number;
  saveCount: number;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onShop: () => void;
  onProduct: () => void;
  popLike: boolean;
  popSave: boolean;
}

function ReelCard({
  reel,
  liked,
  saved,
  likeCount,
  saveCount,
  onLike,
  onSave,
  onShare,
  onShop,
  onProduct,
  popLike,
  popSave,
}: ReelCardProps) {
  return (
    <div
      style={{
        height: "100dvh",
        scrollSnapAlign: "start",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        background: "#000",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "scale(1.02)",
          willChange: "transform",
        }}
      >
        <FadeImage
          src={reel.img}
          alt={reel.title}
          fill
          style={{ objectFit: "cover" }}
          fallbackLabel={reel.title}
        />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,.25) 0%, transparent 25%, transparent 45%, rgba(0,0,0,.70) 75%, rgba(0,0,0,.92) 100%)",
          zIndex: 1,
        }}
      />

      {/* Progress bar */}
      <ProgressBar progress={reel.progress} />

      {/* Tag chip — top right */}
      <div
        style={{
          position: "absolute",
          top: "var(--safe-header-top)",
          right: "max(16px, var(--safe-right))",
          zIndex: 10,
        }}
      >
        <TagChip label={reel.tag} />
      </div>

      {/* Play indicator overlay (center) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 5,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(0,0,0,.40)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="play" size={26} color="#fff" stroke={0} />
      </div>

      {/* Right action column */}
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 148,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          alignItems: "center",
        }}
      >
        <ActionBtn
          icon="heart"
          label={formatCount(likeCount)}
          active={liked}
          activeColor="#FF4D6D"
          onTap={onLike}
          popping={popLike}
        />
        <ActionBtn
          icon="star"
          label={formatCount(saveCount)}
          active={saved}
          activeColor="#D4AF37"
          onTap={onSave}
          popping={popSave}
        />
        <ActionBtn
          icon="send"
          label="Partager"
          onTap={onShare}
        />
        <ActionBtn
          icon="bag"
          label="Acheter"
          onTap={onShop}
        />
      </div>

      {/* Product tag card */}
      <ProductTag
        productRef={reel.product}
        img={reel.img}
        onTap={onProduct}
      />

      {/* Bottom info area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 72,
          bottom: 0,
          zIndex: 10,
          padding: "0 16px 32px",
        }}
      >
        {/* Creator row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "2px solid #D4AF37",
              background: "#1A1A1A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#D4AF37",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              @
            </span>
          </div>

          {/* Name */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {reel.creator}
          </span>

          {/* Suivre pill */}
          <button
            style={{
              padding: "5px 12px",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: "none",
              border: "1px solid rgba(255,255,255,.50)",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "Montserrat, sans-serif",
              letterSpacing: "0.05em",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation",
              flexShrink: 0,
            }}
          >
            Suivre
          </button>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "Montserrat, sans-serif",
            marginTop: 10,
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {reel.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.85)",
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 400,
            lineHeight: 1.45,
            marginTop: 6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {reel.desc}
        </div>
      </div>
    </div>
  );
}

/* ─── Dots indicator ──────────────────────────────────────────────────── */

function DotsIndicator({
  count,
  current,
}: {
  count: number;
  current: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 5,
            width: i === current ? 18 : 5,
            borderRadius: 999,
            background: i === current ? "#D4AF37" : "rgba(255,255,255,.40)",
            transition: "width 0.25s cubic-bezier(.22,.68,0,1), background 0.25s",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main ReelsScreen ────────────────────────────────────────────────── */

interface ReelsScreenProps {
  onClose?: () => void;
}

export function ReelsScreen({ onClose }: ReelsScreenProps) {
  const closeOverlay = useStore((s) => s.closeOverlay);
  const handleClose = onClose ?? closeOverlay;
  const openProduct = useStore((s) => s.openProduct);
  const showToast = useStore((s) => s.showToast);

  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>(
    () => Object.fromEntries(REELS.map((r) => [r.id, parseLikes(r.likes)]))
  );
  const [saveCounts, setSaveCounts] = useState<Record<number, number>>(
    () => Object.fromEntries(REELS.map((r) => [r.id, parseLikes(r.saves)]))
  );
  const [popLike, setPopLike] = useState<number | null>(null);
  const [popSave, setPopSave] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* Track current reel via scroll */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const idx = Math.round(el.scrollTop / h);
    setCurrent(Math.min(Math.max(idx, 0), REELS.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* Like handler */
  const handleLike = useCallback(
    (id: number) => {
      setLiked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          setLikeCounts((c) => ({ ...c, [id]: c[id] - 1 }));
        } else {
          next.add(id);
          setLikeCounts((c) => ({ ...c, [id]: c[id] + 1 }));
          setPopLike(id);
          setTimeout(() => setPopLike(null), 220);
        }
        return next;
      });
    },
    []
  );

  /* Save handler */
  const handleSave = useCallback(
    (id: number) => {
      setSaved((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          setSaveCounts((c) => ({ ...c, [id]: c[id] - 1 }));
        } else {
          next.add(id);
          setSaveCounts((c) => ({ ...c, [id]: c[id] + 1 }));
          setPopSave(id);
          setTimeout(() => setPopSave(null), 220);
        }
        return next;
      });
    },
    []
  );

  /* Share handler */
  const handleShare = useCallback(() => {
    showToast("Lien copié ! ✨");
  }, [showToast]);

  /* Open product from reels data */
  const handleOpenProduct = useCallback(
    (reelProduct: { id: string; name: string; price: number }) => {
      const found = products.find((p) => p.id === reelProduct.id);
      if (found) {
        openProduct(found);
      } else {
        showToast("Produit indisponible");
      }
    },
    [openProduct, showToast]
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 90,
        background: "#000",
        overflow: "hidden",
        animation: "sheetIn 0.42s cubic-bezier(0.22,0.68,0,1) both",
      }}
    >
      {/* Close button */}
      <div
        style={{
          position: "absolute",
          top: "var(--safe-header-top)",
          left: "max(16px, var(--safe-left))",
          zIndex: 120,
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="mobile-screen-header__back mobile-screen-header__back--floating"
          aria-label="Fermer"
        >
          <Icon name="x" size={20} color="#fff" stroke={2} />
        </button>
      </div>

      {/* Snap scroll container */}
      <div
        ref={scrollRef}
        className="noscroll"
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
      >
        {REELS.map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            liked={liked.has(reel.id)}
            saved={saved.has(reel.id)}
            likeCount={likeCounts[reel.id]}
            saveCount={saveCounts[reel.id]}
            onLike={() => handleLike(reel.id)}
            onSave={() => handleSave(reel.id)}
            onShare={handleShare}
            onShop={() => handleOpenProduct(reel.product)}
            onProduct={() => handleOpenProduct(reel.product)}
            popLike={popLike === reel.id}
            popSave={popSave === reel.id}
          />
        ))}
      </div>

      {/* Dots navigation indicator */}
      <DotsIndicator count={REELS.length} current={current} />
    </div>
  );
}
