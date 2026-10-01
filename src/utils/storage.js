/**
 * Safe storage utility for SplitMate.
 * 
 * Handles restricted environments where window.localStorage or window.sessionStorage
 * throws DOMException: "Failed to read the 'localStorage' property from 'Window': Access is denied for this document."
 * (e.g., Android WebView, mobile incognito/private tabs, third-party iframe, strict cookie blocking).
 * 
 * Provides graceful multi-tier fallbacks:
 * 1. window.localStorage (when available and permitted)
 * 2. window.sessionStorage (secondary web storage fallback)
 * 3. in-memory Map (guaranteed non-throwing runtime storage)
 * 4. window.name JSON cache (resilient tab-scoped persistence across page reloads when web storage is blocked)
 */

const memoryStore = new Map();
const WINDOW_NAME_PREFIX = "__splitmate_store__:";

/**
 * Safely test if a storage mechanism is accessible without throwing.
 * Never called during module initialization.
 */
function isStorageSupported(type) {
  try {
    if (typeof window === "undefined") return false;
    const storage = window[type];
    if (!storage) return false;
    const probe = "__sm_probe__";
    storage.setItem(probe, "1");
    const result = storage.getItem(probe);
    storage.removeItem(probe);
    return result === "1";
  } catch {
    return false;
  }
}

/**
 * Read fallback store from window.name safely
 */
function getWindowNameStore() {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.name;
    if (typeof raw === "string" && raw.startsWith(WINDOW_NAME_PREFIX)) {
      const parsed = JSON.parse(raw.slice(WINDOW_NAME_PREFIX.length));
      return parsed && typeof parsed === "object" ? parsed : {};
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Write fallback store to window.name safely
 */
function setWindowNameStore(store) {
  try {
    if (typeof window === "undefined") return;
    window.name = WINDOW_NAME_PREFIX + JSON.stringify(store);
  } catch {
    // ignore
  }
}

export const safeStorage = {
  getItem(key) {
    if (!key) return null;
    const stringKey = String(key);

    // 1. Try reading from window.localStorage safely
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const val = window.localStorage.getItem(stringKey);
        if (val !== null && val !== undefined) {
          memoryStore.set(stringKey, val);
          return val;
        }
      }
    } catch {
      // localStorage is denied or threw DOMException - continue to fallbacks
    }

    // 2. Try reading from window.sessionStorage safely
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const val = window.sessionStorage.getItem(stringKey);
        if (val !== null && val !== undefined) {
          memoryStore.set(stringKey, val);
          return val;
        }
      }
    } catch {
      // sessionStorage is denied or threw DOMException - continue
    }

    // 3. Try reading from memoryStore
    if (memoryStore.has(stringKey)) {
      return memoryStore.get(stringKey);
    }

    // 4. Try reading from window.name fallback (survives page refresh in same tab)
    try {
      const store = getWindowNameStore();
      if (store && Object.prototype.hasOwnProperty.call(store, stringKey)) {
        const val = String(store[stringKey]);
        memoryStore.set(stringKey, val);
        return val;
      }
    } catch {
      // ignore
    }

    return null;
  },

  setItem(key, value) {
    if (!key) return;
    const stringKey = String(key);
    const stringValue = String(value);

    // 1. Always update memoryStore
    memoryStore.set(stringKey, stringValue);

    // 2. Try saving to localStorage safely
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(stringKey, stringValue);
      }
    } catch {
      // Access denied or quota exceeded - continue to fallbacks
    }

    // 3. Try saving to sessionStorage safely
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(stringKey, stringValue);
      }
    } catch {
      // Access denied or quota exceeded - continue
    }

    // 4. Update window.name store for page-refresh resilience
    try {
      const store = getWindowNameStore();
      store[stringKey] = stringValue;
      setWindowNameStore(store);
    } catch {
      // ignore
    }
  },

  removeItem(key) {
    if (!key) return;
    const stringKey = String(key);

    // 1. Remove from memoryStore
    memoryStore.delete(stringKey);

    // 2. Try removing from localStorage safely
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(stringKey);
      }
    } catch {
      // ignore
    }

    // 3. Try removing from sessionStorage safely
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(stringKey);
      }
    } catch {
      // ignore
    }

    // 4. Remove from window.name store safely
    try {
      const store = getWindowNameStore();
      if (store && Object.prototype.hasOwnProperty.call(store, stringKey)) {
        delete store[stringKey];
        setWindowNameStore(store);
      }
    } catch {
      // ignore
    }
  },

  clear() {
    memoryStore.clear();

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // ignore
    }

    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.clear();
      }
    } catch {
      // ignore
    }

    try {
      if (
        typeof window !== "undefined" &&
        window.name &&
        typeof window.name === "string" &&
        window.name.startsWith(WINDOW_NAME_PREFIX)
      ) {
        window.name = "";
      }
    } catch {
      // ignore
    }
  },

  isAvailable() {
    return isStorageSupported("localStorage");
  },
};

// Authentication convenience helpers
export function getAuthToken() {
  return safeStorage.getItem("token");
}

export function setAuthToken(token) {
  if (token) {
    safeStorage.setItem("token", token);
  }
}

export function removeAuthToken() {
  safeStorage.removeItem("token");
}

export function getAuthUser() {
  try {
    const raw = safeStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  if (!user) return;
  const serialized = typeof user === "string" ? user : JSON.stringify(user);
  safeStorage.setItem("user", serialized);
}

export function removeAuthUser() {
  safeStorage.removeItem("user");
}

export function clearAuth() {
  safeStorage.removeItem("token");
  safeStorage.removeItem("user");
}

/**
 * Defensive runtime check.
 * If window.localStorage or window.sessionStorage throw when accessed,
 * attempts to define safeStorage fallback on window so any unpatched
 * access won't cause unhandled DOMExceptions.
 */
export function initStorageSafety() {
  if (typeof window === "undefined") return;

  let localStorageAccessible;
  try {
    const probe = window.localStorage;
    localStorageAccessible = probe !== undefined && probe !== null;
  } catch {
    localStorageAccessible = false;
  }

  if (!localStorageAccessible) {
    try {
      Object.defineProperty(window, "localStorage", {
        value: safeStorage,
        writable: true,
        configurable: true,
      });
    } catch {
      // Browser prevented defining property, which is fine since code imports safeStorage directly
    }
  }

  let sessionStorageAccessible;
  try {
    const probe = window.sessionStorage;
    sessionStorageAccessible = probe !== undefined && probe !== null;
  } catch {
    sessionStorageAccessible = false;
  }

  if (!sessionStorageAccessible) {
    try {
      Object.defineProperty(window, "sessionStorage", {
        value: safeStorage,
        writable: true,
        configurable: true,
      });
    } catch {
      // Browser prevented defining property
    }
  }
}

export default safeStorage;
