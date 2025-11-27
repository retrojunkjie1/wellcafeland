// src/core/system/systemMemory.js
// System memory for storing system state and preferences

const STORAGE_KEY = "wc_system_memory_v1";

/**
 * Get system memory from localStorage
 */
function getMemory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      lastUserEmotion: null,
      lastRiskState: null,
      lastSearchSuccess: null,
      lastSearchFailure: null,
      lastToolUsed: null,
      lastModeUsed: "text",
      lastWorkspaceOpened: null,
      preferredMode: "text",
      systemState: "CALM",
      lastNeed: null,
      lastRecommendation: null,
      updatedAt: null,
    };
  } catch {
    return {
      lastUserEmotion: null,
      lastRiskState: null,
      lastSearchSuccess: null,
      lastSearchFailure: null,
      lastToolUsed: null,
      lastModeUsed: "text",
      lastWorkspaceOpened: null,
      preferredMode: "text",
      systemState: "CALM",
      lastNeed: null,
      lastRecommendation: null,
      updatedAt: null,
    };
  }
}

/**
 * Save system memory to localStorage
 */
function saveMemory(memory) {
  try {
    memory.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (err) {
    console.warn("Failed to save system memory:", err);
  }
}

export const SystemMemory = {
  /**
   * Get all system memory
   */
  getAll() {
    return getMemory();
  },

  /**
   * Get last user emotion
   */
  getLastUserEmotion() {
    return getMemory().lastUserEmotion;
  },

  /**
   * Set last user emotion
   */
  setLastUserEmotion(emotion) {
    const memory = getMemory();
    memory.lastUserEmotion = emotion;
    saveMemory(memory);
  },

  /**
   * Get last risk state
   */
  getLastRiskState() {
    return getMemory().lastRiskState;
  },

  /**
   * Set last risk state
   */
  setLastRiskState(riskState) {
    const memory = getMemory();
    memory.lastRiskState = riskState;
    saveMemory(memory);
  },

  /**
   * Get last search success
   */
  getLastSearchSuccess() {
    return getMemory().lastSearchSuccess;
  },

  /**
   * Set last search success
   */
  setLastSearchSuccess(query, results) {
    const memory = getMemory();
    memory.lastSearchSuccess = {
      query,
      resultCount: results?.length || 0,
      timestamp: Date.now(),
    };
    saveMemory(memory);
  },

  /**
   * Get last search failure
   */
  getLastSearchFailure() {
    return getMemory().lastSearchFailure;
  },

  /**
   * Set last search failure
   */
  setLastSearchFailure(query, error) {
    const memory = getMemory();
    memory.lastSearchFailure = {
      query,
      error: error?.message || String(error),
      timestamp: Date.now(),
    };
    saveMemory(memory);
  },

  /**
   * Get last tool used
   */
  getLastToolUsed() {
    return getMemory().lastToolUsed;
  },

  /**
   * Set last tool used
   */
  setLastToolUsed(toolId) {
    const memory = getMemory();
    memory.lastToolUsed = toolId;
    saveMemory(memory);
  },

  /**
   * Get last mode used
   */
  getLastModeUsed() {
    return getMemory().lastModeUsed || "text";
  },

  /**
   * Set last mode used
   */
  setLastModeUsed(mode) {
    const memory = getMemory();
    memory.lastModeUsed = mode;
    saveMemory(memory);
  },

  /**
   * Get last workspace opened
   */
  getLastWorkspaceOpened() {
    return getMemory().lastWorkspaceOpened;
  },

  /**
   * Set last workspace opened
   */
  setLastWorkspaceOpened(workspaceId) {
    const memory = getMemory();
    memory.lastWorkspaceOpened = workspaceId;
    saveMemory(memory);
  },

  /**
   * Get preferred mode
   */
  getPreferredMode() {
    return getMemory().preferredMode || "text";
  },

  /**
   * Set preferred mode
   */
  setPreferredMode(mode) {
    const memory = getMemory();
    memory.preferredMode = mode;
    saveMemory(memory);
  },

  /**
   * Get system state
   */
  getSystemState() {
    return getMemory().systemState || "CALM";
  },

  /**
   * Set system state
   */
  setSystemState(state) {
    const memory = getMemory();
    memory.systemState = state;
    saveMemory(memory);
  },

  /**
   * Get last need
   */
  getLastNeed() {
    return getMemory().lastNeed;
  },

  /**
   * Set last need
   */
  setLastNeed(need) {
    const memory = getMemory();
    memory.lastNeed = need;
    saveMemory(memory);
  },

  /**
   * Get last recommendation
   */
  getLastRecommendation() {
    return getMemory().lastRecommendation;
  },

  /**
   * Set last recommendation
   */
  setLastRecommendation(recommendation) {
    const memory = getMemory();
    memory.lastRecommendation = recommendation;
    saveMemory(memory);
  },

  /**
   * Clear all system memory
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear system memory:", err);
    }
  },
};

export default SystemMemory;

