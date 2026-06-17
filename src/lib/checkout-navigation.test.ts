import { describe, expect, it } from "vitest";
import {
  isCheckoutFocusMode,
  isCheckoutRoute,
} from "./checkout-navigation";

describe("isCheckoutRoute", () => {
  it("détecte /checkout et ses sous-routes", () => {
    expect(isCheckoutRoute("/checkout")).toBe(true);
    expect(isCheckoutRoute("/checkout/address")).toBe(true);
    expect(isCheckoutRoute("/checkout/shipping")).toBe(true);
    expect(isCheckoutRoute("/checkout/payment")).toBe(true);
    expect(isCheckoutRoute("/checkout/confirmation")).toBe(true);
    expect(isCheckoutRoute("/checkout/confirmation/thank-you")).toBe(true);
  });

  it("ignore les autres routes", () => {
    expect(isCheckoutRoute("/bag")).toBe(false);
    expect(isCheckoutRoute("/boutique")).toBe(false);
    expect(isCheckoutRoute("/api/checkout/create-account")).toBe(false);
    expect(isCheckoutRoute(null)).toBe(false);
  });
});

describe("isCheckoutFocusMode", () => {
  it("active le focus sur /checkout/*", () => {
    expect(isCheckoutFocusMode("/checkout/payment", true)).toBe(true);
  });

  it("active le focus sur /bag quand la tab bar est masquée", () => {
    expect(isCheckoutFocusMode("/bag", false)).toBe(true);
    expect(isCheckoutFocusMode("/bag", true)).toBe(false);
  });

  it("laisse le panier avec navigation visible", () => {
    expect(isCheckoutFocusMode("/bag", true)).toBe(false);
  });
});
