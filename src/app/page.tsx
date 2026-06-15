"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { Icon } from "@/components/shared/Icon";
import { HorizontalProductCarousel } from "@/components/carousels/HorizontalProductCarousel";
import { HorizontalScrollRow } from "@/components/carousels/HorizontalScrollRow";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { FlashSaleHead } from "@/components/commerce/FlashSaleHead";
import { SectionHead } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { usePublicHomeSections } from "@/lib/client-supabase";
import { feed } from "@/lib/data";
import type { Product } from "@/lib/data";
import { usePublicProducts } from "@/lib/client-supabase";
import type { HomeSection, ProductSource } from "@/lib/home-sections";
import {
  filterProductsByHomeKey,
  groupProductsByUniverse,
  homeKeyFromProductSource,
  HOME_UNIVERSE_OPTIONS,
  type HomeUniverseKey,
} from "@/lib/product-home-visibility";
import { resolveProductImage } from "@/lib/product-catalog";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { BlogJournalSection } from "@/components/home/BlogJournalSection";
import { TransformationsSection } from "@/components/home/TransformationsSection";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import {
  HomeHeroCarousel,
  HomeHeroSingleSlide,
} from "@/components/home/HomeHeroCarousel";
import { usePublicHeroCarousel } from "@/lib/client-supabase";
import { resolveHeroDisplay } from "@/lib/hero-carousel";
import { isImageUrl } from "@/lib/admin-media";

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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }

    /* IntersectionObserver — le scroll Accueil est dans AppShell, pas sur window */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
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

/* ─── Routine section (produits Self-Care Rituals admin) ───── */

function RoutineSection({
  products,
  onAdd,
  title,
  eyebrow,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  title?: string;
  eyebrow?: string;
}) {
  if (products.length === 0) return null;

  const total  = products.reduce((s, p) => s + p.price, 0);
  const old    = products.reduce((s, p) => s + (p.old ?? p.price), 0);
  const bundle = Math.round(total * 0.85 * 100) / 100;
  const save   = Math.round((total - bundle) * 100) / 100;

  return (
    <div>
      <div style={{ padding: "0 18px", marginBottom: 13 }}>
        <div className="rev-sec-eyebrow">
          <Icon name="sparkle" size={13} color="var(--gold)" /> {eyebrow ?? "Sur-mesure"}
        </div>
        <h3 className="rev-sec-title" style={{ marginTop: 4 }}>
          {title ?? "Votre rituel parfait"}
        </h3>
      </div>

      <div className="routine-card">
        <div className="routine-steps">
          {products.map((p, i) => (
            <div key={p.id} className="routine-step">
              <span className="routine-step-num">{i + 1}</span>
              <span className="routine-step-img">
                {resolveProductImage(p) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolveProductImage(p)!}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ display: "block", width: "100%", height: "100%", background: "linear-gradient(155deg,#2a2228,#1a1618)" }} />
                )}
              </span>
              <div className="routine-step-main">
                <div className="routine-step-name">{p.name}</div>
                <div className="routine-step-tag">Étape {i + 1}</div>
              </div>
              <span className="routine-step-price">{p.price.toFixed(2)} €</span>
            </div>
          ))}
        </div>

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
            type="button"
            className="lncos-cta lncos-cta--pink lncos-cta--inline"
            onClick={() => products.forEach((p) => onAdd(p))}
          >
            <Icon name="plus" size={16} stroke={2.4} /> Ajouter le rituel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Editorial promo block ─────────────────────────────────── */

function EditoPromo({ section }: { section?: HomeSection }) {
  const bgImage = isImageUrl(section?.img) ? section!.img! : null;
  const kicker = section?.eyebrow ?? "Édition Limitée";
  const titleMain = section?.title ?? "L'art de la";
  const titleAccent = section?.titleAccent ?? "séduction";
  const body = section?.subtitle ?? "Découvrez notre collection capsule Élixir Noir — une fragrance boisée pour les âmes audacieuses.";
  const cta = section?.cta ?? "Découvrir";

  return (
    <div className="edito-promo">
      <div className="edito-bg">
        {bgImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div
            className="ph"
            data-label="Visual éditorial"
            style={{ position: "absolute", inset: 0 }}
          />
        )}
      </div>
      <div className="edito-grad" />
      <div className="edito-glow" />
      <div className="edito-content">
        <span className="edito-kicker">
          <Icon name="sparkle" size={11} /> {kicker}
        </span>
        <div className="edito-h">
          {titleMain}{" "}
          <span className="it gold-text">{titleAccent}</span>
        </div>
        <div className="edito-p">{body}</div>
        <span className="edito-btn">
          {cta} <Icon name="arrowR" size={16} stroke={2.2} />
        </span>
      </div>
    </div>
  );
}

/* ─── Univers LN COS (produits admin) ───────────────────────── */

const UNIVERSE_TILE_META: Record<
  HomeUniverseKey,
  { ic: string; grad: string; sub: string }
