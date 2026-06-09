"use client";

/* ============================================================
   LN COS — Avis · CARROUSEL CENTRÉ "COVERFLOW" (Apple TV / visionOS)
   Ported from Claude Design handoff · all motion values preserved exactly
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { usePublicReviews } from "@/lib/client-supabase";
import type { PublicReview } from "@/lib/reviews";
import s from "./ReviewsSection.module.css";

/* ---------- Data ---------- */

type Review = PublicReview & { service?: string; staff?: string };

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
  const hasPhoto = Boolean(r.images?.length || r.authorPhotoUrl);
  return (
    <div className={s.inner}>
      <span className={s.edge} />

      <div className={s.head}>
        {r.authorPhotoUrl ? (
          <img src={r.authorPhotoUrl} alt="" className={s.avImg} />
        ) : (
          <span className={s.av}>
            {initials}
            <span className={s.avRing} />
          </span>
        )}
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

      {r.title && <div className={s.revTitle}>{r.title}</div>}
      <p className={`${s.text}${hasPhoto ? " " + s.textShort : ""}`}>{r.text}</p>
      {r.images && r.images.length > 0 && (
        <div className={s.revPhotos}>
          {r.images.slice(0, 3).map((url) => (
            <img key={url} src={url} alt="" className={s.revPhoto} />
          ))}
        </div>
      )}

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
  const { reviews: publicReviews, loading: reviewsLoading, total, avg } = usePublicReviews({ homepageOnly: true });

  const LIST = useMemo(
    () =>
      [...publicReviews].sort(
        (a, b) => (b.pinned ? 2 : b.featured ? 1 : 0) - (a.pinned ? 2 : a.featured ? 1 : 0)
      ),
    [publicReviews]
  );

  const len = Math.max(LIST.length, 1);

  /* continuous active index — wraps infinitely */
  const [active, setActive] = useState(0);
  /* live drag offset in card units */
  const [drag, setDrag] = useState(0);
  /* viewport width for responsive cardW */
  const [vw, setVw] = useState(360);
  /* skeleton loading state */
  const [loading, setLoading] = useState(true);
  /* tracks active drag to avoid reading ref during render */
  const [isDragging, setIsDragging] = useState(false);

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

  useEffect(() => {
    if (reviewsLoading) {
      setLoading(true);
      return;
    }
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [reviewsLoading]);

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
    setIsDragging(true);
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
    setIsDragging(false);
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
          transition: isDragging
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

  if (!reviewsLoading && publicReviews.length === 0) return null;

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
            <b>{avg.toFixed(1)}</b><span>· {total.toLocaleString("fr-FR")} avis</span>
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
