"use client";

import { useEffect } from "react";

const DEBUG_ATTR = "data-lncos-debug-nav";
const STORAGE_KEY = "lncos-debug-nav";

/**
 * Active les bordures de debug layout (?debugNav=1 ou localStorage lncos-debug-nav=1).
 * Retirer une fois le gap PWA identifié.
 */
export function NavLayoutDebug() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("debugNav") === "1";
    const fromStorage = localStorage.getItem(STORAGE_KEY) === "1";

    if (fromQuery) {
      localStorage.setItem(STORAGE_KEY, "1");
    }

    if (fromQuery || fromStorage) {
      document.documentElement.setAttribute(DEBUG_ATTR, "");
    }

    return () => {
      document.documentElement.removeAttribute(DEBUG_ATTR);
    };
  }, []);

  return null;
}
