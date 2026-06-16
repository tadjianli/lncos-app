import { describe, expect, it } from "vitest";
import {
  countdownUnitLabel,
  durationTotalSeconds,
  endAtRemainingSeconds,
  getCountdownDisplayUnits,
  parseFlashCountdown,
  splitCountdownParts,
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

describe("splitCountdownParts", () => {
  it("décompose en jours heures minutes secondes", () => {
    const total = 360 * 86400 + 21 * 3600 + 58 * 60 + 12;
    expect(splitCountdownParts(total)).toEqual({
      days: 360,
      hours: 21,
      minutes: 58,
      seconds: 12,
      total,
    });
  });
});

describe("getCountdownDisplayUnits", () => {
  it("affiche j h min au-delà de 30 jours", () => {
    const units = getCountdownDisplayUnits(31 * 86400);
    expect(units.map((u) => u.key)).toEqual(["days", "hours", "minutes"]);
    expect(units[0].value).toBe(31);
  });

  it("affiche j h min sec entre 24h et 30 jours", () => {
    const units = getCountdownDisplayUnits(5 * 86400);
    expect(units.map((u) => u.key)).toEqual(["days", "hours", "minutes", "seconds"]);
  });

  it("affiche h min sec sous 24h", () => {
    const units = getCountdownDisplayUnits(3661);
    expect(units.map((u) => u.key)).toEqual(["hours", "minutes", "seconds"]);
    expect(units[0].value).toBe(1);
  });

  it("chaque unité a un libellé court", () => {
    const units = getCountdownDisplayUnits(3600);
    for (const u of units) {
      expect(u.shortLabel.length).toBeGreaterThan(0);
      expect(u.label.length).toBeGreaterThan(0);
    }
  });
});

describe("countdownUnitLabel", () => {
  it("gère singulier et pluriel", () => {
    expect(countdownUnitLabel("days", 1)).toBe("Jour");
    expect(countdownUnitLabel("days", 2)).toBe("Jours");
    expect(countdownUnitLabel("hours", 1)).toBe("Heure");
  });
});

describe("endAtRemainingSeconds", () => {
  it("calcule le temps restant", () => {
    const end = new Date("2030-01-01T12:00:00.000Z").getTime();
    const now = end - 90_000;
    expect(endAtRemainingSeconds("2030-01-01T12:00:00.000Z", now)).toBe(90);
  });
});
