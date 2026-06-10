"use client";

import { useEffect } from "react";

function isStandalonePwa(): boolean {
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mq || iosStandalone;
}

/** Hauteur réelle du viewport en PWA iOS (100dvh seul laisse une zone morte sous la nav). */
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

export function StandaloneViewportSync() {
  useEffect(() => {
    syncStandaloneViewport();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncStandaloneViewport);
    vv?.addEventListener("scroll", syncStandaloneViewport);
    window.addEventListener("resize", syncStandaloneViewport);
    window.addEventListener("orientationchange", syncStandaloneViewport);

    return () => {
      vv?.removeEventListener("resize", syncStandaloneViewport);
      vv?.removeEventListener("scroll", syncStandaloneViewport);
      window.removeEventListener("resize", syncStandaloneViewport);
      window.removeEventListener("orientationchange", syncStandaloneViewport);
      document.documentElement.classList.remove("standalone-pwa");
      document.documentElement.style.removeProperty("--viewport-h");
    };
  }, []);

  return null;
}
