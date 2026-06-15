const VERSION_STORAGE_KEY = "lncos-app-version";
const CHECK_INTERVAL_MS = 30_000;
const SW_URL = "/sw.js";

let reloadScheduled = false;
let updateActivationPending = false;

export function shouldRegisterPwa(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_PWA_DEV === "1";
  }
  return true;
}

export async function clearLncosCaches(): Promise<void> {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith("lncos-")).map((key) => caches.delete(key))
  );
}

function scheduleReload(): void {
  if (reloadScheduled) return;
  reloadScheduled = true;
  window.location.reload();
}

async function fetchRemoteVersion(): Promise<string | null> {
  try {
    const res = await fetch("/api/app-version", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

function getStoredVersion(): string | null {
  try {
    return sessionStorage.getItem(VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredVersion(version: string): void {
  try {
    sessionStorage.setItem(VERSION_STORAGE_KEY, version);
  } catch {
    /* ignore */
  }
}

async function activateWaitingWorker(registration: ServiceWorkerRegistration): Promise<void> {
  const worker = registration.waiting ?? registration.installing;
  worker?.postMessage({ type: "SKIP_WAITING" });
}

async function applyVersionUpdate(
  registration: ServiceWorkerRegistration,
  nextVersion: string
): Promise<void> {
  updateActivationPending = true;
  // Ne pas vider le cache shell actif — le handler activate du SW purge les anciennes versions.
  await registration.update();
  await activateWaitingWorker(registration);
  setStoredVersion(nextVersion);
}

export async function checkForAppUpdate(
  registration: ServiceWorkerRegistration | null
): Promise<void> {
  if (registration) {
    try {
      await registration.update();
    } catch {
      /* ignore */
    }
  }

  const remoteVersion = await fetchRemoteVersion();
  if (!remoteVersion) return;

  const storedVersion = getStoredVersion();
  if (!storedVersion) {
    setStoredVersion(remoteVersion);
    return;
  }

  if (storedVersion === remoteVersion) return;

  if (registration) {
    await applyVersionUpdate(registration, remoteVersion);
  } else {
    updateActivationPending = true;
    setStoredVersion(remoteVersion);
    scheduleReload();
  }
}

export function registerPwaUpdateHandlers(): () => void {
  if (!shouldRegisterPwa()) {
    return () => {};
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!updateActivationPending) return;
    scheduleReload();
  });

  let registration: ServiceWorkerRegistration | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  void (async () => {
    try {
      registration = await navigator.serviceWorker.register(SW_URL, {
        scope: "/",
        updateViaCache: "none",
      });

      registration.addEventListener("updatefound", () => {
        const worker = registration?.installing;
        if (!worker) return;

        worker.addEventListener("statechange", () => {
          if (worker.state !== "installed") return;
          if (!navigator.serviceWorker.controller) return;
          updateActivationPending = true;
          worker.postMessage({ type: "SKIP_WAITING" });
        });
      });

      await checkForAppUpdate(registration);

      if (disposed) return;

      intervalId = setInterval(() => {
        void checkForAppUpdate(registration);
      }, CHECK_INTERVAL_MS);
    } catch (err) {
      console.warn("[PWA] Service worker registration failed:", err);
    }
  })();

  return () => {
    disposed = true;
    if (intervalId !== null) clearInterval(intervalId);
  };
}
