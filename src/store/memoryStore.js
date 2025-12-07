// src/store/memoryStore.js
// PHASE 44 — FULL OS MEMORY ARCHITECTURE

import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  // NAVIGATION
  lastVisitedRoute: "/",
  lastVisitedAt: null,

  // TOOLS
  lastToolId: null,
  lastToolSession: null, // { startedAt, endedAt, durationSec, metrics, mode }

  // CONTENT / TOPICS
  lastTopicId: null, // e.g. "grief-and-loss"
  lastTopicType: null, // e.g. "education", "mir", "tool"
  lastTopicVisitedAt: null,

  // WORKSPACE
  lastWorkspaceId: null, // e.g. "real-help"
  lastWorkspaceContext: null, // e.g. { priority: "housing" }
  lastWorkspaceVisitedAt: null,

  // EMOTIONAL SNAPSHOT (LIGHTWEIGHT)
  lastEmotionSnapshot: null, // { label, intensity, createdAt, source }

  // USER PREFERENCES
  preferences: {
    soundEnabled: true,
    narrationEnabled: false,
    darkModePreferred: true,
  },

  // META
  memoryVersion: 1,
};

export const useMemoryStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // --- NAVIGATION ACTIONS ---
      setLastVisitedRoute: (path, meta) => {
        if (!path) return;
        set({
          lastVisitedRoute: path,
          lastVisitedAt: meta?.timestamp ?? Date.now(),
        });
      },

      // --- TOOL ACTIONS ---
      setLastToolSession: (toolId, sessionSnapshot) => {
        if (!toolId) return;
        set({
          lastToolId: toolId,
          lastToolSession: {
            toolId,
            ...(sessionSnapshot || {}),
            updatedAt: Date.now(),
          },
        });
      },

      // --- TOPIC ACTIONS ---
      setLastTopic: (topicId, topicType) => {
        if (!topicId) return;
        set({
          lastTopicId: topicId,
          lastTopicType: topicType || null,
          lastTopicVisitedAt: Date.now(),
        });
      },

      // --- WORKSPACE ACTIONS ---
      setLastWorkspace: (workspaceId, context) => {
        if (!workspaceId) return;
        set({
          lastWorkspaceId: workspaceId,
          lastWorkspaceContext: context || null,
          lastWorkspaceVisitedAt: Date.now(),
        });
      },

      // --- EMOTION ACTIONS ---
      setEmotionSnapshot: (snapshot) => {
        if (!snapshot || !snapshot.label) return;
        set({
          lastEmotionSnapshot: {
            ...snapshot,
            createdAt: snapshot.createdAt ?? Date.now(),
          },
        });
      },

      // --- PREFERENCES ACTIONS ---
      setPreference: (key, value) => {
        if (!key) return;
        const current = get().preferences || {};
        set({
          preferences: {
            ...current,
            [key]: value,
          },
        });
      },

      // --- UTILITIES ---
      resetMemory: () => {
        set({
          ...initialState,
          // bump version to avoid clash with older shapes if needed
          memoryVersion: (get().memoryVersion || 1) + 1,
        });
      },
    }),
    {
      name: "wc-os-memory-v1",
      version: 1,
      // Only persist user-facing state; derived/cache can live elsewhere
      partialize: (state) => ({
        lastVisitedRoute: state.lastVisitedRoute,
        lastVisitedAt: state.lastVisitedAt,
        lastToolId: state.lastToolId,
        lastToolSession: state.lastToolSession,
        lastTopicId: state.lastTopicId,
        lastTopicType: state.lastTopicType,
        lastTopicVisitedAt: state.lastTopicVisitedAt,
        lastWorkspaceId: state.lastWorkspaceId,
        lastWorkspaceContext: state.lastWorkspaceContext,
        lastWorkspaceVisitedAt: state.lastWorkspaceVisitedAt,
        lastEmotionSnapshot: state.lastEmotionSnapshot,
        preferences: state.preferences,
        memoryVersion: state.memoryVersion,
      }),
    }
  )
);

// Convenience non-hook accessors for engines (no React rules involved)
export const memoryStore = {
  getState: () => useMemoryStore.getState(),
  setLastVisitedRoute: (path, meta) =>
    useMemoryStore.getState().setLastVisitedRoute(path, meta),
  setLastToolSession: (toolId, sessionSnapshot) =>
    useMemoryStore.getState().setLastToolSession(toolId, sessionSnapshot),
  setLastTopic: (topicId, topicType) =>
    useMemoryStore.getState().setLastTopic(topicId, topicType),
  setLastWorkspace: (workspaceId, context) =>
    useMemoryStore.getState().setLastWorkspace(workspaceId, context),
  setEmotionSnapshot: (snapshot) =>
    useMemoryStore.getState().setEmotionSnapshot(snapshot),
  setPreference: (key, value) =>
    useMemoryStore.getState().setPreference(key, value),
  resetMemory: () => useMemoryStore.getState().resetMemory(),
};

