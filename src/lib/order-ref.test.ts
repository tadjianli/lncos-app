import { describe, expect, it } from "vitest";
import { formatOrderRef } from "@/lib/order-ref";

describe("formatOrderRef", () => {
  it("retourne l’id complet quand il est déjà préfixé LN-", () => {
    expect(formatOrderRef("LN-2593")).toBe("LN-2593");
    expect(formatOrderRef("ln-2593")).toBe("LN-2593");
  });

  it("n’ajoute pas un second préfixe LN-", () => {
    expect(formatOrderRef("LN-2593")).not.toBe("LN-LN-259");
    expect(formatOrderRef("LN-2593")).not.toContain("LN-LN-");
  });

  it("ne tronque pas le numéro", () => {
    expect(formatOrderRef("LN-123456789")).toBe("LN-123456789");
  });

  it("préfixe une seule fois les ids sans préfixe", () => {
    expect(formatOrderRef("2593")).toBe("LN-2593");
    expect(formatOrderRef("abc-def")).toBe("LN-ABC-DEF");
  });

  it("gère les valeurs vides", () => {
    expect(formatOrderRef("")).toBe("LN-????");
    expect(formatOrderRef(null)).toBe("LN-????");
  });
});
