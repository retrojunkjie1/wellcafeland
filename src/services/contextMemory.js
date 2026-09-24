// src/services/contextMemory.js
// Context memory engine for maintaining conversation state

const STORAGE_KEY = "wc_context_memory";

/**
 * Get context memory from localStorage
 */
function getMemory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      lastEmotionalState: null,
      lastToolUsed: null,
      lastIntent: null,
      lastSpiritualNeed: null,
      conversationHistory: [],
    };
  } catch {
    return {
      lastEmotionalState: null,
      lastToolUsed: null,
      lastIntent: null,
      lastSpiritualNeed: null,
      conversationHistory: [],
    };
  }
}

/**
 * Save context memory to localStorage
 */
function saveMemory(memory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (err) {
    console.warn("Failed to save context memory:", err);
  }
}

export const ContextMemory = {
  /**
   * Get last emotional state
   */
  getLastEmotionalState() {
    const memory = getMemory();
    return memory.lastEmotionalState || null;
  },

  /**
   * Set last emotional state
   */
  setLastEmotionalState(state) {
    const memory = getMemory();
    memory.lastEmotionalState = state;
    memory.lastUpdated = new Date().toISOString();
    saveMemory(memory);
  },

  /**
   * Get last tool used
   */
  getLastToolUsed() {
    const memory = getMemory();
    return memory.lastToolUsed || null;
  },

  /**
   * Set last tool used
   */
  setLastToolUsed(tool) {
    const memory = getMemory();
    memory.lastToolUsed = tool;
    memory.lastUpdated = new Date().toISOString();
    saveMemory(memory);
  },

  /**
   * Get conversation intent
   */
  getConversationIntent() {
    const memory = getMemory();
    return memory.lastIntent || null;
  },

  /**
   * Set conversation intent
   */
  setConversationIntent(intent) {
    const memory = getMemory();
    memory.lastIntent = intent;
    memory.lastUpdated = new Date().toISOString();
    saveMemory(memory);
  },

  /**
   * Get last spiritual need
   */
  getLastSpiritualNeed() {
    const memory = getMemory();
    return memory.lastSpiritualNeed || null;
  },

  /**
   * Set last spiritual need
   */
  setLastSpiritualNeed(need) {
    const memory = getMemory();
    memory.lastSpiritualNeed = need;
    memory.lastUpdated = new Date().toISOString();
    saveMemory(memory);
  },

  /**
   * Add to conversation history
   */
  addToHistory(entry) {
    const memory = getMemory();
    if (!memory.conversationHistory) {
      memory.conversationHistory = [];
    }
    memory.conversationHistory.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    // Keep only last 50 entries
    if (memory.conversationHistory.length > 50) {
      memory.conversationHistory = memory.conversationHistory.slice(-50);
    }
    saveMemory(memory);
  },

  /**
   * Get conversation history
   */
  getHistory(limit = 10) {
    const memory = getMemory();
    const history = memory.conversationHistory || [];
    return history.slice(-limit);
  },

  /**
   * Clear all context memory
   */
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear context memory:", err);
    }
  },

  clearEmotionalAnalysis() {
    const memory = getMemory();
    memory.lastEmotionalState = null;
    memory.conversationHistory = [];
    saveMemory(memory);
  },
};

export default ContextMemory;
