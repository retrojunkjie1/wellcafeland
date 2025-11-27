// src/stores/useInteractionCanvasStore.js
// Central store for chat-first interaction canvas with module injection

import { create } from "zustand";

const MODULE_TYPES = {
  MESSAGE: "message",
  TOOL: "tool",
  VIDEO: "video",
  VOICE: "voice",
  SUPPORT_SEARCH: "support_search",
  INSIGHT: "insight",
  TIMELINE: "timeline",
};

const createMessage = (role, content, metadata = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type: MODULE_TYPES.MESSAGE,
  role, // "user" | "assistant" | "system"
  content,
  timestamp: Date.now(),
  metadata,
});

const createModule = (type, payload) => ({
  id: `module-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  payload,
  timestamp: Date.now(),
});

export const useInteractionCanvasStore = create((set) => {
  const welcomeMessage = createMessage(
    "system",
    "Welcome to WellnessCafe. I'm your living guide. How can we support you today?"
  );

  return {
    // Canvas state
    items: [welcomeMessage], // Array of messages + modules
    isInputFocused: false,
    hasStartedConversation: false,

    // Voice mode
    isVoiceMode: false,
    isRecording: false,
    voiceWaveform: [],

    // Explore panel
    isExploreOpen: false,

    // Actions
    addMessage: (role, content, metadata) => {
      const msg = createMessage(role, content, metadata);
      set((state) => ({
        items: [...state.items, msg],
        hasStartedConversation: true,
      }));
      return msg;
    },

    injectModule: (type, payload) => {
      const module = createModule(type, payload);
      set((state) => ({
        items: [...state.items, module],
        hasStartedConversation: true,
      }));
      return module;
    },

    removeModule: (moduleId) => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== moduleId),
      }));
    },

    clearCanvas: () => {
      set({
        items: [welcomeMessage],
        hasStartedConversation: false,
      });
    },

    // Voice mode
    setVoiceMode: (enabled) => {
      set({ isVoiceMode: enabled });
    },

    startRecording: () => {
      set({
        isRecording: true,
        isVoiceMode: true,
        voiceWaveform: Array(20).fill(0).map(() => Math.random() * 0.5 + 0.2),
      });
    },

    stopRecording: () => {
      set({
        isRecording: false,
        voiceWaveform: [],
      });
    },

    // Explore panel
    toggleExplore: () => {
      set((state) => ({ isExploreOpen: !state.isExploreOpen }));
    },

    setExploreOpen: (open) => {
      set({ isExploreOpen: open });
    },

    // Input focus
    setInputFocused: (focused) => {
      set({ isInputFocused: focused });
    },
  };
});

export { MODULE_TYPES };

