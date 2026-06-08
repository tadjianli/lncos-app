"use client";
/**
 * LN COS — Home Sections Store
 *
 * Manages the homepage section configuration with:
 *  • reorderable sections
 *  • per-section enable/disable
 *  • draft / published two-stage publishing
 *  • App Builder preview isolation mode
 *
 * Persisted to localStorage so admin changes survive refresh.
 * Consumers call `useHomeSectionsStore` — NOT the main `useStore`.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_HOME_SECTIONS,
  visibleSections,
  type HomeSection,
  type SectionType,
} from "@/lib/home-sections";

/* ─── Types ─────────────────────────────────────────────────────────── */

type SectionPatch = Partial<Omit<HomeSection, "id" | "type">>;

interface HomeSectionsState {
  /** Sections actively serving client traffic */
  published: HomeSection[];
  /** Staging copy for admin editing — null means no uncommitted changes */
  draft: HomeSection[] | null;
  /** When true, renders draft instead of published (App Builder preview) */
  previewMode: boolean;

  /* ── Computed ───────────────────────────────────────── */
  /** Returns the list that the homepage should render */
  activeSections: () => HomeSection[];
  /** Filters for the current render context (mobile/vip/schedule) */
  getVisible: (opts?: { isMobile?: boolean; isVip?: boolean; isLoggedIn?: boolean }) => HomeSection[];

  /* ── Published mutations ────────────────────────────── */
  toggleSection: (id: string) => void;
  moveSection: (id: string, direction: "up" | "down") => void;
  updateSection: (id: string, patch: SectionPatch) => void;

  /* ── Draft workflow ─────────────────────────────────── */
  beginDraft: () => void;
  updateDraftSection: (id: string, patch: SectionPatch) => void;
  moveDraftSection: (id: string, direction: "up" | "down") => void;
  toggleDraftSection: (id: string) => void;
  discardDraft: () => void;
  publishDraft: () => void;

  /* ── Preview mode (App Builder) ─────────────────────── */
  setPreviewMode: (on: boolean) => void;

  /* ── Reset ──────────────────────────────────────────── */
  resetToDefaults: () => void;
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function moveItem<T>(arr: T[], id: string, direction: "up" | "down"): T[] {
  const idx = arr.findIndex((s: unknown) => (s as HomeSection).id === id);
  if (idx === -1) return arr;
  const next = direction === "up" ? idx - 1 : idx + 1;
  if (next < 0 || next >= arr.length) return arr;
  const copy = [...arr];
  [copy[idx], copy[next]] = [copy[next], copy[idx]];
  return copy;
}

function patchSection(sections: HomeSection[], id: string, patch: SectionPatch): HomeSection[] {
  return sections.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

/* ─── Store ─────────────────────────────────────────────────────────── */

export const useHomeSectionsStore = create<HomeSectionsState>()(
  persist(
    (set, get) => ({
      published: DEFAULT_HOME_SECTIONS,
      draft: null,
      previewMode: false,

      /* ── Computed ─────────────────────────────────────── */
      activeSections() {
        const { published, draft, previewMode } = get();
        return previewMode && draft ? draft : published;
      },
      getVisible(opts = {}) {
        return visibleSections(get().activeSections(), opts);
      },

      /* ── Published mutations ──────────────────────────── */
      toggleSection(id) {
        set((s) => ({
          published: patchSection(s.published, id, {
            enabled: !s.published.find((sec) => sec.id === id)?.enabled,
          }),
        }));
      },
      moveSection(id, direction) {
        set((s) => ({ published: moveItem(s.published, id, direction) }));
      },
      updateSection(id, patch) {
        set((s) => ({ published: patchSection(s.published, id, patch) }));
      },

      /* ── Draft workflow ───────────────────────────────── */
      beginDraft() {
        set((s) => ({ draft: s.draft ?? [...s.published] }));
      },
      updateDraftSection(id, patch) {
        set((s) => ({
          draft: s.draft ? patchSection(s.draft, id, patch) : s.draft,
        }));
      },
      moveDraftSection(id, direction) {
        set((s) => ({
          draft: s.draft ? moveItem(s.draft, id, direction) : s.draft,
        }));
      },
      toggleDraftSection(id) {
        set((s) => ({
          draft: s.draft
            ? patchSection(s.draft, id, {
                enabled: !s.draft.find((sec) => sec.id === id)?.enabled,
              })
            : s.draft,
        }));
      },
      discardDraft() {
        set({ draft: null, previewMode: false });
      },
      publishDraft() {
        set((s) => ({
          published: s.draft ?? s.published,
          draft: null,
          previewMode: false,
        }));
      },

      /* ── Preview mode ─────────────────────────────────── */
      setPreviewMode(on) {
        set((s) => ({
          previewMode: on,
          // Auto-begin draft when entering preview if none exists
          draft: on && !s.draft ? [...s.published] : s.draft,
        }));
      },

      /* ── Reset ────────────────────────────────────────── */
      resetToDefaults() {
        set({ published: DEFAULT_HOME_SECTIONS, draft: null, previewMode: false });
      },
    }),
    {
      name: "lncos-home-sections",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      // Persist published + draft; previewMode is ephemeral (reset on reload)
      partialize: (s) => ({ published: s.published, draft: s.draft }),
    }
  )
);

/* ─── Typed section-type selector ───────────────────────────────────── */
export function selectSectionsByType(type: SectionType) {
  return (s: HomeSectionsState) => s.activeSections().filter((sec) => sec.type === type);
}
