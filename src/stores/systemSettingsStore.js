// src/stores/systemSettingsStore.js

import { create } from "zustand";
import { loadAdminSystemSettings, saveAdminSystemSettings } from "../services/adminSystemSettings";

const STORAGE_KEY = "wc-system-settings-v1";

export const defaultSystemSettings = {
  // Feature toggles
  features: {
    aiSessions: true,
    recoveryTracking: true,
    toolsCatalog: true,
    providersMarketplace: true,
    telemetry: true,
    riskRadar: true,
    notifications: true,
    sessionSharing: true,
  },

  // Threshold sliders
  thresholds: {
    riskLevelLow: 3, // 0-10 scale
    riskLevelMedium: 6,
    riskLevelHigh: 8,
    sessionCompletionRate: 0.7, // 0-1 scale
    activeUserThreshold: 1, // days since last activity
    errorRateThreshold: 0.1, // 0-1 scale (10%)
  },

  // Notification rules (Towncrier)
  notifications: {
    enabled: true,
    riskAlerts: true,
    sessionReminders: true,
    streakMilestones: true,
    systemUpdates: false,
    frequency: "moderate", // low, moderate, high
    quietHours: {
      enabled: true,
      start: 22, // 10 PM
      end: 7, // 7 AM
    },
  },

  // Agent auto-run settings
  agentAutoRun: {
    sentinel: {
      enabled: true,
      interval: 15, // minutes
    },
    towncrier: {
      enabled: true,
      interval: 5, // minutes
    },
    seer: {
      enabled: false,
      interval: null,
    },
    oracle: {
      enabled: false,
      interval: null,
    },
    overseer: {
      enabled: false,
      interval: null,
    },
  },
};

function loadFromStorage() {
  if (typeof window === "undefined") return defaultSystemSettings;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSystemSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSystemSettings, ...parsed };
  } catch {
    return defaultSystemSettings;
  }
}

export const useSystemSettingsStore = create((set, get) => ({
  settings: loadFromStorage(),

  updateSettings(partial) {
    set((state) => {
      const next = { ...state.settings, ...partial };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // ignore storage errors
      }
      return { settings: next };
    });
  },

  updateFeature(featureName, enabled) {
    set((state) => {
      const next = {
        ...state.settings,
        features: {
          ...state.settings.features,
          [featureName]: enabled,
        },
      };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return { settings: next };
    });
  },

  updateThreshold(thresholdName, value) {
    set((state) => {
      const next = {
        ...state.settings,
        thresholds: {
          ...state.settings.thresholds,
          [thresholdName]: value,
        },
      };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return { settings: next };
    });
  },

  updateNotificationRule(ruleName, value) {
    set((state) => {
      // Handle nested objects like quietHours
      const next = {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          [ruleName]: value,
        },
      };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return { settings: next };
    });
  },

  resetSettings() {
    set(() => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSystemSettings));
        }
      } catch {
        // ignore
      }
      return { settings: defaultSystemSettings };
    });
  },

  // Firestore integration
  async loadFromRemote() {
    const result = await loadAdminSystemSettings();
    if (result.settings) {
      const remote = result.settings;
      const merged = {
        ...defaultSystemSettings,
        ...remote,
        features: { ...defaultSystemSettings.features, ...remote.features },
        thresholds: { ...defaultSystemSettings.thresholds, ...remote.thresholds },
        notifications: {
          ...defaultSystemSettings.notifications,
          ...remote.notifications,
          quietHours: { ...defaultSystemSettings.notifications.quietHours, ...remote.notifications?.quietHours },
        },
        agentAutoRun: { ...defaultSystemSettings.agentAutoRun, ...remote.agentAutoRun },
      };
      set({ settings: merged });
      try {
        if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch { /* remote remains authoritative for this session */ }
    }
    return result;
  },

  async saveToRemote() {
    const result = await saveAdminSystemSettings(get().settings);
    if (!result.saved) throw new Error("Settings were not confirmed as saved.");
    return result;
  },
}));
