"use client";

import type { HomeSection } from "@/lib/home-sections";
import { isImageUrl } from "@/lib/admin-media";

export interface HomeHeroBannerProps {
  section?: Pick<HomeSection, "eyebrow" | "title" | "titleAccent" | "cta" | "img">;
  onDiscover?: () => void;
  /** Désactive l'action du CTA (aperçu admin). */
  preview?: boolean;
}

export function HomeHeroBanner({ onDiscover, section, preview }: HomeHeroBannerProps) {
  const eyebrow = section?.eyebrow ?? "Nouvelle collection";
  const title = section?.title ?? "Révélez votre";
  const accent = section?.titleAccent ?? "éclat";
  const cta = section?.cta ?? "Découvrir";
  const bgImage = isImageUrl(section?.img) ? section!.img! : null;

  return (
    <div className="home-z" style={{ padding: "16px 18px 0" }}>
      <div
        style={{
          height: 210,
          borderRadius: "var(--r-lg)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(212,175,55,.2)",
          background: bgImage
            ? `url(${bgImage}) center/cover no-repeat`
            : "radial-gradient(120% 90% at 50% 30%, #2a1f24 0%, #100b0d 75%)",
          boxShadow: "0 30px 60px -32px rgba(212,175,55,.32)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(14,10,12,.92) 0%, rgba(14,10,12,.6) 36%, rgba(14,10,12,.05) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -30,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,.22), transparent 70%)",
          }}
        />
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
            {eyebrow}
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
            {title}{" "}
            <span className="gold-text" style={{ fontStyle: "italic" }}>
              {accent}
            </span>
          </h2>
          <button
            type="button"
            onClick={preview ? undefined : onDiscover}
            style={{
              padding: "12px 24px",
              borderRadius: "var(--r-pill)",
              background: "var(--pink-grad)",
              color: "#3a1020",
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 10px 24px -10px rgba(239,169,192,.7)",
              cursor: preview ? "default" : "pointer",
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
