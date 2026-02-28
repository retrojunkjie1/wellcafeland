// src/stores/useOSStore.js
// Central OS-level store for 3-mode interface (Chat, Workspace, Explore)
// Phase 25: Uses messageNormalizer for consistent message shapes

import { create } from "zustand";
import { normalizeMessage } from "@/core/system/messageNormalizer";

const MODES = {
  CHAT: "chat",
  WORKSPACE: "workspace",
  EXPLORE: "explore",
};

// Load chats from localStorage (only those with user messages)
const loadChats = () => {
  try {
    const saved = localStorage.getItem("wc-os-chats");
    if (!saved) return [];
    const chats = JSON.parse(saved);
    // Filter to only return chats with user messages
    return chats.filter((chat) => chat.hasUserMessages === true);
  } catch {
    return [];
  }
};

// Save chats to localStorage (only those with user messages)
const saveChats = (chats) => {
  try {
    // Only save chats that have user messages
    const validChats = chats.filter((chat) => chat.hasUserMessages === true);
    localStorage.setItem("wc-os-chats", JSON.stringify(validChats));
  } catch (err) {
    console.warn("Failed to save chats:", err);
  }
};

// Phase 34: Settings persistence helpers
const SETTINGS_STORAGE_KEY = "wc-os-settings";

const loadLocalSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveLocalSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("[useOSStore] Failed to persist settings:", err);
  }
};

