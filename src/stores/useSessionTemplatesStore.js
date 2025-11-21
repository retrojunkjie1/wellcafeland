// src/stores/useSessionTemplatesStore.js

import { create } from "zustand";
import { DEFAULT_SESSION_TEMPLATES } from "../data/sessionTemplates";

export const useSessionTemplatesStore = create((set, get) => ({
  templates: DEFAULT_SESSION_TEMPLATES,
  selectedId: DEFAULT_SESSION_TEMPLATES[0]?.id ?? null,
  isSaving: false,
  error: null,

  selectTemplate(id) {
    set({ selectedId: id });
  },

  addTemplate() {
    const id = `custom-${Date.now()}`;
    const newTemplate = {
      id,
      title: "New custom session",
      tags: [],
      category: "Custom",
      durationMinutes: 10,
      summary: "Describe what this session is for.",
      steps: ["Start with a first step here..."]
    };
    set((state) => ({
      templates: [newTemplate, ...state.templates],
      selectedId: id
    }));
  },

  updateTemplate(id, updates) {
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      )
    }));
  },

  removeTemplate(id) {
    set((state) => {
      const filtered = state.templates.filter((t) => t.id !== id);
      return {
        templates: filtered,
        selectedId: filtered[0]?.id ?? null
      };
    });
  },

  reorderStep(templateId, fromIndex, toIndex) {
    set((state) => {
      const templates = state.templates.map((t) => {
        if (t.id !== templateId) return t;
        const steps = [...t.steps];
        const [moved] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, moved);
        return { ...t, steps };
      });
      return { templates };
    });
  },

  setError(error) {
    set({ error });
  },

  // placeholder for future save to backend
  async saveAll() {
    set({ isSaving: true, error: null });
    try {
      const data = get().templates;
      // TODO: send to /aiTemplate or Firestore when ready
      console.log("Saving templates (placeholder):", data);
    } catch {
      set({ error: "Could not save templates yet." });
    } finally {
      set({ isSaving: false });
    }
  }
}));

