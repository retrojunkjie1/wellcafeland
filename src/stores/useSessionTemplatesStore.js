import { create } from "zustand";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { DEFAULT_SESSION_TEMPLATES } from "@/data/sessionTemplates";

export const useSessionTemplatesStore = create((set, get) => ({
  templates: DEFAULT_SESSION_TEMPLATES,
  selectedId: DEFAULT_SESSION_TEMPLATES[0]?.id ?? null,
  isLoading: false,
  isSaving: false,
  error: null,
  saved: false,

  async loadAll() {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await getDocs(collection(db, "sessionTemplates"));
      const loaded = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      if (loaded.length) {
        set((state) => ({
          templates: loaded,
          selectedId: loaded.some((item) => item.id === state.selectedId) ? state.selectedId : loaded[0].id,
        }));
      }
    } catch (error) {
      set({ error: "Saved sessions couldn't be loaded. Check your admin access and try again." });
    } finally {
      set({ isLoading: false });
    }
  },

  selectTemplate(id) {
    set({ selectedId: id, saved: false });
  },

  addTemplate() {
    const id = `custom-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
    const newTemplate = {
      id,
      title: "Untitled session",
      tags: [],
      category: "General",
      durationMinutes: 10,
      summary: "",
      steps: [""],
      active: true,
      intentLabel: "recovery_mix",
    };
    set((state) => ({ templates: [newTemplate, ...state.templates], selectedId: id, saved: false, error: null }));
  },

  updateTemplate(id, updates) {
    set((state) => ({ templates: state.templates.map((item) => item.id === id ? { ...item, ...updates } : item), saved: false }));
  },

  removeTemplate(id) {
    set((state) => {
      const templates = state.templates.filter((item) => item.id !== id);
      return { templates, selectedId: templates[0]?.id ?? null, saved: false };
    });
  },

  reorderStep(templateId, fromIndex, toIndex) {
    set((state) => ({
      templates: state.templates.map((item) => {
        if (item.id !== templateId || toIndex < 0 || toIndex >= item.steps.length) return item;
        const steps = [...item.steps];
        const [moved] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, moved);
        return { ...item, steps };
      }),
      saved: false,
    }));
  },

  async saveAll() {
    set({ isSaving: true, error: null, saved: false });
    try {
      const templates = get().templates;
      const invalid = templates.find((item) => !item.title?.trim() || !item.summary?.trim() || !item.steps?.some((step) => step?.trim()));
      if (invalid) throw new Error("Each session needs a title, a short description, and at least one completed step.");

      const existing = await getDocs(collection(db, "sessionTemplates"));
      const retainedIds = new Set(templates.map((item) => item.id));
      const batch = writeBatch(db);
      templates.forEach((item, index) => {
        const { id, ...data } = item;
        batch.set(doc(db, "sessionTemplates", id), {
          ...data,
          active: item.active !== false,
          intentLabel: item.intentLabel || "recovery_mix",
          position: index,
          updatedAt: Date.now(),
        });
      });
      existing.docs.filter((item) => !retainedIds.has(item.id)).forEach((item) => batch.delete(item.ref));
      await batch.commit();
      set({ saved: true });
    } catch (error) {
      set({ error: error?.message || "Sessions couldn't be saved. Check your admin access and try again." });
    } finally {
      set({ isSaving: false });
    }
  },
}));
