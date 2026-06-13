import { describe, expect, it } from "vitest";
import { checkProductionEnv, PRODUCTION_ENV_SPECS } from "./production-config";

describe("production-config", () => {
  it("defines all required production variables", () => {
    const keys = PRODUCTION_ENV_SPECS.map((s) => s.key);
    expect(keys).toContain("NEXT_PUBLIC_SITE_URL");
    expect(keys).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(keys).toContain("RESEND_API_KEY");
    expect(keys).toContain("RESEND_FROM");
  });

  it("never marks server secrets as client-safe", () => {
    const serverSecrets = ["SUPABASE_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY", "RESEND_API_KEY"];
    for (const key of serverSecrets) {
      const spec = PRODUCTION_ENV_SPECS.find((s) => s.key === key);
      expect(spec?.clientSafe).toBe(false);
    }
  });

  it("returns structured check results", () => {
    const checks = checkProductionEnv();
    expect(checks.length).toBe(PRODUCTION_ENV_SPECS.length);
    expect(checks.every((c) => ["ok", "missing", "empty"].includes(c.status))).toBe(true);
  });
});
