"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/Icon";
import { ProductCard } from "@/components/shared/ProductCard";
import { GoldBtn } from "@/components/shared/ActionButtons";
import { useStore } from "@/lib/store";
import { usePublicProducts, usePublicCategories } from "@/lib/client-supabase";
import type { HomeSection } from "@/lib/home-sections";

const CAT_META: Record<string, { icon: string; grad: string; accent: string }> = {
  visage:      { icon: "sparkle", grad: "linear-gradient(135deg,#2a1f24,#1a1014)", accent: "#F7C6D7" },
  maquillage:  { icon: "star",    grad: "linear-gradient(135deg,#1e1420,#14090f)", accent: "#E2A8C0" },
  parfums:     { icon: "flame",   grad: "linear-gradient(135deg,#1e190e,#100c04)", accent: "#D4AF37" },
  corps:       { icon: "heart",   grad: "linear-gradient(135deg,#1a2218,#0d120c)", accent: "#A8C9A0" },
  cheveux:     { icon: "sparkle", grad: "linear-gradient(135deg,#1a1a28,#0c0c18)", accent: "#A8B4F7" },
  accessoires: { icon: "bag",     grad: "linear-gradient(135deg,#1e1c16,#110f0a)", accent: "#D4AF37" },
  coffrets:    { icon: "gift",    grad: "linear-gradient(135deg,#241824,#14101a)", accent: "#E2A8C0" },
};

function PageHero({ section }: { section: HomeSection }) {
  return (
    <div style={{ padding: "58px 18px 12px" }}>
      {section.eyebrow && (
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 6px" }}>
          {section.eyebrow}
        </p>
      )}
      <h1 style={{ margin: "0 0 4px", fontSize: "var(--fs-h2)", fontWeight: 700, color: "var(--ink)", letterSpacing: "-.01em", whiteSpace: "pre-line" }}>
        {section.title}
      </h1>
      {section.subtitle && (
        <p style={{ fontSize: "var(--fs-xs)", color: "var(--ink-mute)", margin: 0 }}>{section.subtitle}</p>
      )}
    </div>
  );
}

