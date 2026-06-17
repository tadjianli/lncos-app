/**
 * Stockage popup — Web, PWA iOS/Android (WKWebView / Chrome).
 * Fallback mémoire si localStorage/sessionStorage indisponible (ITP, mode privé).
 */

type KVStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function memoryKv(store: Map<string, string>): KVStorage {
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

const memoryLocal = new Map<string, string>();
const memorySession = new Map<string, string>();

function wrapBrowserStorage(
  storage: Storage | null | undefined,
  memory: Map<string, string>
): KVStorage {
  if (!storage) return memoryKv(memory);

  return {
    getItem(key) {
      try {
        return storage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        memory.set(key, value);
      }
    },
  };
}

/** localStorage avec repli mémoire (PWA iOS inclus). */
export function getPopupLocalStorage(): KVStorage {
  if (typeof window === "undefined") return memoryKv(memoryLocal);
  return wrapBrowserStorage(window.localStorage, memoryLocal);
}

/** sessionStorage avec repli mémoire. */
export function getPopupSessionStorage(): KVStorage {
  if (typeof window === "undefined") return memoryKv(memorySession);
  return wrapBrowserStorage(window.sessionStorage, memorySession);
}

/** true si le stockage persistant navigateur est utilisable. */
export function isPopupPersistentStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__lncos_popup_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
