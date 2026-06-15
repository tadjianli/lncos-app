"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAdminHeroCarousel } from "@/lib/admin-supabase";
import {
  activeHeroSlides,
  emptyHeroSlide,
  isSlideEmpty,
  MAX_HERO_SLIDES,
  reindexHeroSlides,
  type HeroCarouselSettings,
  type HeroCarouselSlide,
} from "@/lib/hero-carousel";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { AdminToast, type AdminToastVariant } from "@/components/admin/AdminToast";
import { AdminAccordion, AdminAccordionStack } from "@/components/admin/AdminAccordion";
import { HomeHeroCarousel, HomeHeroSingleSlide } from "@/components/home/HomeHeroCarousel";
import { Icon } from "@/components/shared/Icon";

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

function DragHandle() {
  return (
    <div className="ab-drag" title="Glisser pour réordonner">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

function slideLabel(slide: HeroCarouselSlide): string {
  if (slide.title.trim()) return slide.title.trim();
  if (slide.titleAccent.trim()) return slide.titleAccent.trim();
  return `Slide ${slide.position}`;
}

export function HeroCarouselModule() {
  const { settings: dbSettings, slides: dbSlides, loading, saving, saveAll } =
    useAdminHeroCarousel();
  const [settings, setSettings] = useState<HeroCarouselSettings | null>(null);
  const [slides, setSlides] = useState<HeroCarouselSlide[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; variant: AdminToastVariant } | null>(null);
  const [dirty, setDirty] = useState(false);
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !dirty) {
      setSettings(dbSettings);
      setSlides(dbSlides);
      if (!selectedId && dbSlides.length > 0) {
        setSelectedId(dbSlides[0].id);
      }
    }
  }, [loading, dbSettings, dbSlides, dirty, selectedId]);

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

  function setSlidesOrdered(next: HeroCarouselSlide[]) {
    setSlides(reindexHeroSlides(next));
    setDirty(true);
  }

  function handleAddSlide() {
    if (!slides) return;
    const empty = slides.find(isSlideEmpty);
    if (empty) {
      setSelectedId(empty.id);
      patchSlide(empty.id, { active: true });
      showToast(`Éditez la slide ${empty.position}`);
      return;
    }
    if (slides.length >= MAX_HERO_SLIDES) {
      showToast(`Maximum ${MAX_HERO_SLIDES} slides`, "error");
      return;
    }
    showToast(`Maximum ${MAX_HERO_SLIDES} emplacements — supprimez une slide pour en recréer une`, "error");
  }

  function handleDeleteSlide(id: string) {
    if (!slides) return;
    const slide = slides.find((s) => s.id === id);
    if (!slide) return;
    setSlides(slides.map((s) => (s.id === id ? emptyHeroSlide(s) : s)));
    setDirty(true);
    if (selectedId === id) {
      const remaining = slides.filter((s) => s.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
    showToast("Slide supprimée");
  }

  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  function onDrop(targetId: string) {
    const fromId = dragId.current;
    if (!fromId || fromId === targetId || !slides) {
      setDragOverId(null);
      return;
    }
    const arr = [...slides].sort((a, b) => a.position - b.position);
    const fromIdx = arr.findIndex((s) => s.id === fromId);
    const toIdx = arr.findIndex((s) => s.id === targetId);
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    setSlidesOrdered(arr);
    dragId.current = null;
    setDragOverId(null);
  }

  async function handleSave() {
    if (!settings || !slides) return;
    const ordered = reindexHeroSlides(slides);
    const { error } = await saveAll(settings, ordered);
    if (error) {
      showToast(`Erreur : ${error}`, "error");
      return;
    }
    setSlides(ordered);
    setDirty(false);
    showToast("Carousel enregistré — visible sur l'accueil");
  }

  const selected = slides?.find((s) => s.id === selectedId) ?? null;
  const active = slides ? activeHeroSlides(slides) : [];
  const previewSettings = settings ?? dbSettings;
  const filledCount = slides?.filter((s) => !isSlideEmpty(s)).length ?? 0;

  return (
    <>
      <div className="adm-content">
        <div className="adm-topbar">
          <div>
            <div className="adm-page-eyebrow">
              <span className="dot" />
              ACCUEIL · CAROUSEL
            </div>
            <h1 className="adm-h1">Hero Carousel</h1>
            <p className="adm-page-sub" style={{ marginTop: 6, maxWidth: 520 }}>
              Gérez jusqu&apos;à {MAX_HERO_SLIDES} slides. Les données proviennent de{" "}
              <code style={{ fontSize: 12 }}>hero_carousel_slides</code> — pas de l&apos;ancienne
              bannière « Bannière héro » du builder.
            </p>
          </div>
          <div className="ab-publish-bar">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="adm-btn ghost sm" style={{ textDecoration: "none" }}>
              <Icon name="search" size={14} /> Aperçu boutique
            </Link>
            <button
              type="button"
              className={`adm-btn gold${!dirty || saving ? " is-disabled" : ""}`}
              disabled={!dirty || saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="adm-card hero-admin-loading">Chargement du carousel…</div>
        )}

        {!loading && settings && slides && (
          <AdminAccordionStack>
            <AdminAccordion title="Options globales">
                <div className="hero-admin-global" style={{ padding: 0, border: "none", background: "transparent" }}>
                  <Toggle label="Activer le carousel" checked={settings.enabled} onChange={(enabled) => patchSettings({ enabled })} />
                  <Toggle label="Défilement automatique" checked={settings.autoplay} onChange={(autoplay) => patchSettings({ autoplay })} />
                  <Toggle label="Afficher les indicateurs" checked={settings.showIndicators} onChange={(showIndicators) => patchSettings({ showIndicators })} />
                  <div className="ab-field">
                    <label>Durée entre les slides (s)</label>
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
            </AdminAccordion>

            <AdminAccordion title={`Slides (${filledCount}/${MAX_HERO_SLIDES})`}>
                <div className="ab-list-head" style={{ marginBottom: 12 }}>
                  <div>
                    <div className="ab-list-sub">Glissez pour réordonner · {active.length} active{active.length !== 1 ? "s" : ""}</div>
                  </div>
                  <button
                    type="button"
                    className="adm-btn ghost sm"
                    onClick={handleAddSlide}
                    disabled={filledCount >= MAX_HERO_SLIDES && !slides.some(isSlideEmpty)}
                  >
                    <Icon name="plus" size={15} /> Ajouter
                  </button>
                </div>

                {[...slides].sort((a, b) => a.position - b.position).map((slide) => (
                  <div
                    key={slide.id}
                    className={`ab-row hero-slide-row${dragOverId === slide.id ? " drag-over" : ""}${selectedId === slide.id ? " hero-slide-row-selected" : ""}`}
                    draggable
                    onDragStart={() => onDragStart(slide.id)}
                    onDragOver={(e) => onDragOver(e, slide.id)}
                    onDrop={() => onDrop(slide.id)}
                    onDragEnd={() => { dragId.current = null; setDragOverId(null); }}
                    onClick={() => setSelectedId(slide.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedId(slide.id); }}
                  >
                    <DragHandle />
                    <div className="ab-sec-icon" style={{ background: "rgba(212,175,55,.14)" }}>
                      <Icon name="sparkle" size={18} color="#B8902B" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ab-sec-name">{slideLabel(slide)}</div>
                      <div className="ab-sec-meta">
                        <span className="ab-sec-tag">Position {slide.position}</span>
                        <span style={{ color: "var(--adm-border)" }}>·</span>
                        <span className={`hero-admin-slide-status${slide.active ? " on" : ""}`} style={{ fontSize: 10 }}>
                          {slide.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="ab-row-actions" onClick={(e) => e.stopPropagation()}>
                      <label className="ab-toggle" title={slide.active ? "Désactiver" : "Activer"}>
                        <input
                          type="checkbox"
                          checked={slide.active}
                          onChange={() => patchSlide(slide.id, { active: !slide.active })}
                        />
                        <div className="ab-toggle-track" />
                        <div className="ab-toggle-thumb" />
                      </label>
                      <button
                        type="button"
                        className="adm-iconbtn sm"
                        title="Supprimer la slide"
                        style={{ color: "var(--tone-pink)" }}
                        onClick={() => handleDeleteSlide(slide.id)}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </AdminAccordion>

            <AdminAccordion title="Édition slide">
              {selected ? (
                <div className="hero-admin-slide" style={{ marginBottom: 0, border: "none", boxShadow: "none", padding: 0 }}>
                  <div className="hero-admin-slide-head">
                    <span className="hero-admin-slide-num">Slide {selected.position}</span>
                  </div>

                  <div className="ab-field">
                    <label>Image</label>
                    <AdminImageUpload
                      value={selected.imageUrl ?? ""}
                      onChange={(url) => patchSlide(selected.id, { imageUrl: url || null })}
                      label={`Slide ${selected.position}`}
                      folder="hero-carousel"
                    />
                  </div>

                  <div className="ab-field">
                    <label>Texte alternatif (SEO)</label>
                    <input
                      className="ab-input"
                      type="text"
                      value={selected.imageAlt}
                      onChange={(e) => patchSlide(selected.id, { imageAlt: e.target.value })}
                    />
                  </div>

                  <div className="ab-field-grid">
                    <div className="ab-field">
                      <label>Sous-titre (eyebrow)</label>
                      <input
                        className="ab-input"
                        type="text"
                        value={selected.subtitle}
                        onChange={(e) => patchSlide(selected.id, { subtitle: e.target.value })}
                        placeholder="Nouvelle collection"
                      />
                    </div>
                    <div className="ab-field">
                      <label>Titre</label>
                      <input
                        className="ab-input"
                        type="text"
                        value={selected.title}
                        onChange={(e) => patchSlide(selected.id, { title: e.target.value })}
                        placeholder="Révélez votre"
                      />
                    </div>
                  </div>

                  <div className="ab-field">
                    <label>Accent (italique doré)</label>
                    <input
                      className="ab-input"
                      type="text"
                      value={selected.titleAccent}
                      onChange={(e) => patchSlide(selected.id, { titleAccent: e.target.value })}
                      placeholder="éclat"
                    />
                  </div>

                  <div className="ab-field-grid">
                    <div className="ab-field">
                      <label>Texte bouton</label>
                      <input
                        className="ab-input"
                        type="text"
                        value={selected.buttonText}
                        onChange={(e) => patchSlide(selected.id, { buttonText: e.target.value })}
                      />
                    </div>
                    <div className="ab-field">
                      <label>URL bouton</label>
                      <input
                        className="ab-input"
                        type="text"
                        value={selected.buttonLink}
                        onChange={(e) => patchSlide(selected.id, { buttonLink: e.target.value })}
                        placeholder="/boutique"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "8px 0", color: "var(--adm-ink-mute)" }}>
                  Sélectionnez une slide dans la liste.
                </div>
              )}
            </AdminAccordion>

            <AdminAccordion title="Aperçu carousel complet">
              <div className="hero-admin-preview" style={{ border: "none", boxShadow: "none", padding: 0 }}>
                {active.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--adm-ink-mute)", margin: 0 }}>
                    Aucune slide active avec image — fallback sur l&apos;ancienne bannière héro.
                  </p>
                ) : active.length === 1 ? (
                  <HomeHeroSingleSlide slides={active} slide={active[0]} preview />
                ) : (
                  <HomeHeroCarousel slides={active} settings={previewSettings} preview />
                )}
              </div>
            </AdminAccordion>
          </AdminAccordionStack>
        )}
      </div>

      {toast && <AdminToast msg={toast.msg} variant={toast.variant} />}
    </>
  );
}

/** @deprecated Utiliser HeroCarouselModule sur /admin/hero-carousel */
export function HeroCarouselPanel() {
  return <HeroCarouselModule />;
}
