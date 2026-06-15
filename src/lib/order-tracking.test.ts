import { describe, expect, it } from "vitest";
import {
  buildCarrierTrackingUrl,
  isTrackableStatus,
  resolveOrderTrackingUrl,
} from "@/lib/order-tracking";

describe("order-tracking", () => {
  it("construit l’URL Colissimo", () => {
    const url = buildCarrierTrackingUrl("colissimo", "8R12345678901");
    expect(url).toContain("laposte.fr");
    expect(url).toContain("8R12345678901");
  });

  it("priorise l’URL admin personnalisée", () => {
    expect(
      resolveOrderTrackingUrl({
        trackingUrl: "https://track.example.com/ABC",
        carrier: "colissimo",
        trackingNumber: "XYZ",
      }),
    ).toBe("https://track.example.com/ABC");
  });

  it("retourne null sans numéro de suivi", () => {
    expect(resolveOrderTrackingUrl({ carrier: "colissimo", trackingNumber: null })).toBeNull();
  });

  it("identifie les statuts suivables", () => {
    expect(isTrackableStatus("shipped")).toBe(true);
    expect(isTrackableStatus("preparing")).toBe(false);
  });
});
