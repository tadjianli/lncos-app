"use client";

import { useState } from "react";
import { HomeHeroBanner } from "@/components/home/HomeHeroBanner";
import type { HomeSection } from "@/lib/home-sections";

interface HeroLivePreviewProps {
  section: HomeSection;
}

export function HeroLivePreview({ section }: HeroLivePreviewProps) {
  const [mode, setMode] = useState<"inline" | "mobile">("inline");

  const banner = <HomeHeroBanner section={section} preview />;

  return (
    <div className="hero-live-preview">
      <div className="hero-live-preview-head">
        <div className="hero-live-preview-title">Aperçu en direct</div>
        <div className="hero-live-preview-tabs" role="tablist" aria-label="Mode d'aperçu">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "inline"}
            className={`hero-live-preview-tab${mode === "inline" ? " active" : ""}`}
            onClick={() => setMode("inline")}
          >
            Plein écran
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "mobile"}
            className={`hero-live-preview-tab${mode === "mobile" ? " active" : ""}`}
            onClick={() => setMode("mobile")}
          >
            Aperçu Mobile
          </button>
        </div>
      </div>

      {mode === "inline" ? (
        <div className="lncos-preview-shell lncos-preview-shell--inline">
          {banner}
        </div>
      ) : (
        <div className="hero-iphone-stage">
          <div className="hero-iphone-mockup" aria-hidden="true">
            <div className="hero-iphone-notch" />
            <div className="hero-iphone-screen">
              <div className="lncos-preview-shell lncos-preview-shell--device">
                {banner}
              </div>
            </div>
            <div className="hero-iphone-home" />
          </div>
        </div>
      )}
    </div>
  );
}
