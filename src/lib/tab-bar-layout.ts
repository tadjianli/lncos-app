/**
 * Tab bar flottante LN COS — hauteurs de référence (alignées sur globals.css).
 *
 * Hauteur visuelle du dock : float-gap (16) + barre pill (72) + safe-area.
 * Clearance scroll : hauteur dock + marge confort (24 px).
 */

export const TAB_BAR_FLOAT_GAP = 16;
export const TAB_BAR_BAR_HEIGHT = 72;
/** Marge confort sous le dernier élément scrollable (20–30 px). */
export const TAB_BAR_SCROLL_COMFORT = 24;

/** Hauteur fixe sans safe-area — référence JS (88 px). */
export const TAB_BAR_HEIGHT = TAB_BAR_FLOAT_GAP + TAB_BAR_BAR_HEIGHT;

/** Clearance scroll sans safe-area (112 px). */
export const TAB_BAR_SCROLL_CLEARANCE = TAB_BAR_HEIGHT + TAB_BAR_SCROLL_COMFORT;

/** Variables CSS consommées par ScrollRegion / globals.css */
export const TAB_BAR_CSS_VARS = {
  height: "--tab-bar-height",
  scrollPadBottom: "--app-scroll-pad-bottom",
  scrollComfort: "--tab-bar-scroll-comfort",
} as const;
