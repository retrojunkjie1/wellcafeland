// src/stores/useOSStore.js
// Central OS-level store for 3-mode interface (Chat, Workspace, Explore)

import { create } from "zustand";

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
      // Preserve suggestion for recommendation messages
      if (content.suggestion) {
        msg.suggestion = content.suggestion;
      }
    }
    set((state) => {
      const newMessages = [...state.messages, msg];
      const isUserMessage = role === "user";
      
      // Update chat with new messages and mark as having user messages if user sent something
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === state.currentChatId) {
          return {
            ...chat,
            messages: newMessages,
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
    return msg;
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
  injectToolIntoChat: (toolType, toolConfig) => {
    const toolMessage = {
      id: `tool-${Date.now()}`,
      role: "tool",
      type: toolType,
      config: toolConfig,
      timestamp: Date.now(),
    };
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
    return toolMessage;
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
}));

export { MODES };

