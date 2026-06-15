import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./admin-nav-config";

describe("isNavItemActive", () => {
  it("active ventes flash avec tab=flash", () => {
    const search = new URLSearchParams("tab=flash");
    expect(
      isNavItemActive(
        { id: "flash-sales", href: "/admin/content-pages?tab=flash", icon: "flame", label: "Ventes Flash" },
        "/admin/content-pages",
        search
      )
    ).toBe(true);
  });

  it("active pages contenu sans tab", () => {
    expect(
      isNavItemActive(
        { id: "content-pages", href: "/admin/content-pages", icon: "edit", label: "Pages contenu" },
        "/admin/content-pages",
        new URLSearchParams()
      )
    ).toBe(true);
  });

  it("active retours via settings legal", () => {
    expect(
      isNavItemActive(
        { id: "returns", href: "/admin/settings?section=legal", icon: "arrowR", label: "Retours" },
        "/admin/settings",
        new URLSearchParams("section=legal")
      )
    ).toBe(true);
  });
});
