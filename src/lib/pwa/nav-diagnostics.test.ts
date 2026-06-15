import { describe, expect, it } from "vitest";
import { isPlainOfflineText } from "./nav-diagnostics";

describe("isPlainOfflineText", () => {
  it("détecte la coquille texte plain du SW legacy", () => {
    expect(isPlainOfflineText("Hors ligne")).toBe(true);
  });

  it("ignore une page HTML normale", () => {
    expect(isPlainOfflineText("FAQ\nRetrouvez les réponses")).toBe(false);
  });
});
