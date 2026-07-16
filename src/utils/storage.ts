/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// In-memory fallback dictionary for environments (like YouTube Playables iframe) where localStorage is disabled or restricted
const memoryStorage: Record<string, string> = {};

// Helper to check if localStorage is available and fully functional
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) {
      return false;
    }
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    return retrieved === testKey;
  } catch (e) {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`[Storage] Failed to getItem for key "${key}" from localStorage, using memory fallback`, e);
      }
    }
    return key in memoryStorage ? memoryStorage[key] : null;
  },

  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn(`[Storage] Failed to setItem for key "${key}" to localStorage, using memory fallback`, e);
      }
    }
    memoryStorage[key] = String(value);
  },

  removeItem(key: string): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn(`[Storage] Failed to removeItem for key "${key}" from localStorage`, e);
      }
    }
    delete memoryStorage[key];
  },

  clear(): void {
    if (hasLocalStorage) {
      try {
        window.localStorage.clear();
        return;
      } catch (e) {
        console.warn("[Storage] Failed to clear localStorage", e);
      }
    }
    for (const key in memoryStorage) {
      delete memoryStorage[key];
    }
  }
};
