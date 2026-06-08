"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import s from "./ReviewsSection.module.css";

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

/* ─── ReviewsSection ──────────────────────────────────────────────── */

export function ReviewsSection({ title = "Avis vérifiés" }: { title?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Track active card via scroll position */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const cardW = first.offsetWidth + 14; // card width + gap
      const idx = Math.round(el.scrollLeft / cardW);
      setActive(Math.max(0, Math.min(idx, REVIEWS.length - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const cardW = first.offsetWidth + 14;
    el.scrollTo({ left: i * cardW, behavior: "smooth" });
  }, []);

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

      {/* ── Carousel track ── */}
      <div ref={trackRef} className={s.track}>
        {REVIEWS.map((r) => (
          <article key={r.id} className={s.card}>
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
          </article>
        ))}
      </div>

      {/* ── Pagination dots ── */}
      <div className={s.dots} role="tablist" aria-label="Avis">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Avis ${i + 1}`}
            className={`${s.dot}${i === active ? ` ${s.active}` : ""}`}
            onClick={() => goTo(i)}
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
