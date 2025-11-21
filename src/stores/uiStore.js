// src/stores/uiStore.js

import { create } from "zustand";

const STORAGE_KEY = "wc-ui-mode-v1";

function getInitialMode() {
  if (typeof window === "undefined") return "user";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "adminPreview" ? "adminPreview" : "user";
  } catch {
    return "user";
  }
}

export const useUIStore = create((set) => ({
  viewMode: getInitialMode(),

  setViewMode: (mode) => {
    set({ viewMode: mode });
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // ignore storage errors
    }
  },

  toggleViewMode: () =>
    set((state) => {
      const next = state.viewMode === "user" ? "adminPreview" : "user";
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, next);
        }
      } catch {
        // ignore
      }
      return { viewMode: next };
    }),
}));

