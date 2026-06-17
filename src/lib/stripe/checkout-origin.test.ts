import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { resolveCheckoutOrigin } from "./checkout-origin";

describe("resolveCheckoutOrigin", () => {
  const prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (prevSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
  });

  it("uses NEXT_PUBLIC_SITE_URL when configured", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.com/";
    const req = new Request("https://evil.com/api/stripe/checkout", {
      headers: { host: "evil.com" },
    });
    expect(resolveCheckoutOrigin(req)).toBe("https://shop.example.com");
  });

  it("ignores hostile host when SITE_URL is set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.lncos.fr";
    const req = new Request("https://attacker.example/api/stripe/checkout", {
      headers: { host: "attacker.example", "x-forwarded-host": "attacker.example" },
    });
    expect(resolveCheckoutOrigin(req)).toBe("https://www.lncos.fr");
  });

  it("falls back to forwarded host in dev without SITE_URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const req = new Request("http://localhost:3000/api/stripe/checkout", {
      headers: { host: "localhost:3000" },
    });
    expect(resolveCheckoutOrigin(req)).toBe("http://localhost:3000");
  });
});
