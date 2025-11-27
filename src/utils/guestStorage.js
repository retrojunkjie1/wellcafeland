// src/utils/guestStorage.js
// Guest mode data storage utilities using sessionStorage

const STORAGE_KEYS = {
  moments: "wc_guest_moments",
  insights: "wc_guest_insights",
  guideHistory: "wc_guest_guide_history",
  toolUsage: "wc_guest_tool_usage",
};

function safeGet(key, defaultValue = []) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Failed to save to sessionStorage:", err);
  }
}

export const guestStorage = {
  // Moments
  getMoments() {
    return safeGet(STORAGE_KEYS.moments, []);
  },

  addMoment(momentData) {
    const moments = this.getMoments();
    const newMoment = {
      ...momentData,
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    moments.push(newMoment);
    safeSet(STORAGE_KEYS.moments, moments);
    return newMoment;
  },

  // Insights (weekly summaries)
  getInsights() {
    return safeGet(STORAGE_KEYS.insights, null);
  },

  setInsights(insightsData) {
    safeSet(STORAGE_KEYS.insights, insightsData);
  },

  // Guide history (chat sessions)
  getGuideHistory() {
    return safeGet(STORAGE_KEYS.guideHistory, []);
  },

  addGuideMessage(message) {
    const history = this.getGuideHistory();
    history.push({
      ...message,
      timestamp: Date.now(),
    });
    safeSet(STORAGE_KEYS.guideHistory, history);
  },

  // Tool usage tracking
  getToolUsage() {
    return safeGet(STORAGE_KEYS.toolUsage, []);
  },

  recordToolUsage(toolId, data = {}) {
    const usage = this.getToolUsage();
    usage.push({
      toolId,
      ...data,
      timestamp: Date.now(),
    });
    safeSet(STORAGE_KEYS.toolUsage, usage);
  },

  // Clear all guest data (useful for testing or explicit reset)
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(key);
      }
    });
  },
};

