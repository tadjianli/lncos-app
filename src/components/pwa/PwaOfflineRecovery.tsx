"use client";

import { useEffect } from "react";
import { isSwPlainOfflineShell, pwaNavLog } from "@/lib/pwa/nav-diagnostics";

/**
 * Filet de sécurité : le SW legacy pouvait renvoyer du texte brut « Hors ligne ».
 * Si le réseau est disponible, on retente automatiquement le chargement.
 */
export function PwaOfflineRecovery() {
  useEffect(() => {
    if (!isSwPlainOfflineShell()) return;

    pwaNavLog("sw-plain-offline-detected", {
      online: navigator.onLine,
      path: window.location.pathname,
    });

    if (!navigator.onLine) return;

    const retry = () => {
      pwaNavLog("sw-plain-offline-reload");
      window.location.reload();
    };

    const timer = window.setTimeout(retry, 800);
    window.addEventListener("online", retry, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", retry);
    };
  }, []);

  return null;
}
