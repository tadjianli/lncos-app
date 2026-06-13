"use client";

import { useEffect } from "react";

function isStandalonePwa(): boolean {
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || iosStandalone;
}

function isIosFormField(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  if (el instanceof HTMLInputElement) {
    const type = el.type;
    return (
      type !== "checkbox" &&
      type !== "radio" &&
      type !== "hidden" &&
      type !== "button" &&
      type !== "submit" &&
      type !== "file"
    );
  }
  return false;
}

/** Hauteur réelle du viewport — pour reels / slides plein écran (pas pour verrouiller le shell). */
function syncStandaloneViewport() {
  const root = document.documentElement;

  if (!isStandalonePwa()) {
    root.classList.remove("standalone-pwa");
    root.style.removeProperty("--viewport-h");
    return;
  }

  const h = window.visualViewport?.height ?? window.innerHeight;
  root.classList.add("standalone-pwa");
  root.style.setProperty("--viewport-h", `${Math.round(h)}px`);
}

/** iOS laisse parfois un décalage de scroll / scale après fermeture du clavier. */
function restoreViewportAfterKeyboard() {
  if (!isStandalonePwa()) return;

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const vv = window.visualViewport;
  if (vv && vv.offsetTop > 0) {
    window.scrollTo(0, 0);
  }

  syncStandaloneViewport();
}

export function StandaloneViewportSync() {
  useEffect(() => {
    syncStandaloneViewport();

    let lastViewportHeight = window.visualViewport?.height ?? window.innerHeight;

    const onViewportChange = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      if (h > lastViewportHeight + 72) {
        restoreViewportAfterKeyboard();
      } else {
        syncStandaloneViewport();
      }
      lastViewportHeight = h;
    };

    const onFocusOut = (e: FocusEvent) => {
      if (!isIosFormField(e.target)) return;
      window.requestAnimationFrame(() => {
        window.setTimeout(restoreViewportAfterKeyboard, 80);
      });
    };

    const vv = window.visualViewport;
    vv?.addEventListener("resize", onViewportChange);
    vv?.addEventListener("scroll", onViewportChange);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    document.addEventListener("focusout", onFocusOut, true);

    return () => {
      vv?.removeEventListener("resize", onViewportChange);
      vv?.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      document.removeEventListener("focusout", onFocusOut, true);
      document.documentElement.classList.remove("standalone-pwa");
      document.documentElement.style.removeProperty("--viewport-h");
    };
  }, []);

  return null;
}
