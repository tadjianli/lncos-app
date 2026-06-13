"use client";

import { useEffect, useState } from "react";
import { useAdminHeroCarousel } from "@/lib/admin-supabase";
import type { HeroCarouselSettings, HeroCarouselSlide } from "@/lib/hero-carousel";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { HomeHeroCarousel, HomeHeroSingleSlide } from "@/components/home/HomeHeroCarousel";
import { Icon } from "@/components/shared/Icon";
import { activeHeroSlides } from "@/lib/hero-carousel";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="ab-toggle-row">
      <span>{label}</span>
      <label className="ab-toggle" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
        <div className="ab-toggle-track" />
        <div className="ab-toggle-thumb" />
      </label>
    </label>
  );
}

function SlideEditor({
  slide,
  onChange,
}: {
  slide: HeroCarouselSlide;
  onChange: (patch: Partial<HeroCarouselSlide>) => void;
}) {
  return (
    <div className="hero-admin-slide">
      <div className="hero-admin-slide-head">
        <span className="hero-admin-slide-num">Slide {slide.position}</span>
        <Toggle
          label=""
          checked={slide.active}
          onChange={(active) => onChange({ active })}
        />
        <span className={`hero-admin-slide-status${slide.active ? " on" : ""}`}>
          {slide.active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="ab-field">
        <label>Image</label>
        <AdminImageUpload
          value={slide.imageUrl ?? ""}
          onChange={(url) => onChange({ imageUrl: url || null })}
          label={`Slide ${slide.position}`}
          folder="hero-carousel"
          helpText="JPG, PNG ou WebP — max 5 Mo. Recommandé : 1200×630 px minimum."
        />
      </div>

      <div className="ab-field">
        <label>Texte alternatif (SEO)</label>
        <input
          className="ab-input"
          type="text"
          value={slide.imageAlt}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
          placeholder="Description de l'image pour l'accessibilité"
        />
      </div>

      <div className="ab-field">
        <label>Titre</label>
        <input
          className="ab-input"
          type="text"
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      <div className="ab-field">
        <label>Sous-titre</label>
        <input
          className="ab-input"
          type="text"
          value={slide.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
        />
      </div>

      <div className="ab-field-grid">
        <div className="ab-field">
          <label>Texte bouton</label>
          <input
            className="ab-input"
            type="text"
            value={slide.buttonText}
            onChange={(e) => onChange({ buttonText: e.target.value })}
          />
        </div>
        <div className="ab-field">
          <label>Lien bouton</label>
          <input
            className="ab-input"
            type="text"
            value={slide.buttonLink}
            onChange={(e) => onChange({ buttonLink: e.target.value })}
            placeholder="/boutique"
          />
        </div>
      </div>
    </div>
  );
}

export function HeroCarouselPanel() {
  const { settings: dbSettings, slides: dbSlides, loading, saving, saveAll } =
    useAdminHeroCarousel();
  const [settings, setSettings] = useState<HeroCarouselSettings | null>(null);
  const [slides, setSlides] = useState<HeroCarouselSlide[] | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && settings === null) {
      setSettings(dbSettings);
      setSlides(dbSlides);
    }
  }, [loading, dbSettings, dbSlides, settings]);

  function showToast(msg: string, variant: AdminToastVariant = "success") {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 2800);
  }

  function patchSettings(patch: Partial<HeroCarouselSettings>) {
    setSettings((s) => (s ? { ...s, ...patch } : s));
    setDirty(true);
  }

  function patchSlide(id: string, patch: Partial<HeroCarouselSlide>) {
    setSlides((list) =>
      list ? list.map((s) => (s.id === id ? { ...s, ...patch } : s)) : list
    );
    setDirty(true);
  }

  async function handleSave() {
    if (!settings || !slides) return;
    const { error } = await saveAll(settings, slides);
    if (error) {
      showToast(`Erreur : ${error}`, "error");
      return;
    }
    setDirty(false);
    showToast("Hero carousel enregistré");
  }

  const active = slides ? activeHeroSlides(slides) : [];
  const previewSettings = settings ?? dbSettings;

  return (
    <>
      <div className="adm-card hero-admin-card">
        <button
          type="button"
          className="hero-admin-card-toggle"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          <div>
            <div className="ab-list-title">Accueil · Hero Carousel</div>
            <div className="ab-list-sub">
              {active.length} slide{active.length !== 1 ? "s" : ""} active
              · max 3
            </div>
          </div>
          <Icon
            name="chevD"
            size={16}
            color="var(--adm-ink-mute)"
            style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform .2s ease" }}
          />
        </button>

        {expanded && !loading && settings && slides && (
          <div className="hero-admin-body">
            <div className="hero-admin-global">
              <div className="hero-admin-global-title">Options globales</div>
              <Toggle
                label="Activer le carousel"
                checked={settings.enabled}
                onChange={(enabled) => patchSettings({ enabled })}
              />
              <Toggle
                label="Défilement automatique"
                checked={settings.autoplay}
                onChange={(autoplay) => patchSettings({ autoplay })}
              />
              <Toggle
                label="Afficher les indicateurs"
                checked={settings.showIndicators}
                onChange={(showIndicators) => patchSettings({ showIndicators })}
              />
              <Toggle
                label="Afficher les flèches"
                checked={settings.showArrows}
                onChange={(showArrows) => patchSettings({ showArrows })}
              />
              <div className="ab-field" style={{ marginTop: 8 }}>
                <label>Durée entre les slides (secondes)</label>
                <input
                  className="ab-input"
                  type="number"
                  min={2}
                  max={60}
                  step={0.5}
                  value={settings.intervalSeconds}
                  onChange={(e) =>
                    patchSettings({
                      intervalSeconds: Math.min(60, Math.max(2, Number(e.target.value) || 5)),
                    })
                  }
                />
              </div>
            </div>

            {slides.map((slide) => (
              <SlideEditor
                key={slide.id}
                slide={slide}
                onChange={(patch) => patchSlide(slide.id, patch)}
              />
            ))}

            {active.length > 0 && (
              <div className="hero-admin-preview">
                <div className="hero-admin-preview-label">Aperçu</div>
                {active.length === 1 ? (
                  <HomeHeroSingleSlide slides={active} slide={active[0]} preview />
                ) : (
                  <HomeHeroCarousel slides={active} settings={previewSettings} preview />
                )}
              </div>
            )}

            <div className="hero-admin-foot">
              <button
                type="button"
                className={`adm-btn gold${!dirty || saving ? " is-disabled" : ""}`}
                disabled={!dirty || saving}
                onClick={() => void handleSave()}
              >
                {saving ? "Enregistrement…" : "Enregistrer le carousel"}
              </button>
            </div>
          </div>
        )}

        {expanded && loading && (
          <div className="hero-admin-loading">Chargement du carousel…</div>
        )}
      </div>

      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </>
  );
}
