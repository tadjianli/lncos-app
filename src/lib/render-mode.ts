"use client";
/**
 * LN COS — Render mode
 * Controls how the client app renders based on URL parameters.
 *
 *   live      — normal public-facing render (home_sections published)
 *   preview   — admin preview (home_sections_draft, ?preview=1)
 *   builder   — AppBuilder iframe embed (no nav, ?builder=1)
 */

export type RenderMode = "live" | "preview" | "builder";

/** Client hook — reads URL search params to determine render mode */
export function getRenderModeFromSearch(search: string): RenderMode {
  const params = new URLSearchParams(search);
  if (params.get("builder") === "1") return "builder";
  if (params.get("preview") === "1") return "preview";
  return "live";
}

/** Which home_sections table to read based on mode */
export function sectionsTable(mode: RenderMode): "home_sections" | "home_sections_draft" {
  return mode === "preview" ? "home_sections_draft" : "home_sections";
}

/** Whether to show nav in this mode */
export function showNav(mode: RenderMode): boolean {
  return mode !== "builder";
}
