import { describe, expect, it } from "vitest";
import type { ShippingMethod } from "@/lib/admin-supabase";
import {
  computeShippingCost,
  filterEligibleShippingMethods,
  isShippingMethodEligible,
  validateShippingMethodForm,
} from "@/lib/shipping-rules";

function baseMethod(overrides: Partial<ShippingMethod> = {}): ShippingMethod {
  return {
    id: "1",
    name: "Standard",
    description: "2-3 jours ouvrés",
    price: 4.9,
    estimatedDays: "2-3 jours",
    icon: "truck",
    isActive: true,
    isFree: false,
    freeShippingEnabled: true,
    freeShippingThreshold: 50,
    minimumOrderEnabled: false,
    minimumOrderAmount: null,
    maximumOrderEnabled: false,
    maximumOrderAmount: null,
    sortOrder: 0,
    createdAt: "",
    ...overrides,
  };
}

const standard = baseMethod();
const express = baseMethod({
  id: "2",
  name: "Express",
  price: 9.9,
  freeShippingEnabled: false,
  freeShippingThreshold: null,
  minimumOrderEnabled: true,
  minimumOrderAmount: 20,
});
const economy = baseMethod({
  id: "3",
  name: "Économique",
  price: 2.9,
  freeShippingEnabled: false,
  freeShippingThreshold: null,
  maximumOrderEnabled: true,
  maximumOrderAmount: 100,
});

const allMethods = [standard, express, economy];

describe("computeShippingCost — Standard offert dès 50€", () => {
  it("facture 4.90€ pour un panier de 40€", () => {
    expect(computeShippingCost(standard, 40)).toBe(4.9);
  });

  it("est gratuit pour un panier de 50€", () => {
    expect(computeShippingCost(standard, 50)).toBe(0);
  });

  it("est gratuit pour un panier de 70€", () => {
    expect(computeShippingCost(standard, 70)).toBe(0);
  });
});

describe("isShippingMethodEligible", () => {
  it("masque Express si panier < 20€", () => {
    expect(isShippingMethodEligible(express, 15)).toBe(false);
    expect(isShippingMethodEligible(express, 25)).toBe(true);
  });

  it("masque Économique si panier > 100€", () => {
    expect(isShippingMethodEligible(economy, 120)).toBe(false);
    expect(isShippingMethodEligible(economy, 100)).toBe(true);
  });
});

describe("filterEligibleShippingMethods", () => {
  it("panier 10€ — uniquement Standard et Économique", () => {
    const eligible = filterEligibleShippingMethods(allMethods, 10);
    expect(eligible.map((m) => m.name)).toEqual(["Standard", "Économique"]);
  });

  it("panier 25€ — Standard, Express et Économique", () => {
    const eligible = filterEligibleShippingMethods(allMethods, 25);
    expect(eligible.map((m) => m.name)).toEqual(["Standard", "Express", "Économique"]);
  });

  it("panier 50€ — toutes les méthodes actives", () => {
    const eligible = filterEligibleShippingMethods(allMethods, 50);
    expect(eligible.map((m) => m.name)).toEqual(["Standard", "Express", "Économique"]);
  });

  it("panier 100€ — toutes les méthodes (max économique inclus)", () => {
    const eligible = filterEligibleShippingMethods(allMethods, 100);
    expect(eligible.map((m) => m.name)).toEqual(["Standard", "Express", "Économique"]);
  });

  it("panier 200€ — Standard et Express", () => {
    const eligible = filterEligibleShippingMethods(allMethods, 200);
    expect(eligible.map((m) => m.name)).toEqual(["Standard", "Express"]);
  });
});

describe("validateShippingMethodForm", () => {
  it("rejette minimum > maximum", () => {
    const result = validateShippingMethodForm({
      ...baseMethod(),
      name: "Test",
      minimumOrderEnabled: true,
      minimumOrderAmount: 80,
      maximumOrderEnabled: true,
      maximumOrderAmount: 50,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("minimum"))).toBe(true);
  });

  it("rejette seuil vide si toggle activé", () => {
    const result = validateShippingMethodForm({
      ...baseMethod(),
      name: "Test",
      freeShippingEnabled: true,
      freeShippingThreshold: null,
    });
    expect(result.valid).toBe(false);
  });
});
