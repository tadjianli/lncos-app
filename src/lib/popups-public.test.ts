import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type { Popup } from "./rdv-store";
import {
  getPopupBlockReason,
  isPopupScheduleActive,
  markPopupDismissed,
  pathnameMatchesPopupPages,
  pickEligiblePopup,
  POPUP_FREQUENCY_STORAGE_PREFIX,
} from "./popups-public";
import { getPopupLocalStorage } from "./popup-storage";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

beforeEach(() => {
  const local = createStorage();
  const session = createStorage();
  vi.stubGlobal("localStorage", local);
  vi.stubGlobal("sessionStorage", session);
  vi.stubGlobal("window", {
    localStorage: local,
    sessionStorage: session,
    matchMedia: () => ({ matches: false }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const basePopup: Popup = {
  id: "pop_test",
  name: "Test",
  enabled: true,
  type: "promo_code",
  layout: "centered",
  eyebrow: "Offre",
  title: "−10%",
  subtitle: "Profitez maintenant",
  code: "TEST10",
  ctaLabel: "Copier",
  ctaAction: "copy",
  emailCapture: false,
  accent: "#D4AF37",
  image: false,
  imageId: "",
  delaySec: 1,
  trigger: "delay",
  frequency: { mode: "always", days: 7 },
  audience: "all",
  device: "all",
  pages: ["home"],
  countdown: { enabled: false, minutes: 30 },
  schedule: { enabled: false, start: "", end: "" },
  stats: {
    views: 0,
    closes: 0,
    clicks: 0,
    copies: 0,
    conversions: 0,
    daily: new Array(14).fill(0),
  },
};

describe("pathnameMatchesPopupPages", () => {
  it("matche home et boutique", () => {
    expect(pathnameMatchesPopupPages("/", ["home"])).toBe(true);
    expect(pathnameMatchesPopupPages("/boutique", ["boutique"])).toBe(true);
  });
});

describe("isPopupScheduleActive", () => {
  it("bloque avant la date de début", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const result = isPopupScheduleActive({
      enabled: true,
      start: future,
      end: "",
    });
    expect(result.active).toBe(false);
    expect(result.reason).toBe("schedule_not_started");
  });

  it("bloque après la date de fin", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const result = isPopupScheduleActive({
      enabled: true,
      start: "",
      end: past,
    });
    expect(result.active).toBe(false);
    expect(result.reason).toBe("schedule_ended");
  });
});

describe("pickEligiblePopup", () => {
  it("retourne la première popup éligible", () => {
    const { popup } = pickEligiblePopup([basePopup], {
      pathname: "/",
      overlayOpen: false,
      previewMode: false,
    });
    expect(popup?.id).toBe("pop_test");
  });

  it("bloque sur mauvaise page", () => {
    const reason = getPopupBlockReason(basePopup, {
      pathname: "/bag",
      overlayOpen: false,
      previewMode: false,
    });
    expect(reason).toBe("wrong_page");
  });

  it("respecte frequency once après dismiss", () => {
    markPopupDismissed({ ...basePopup, frequency: { mode: "once", days: 7 } });
    const reason = getPopupBlockReason(
      { ...basePopup, frequency: { mode: "once", days: 7 } },
      { pathname: "/", overlayOpen: false, previewMode: false }
    );
    expect(reason).toBe("frequency_once");
  });

  it("bloque si Promotions & offres désactivées", () => {
    const reason = getPopupBlockReason(basePopup, {
      pathname: "/",
      overlayOpen: false,
      previewMode: false,
      promosEnabled: false,
    });
    expect(reason).toBe("promos_disabled");
  });
});

describe("localStorage dismiss", () => {
  it("persiste la clé de fréquence", () => {
    markPopupDismissed({ ...basePopup, frequency: { mode: "once", days: 7 } });
    expect(
      getPopupLocalStorage().getItem(`${POPUP_FREQUENCY_STORAGE_PREFIX}pop_test`)
    ).toBeTruthy();
  });
});
