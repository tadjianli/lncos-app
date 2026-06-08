"use client";

/* ============================================================
   LN COS — Avis · CARROUSEL CENTRÉ "COVERFLOW" (Apple TV / visionOS)
   Ported from Claude Design handoff · all motion values preserved exactly
   ============================================================ */

import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/shared/Icon";
import s from "./ReviewsSection.module.css";

/* ---------- Data ---------- */

interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  product?: string;
  service?: string;
  staff?: string;
  verified?: boolean;
  featured?: boolean;
  pinned?: boolean;
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Margaux L.",
    rating: 5,
    date: "Il y a 2 jours",
    text: "Ce sérum a complètement transformé mon teint en trois semaines. La texture est incomparable — soyeuse, absorbée instantanément. Je ne peux plus m'en passer.",
    product: "Sérum Éclat",
    verified: true,
    pinned: true,
  },
  {
    id: "r2",
    name: "Diane K.",
    rating: 5,
    date: "Il y a 5 jours",
    text: "LN COS comprend que le luxe est dans les détails. Du packaging à la fragrance, chaque élément est intentionnel. Un vrai soin haut de gamme.",
    product: "Parfum Noir",
    verified: true,
    featured: true,
  },
  {
    id: "r3",
    name: "Isabelle R.",
    rating: 5,
    date: "Il y a 1 semaine",
    text: "La collection nocturne est devenue mon rituel du soir. Je me réveille avec un éclat qu'il me fallait autrefois toute une routine de maquillage pour obtenir.",
    product: "Crème Nuit",
    verified: true,
  },
  {
    id: "r4",
    name: "Camille D.",
    rating: 5,
    date: "Il y a 2 semaines",
    text: "L'huile démaquillante est une révélation. Ma peau n'a jamais été aussi douce et lumineuse. Le parfum d'amande vanillée est absolument divin.",
    product: "Huile Démaq.",
    verified: true,
  },
  {
    id: "r5",
    name: "Sophie M.",
    rating: 5,
    date: "Il y a 3 semaines",
    text: "Le masque purifiant est mon coup de cœur absolu. En 20 minutes les pores sont resserrés, le teint unifié. Résultat professionnel à la maison.",
    product: "Masque Purifiant",
    verified: true,
  },
];

/* Pinned/featured cards appear first — same ordering as handoff */
const LIST = [...REVIEWS].sort(
  (a, b) => (b.pinned ? 2 : b.featured ? 1 : 0) - (a.pinned ? 2 : a.featured ? 1 : 0)
);

/* ---------- Skeleton ---------- */