export const useOSStore = create((set, get) => ({
  // Current mode
  mode: MODES.CHAT,
  setMode: (mode) => set({ mode }),

  // Sidebar state
  sidebarCollapsed: false, // Default to expanded so sidebar is visible
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed,
  })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Chat state
  currentChatId: null,
  chats: loadChats(), // Array of { id, title, messages, createdAt, updatedAt, hasUserMessages }
  messages: [
    {
      id: "welcome",
      role: "system",
      content: "Welcome to WellnessCafe. I'm your living guide. How can we support you today?",
      timestamp: Date.now(),
    },
  ], // Current chat messages

  // Workspace state
  currentWorkspaceId: null,
  workspaces: [], // Array of { id, type, title, data, createdAt }
  workspaceHistory: [], // Recently opened workspaces

  // Explore state
  exploreOpen: false,
  exploreSection: null, // 'tools' | 'providers' | 'support' | 'education'

  // Actions
  createChat: (title = "New Chat") => {
    const welcomeMsg = {
      id: "welcome",
      role: "system",
      content: "Welcome to WellnessCafe. I'm your living guide. How can we support you today?",
      timestamp: Date.now(),
    };
    const chat = {
      id: `chat-${Date.now()}`,
      title,
      messages: [welcomeMsg],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hasUserMessages: false, // Track if chat has user input
    };
    set((state) => ({
      chats: [chat, ...state.chats],
      currentChatId: chat.id,
      messages: [welcomeMsg],
      mode: MODES.CHAT,
      // Keep sidebar state as is - don't auto-collapse
    }));
    return chat;
  },

  setMessages: (msgs) =>
    set((state) => ({
      messages: Array.isArray(msgs) ? msgs : state.messages,
      chats: state.chats.map((c) =>
        c.id === state.currentChatId
          ? { ...c, messages: Array.isArray(msgs) ? msgs : c.messages, updatedAt: Date.now() }
          : c
      ),
    })),

  openChat: (chatId) => {
    const chat = get().chats.find((c) => c.id === chatId);
    if (chat) {
      set({
        currentChatId: chatId,
        messages: chat.messages,
        mode: MODES.CHAT,
        // Keep sidebar state as is
      });
    }
  },

  addMessage: (role, content) => {
    // Handle both string and object content
    // Support multimodal message types: assistant_text, assistant_audio, assistant_video
    const msg = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content: typeof content === "object" ? (content.text || content.content || content) : content,
      timestamp: Date.now(),
      createdAt: Date.now(),
    };
    
    // Preserve multimodal type and URLs if provided
    if (typeof content === "object") {
      // Preserve metadata from decision engine
      if (content.metadata) {
        msg.metadata = content.metadata;
      }
      if (content.type) {
        msg.type = content.type; // assistant_text, assistant_audio, assistant_video
      }
      if (content.audioUrl) {
        msg.audioUrl = content.audioUrl;
      }
      if (content.videoUrl) {
        msg.videoUrl = content.videoUrl;
      }
      if (content.mode) {
        msg.mode = content.mode;
      }
      if (content.text) {
        msg.text = content.text;
      }
      // Phase 17: Preserve emotion, triggers, and risk fields
      if (content.emotion) {
        msg.emotion = content.emotion;
      }
      if (content.triggers) {
        msg.triggers = content.triggers;
      }
      if (content.risk) {
        msg.risk = content.risk;
      }
      // Phase 28: Preserve identity field
      if (content.identity) {
        msg.identity = content.identity;
      }
      // Phase 29: Preserve relationship field
      if (content.relationship) {
        msg.relationship = content.relationship;
      }
      // Phase 25: Preserve conversational mode (HMN)
      if (content.humanMode) {
        msg.humanMode = content.humanMode;
      }
      // Phase 26: Preserve tone profile (ATS)
      if (content.toneProfile) {
        msg.toneProfile = content.toneProfile;
      }
      // Phase 27: Preserve phrasing style (ARP)
      if (content.phrasingStyle) {
        msg.phrasingStyle = content.phrasingStyle;
      }
      // Phase 28: Preserve behavioral drift (BDE)
      if (content.drift) {
        msg.drift = content.drift;
      }
      // Preserve suggestion for recommendation messages
      if (content.suggestion) {
        msg.suggestion = content.suggestion;
      }
      // Phase 24: Preserve trajectory for emotional graph
      if (content.trajectory) {
        msg.trajectory = content.trajectory;
      }
      // Phase 30: Preserve crisis forecast
      if (content.crisisForecast) {
        msg.crisisForecast = content.crisisForecast;
      }
    }
    
    // Phase 25: Normalize message before storing
    const normalizedMsg = normalizeMessage(msg);
    
    set((state) => {
      const newMessages = [...state.messages, normalizedMsg];
      const isUserMessage = role === "user";
      
      // Update chat with new messages and mark as having user messages if user sent something
      // Phase 25: Ensure chat messages are normalized (full objects, not truncated)
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === state.currentChatId) {
          return {
            ...chat,
            messages: newMessages, // Already normalized
            updatedAt: Date.now(),
            hasUserMessages: isUserMessage ? true : chat.hasUserMessages,
          };
        }
        return chat;
      });

      // If this is a user message and chat doesn't have user messages yet, ensure it's saved
      // Filter out chats that only have system messages
      const validChats = updatedChats.filter((chat) => {
        // Keep current chat even if no user messages yet (might be in progress)
        if (chat.id === state.currentChatId) return true;
        // Keep chats that have user messages
        return chat.hasUserMessages === true;
      });

      // Save to localStorage
      saveChats(validChats);

      return {
        messages: newMessages,
        chats: validChats,
      };
    });
    return normalizedMsg;
  },

  // Workspace actions
  openWorkspace: (type, title, data = {}) => {
    const workspace = {
      id: `workspace-${Date.now()}`,
      type, // 'tool' | 'support' | 'provider' | 'education'
      title,
      data,
      createdAt: Date.now(),
    };
    set((state) => ({
      workspaces: [workspace, ...state.workspaces.filter((w) => w.id !== workspace.id)],
      currentWorkspaceId: workspace.id,
      workspaceHistory: [workspace.id, ...state.workspaceHistory.filter((id) => id !== workspace.id)].slice(0, 10),
      mode: MODES.WORKSPACE,
      // Keep sidebar state as is
    }));
    return workspace;
  },

  closeWorkspace: () => {
    set({
      currentWorkspaceId: null,
      mode: MODES.CHAT,
      // Keep sidebar state as is
    });
  },

  // Explore actions
  openExplore: (section = null) => {
    set({
      exploreOpen: true,
      exploreSection: section,
      mode: MODES.EXPLORE,
      // Keep sidebar state as is
    });
  },

  closeExplore: () => {
    set({
      exploreOpen: false,
      exploreSection: null,
      mode: MODES.CHAT,
    });
  },

  // Tool injection (only when verbally requested in chat)
  // TRUTH-GATE: Returns tool message only if tool actually opens successfully
  injectToolIntoChat: async (toolType, toolConfig) => {
    // Validate tool exists in registry
    try {
      const { validateToolId, getToolRoute } = await import("@/utils/toolRouter");
      
      if (!validateToolId(toolType)) {
        console.error("[useOSStore] Attempted to inject invalid tool:", toolType);
        // Truth-Gate: Return null - tool doesn't exist
        return null;
      }

      const route = getToolRoute(toolType);
      if (!route) {
        console.error("[useOSStore] No route found for tool:", toolType);
        return null;
      }

      // Create tool message
      const toolMessage = {
        id: `tool-${Date.now()}`,
        role: "tool",
        type: toolType,
        config: toolConfig,
        timestamp: Date.now(),
      };
      
      // Update state first
      set((state) => {
        const newMessages = [...state.messages, toolMessage];
        const updatedChats = state.chats.map((chat) =>
          chat.id === state.currentChatId
            ? { ...chat, messages: newMessages, updatedAt: Date.now() }
            : chat
        );
        return {
          messages: newMessages,
          chats: updatedChats,
        };
      });
      
      // Navigate to tool route (use navigate if available, fallback to location)
      try {
        // Try using React Router navigate if available
        const { useNavigate } = await import("react-router-dom");
        // Note: This won't work here as we're not in a component context
        // Fallback to window.location
        window.location.href = route;
      } catch {
        // Fallback: direct navigation
        window.location.href = route;
      }
      
      // Return tool message to confirm successful opening
      return toolMessage;
    } catch (err) {
      console.error("[useOSStore] Tool injection error:", err);
      // Truth-Gate: Return null on error - tool didn't open
      return null;
    }
  },

  setSystemState: (state) => {
    set((currentState) => ({
      ...currentState,
      systemState: state,
    }));
  },

  setPreferredMode: (mode) => {
    set((currentState) => ({
      ...currentState,
      preferredMode: mode,
    }));
  },

  setLastNeed: (need) => {
    set((currentState) => ({
      ...currentState,
      lastNeed: need,
    }));
  },

  setLastRecommendation: (recommendation) => {
    set((currentState) => ({
      ...currentState,
      lastRecommendation: recommendation,
    }));
  },

  // Phase 19: Emotional timeline tracking
  lastEmotion: null,
  lastRiskEvent: null,
  setLastEmotion: (emotion) => set({ lastEmotion: emotion }),
  setLastRiskEvent: (risk) => set({ lastRiskEvent: risk }),

  // Phase 30: Crisis Forecast Engine
  lastCrisisForecast: null,
  setLastCrisisForecast: (forecast) => set({ lastCrisisForecast: forecast }),

  // Phase 24: Emotional Graph Engine - history buffer
  emotionalHistory: [], // last N emotional snapshots for user messages

  /**
   * Append an emotional snapshot for a user message.
   * snapshot shape:
   * {
   *   id,
   *   timestamp,
   *   label,
   *   intensity,
   *   valence,
   *   triggers,
   *   riskLevel
   * }
   */
  appendEmotionalSnapshot: (snapshot) => set((state) => {
    const maxHistory = 20;
    const history = [...(state.emotionalHistory || []), snapshot];
    if (history.length > maxHistory) {
      history.shift();
    }
    return { emotionalHistory: history };
  }),

  // Phase 28: Identity fracture history
  identityHistory: [], // array of identity snapshots
  lastIdentitySnapshot: null,
  setLastIdentitySnapshot: (snapshot) => set({ lastIdentitySnapshot: snapshot }),
  appendIdentitySnapshot: (snapshot) =>
    set((state) => {
      const maxHistory = 20;
      const history = [...(state.identityHistory || []), snapshot];
      if (history.length > maxHistory) {
        history.shift();
      }
      return { identityHistory: history, lastIdentitySnapshot: snapshot };
    }),

  // Phase 29: Relationship stress history
  relationshipHistory: [],
  lastRelationshipSnapshot: null,
  setLastRelationshipSnapshot: (snapshot) =>
    set({ lastRelationshipSnapshot: snapshot }),
  appendRelationshipSnapshot: (snapshot) =>
    set((state) => {
      const maxHistory = 20;
      const list = [...(state.relationshipHistory || []), snapshot];
      if (list.length > maxHistory) {
        list.shift();
      }
      return { relationshipHistory: list, lastRelationshipSnapshot: snapshot };
    }),

  // Phase 27: UI State Extension
  uiState: {
    currentVisualMode: "neutral",
    lastHumanMode: null,
    lastLayoutShift: Date.now(),
  },
  setUIVisualMode: (mode) => set((state) => ({
    uiState: {
      ...state.uiState,
      currentVisualMode: mode,
      lastLayoutShift: Date.now(),
    },
  })),
  setLastHumanMode: (mode) => set((state) => ({
    uiState: {
      ...state.uiState,
      lastHumanMode: mode,
    },
  })),

  // === Settings slice (Phase 34) ===
  settings: {
    // Appearance
    themeMode: "deep-night",      // "deep-night" | "dawn" | "system"
    interfaceDensity: "cozy",     // "cozy" | "compact"

    // Wellness & intelligence
    allowEmotionFromChat: true,
    allowFaceSignals: false,
    trajectoryTrackingEnabled: true,
    recoveryMode: "standard",     // "gentle" | "standard" | "intensive"

    // Notifications
    notifications: {
      emailEnabled: true,
      pushEnabled: false,
      dailyCheckIn: true,
      milestoneAlerts: true,
      providerMessages: true,
      circleActivity: true,
    },

    // Privacy & safety
    privacy: {
      hideSensitiveText: false,
      redactNamesInHistory: true,
      dataRetention: "90d",       // "7d" | "30d" | "90d" | "forever"
      requirePinForProviderView: false,
    },
  },

  /**
   * Hydrate settings from external source (Firestore or localStorage).
   * Safe merge, never throws.
   */
  hydrateSettings: (incoming) =>
    set((state) => {
      if (!incoming || typeof incoming !== "object") return {};
      const merged = {
        ...state.settings,
        ...incoming,
        notifications: {
          ...state.settings.notifications,
          ...(incoming.notifications || {}),
        },
        privacy: {
          ...state.settings.privacy,
          ...(incoming.privacy || {}),
        },
      };
      saveLocalSettings(merged);
      return { settings: merged };
    }),

  // Appearance setters
  setThemeMode: (themeMode) =>
    set((state) => {
      const settings = {
        ...state.settings,
        themeMode,
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  setInterfaceDensity: (density) =>
    set((state) => {
      const settings = {
        ...state.settings,
        interfaceDensity: density,
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  // Wellness / intelligence toggles
  setAllowEmotionFromChat: (value) =>
    set((state) => {
      const settings = {
        ...state.settings,
        allowEmotionFromChat: Boolean(value),
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  setAllowFaceSignals: (value) =>
    set((state) => {
      const settings = {
        ...state.settings,
        allowFaceSignals: Boolean(value),
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  setTrajectoryTrackingEnabled: (value) =>
    set((state) => {
      const settings = {
        ...state.settings,
        trajectoryTrackingEnabled: Boolean(value),
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  setRecoveryMode: (mode) =>
    set((state) => {
      const settings = {
        ...state.settings,
        recoveryMode: mode,
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  // Notifications
  setNotificationSetting: (key, value) =>
    set((state) => {
      const settings = {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          [key]: value,
        },
      };
      saveLocalSettings(settings);
      return { settings };
    }),

  // Privacy
  setPrivacySetting: (key, value) =>
    set((state) => {
      const settings = {
        ...state.settings,
        privacy: {
          ...state.settings.privacy,
          [key]: value,
        },
      };
      saveLocalSettings(settings);
      return { settings };
    }),

}));

// Phase 34: Initialize settings from localStorage on store creation
const localSettings = loadLocalSettings();
if (localSettings) {
  useOSStore.setState((state) => {
    const merged = {
      ...state.settings,
      ...localSettings,
      notifications: {
        ...state.settings.notifications,
        ...(localSettings.notifications || {}),
      },
      privacy: {
        ...state.settings.privacy,
        ...(localSettings.privacy || {}),
      },
    };
    return { settings: merged };
  });
}

export { MODES };

