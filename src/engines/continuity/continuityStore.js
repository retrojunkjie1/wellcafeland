// src/engines/continuity/continuityStore.js
// Phase 54B: Local-first thread continuity (no backend, trauma-safe)

import { create } from "zustand";

const STORAGE_KEY = "wc_continuity_v1";
const MAX_TOPICS = 3;
const MAX_ACTIONS = 3;

const loadPersisted = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      threadId: data.threadId || null,
      lastIntent: data.lastIntent || null,
      lastTopic: data.lastTopic || null,
      recentTopics: Array.isArray(data.recentTopics) ? data.recentTopics.slice(0, MAX_TOPICS) : [],
      recentActions: Array.isArray(data.recentActions) ? data.recentActions.slice(0, MAX_ACTIONS) : [],
    };
  } catch {
    return null;
  }
};

const savePersisted = (state) => {
  try {
    const payload = {
      threadId: state.threadId,
      lastIntent: state.lastIntent,
      lastTopic: state.lastTopic,
      recentTopics: state.recentTopics,
      recentActions: state.recentActions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("[continuityStore] Failed to persist:", err);
  }
};

const ingestText = (text) => {
  if (!text || typeof text !== "string") return { intent: "talk", topic: null };
  const t = text.toLowerCase().trim();
  if (t.length < 2) return { intent: "talk", topic: null };

  if (/\b(home|shelter|housing|homeless|sober living)\b/.test(t)) {
    return { intent: "housing", topic: "housing" };
  }
  if (/\b(craving|relapse|urge|using)\b/.test(t)) {
    return { intent: "craving", topic: "craving" };
  }
  if (/\b(panic|anxiety|overwhelm|panic attack)\b/.test(t)) {
    return { intent: "panic", topic: "panic" };
  }
  if (/\b(hurt|trauma|flashback|triggered)\b/.test(t)) {
    return { intent: "trauma", topic: "trauma" };
  }
  if (/\b(food|hungry|hunger|meal)\b/.test(t)) {
    return { intent: "food", topic: "food" };
  }
  if (/\b(sleep|insomnia|tired|exhausted)\b/.test(t)) {
    return { intent: "sleep", topic: "sleep" };
  }
  if (/\b(support|talk|someone|lonely)\b/.test(t)) {
    return { intent: "support", topic: "support" };
  }

  return { intent: "talk", topic: null };
};

export const useContinuityStore = create((set, get) => {
  const persisted = loadPersisted();
  const threadId = persisted?.threadId || "wc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  return {
    threadId,
    lastIntent: persisted?.lastIntent ?? null,
    lastTopic: persisted?.lastTopic ?? null,
    recentTopics: persisted?.recentTopics ?? [],
    recentActions: persisted?.recentActions ?? [],
    lastRoute: "/",
    updatedAt: Date.now(),

    initThread: () => {
      const state = get();
      if (!persisted?.threadId) {
        savePersisted(state);
      }
    },

    setIntent: (intent) => {
      set({ lastIntent: intent, updatedAt: Date.now() });
      savePersisted(get());
    },

    ingestUserDraft: (text) => {
      const { intent, topic } = ingestText(text);
      set((s) => {
        const nextTopics = topic
          ? [topic, ...s.recentTopics.filter((x) => x !== topic)].slice(0, MAX_TOPICS)
          : s.recentTopics;
        return {
          lastIntent: intent,
          lastTopic: topic || s.lastTopic,
          recentTopics: nextTopics,
          updatedAt: Date.now(),
        };
      });
      savePersisted(get());
    },

    pushAction: (action) => {
      const entry = {
        type: action.type || "action",
        label: action.label || "Action",
        href: action.href || "/",
        ts: action.ts ?? Date.now(),
      };
      set((s) => ({
        recentActions: [entry, ...s.recentActions].slice(0, MAX_ACTIONS),
        updatedAt: Date.now(),
      }));
      savePersisted(get());
    },

    setRoute: (path) => {
      set({ lastRoute: path || "/", updatedAt: Date.now() });
    },
  };
});
