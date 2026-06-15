import { describe, expect, it, vi } from "vitest";
import { finishProductOverlayClose } from "./product-navigation";

describe("finishProductOverlayClose", () => {
  it("restaure l'overlay listing sans closeOverlay intermédiaire", () => {
    const closeOverlay = vi.fn();
    const restoreOverlay = vi.fn();
    const previousOverlay = {
      type: "listing" as const,
      category: { id: "visage", name: "Visage", count: 2 },
    };

    finishProductOverlayClose(
      {
        pathname: "/discover",
        search: "?cat=visage",
        source: "categories",
        previousOverlay,
      },
      closeOverlay,
      restoreOverlay,
    );

    expect(restoreOverlay).toHaveBeenCalledWith(previousOverlay);
    expect(closeOverlay).not.toHaveBeenCalled();
  });

  it("ferme complètement si aucun overlay précédent", () => {
    const closeOverlay = vi.fn();
    const restoreOverlay = vi.fn();

    finishProductOverlayClose(
      {
        pathname: "/boutique",
        search: "",
        source: "boutique",
        previousOverlay: null,
      },
      closeOverlay,
      restoreOverlay,
    );

    expect(closeOverlay).toHaveBeenCalled();
    expect(restoreOverlay).not.toHaveBeenCalled();
  });
});