function RevSkeleton({ className }: { className?: string }) {
  return (
    <div className={`${s.inner} ${s.sk} ${className ?? ""}`}>
      <div className={s.head}>
        <span className={s.skBox} style={{ width: 46, height: 46, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <span className={s.skBox} style={{ width: "55%", height: 13, marginBottom: 9 }} />
          <span className={s.skBox} style={{ width: "40%", height: 10 }} />
        </div>
      </div>
      <span className={s.skBox} style={{ width: "100%", height: 12, marginTop: 22 }} />
      <span className={s.skBox} style={{ width: "92%", height: 12, marginTop: 11 }} />
      <span className={s.skBox} style={{ width: "78%", height: 12, marginTop: 11 }} />
      <span className={s.skBox} style={{ width: 130, height: 26, marginTop: 22, borderRadius: 999 }} />
    </div>
  );
}

/* ---------- Card content ---------- */

function RevCardContent({ r }: { r: Review }) {
  const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hasPhoto = false; // no photo URLs in static data
  return (
    <div className={s.inner}>
      <span className={s.edge} />

      <div className={s.head}>
        <span className={s.av}>
          {initials}
          <span className={s.avRing} />
        </span>
        <div className={s.headMain}>
          <div className={s.name}>
            {r.name}
            {r.verified && (
              <span className={s.verif} title="Achat vérifié">
                <Icon name="check" size={9} stroke={3} />
              </span>
            )}
          </div>
          <div className={s.stars}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24"
                fill={i < r.rating ? "var(--gold)" : "rgba(255,255,255,.16)"}
                stroke="none">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            ))}
            <span className={s.date}>{r.date}</span>
          </div>
        </div>
      </div>

      <p className={`${s.text}${hasPhoto ? " " + s.textShort : ""}`}>{r.text}</p>

      <div className={s.foot}>
        {r.product && (
          <span className={`${s.chip} ${s.chipProd}`}>
            <Icon name="bag" size={12} /> {r.product}
          </span>
        )}
        {r.service && (
          <span className={`${s.chip} ${s.chipRdv}`}>
            <Icon name="calendar" size={12} /> {r.service}{r.staff ? ` · ${r.staff}` : ""}
          </span>
        )}
        {!r.product && !r.service && (
          <span className={`${s.chip} ${s.chipProd}`}>
            <Icon name="sparkle" size={12} /> Cliente vérifiée
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Carrousel coverflow ---------- */

export function ReviewsSection({ title = "Avis vérifiés" }: { title?: string }) {
  const len = LIST.length;
  const avg = LIST.reduce((sum, r) => sum + r.rating, 0) / len;

  /* continuous active index — wraps infinitely */
  const [active, setActive] = useState(0);
  /* live drag offset in card units */
  const [drag, setDrag] = useState(0);
  /* viewport width for responsive cardW */
  const [vw, setVw] = useState(360);
  /* skeleton loading state */
  const [loading, setLoading] = useState(true);

  const vpRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, id: -1, sx: 0, lastUnit: 0, vel: 0 });
  const hoverRef = useRef(false);

  /* Measure viewport width */
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const set = () => setVw(el.clientWidth || 360);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Skeleton delay — 650ms exactly as handoff */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  /* Autoplay — 5200ms exactly as handoff, pauses on hover/drag */
  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      if (!hoverRef.current && !dragRef.current.active) {
        setActive((a) => a + 1);
      }
    }, 5200);
    return () => clearInterval(t);
  }, [loading]);

  /* Responsive card width — Math.min(288, Math.round(vw * 0.75)) */
  const cardW = Math.min(288, Math.round(vw * 0.75));
  /* spacing between card centres — cardW * 0.79 */
  const SP = cardW * 0.79;

  /* ---- pointer drag handlers ---- */
  const onDown = (e: React.PointerEvent) => {
    dragRef.current = { active: true, id: e.pointerId, sx: e.clientX, lastUnit: 0, vel: 0 };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active || d.id !== e.pointerId) return;
    const unit = -(e.clientX - d.sx) / SP;
    d.vel = unit - d.lastUnit;
    d.lastUnit = unit;
    setDrag(unit);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.id !== e.pointerId) return;
    /* velocity-based momentum snap — exactly as handoff */
    const momentum = Math.max(-1, Math.min(1, Math.round(d.vel * 6)));
    const target = Math.round(active + d.lastUnit + momentum);
    d.active = false;
    setActive(target);
    setDrag(0);
  };

  const goTo = (absIndex: number) => setActive(absIndex);
  const curMod = ((active % len) + len) % len;

  /* ---- render window ---- */
  const WINDOW = 3;
  const cards: React.ReactNode[] = [];
  for (let k = -WINDOW; k <= WINDOW; k++) {
    const abs = active + k;
    const pos = abs - active - drag;       // 0 = centre
    const aPos = Math.abs(pos);
    if (aPos > WINDOW + 0.5) continue;
    const r = LIST[((abs % len) + len) % len];
    /* --- exact handoff interpolation formulas --- */
    const scale   = Math.max(0.8, 1 - aPos * 0.13);
    const opacity = Math.max(0, 1 - aPos * 0.46);
    const blur    = aPos < 0.5 ? 0 : Math.min(6, (aPos - 0.25) * 3.2);
    const dark    = Math.min(0.62, aPos * 0.38);
    const isCenter = aPos < 0.5;

    const cardClass = [
      s.card,
      isCenter ? s.cardCenter : "",
      r.featured ? s.cardFeat : "",
      r.pinned   ? s.cardPin  : "",
    ].filter(Boolean).join(" ");

    cards.push(
      <article
        key={abs}
        className={cardClass}
        style={{
          width: cardW,
          transform: `translate(-50%,-50%) translateX(${pos * SP}px) scale(${scale})`,
          opacity,
          zIndex: 100 - Math.round(aPos * 10),
          filter: blur ? `blur(${blur}px)` : "none",
          /* CSS transition — exactly as handoff (no spring physics) */
          transition: dragRef.current.active
            ? "none"
            : "transform .6s cubic-bezier(.22,.7,0,1), opacity .5s ease, filter .5s ease",
          pointerEvents: aPos > 1.5 ? "none" : "auto",
        }}
        onClick={() => {
          if (!isCenter && Math.abs(Math.round(pos)) >= 1) goTo(abs);
        }}
      >
        <RevCardContent r={r} />
        {!isCenter && <span className={s.veil} style={{ opacity: dark }} />}
      </article>
    );
  }

  return (
    <section className={s.section}>
      {/* ── Section header ── */}
      <div className={s.secHead}>
        <div>
          <div className={s.secEyebrow}>
            <Icon name="sparkle" size={13} color="var(--gold)" /> Elles adorent
          </div>
          <h3 className={s.secTitle}>{title}</h3>
        </div>
        <div className={s.secRating}>
          <div className={s.secStars}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                fill="var(--gold)" stroke="none">
                <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
              </svg>
            ))}
          </div>
          <div className={s.secNum}>
            <b>{avg.toFixed(1)}</b><span>· 1 248 avis</span>
          </div>
        </div>
      </div>

      {/* ── Viewport ── */}
      <div
        className={s.viewport}
        ref={vpRef}
        onPointerDown={loading ? undefined : onDown}
        onPointerMove={loading ? undefined : onMove}
        onPointerUp={loading ? undefined : onUp}
        onPointerCancel={loading ? undefined : onUp}
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => {
          hoverRef.current = false;
          if (dragRef.current.active) { dragRef.current.active = false; setDrag(0); }
        }}
      >
        <span className={s.glow} style={{ width: cardW + 14 }} />
        <div className={s.stage}>
          {loading
            ? (
              <article
                className={`${s.card} ${s.cardCenter}`}
                style={{
                  width: Math.min(300, Math.round(vw * 0.78)),
                  transform: "translate(-50%,-50%)",
                }}
              >
                <RevSkeleton />
              </article>
            )
            : cards}
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className={s.dots}>
        {LIST.map((_, i) => (
          <button
            key={i}
            className={`${s.dot}${i === curMod ? " " + s.dotOn : ""}`}
            onClick={() =>
              goTo(
                active +
                ((i - curMod + len) % len) -
                (((i - curMod + len) % len) > len / 2 ? len : 0)
              )
            }
            aria-label={`Avis ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Swipe hint ── */}
      <div className={s.hint}>
        <span className={s.hintIcon}>
          <Icon name="share" size={12} />
        </span>
        Glissez pour parcourir les avis
      </div>
    </section>
  );
}
