"use client";

import { useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  MotionValue,
} from "framer-motion";
import { Icon } from "@/components/shared/Icon";
import s from "./ReviewsSection.module.css";

/* ─── Constants ──────────────────────────────────────────────────── */

const CARD_WIDTH = 282;
const GAP = 14;
const CARD_STEP = CARD_WIDTH + GAP;

/* ─── Static review data ──────────────────────────────────────────── */

const REVIEWS = [
  {
    id: "r1",
    name: "Margaux L.",
    initials: "ML",
    avatarGrad: "linear-gradient(135deg, #C2A95A 0%, #8B6914 100%)",
    rating: 5,
    date: "Il y a 2 jours",
    text: "Ce sérum a complètement transformé mon teint en trois semaines. La texture est incomparable — soyeuse, absorbée instantanément. Je ne peux plus m'en passer.",
    product: "Sérum Éclat",
  },
  {
    id: "r2",
    name: "Diane K.",
    initials: "DK",
    avatarGrad: "linear-gradient(135deg, #C47A9A 0%, #8B3060 100%)",
    rating: 5,
    date: "Il y a 5 jours",
    text: "LN COS comprend que le luxe est dans les détails. Du packaging à la fragrance, chaque élément est intentionnel. Un vrai soin haut de gamme.",
    product: "Parfum Noir",
  },
  {
    id: "r3",
    name: "Isabelle R.",
    initials: "IR",
    avatarGrad: "linear-gradient(135deg, #7A9EC4 0%, #2B5A8B 100%)",
    rating: 5,
    date: "Il y a 1 semaine",
    text: "La collection nocturne est devenue mon rituel du soir. Je me réveille avec un éclat qu'il me fallait autrefois toute une routine de maquillage pour obtenir.",
    product: "Crème Nuit",
  },
  {
    id: "r4",
    name: "Camille D.",
    initials: "CD",
    avatarGrad: "linear-gradient(135deg, #9EC47A 0%, #4A8B2B 100%)",
    rating: 5,
    date: "Il y a 2 semaines",
    text: "L'huile démaquillante est une révélation. Ma peau n'a jamais été aussi douce et lumineuse. Le parfum d'amande vanillée est absolument divin.",
    product: "Huile Démaq.",
  },
  {
    id: "r5",
    name: "Sophie M.",
    initials: "SM",
    avatarGrad: "linear-gradient(135deg, #C4A07A 0%, #8B5A2B 100%)",
    rating: 5,
    date: "Il y a 3 semaines",
    text: "Le masque purifiant est mon coup de cœur absolu. En 20 minutes les pores sont resserrés, le teint unifié. Résultat professionnel à la maison.",
    product: "Masque Purifiant",
  },
];

/* ─── Spring / easing configs ─────────────────────────────────────── */

const SNAP_SPRING    = { type: "spring" as const, stiffness: 300,  damping: 35, mass: 0.8 };
const CARD_SPRING    = { type: "spring" as const, stiffness: 400,  damping: 40 };
const DOT_SPRING     = { type: "spring" as const, stiffness: 500,  damping: 30 };
const ENTRANCE_EASE  = [0.22, 1, 0.36, 1] as const;

/* ─── Filled star ─────────────────────────────────────────────────── */

