"use client";

const DEBUG_KEY = "lncos-pwa-debug";

export function isPwaNavDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_PWA_DEBUG === "1") return true;
  try {
    return localStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

export function pwaNavLog(event: string, detail?: Record<string, unknown>): void {
  if (!isPwaNavDebugEnabled()) return;
  console.log("[LN COS Nav]", event, detail ?? "");
}

export function installPwaNavDiagnostics(): () => void {
  if (typeof window === "undefined") return () => {};

  const logOnline = () =>
    pwaNavLog("connectivity", { online: navigator.onLine, type: "online" });
  const logOffline = () =>
    pwaNavLog("connectivity", { online: navigator.onLine, type: "offline" });

  window.addEventListener("online", logOnline);
  window.addEventListener("offline", logOffline);

  pwaNavLog("init", {
    online: navigator.onLine,
    path: window.location.pathname,
    controller: Boolean(navigator.serviceWorker?.controller),
  });

  return () => {
    window.removeEventListener("online", logOnline);
    window.removeEventListener("offline", logOffline);
  };
}

/** Détecte la coquille texte plain du SW legacy et recharge si le réseau est OK. */
export function isPlainOfflineText(text: string | undefined | null): boolean {
  return text?.trim() === "Hors ligne";
}

export function isSwPlainOfflineShell(): boolean {
  if (typeof document === "undefined") return false;
  return isPlainOfflineText(document.body?.innerText);
}
