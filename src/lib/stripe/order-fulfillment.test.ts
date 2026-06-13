import { describe, expect, it } from "vitest";
import { decodeItemsSnapshot, encodeItemsSnapshot } from "./order-fulfillment";

describe("order-fulfillment snapshot", () => {
  const sample = [
    { id: "prod-1", name: "Sérum Éclat", price: 9.9, qty: 2, variant: "30 ml" },
    { id: "prod-2", name: "Crème Nuit", price: 15.5, qty: 1, variant: "" },
  ];

  it("encodes and decodes a compact snapshot", () => {
    const meta = encodeItemsSnapshot(sample);
    const decoded = decodeItemsSnapshot(meta);
    expect(decoded).toHaveLength(2);
    expect(decoded?.[0]).toMatchObject({ id: "prod-1", qty: 2, price: 9.9, variant: "30 ml" });
    expect(decoded?.[1]).toMatchObject({ id: "prod-2", qty: 1, price: 15.5 });
  });

  it("chunks large carts across metadata keys", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `uuid-${i.toString().padStart(8, "0")}-aaaa-bbbb-cccc-ddddeeeeffff`,
      name: `Produit premium numéro ${i + 1}`,
      price: 9.9 + i,
      qty: 1,
      variant: `Variante ${i}`,
    }));
    const meta = encodeItemsSnapshot(many);
    expect(meta.items_snapshot || meta.items_chunks).toBeTruthy();
    const decoded = decodeItemsSnapshot(meta);
    expect(decoded?.length).toBe(12);
  });
});