function Star({ dim }: { dim?: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={dim ? "rgba(212,175,55,.18)" : "var(--gold)"}
      stroke="none"
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}

/* ─── ReviewCard ── extracted so hooks are always called at component top ── */

interface ReviewCardProps {
  review: (typeof REVIEWS)[number];
  index: number;
  isActive: boolean;
  trackX: MotionValue<number>;
  prefersReduced: boolean | null;
}

function ReviewCard({ review: r, index: i, isActive, trackX, prefersReduced }: ReviewCardProps) {
  /* Parallax: card interior shifts ±8px as the draggable track moves */
  const parallaxX = useTransform(
    trackX,
    [-(i + 1) * CARD_STEP, -i * CARD_STEP, -(i - 1) * CARD_STEP],
    [8, 0, -8]
  );

  return (
    <motion.article
      className={s.card}
      style={{ backfaceVisibility: "hidden" }}
      /* Entrance animation triggered when card enters viewport */
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={
        prefersReduced
          ? { duration: 0.3 }
          : { delay: i * 0.06, duration: 0.4, ease: ENTRANCE_EASE }
      }
      /* Active/inactive focus state — spring-animated */
      animate={
        prefersReduced
          ? { opacity: isActive ? 1 : 0.72 }
          : {
              scale:   isActive ? 1    : 0.96,
              opacity: isActive ? 1    : 0.72,
              filter:  isActive ? "brightness(1)" : "brightness(0.85)",
            }
      }
      /* Override the entrance transition for the animate (focus) state */
      // @ts-ignore — framer-motion supports per-prop transitions via variants; direct override below:
    >
      {/* Parallax inner wrapper — subtle depth on drag */}
      <motion.div
        className={s.cardInner}
        style={prefersReduced ? undefined : { x: parallaxX }}
        transition={CARD_SPRING}
      >
        {/* Corner glow */}
        <div className={s.cardGlow} />

        {/* Avatar · name · date */}
        <div className={s.cardHead}>
          <div className={s.avatar} style={{ background: r.avatarGrad }}>
            {r.initials}
          </div>
          <div className={s.cardIdentity}>
            <div className={s.authorName}>{r.name}</div>
            <div className={s.verified}>
              <Icon name="check" size={8} color="#1A1612" stroke={2.8} />
              Vérifié
            </div>
          </div>
          <span className={s.date}>{r.date}</span>
        </div>

        {/* Stars */}
        <div className={s.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} dim={n > r.rating} />
          ))}
        </div>

        {/* Review body */}
        <p className={s.text}>{r.text}</p>

        {/* Product pill */}
        <div className={s.productPill}>
          <Icon name="tag" size={10} color="var(--gold)" />
          {r.product}
        </div>
      </motion.div>
    </motion.article>
  );
}

/* ─── ReviewsSection ──────────────────────────────────────────────── */

export function ReviewsSection({ title = "Avis vérifiés" }: { title?: string }) {
  const prefersReduced = useReducedMotion();
  const [active, setActive] = useState(0);

  /* The x MotionValue drives the draggable track position */
  const x = useMotionValue(0);

  /* Snap to a specific card index with spring physics */
  const snapTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, REVIEWS.length - 1));
      setActive(clamped);
      animate(x, -clamped * CARD_STEP, SNAP_SPRING);
    },
    [x]
  );

  /* On drag end: compute nearest snap index and animate there */
  const onDragEnd = useCallback(() => {
    const rawIndex = -x.get() / CARD_STEP;
    snapTo(Math.round(rawIndex));
  }, [x, snapTo]);

  /* Hard drag bounds: cannot drag past first or last card */
  const dragConstraints = {
    left:  -(REVIEWS.length - 1) * CARD_STEP,
    right: 0,
  };

  return (
    <div className={s.section}>
      {/* Ambient gold glow */}
      <div className={s.ambientGlow} />

      {/* ── Section header ── */}
      <div className={s.head}>
        <div className={s.eyebrow}>
          <Icon name="sparkle" size={12} color="var(--gold)" />
          ELLES ADORENT
        </div>
        <h3 className={s.title}>{title}</h3>

        {/* Global rating block */}
        <div className={s.ratingGlobal}>
          <div className={s.ratingStarsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} width="15" height="15" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            ))}
          </div>
          <span className={s.globalScore}>4.8</span>
          <span className={s.globalSep}>·</span>
          <span className={s.globalCount}>1&nbsp;248 avis</span>
        </div>
      </div>

      {/* ── Carousel viewport (clips overflow) ── */}
      <div className={s.viewport}>
        {/* Draggable flex track */}
        <motion.div
          className={s.track}
          style={{ x, willChange: "transform" }}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          dragMomentum={true}
          onDragEnd={onDragEnd}
        >
          {REVIEWS.map((r, i) => (
            <ReviewCard
              key={r.id}
              review={r}
              index={i}
              isActive={i === active}
              trackX={x}
              prefersReduced={prefersReduced}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Pagination dots — spring-animated width ── */}
      <div className={s.dots} role="tablist" aria-label="Avis">
        {REVIEWS.map((_, i) => (
          <motion.button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Avis ${i + 1}`}
            className={s.dot}
            animate={{
              width:      i === active ? 20 : 6,
              background: i === active ? "var(--gold)" : "var(--charcoal-3)",
            }}
            transition={DOT_SPRING}
            onClick={() => snapTo(i)}
            style={{ backfaceVisibility: "hidden" }}
          />
        ))}
      </div>

      {/* ── Swipe hint ── */}
      <div className={s.hint}>
        <Icon name="chevR" size={11} color="var(--ink-mute)" />
        Glissez pour parcourir les avis
      </div>
    </div>
  );
}