function PageTrust({ section }: { section: HomeSection }) {
  const items = (section.subtitle ?? "").split("|").map((t) => t.trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", gap: 9, padding: "0 18px 14px", flexWrap: "wrap" }}>
      {items.map((t) => (
        <div key={t} style={{ flex: "1 1 100px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
          <Icon name="star" size={19} color="var(--gold)" />
          <span style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 500, lineHeight: 1.25 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

function PageCta({ section, onClick }: { section: HomeSection; onClick?: () => void }) {
  return (
    <div style={{ padding: "8px 18px 18px" }}>
      {section.title && section.variant !== "default" && (
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 10, textAlign: "center" }}>{section.title}</div>
      )}
      <GoldBtn icon="calendar" onClick={onClick}>{section.cta ?? section.title ?? "Continuer"}</GoldBtn>
    </div>
  );
}

function PageProducts({ section }: { section: HomeSection }) {
  const { products } = usePublicProducts();
  const openProduct = useStore((s) => s.openProduct);
  const addToCart   = useStore((s) => s.addToCart);
  const toggleFav   = useStore((s) => s.toggleFav);
  const favs        = useStore((s) => s.favs);
  const [cat, setCat] = useState("all");

  let list = products;
  if (section.source && section.source !== "all") {
    const map: Record<string, (typeof products)[0][]> = {
      flash: products.filter((p) => p.tag === "Flash"),
      best: products.filter((p) => p.tag === "Best-seller"),
      new: products.filter((p) => p.tag === "Nouveau"),
      reco: products.slice(0, 8),
    };
    list = map[section.source] ?? products;
  }
  if (cat !== "all") list = list.filter((p) => p.cat === cat);
  const { categories } = usePublicCategories();

  return (
    <div style={{ padding: "0 16px 28px" }}>
      {section.title && (
        <h3 style={{ margin: "0 0 12px", padding: "0 2px", fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>{section.title}</h3>
      )}
      {section.source === "all" && (
        <div className="noscroll" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 14, padding: "0 2px" }}>
          <button type="button" onClick={() => setCat("all")} style={{ flex: "0 0 auto", padding: "9px 16px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, background: cat === "all" ? "var(--gold-grad)" : "var(--charcoal)", color: cat === "all" ? "#1a1306" : "var(--ink-soft)", border: cat === "all" ? "none" : "1px solid rgba(255,255,255,.07)" }}>Tous</button>
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => setCat(c.id)} style={{ flex: "0 0 auto", padding: "9px 16px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, background: cat === c.id ? "var(--gold-grad)" : "var(--charcoal)", color: cat === c.id ? "#1a1306" : "var(--ink-soft)", border: cat === c.id ? "none" : "1px solid rgba(255,255,255,.07)" }}>{c.name}</button>
          ))}
        </div>
      )}
      <div className="prodbento">
        {list.map((p, i) => (
          <div key={p.id} className="prodbento-cell">
            <ProductCard p={p} wide priority={i < 4} isFav={favs.includes(p.id)} onFav={toggleFav} onAdd={addToCart} onOpen={openProduct} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageCategories({ section }: { section: HomeSection }) {
  const { categories } = usePublicCategories();
  const openListing = useStore((s) => s.openListing);

  return (
    <div style={{ padding: "0 18px 24px" }}>
      {section.title && (
        <h3 style={{ margin: "0 0 14px", fontWeight: 600, fontSize: "var(--fs-h3)", color: "var(--ink)" }}>{section.title}</h3>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {categories.map((c) => {
          const m = CAT_META[c.id] ?? { icon: "sparkle", grad: "var(--charcoal)", accent: "var(--gold)" };
          return (
            <button key={c.id} type="button" onClick={() => openListing(c)} style={{ textAlign: "left", padding: 14, borderRadius: "var(--r-md)", background: m.grad, border: "1px solid rgba(255,255,255,.06)" }}>
              <Icon name={m.icon as "sparkle"} size={22} color={m.accent} />
              <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>{c.count} produits</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PageNewsletter({ section }: { section: HomeSection }) {
  return (
    <div style={{ margin: "0 18px 24px", padding: 20, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg,#241a10,#1a1208)", border: "1px solid rgba(212,175,55,.25)" }}>
      {section.eyebrow && <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>{section.eyebrow}</div>}
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>{section.title}</div>
      {section.subtitle && <p style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 8, lineHeight: 1.5 }}>{section.subtitle}</p>}
      <button type="button" style={{ marginTop: 14, padding: "12px 20px", borderRadius: "var(--r-pill)", background: "var(--gold-grad)", color: "#1a1306", fontWeight: 700, fontSize: 13 }}>
        {section.cta ?? "S'inscrire"}
      </button>
    </div>
  );
}

export function PageSectionsView({
  sections,
  onCta,
}: {
  sections: HomeSection[];
  onCta?: () => void;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return <PageHero key={section.id} section={section} />;
          case "trust":
            return <PageTrust key={section.id} section={section} />;
          case "cta":
            return <PageCta key={section.id} section={section} onClick={onCta} />;
          case "products":
            return <PageProducts key={section.id} section={section} />;
          case "categories":
            return <PageCategories key={section.id} section={section} />;
          case "newsletter":
            return <PageNewsletter key={section.id} section={section} />;
          case "quote":
            return (
              <blockquote key={section.id} style={{ margin: "12px 18px 24px", padding: "20px 18px", borderLeft: "3px solid var(--gold)", color: "var(--ink-soft)", fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>
                {section.title}
              </blockquote>
            );
          case "promo":
            return (
              <div key={section.id} style={{ margin: "0 18px 20px", padding: 18, borderRadius: "var(--r-md)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.06)" }}>
                {section.eyebrow && <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>{section.eyebrow}</div>}
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", marginTop: 6 }}>{section.title}</div>
                {section.subtitle && <p style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 8 }}>{section.subtitle}</p>}
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
