import { describe, expect, it } from "vitest";
import { AuthenticationError, APIError } from "@anthropic-ai/sdk";
import {
  classifyAnthropicError,
  isInsufficientCreditMessage,
} from "./ai-anthropic-client";

describe("isInsufficientCreditMessage", () => {
  it("détecte un message de crédit insuffisant", () => {
    expect(
      isInsufficientCreditMessage("Your credit balance is too low to access the Anthropic API")
    ).toBe(true);
  });
});

describe("classifyAnthropicError", () => {
  it("classifie une clé invalide", () => {
    const err = new AuthenticationError(401, undefined, "invalid x-api-key", undefined);
    const result = classifyAnthropicError(err);
    expect(result.status).toBe("invalid_key");
    expect(result.message).toBe("Clé invalide");
  });

  it("classifie un crédit insuffisant", () => {
    const err = new APIError(
      400,
      { type: "invalid_request_error", message: "credit balance is too low" },
      "credit balance is too low",
      undefined
    );
    const result = classifyAnthropicError(err);
    expect(result.status).toBe("insufficient_credit");
    expect(result.message).toBe("Crédit insuffisant");
  });

  it("classifie une erreur API générique", () => {
    const err = new APIError(500, { type: "api_error" }, "Internal server error", undefined);
    const result = classifyAnthropicError(err);
    expect(result.status).toBe("api_error");
    expect(result.message).toBe("Erreur API");
  });
});
