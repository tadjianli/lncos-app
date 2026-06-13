import { describe, expect, it } from "vitest";
import { decodeShippingAddress, encodeShippingAddress } from "./shipping-address";

describe("shipping-address metadata", () => {
  const sample = {
    firstName: "Marie",
    lastName: "Durand",
    address: "12 rue des Palmiers",
    zip: "97400",
    city: "Saint-Denis",
    phone: "0692123456",
  };

  it("encodes and decodes a shipping address", () => {
    const meta = encodeShippingAddress(sample);
    expect(meta.ship_addr.length).toBeLessThanOrEqual(500);
    expect(decodeShippingAddress(meta)).toEqual(sample);
  });
});
