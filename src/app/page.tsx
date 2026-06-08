"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Icon } from "@/components/shared/Icon";
import { ProductCard } from "@/components/shared/ProductCard";
import { SectionHead } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { useHomeSectionsStore } from "@/lib/stores";
import { feed, byId as staticById } from "@/lib/data";
import type { Product } from "@/lib/data";
import { usePublicProducts } from "@/lib/client-supabase";
import type { HomeSection, ProductSource } from "@/lib/home-sections";
import { ReviewsSection } from "@/components/home/ReviewsSection";

/* ─── Ambient depth (orbs + particles) ─────────────────────── */

function HomeAmbient() {
  const parts = [
    { l: "18%", d: "0s", dur: "14s" },
    { l: "40%", d: "4s",  dur: "17s" },
    { l: "63%", d: "8s",  dur: "15s" },
    { l: "82%", d: "2s",  dur: "19s" },
    { l: "52%", d: "11s", dur: "16s" },
  ];
  return (
    <div className="home-ambient">
      <span className="home-orb a" />
      <span className="home-orb b" />
      <span className="home-orb c" />
      {parts.map((p, i) => (
        <span
          key={i}
          className="home-particle"
          style={{
            left: p.l,
            bottom: "8%",
            animationDuration: p.dur,
            animationDelay: p.d,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Scroll reveal ─────────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) setSeen(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={"home-reveal" + (seen ? " in" : "")}
      style={{ transitionDelay: delay + "ms" }}
    >
      {children}
    </div>
  );
}

/* ─── Hero section ──────────────────────────────────────────── */

function HeroSection({ onDiscover }: { onDiscover?: () => void }) {
  return (
    <div className="home-z" style={{ padding: "16px 18px 0" }}>
      <div
        style={{
          height: 210,
          borderRadius: "var(--r-lg)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(212,175,55,.2)",
          background:
            "radial-gradient(120% 90% at 50% 30%, #2a1f24 0%, #100b0d 75%)",
          boxShadow: "0 30px 60px -32px rgba(212,175,55,.32)",
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(14,10,12,.92) 0%, rgba(14,10,12,.6) 36%, rgba(14,10,12,.05) 100%)",
          }}
        />
        {/* Gold ambient halo */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -30,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(212,175,55,.22), transparent 70%)",
          }}
        />
        {/* Content */}
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "0 22px",
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 11,
            }}
          >
            Nouvelle collection
          </div>
          <h2
            style={{
              fontWeight: 600,
              fontSize: 31,
              lineHeight: 1.08,
              color: "var(--ink)",
              margin: "0 0 18px",
              maxWidth: 210,
            }}
          >
            Révélez votre{" "}
            <span className="gold-text" style={{ fontStyle: "italic" }}>
              éclat
            </span>
          </h2>
          <button
            onClick={onDiscover}
            style={{
              padding: "12px 24px",
              borderRadius: "var(--r-pill)",
              background: "var(--pink-grad)",
              color: "#3a1020",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 10px 24px -10px rgba(239,169,192,.7)",
            }}
          >
            Découvrir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Trust strip ───────────────────────────────────────────── */

function TrustStrip() {
  const items = [
    { i: "truck",   t: "Livraison 48h offerte" },
    { i: "sparkle", t: "Vegan & cruelty-free" },
    { i: "heart",   t: "Formulé en France" },
    { i: "star",    t: "+12 000 avis 4.9/5" },
  ];
  return (
    <div className="home-trust noscroll">
      {items.map((it, i) => (
        <span key={i} className="trust-pill">
          <Icon name={it.i} size={13} color="var(--gold)" />
          {it.t}
        </span>
      ))}
    </div>
  );
}

/* ─── Flash sale countdown head ─────────────────────────────── */

function FlashHead({ title }: { title: string }) {
  const [f, setF] = useState({ h: 4, m: 12, s: 38 });

  useEffect(() => {
    const t = setInterval(() => {
      setF((o) => {
        let { h, m, s } = o;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) h = 5;
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "var(--fs-h3)",
          color: "var(--ink)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          whiteSpace: "nowrap",
        }}
      >
        <Icon
          name="flame"
          size={20}
          color="var(--gold)"
          fill="rgba(212,175,55,.25)"
        />
        {title}
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[f.h, f.m, f.s].map((v, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                background: "var(--charcoal-2)",
                color: "var(--gold)",
                fontWeight: 700,
                fontSize: 12,
                padding: "4px 6px",
                borderRadius: 7,
                minWidth: 26,
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {pad(v)}
            </span>
            {i < 2 && (
              <span style={{ color: "var(--ink-mute)", fontWeight: 700 }}>
                :
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Routine section ───────────────────────────────────────── */

const ROUTINES = [
  {
    id: "matin",  tab: "Matin",       kicker: "Routine du matin",   title: "Réveil lumineux",
    sub: "Un teint frais et protégé pour toute la journée.",
    duration: "5 min", benefit: "Éclat",        steps: ["serum-eclat", "creme-hydra", "brume-corps"],
  },
  {
    id: "nuit",   tab: "Nuit",        kicker: "Routine du soir",    title: "Régénération nocturne",
    sub: "La peau se répare pendant que vous dormez.",
    duration: "7 min", benefit: "Réparation",   steps: ["huile-demaq", "masque-purifiant", "creme-hydra"],
  },
  {
    id: "glow",   tab: "Glow",        kicker: "Routine éclat",      title: "Effet bonne mine",
    sub: "Le rituel signature pour une peau qui capte la lumière.",
    duration: "6 min", benefit: "Glow",          steps: ["serum-eclat", "palette-glow", "parfum-noir"],
  },
  {
    id: "hydra",  tab: "Hydratation", kicker: "Routine confort",    title: "Source d'hydratation",
    sub: "Repulpez et nourrissez intensément votre peau.",
    duration: "5 min", benefit: "Hydratation",   steps: ["creme-hydra", "masque-purifiant", "brume-corps"],
  },
];

function RoutineSection({ onAdd }: { onAdd: (p: Product) => void }) {
  const [active, setActive] = useState("matin");
  const r = ROUTINES.find((x) => x.id === active)!;
  const prods = r.steps.map((id) => staticById(id)).filter(Boolean) as Product[];
  const total  = prods.reduce((s, p) => s + p.price, 0);
  const old    = prods.reduce((s, p) => s + (p.old ?? p.price), 0);
  const bundle = Math.round(total * 0.85 * 100) / 100;
  const save   = Math.round((total - bundle) * 100) / 100;

  return (
    <div>
      <div style={{ padding: "0 18px", marginBottom: 13 }}>
        <div className="rev-sec-eyebrow">
          <Icon name="sparkle" size={13} color="var(--gold)" /> Sur-mesure
        </div>
        <h3 className="rev-sec-title" style={{ marginTop: 4 }}>
          Votre rituel parfait
        </h3>
      </div>

      {/* Tabs */}
      <div className="routine-tabs noscroll">
        {ROUTINES.map((x) => (
          <button
            key={x.id}
            className={"routine-tab" + (active === x.id ? " on" : "")}
            onClick={() => setActive(x.id)}
          >
            {x.tab}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="routine-card" key={r.id}>
        {/* Hero image */}
        <div className="routine-hero">
          <div
            className="ph"
            data-label={r.title}
            style={{ position: "absolute", inset: 0 }}
          />
          <div className="routine-hero-grad" />
          <div className="routine-hero-meta">
            <div className="routine-kicker">
              <Icon name="sparkle" size={11} color="var(--gold)" />
              {r.kicker}
            </div>
            <div className="routine-title">{r.title}</div>
            <div className="routine-sub">{r.sub}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="routine-stats">
          {[
            { i: "clock",   v: r.duration, s: "chaque jour" },
            { i: "sparkle", v: r.benefit,  s: "bénéfice clé" },
            { i: "bag",     v: `${prods.length} produits`, s: "dans le rituel" },
          ].map((s) => (
            <div key={s.i} className="routine-stat">
              <span className="routine-stat-ic">
                <Icon name={s.i} size={15} color="var(--gold)" />
              </span>
              <div>
                <b>{s.v}</b>
                <span>{s.s}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="routine-steps">
          {prods.map((p, i) => (
            <div key={p.id} className="routine-step">
              <span className="routine-step-num">{i + 1}</span>
              <span className="routine-step-img">
                <div
                  className="ph"
                  data-label=""
                  style={{ position: "absolute", inset: 0 }}
                />
              </span>
              <div className="routine-step-main">
                <div className="routine-step-name">{p.name}</div>
                <div className="routine-step-tag">
                  Étape {i + 1} · {r.benefit}
                </div>
              </div>
              <span className="routine-step-price">{p.price.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="routine-foot">
          <div className="routine-total">
            <div className="routine-total-lab">Le rituel complet</div>
            <div className="routine-total-val">
              <b>{bundle.toFixed(2)} €</b>
              <s>{old.toFixed(2)} €</s>
              <span className="routine-total-save">−{save.toFixed(2)} €</span>
            </div>
          </div>
          <button
            className="routine-cta"
            onClick={() => prods.forEach((p) => onAdd(p))}
          >
            <Icon name="plus" size={16} stroke={2.4} /> Ajouter le rituel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Editorial promo block ─────────────────────────────────── */

function EditoPromo() {
  return (
    <div className="edito-promo">
      <div className="edito-bg">
        <div
          className="ph"
          data-label="Visual éditorial"
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div className="edito-grad" />
      <div className="edito-glow" />
      <div className="edito-content">
        <span className="edito-kicker">
          <Icon name="sparkle" size={11} /> Édition Limitée
        </span>
        <div className="edito-h">
          L'art de la{" "}
          <span className="it gold-text">séduction</span>
        </div>
        <div className="edito-p">
          Découvrez notre collection capsule Élixir Noir — une fragrance
          boisée pour les âmes audacieuses.
        </div>
        <span className="edito-btn">
          Découvrir <Icon name="arrowR" size={16} stroke={2.2} />
        </span>
      </div>
    </div>
  );
}

/* ─── Bento self-care ───────────────────────────────────────── */

function BentoSelfCare() {
  const tiles = [
    {
      cls: "tall", t: "Self-care rituals", s: "Prenez soin de vous",
      ic: "heart", grad: "linear-gradient(180deg, rgba(239,169,192,.15), rgba(10,8,7,.85))",
    },
    {
      cls: "", t: "Skincare", s: "Soins visage",
      ic: "sparkle", grad: "linear-gradient(180deg, rgba(212,175,55,.12), rgba(10,8,7,.86))",
    },
    {
      cls: "", t: "Parfums", s: "Signatures",
      ic: "flame", grad: "linear-gradient(180deg, rgba(120,90,160,.16), rgba(10,8,7,.86))",
    },
    {
      cls: "wide", t: "Maquillage", s: "La couleur dans la lumière",
      ic: "star", grad: "linear-gradient(120deg, rgba(212,175,55,.14), rgba(10,8,7,.5) 60%, rgba(10,8,7,.85))",
    },
  ];

  return (
    <div className="bento">
      {tiles.map((t, i) => (
        <div key={i} className={"bento-tile " + t.cls}>
          <div className="bento-bg">
            <div
              className="ph"
              data-label=""
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div className="bento-grad" style={{ background: t.grad }} />
          <span className="bento-ic">
            <Icon name={t.ic} size={17} color="#fff" />
          </span>
          <div className="bento-label">
            <div className="bento-t">{t.t}</div>
            <div className="bento-s">{t.s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Immersive quote ───────────────────────────────────────── */

function QuoteSection() {
  return (
    <div className="home-quote">
      <div className="home-quote-glow" />
      <div className="home-quote-mark">"</div>
      <div className="home-quote-txt">
        La beauté commence à l'instant où vous décidez d'être{" "}
        <span className="hl">vous-même</span>.
      </div>
      <div className="home-quote-by">— La maison LN COS</div>
    </div>
  );
}

/* ─── Reels section ─────────────────────────────────────────── */

function ReelsSection() {
  const openReels = useStore((s) => s.openReels);
  const tags = ["Routine", "Teint frais", "Unboxing"];
  const stats = [
    ["12.4k", "2.1k"],
    ["8.9k",  "1.4k"],
    ["21.7k", "5.3k"],
  ];

  return (
    <div>
      <div style={{ padding: "0 18px" }}>
        <SectionHead title="LN COS Beauté" action="Tout voir" onAction={openReels} />
      </div>
      <div
        className="noscroll"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 18px 4px",
        }}
      >
        {feed.map((v, i) => (
          <button key={v.id} className="reel-card" onClick={openReels}>
            <div className="reel-bg">
              <div
                className="ph"
                data-label={v.label}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(120% 90% at 50% 35%, #2a1f24 0%, #100b0d 75%)",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.25), transparent 30%)",
              }}
            />
            <span className="reel-progress">
              <i style={{ animationDelay: -i * 1.5 + "s" }} />
            </span>
            <span className="reel-tag">#{tags[i % tags.length]}</span>
            <span className="reel-play">
              <Icon name="play" size={15} color="#fff" fill="#fff" />
            </span>
            <div className="reel-meta">
              <div className="reel-title">{v.title}</div>
              <div className="reel-stats">
                <span className="reel-stat">
                  <Icon name="heart" size={11} color="var(--pink)" fill="var(--pink)" />
                  {stats[i % stats.length][0]}
                </span>
                <span className="reel-stat">
                  <Icon name="bag" size={11} color="#fff" />
                  {stats[i % stats.length][1]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Newsletter ────────────────────────────────────────────── */

function NewsletterBlock() {
  return (
    <div className="home-z" style={{ padding: "0 18px" }}>
      <div className="home-news">
        <div className="home-news-glow" />
        <div className="rev-sec-eyebrow" style={{ justifyContent: "center", display: "flex" }}>
          <Icon name="mail" size={13} color="var(--gold)" /> Club LN COS
        </div>
        <h3
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "var(--ink)",
            textAlign: "center",
            margin: "8px 0 6px",
          }}
        >
          Rejoignez le club beauté
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-soft)",
            textAlign: "center",
            lineHeight: 1.5,
            margin: "0 0 18px",
          }}
        >
          Offres exclusives, lancements en avant-première et conseils
          beauté personnalisés.
        </p>
        <div className="home-news-form">
          <Icon name="mail" size={16} color="var(--ink-mute)" />
          <input placeholder="votre@email.com" />
          <button>Je m&apos;inscris</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Home page ─────────────────────────────────────────────── */

export default function HomePage() {
  /* ── Store selectors ──────────────────────────────────────── */
  const addToCart    = useStore((s) => s.addToCart);
  const toggleFav    = useStore((s) => s.toggleFav);
  const openProduct  = useStore((s) => s.openProduct);
  const openSideMenu = useStore((s) => s.openSideMenu);
  const openSearch   = useStore((s) => s.openSearch);
  const openListing  = useStore((s) => s.openListing);
  const isFav        = useStore((s) => s.isFav);

  /* ── Section config — driven by home-sections store ──────── */
  const getVisible    = useHomeSectionsStore((s) => s.getVisible);
  const activeSections = getVisible({ isMobile: true }); // client is always mobile-first

  /* ── Stable callbacks ─────────────────────────────────────── */
  const handleAdd  = useCallback((p: Product) => addToCart(p), [addToCart]);
  const handleFav  = useCallback((id: string) => toggleFav(id), [toggleFav]);
  const handleOpen = useCallback((p: Product) => openProduct(p), [openProduct]);

  /* ── Products from Supabase (falls back to static data) ──── */
  const { products, byId } = usePublicProducts();

  /* ── Pre-resolved product lists by source ─────────────────── */
  const flashProducts = products.filter((p) => p.tag === "Flash");
  const _bestRaw      = products.filter((p) => p.tag === "Best-seller").concat(products.slice(0, 3));
  const _seenBest     = new Set<string>();
  const bestProducts  = _bestRaw.filter((p) => !_seenBest.has(p.id) && !!_seenBest.add(p.id));
  const newProducts   = products.filter((p) => p.tag === "Nouveau");

  const productsBySource: Record<ProductSource, Product[]> = {
    flash: flashProducts,
    best:  bestProducts,
    new:   newProducts,
    reco:  products.slice(0, 4),
  };

  /* ── Section renderer (dispatch to inline components) ─────── */
  const renderSection = useCallback(
    (section: HomeSection, i: number): React.ReactNode => {
      if (!section.enabled) return null;
      const isFirst = section.type === "hero" || i === 0;
      const mt = isFirst ? 0 : section.type === "products" && i < 4 ? 26 : 34;

      switch (section.type) {
        case "hero":
          return (
            <div key={section.id} className="home-z">
              <HeroSection onDiscover={() => openListing(null)} />
            </div>
          );

        case "trust":
          return (
            <div key={section.id} className="home-z">
              <TrustStrip />
            </div>
          );

        case "products": {
          const source     = (section.source ?? "flash") as ProductSource;
          const prods      = productsBySource[source] ?? [];
          const isGrid     = section.variant === "grid";
          const isFirst    = source === "flash";
          return (
            <div
              key={section.id}
              className="home-z home-section"
              style={{ marginTop: mt, padding: "0 18px" }}
            >
              {isFirst ? (
                <>
                  <FlashHead title={section.title} />
                  <div className="scroll-row" style={{ padding: "4px 0 8px" }}>
                    {prods.map((p, pi) => (
                      <ProductCard
                        key={p.id + "-" + source + "-" + pi}
                        p={p}
                        onOpen={handleOpen}
                        onFav={handleFav}
                        isFav={isFav(p.id)}
                        onAdd={handleAdd}
                        priority={pi === 0}
                      />
                    ))}
                  </div>
                </>
              ) : isGrid ? (
                <Reveal>
                  <SectionHead title={section.title} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {prods.map((p, pi) => (
                      <ProductCard
                        key={p.id + "-" + source + "-" + pi}
                        p={p}
                        wide
                        onOpen={handleOpen}
                        onFav={handleFav}
                        isFav={isFav(p.id)}
                        onAdd={handleAdd}
                      />
                    ))}
                  </div>
                </Reveal>
              ) : (
                <Reveal>
                  <SectionHead title={section.title} action="Voir tout" />
                  <div className="scroll-row" style={{ padding: "4px 0 8px" }}>
                    {prods.slice(0, 5).map((p, pi) => (
                      <ProductCard
                        key={p.id + "-" + source + "-" + pi}
                        p={p}
                        onOpen={handleOpen}
                        onFav={handleFav}
                        isFav={isFav(p.id)}
                        onAdd={handleAdd}
                      />
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          );
        }

        case "routine":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <RoutineSection onAdd={handleAdd} />
              </Reveal>
            </div>
          );

        case "promo":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <EditoPromo />
              </Reveal>
            </div>
          );

        case "bento":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <div style={{ padding: "0 18px", marginBottom: 14 }}>
                <div className="rev-sec-eyebrow">
                  <Icon name="heart" size={13} color="var(--gold)" /> {section.subtitle ?? "Self-care"}
                </div>
                <h3 className="rev-sec-title" style={{ marginTop: 4 }}>
                  {section.title}
                </h3>
              </div>
              <Reveal>
                <BentoSelfCare />
              </Reveal>
            </div>
          );

        case "quote":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <QuoteSection />
              </Reveal>
            </div>
          );

        case "reviews":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <ReviewsSection title={section.title} />
              </Reveal>
            </div>
          );

        case "reels":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <ReelsSection />
              </Reveal>
            </div>
          );

        case "newsletter":
          return (
            <div key={section.id} className="home-z home-section" style={{ marginTop: mt }}>
              <Reveal>
                <NewsletterBlock />
              </Reveal>
            </div>
          );

        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleAdd, handleFav, handleOpen, isFav, openListing, productsBySource]
  );

  return (
    <AppShell>
      {/* Ambient depth layer */}
      <HomeAmbient />

      {/* Top bar */}
      <TopBar onMenuClick={openSideMenu} onSearchClick={openSearch} />

      {/* Scrollable content — dynamic section order driven by home-sections store */}
      <div
        className="noscroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingBottom: 28 }}
      >
        {activeSections.map((section, i) => renderSection(section, i))}
      </div>
    </AppShell>
  );
}