> = {
  self_care_rituals: {
    ic: "heart",
    sub: "Prenez soin de vous",
    grad: "linear-gradient(180deg, rgba(239,169,192,.15), rgba(10,8,7,.85))",
  },
  skincare: {
    ic: "sparkle",
    sub: "Soins visage",
    grad: "linear-gradient(180deg, rgba(212,175,55,.12), rgba(10,8,7,.86))",
  },
  parfums: {
    ic: "flame",
    sub: "Signatures",
    grad: "linear-gradient(180deg, rgba(120,90,160,.16), rgba(10,8,7,.86))",
  },
  makeup: {
    ic: "star",
    sub: "La couleur dans la lumière",
    grad: "linear-gradient(120deg, rgba(212,175,55,.14), rgba(10,8,7,.5) 60%, rgba(10,8,7,.85))",
  },
};

function BentoUniversSection({
  grouped,
  onOpen,
  onFav,
  onAdd,
  favs,
}: {
  grouped: ReturnType<typeof groupProductsByUniverse>;
  onOpen: (p: Product) => void;
  onFav: (id: string) => void;
  onAdd: (p: Product) => void;
  favs: string[];
}) {
  const blocks = HOME_UNIVERSE_OPTIONS
    .map(({ key, label }) => ({ key, label, products: grouped[key] }))
    .filter((b) => b.products.length > 0);

  if (blocks.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {blocks.map(({ key, label, products }) => {
        const meta = UNIVERSE_TILE_META[key];
        const hero = products[0];
        return (
          <div key={key}>
            <div className="bento-tile" style={{ height: 120, marginBottom: 12, borderRadius: 18 }}>
              <div className="bento-bg">
                {resolveProductImage(hero) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={resolveProductImage(hero)!}
                    alt=""
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <div className="bento-grad" style={{ background: meta.grad }} />
              <span className="bento-ic">
                <Icon name={meta.ic} size={17} color="#fff" />
              </span>
              <div className="bento-label">
                <div className="bento-t">{label}</div>
                <div className="bento-s">{meta.sub}</div>
              </div>
            </div>
            <HorizontalProductCarousel fillColumns={2}>
              {products.map((p, pi) => (
                <ProductCard
                  key={p.id + "-univ-" + key + "-" + pi}
                  p={p}
                  onOpen={onOpen}
                  onFav={onFav}
                  isFav={favs.includes(p.id)}
                  onAdd={onAdd}
                />
              ))}
            </HorizontalProductCarousel>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Immersive quote ───────────────────────────────────────── */

function QuoteSection() {
  return (
    <div className="home-quote">
      <div className="home-quote-glow" />
      <div className="home-quote-mark">&quot;</div>
      <div className="home-quote-txt">
        La beauté commence à l&apos;instant où vous décidez d&apos;être{" "}
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
    <div className="home-reels">
      <SectionHead title="LN COS Beauté" action="Tout voir" onAction={openReels} />
      <HorizontalScrollRow className="home-reels-hsc" trackClassName="home-reels-row">
        {feed.map((v, i) => (
          <button key={v.id} type="button" className="reel-card reel-card--fill snap" onClick={openReels}>
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
      </HorizontalScrollRow>
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
  const router       = useRouter();
  const favs         = useStore((s) => s.favs);

  /* ── Section config — Supabase published (realtime) ─────── */
  const { getVisible } = usePublicHomeSections();
  const activeSections = getVisible({ isMobile: true });
  const { settings: heroSettings, slides: heroSlides } = usePublicHeroCarousel();
  const heroDisplay = resolveHeroDisplay(heroSettings, heroSlides);

  /* ── Stable callbacks ─────────────────────────────────────── */
  const handleAdd  = useCallback((p: Product) => addToCart(p), [addToCart]);
  const handleFav  = useCallback((id: string) => toggleFav(id), [toggleFav]);
  const handleOpen = useCallback((p: Product) => openProduct(p), [openProduct]);

  /* ── Products from Supabase (falls back to static data) ──── */
  const { products, byId } = usePublicProducts();

  /* ── Listes produits par visibilité admin (home_visibility) ─ */
  const flashProducts = filterProductsByHomeKey(products, "flash");
  const bestProducts  = filterProductsByHomeKey(products, "best_seller");
  const newProducts   = filterProductsByHomeKey(products, "new_arrivals");
  const universeGrouped = groupProductsByUniverse(products);
  const selfCareProducts = universeGrouped.self_care_rituals;

  const productsBySource: Record<ProductSource, Product[]> = {
    flash: flashProducts,
    best:  bestProducts,
    new:   newProducts,
    reco:  products.filter(
      (p) =>
        p.homeVisibility?.flash ||
        p.homeVisibility?.best_seller ||
        p.homeVisibility?.new_arrivals
    ).slice(0, 4),
    all:   products,
  };

  /* ── Section renderer (dispatch to inline components) ─────── */
  const renderSection = useCallback(
    (section: HomeSection, i: number): React.ReactNode => {
      if (!section.enabled) return null;
      const isFirst = section.type === "hero" || i === 0;
      const mt = isFirst ? 0 : section.type === "products" && i < 4 ? 26 : 34;

      switch (section.type) {
        case "hero":
          if (heroDisplay.mode === "carousel") {
            return (
              <div key={section.id}>
                <HomeHeroCarousel
                  slides={heroDisplay.slides}
                  settings={heroSettings}
                />
              </div>
            );
          }
          if (heroDisplay.mode === "single") {
            return (
              <div key={section.id}>
                <HomeHeroSingleSlide
                  slides={heroDisplay.slides}
                  slide={heroDisplay.slides[0]}
                />
              </div>
            );
          }
          return (
            <div key={section.id} className="home-z">
              <HomeHeroBanner section={section} onDiscover={() => router.push("/boutique")} />
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
          const visKey     = homeKeyFromProductSource(source);
          const prods      = visKey
            ? filterProductsByHomeKey(products, visKey)
            : (productsBySource[source] ?? []);
          const isGrid     = section.variant === "grid";
          const isFirst    = source === "flash";
          if (prods.length === 0) return null;
          return (
            <div
              key={section.id}
              className="home-z home-section home-section-pad"
              style={{ marginTop: mt }}
            >
              {isFirst ? (
                <>
                  <FlashSaleHead title={section.title} />
                  <HorizontalProductCarousel fillColumns={2}>
                    {prods.map((p, pi) => (
                      <ProductCard
                        key={p.id + "-" + source + "-" + pi}
                        p={p}
                        onOpen={handleOpen}
                        onFav={handleFav}
                        isFav={favs.includes(p.id)}
                        onAdd={handleAdd}
                        priority={pi === 0}
                      />
                    ))}
                  </HorizontalProductCarousel>
                </>
              ) : isGrid ? (
                <Reveal>
                  <SectionHead title={section.title} />
                  <ProductGrid products={prods} bottomClearance={false} />
                </Reveal>
              ) : (
                <Reveal>
                  <SectionHead title={section.title} action="Voir tout" />
                  <HorizontalProductCarousel fillColumns={2}>
                    {prods.slice(0, 5).map((p, pi) => (
                      <ProductCard
                        key={p.id + "-" + source + "-" + pi}
                        p={p}
                        onOpen={handleOpen}
                        onFav={handleFav}
                        isFav={favs.includes(p.id)}
                        onAdd={handleAdd}
                      />
                    ))}
                  </HorizontalProductCarousel>
                </Reveal>
              )}
            </div>
          );
        }

        case "routine":
          if (selfCareProducts.length === 0) return null;
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <RoutineSection
                  products={selfCareProducts}
                  onAdd={handleAdd}
                  title={section.title}
                  eyebrow={section.eyebrow}
                />
              </Reveal>
            </div>
          );

        case "promo":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <EditoPromo section={section} />
              </Reveal>
            </div>
          );

        case "bento": {
          const hasUniverse = HOME_UNIVERSE_OPTIONS.some(
            ({ key }) => universeGrouped[key].length > 0
          );
          if (!hasUniverse) return null;
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <div style={{ marginBottom: 14 }}>
                <div className="rev-sec-eyebrow">
                  <Icon name="heart" size={13} color="var(--gold)" /> {section.subtitle ?? "Self-care"}
                </div>
                <h3 className="rev-sec-title" style={{ marginTop: 4 }}>
                  {section.title}
                </h3>
              </div>
              <Reveal>
                <BentoUniversSection
                  grouped={universeGrouped}
                  onOpen={handleOpen}
                  onFav={handleFav}
                  onAdd={handleAdd}
                  favs={favs}
                />
              </Reveal>
            </div>
          );
        }

        case "quote":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <QuoteSection />
              </Reveal>
            </div>
          );

        case "reviews":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <ReviewsSection title={section.title} />
              </Reveal>
            </div>
          );

        case "transformations":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <TransformationsSection title={section.title} />
              </Reveal>
            </div>
          );

        case "reels":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <ReelsSection />
              </Reveal>
            </div>
          );

        case "newsletter":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <NewsletterBlock />
              </Reveal>
            </div>
          );

        case "journal":
          return (
            <div key={section.id} className="home-z home-section home-section-pad" style={{ marginTop: mt }}>
              <Reveal>
                <BlogJournalSection
                  title={section.title}
                  subtitle={section.subtitle}
                  eyebrow={section.eyebrow}
                  cta={section.cta}
                />
              </Reveal>
            </div>
          );

        default:
          return null;
      }
    },
     
    [handleAdd, handleFav, handleOpen, favs, router, products, productsBySource, selfCareProducts, universeGrouped, heroDisplay, heroSettings]
  );

  return (
    <AppShell>
      {/* Ambient depth layer */}
      <HomeAmbient />

      {/* Top bar */}
      <TopBar onMenuClick={openSideMenu} onSearchClick={openSearch} />

      {/* Scrollable content — dynamic section order driven by home-sections store */}
      <div
        className="noscroll home-scroll"
        style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingBottom: 8 }}
      >
        {activeSections.map((section, i) => renderSection(section, i))}
      </div>
    </AppShell>
  );
}
