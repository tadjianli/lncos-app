import { describe, expect, it } from "vitest";
import {
  durationTotalSeconds,
  endAtRemainingSeconds,
  parseFlashCountdown,
  splitSeconds,
} from "./flash-countdown";

describe("parseFlashCountdown", () => {
  it("retourne les defaults si raw invalide", () => {
    expect(parseFlashCountdown(null).hours).toBe(4);
    expect(parseFlashCountdown(null).enabled).toBe(true);
  });

  it("parse un objet DB snake_case", () => {
    const c = parseFlashCountdown({
      enabled: false,
      mode: "end_at",
      hours: 1,
      minutes: 30,
      seconds: 0,
      end_at: "2026-12-31T23:59:59.000Z",
      on_expire: "hide",
    });
    expect(c.enabled).toBe(false);
    expect(c.mode).toBe("end_at");
    expect(c.onExpire).toBe("hide");
  });
});

describe("durationTotalSeconds", () => {
  it("additionne h m s", () => {
    expect(durationTotalSeconds({ hours: 4, minutes: 12, seconds: 34 })).toBe(15154);
  });
});

describe("splitSeconds", () => {
  it("décompose en h m s", () => {
    expect(splitSeconds(3661)).toEqual({ h: 1, m: 1, s: 1 });
  });
});

describe("endAtRemainingSeconds", () => {
  it("calcule le temps restant", () => {
    const end = new Date("2030-01-01T12:00:00.000Z").getTime();
    const now = end - 90_000;
    expect(endAtRemainingSeconds("2030-01-01T12:00:00.000Z", now)).toBe(90);
  });
});
