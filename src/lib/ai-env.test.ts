import { afterEach, describe, expect, it } from "vitest";
import {
  getAiEncryptionSecret,
  isAiEncryptionConfigured,
  resolveAnthropicApiKey,
} from "./ai-env";

const ORIGINAL = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("ai-env", () => {
  it("détecte AI_ENCRYPTION_KEY en priorité", () => {
    process.env.AI_ENCRYPTION_KEY = "dedicated-secret";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    expect(getAiEncryptionSecret()).toBe("dedicated-secret");
  });

  it("utilise SUPABASE_SERVICE_ROLE_KEY en repli", () => {
    delete process.env.AI_ENCRYPTION_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    expect(isAiEncryptionConfigured()).toBe(true);
  });

  it("priorise ANTHROPIC_API_KEY sur la clé stockée", () => {
    process.env.ANTHROPIC_API_KEY = "sk-env";
    expect(resolveAnthropicApiKey("sk-db")).toBe("sk-env");
  });

  it("signale l'absence de chiffrement", () => {
    delete process.env.AI_ENCRYPTION_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(isAiEncryptionConfigured()).toBe(false);
  });
});
