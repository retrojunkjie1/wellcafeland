// src/stores/adminConfigStore.js

import { create } from "zustand";

// Optional: future Firestore integration
// import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
// import { app } from "../lib/firebaseClient"; // when you have this ready

const storageKey = "wc-admin-config-v1";

export const defaultAdminConfig = {
  // Home hero
  homeHeroEyebrow: "Your wellness guide for",
  homeHeroHeadline: "recovery, tools, and support.",
  homeHeroBody:
    "We learn what works for you and help you take the next right step—without judgment.",
  homeHeroPrimaryCta: "Let my guide read my day",
  homeHeroSecondaryCta: "Browse guided sessions",

  // Recovery card copy
  recoverySubtitle: "Track sobriety, urges, triggers, and wins in one calm space.",

  // Tools card copy
  toolsSubtitle:
    "Breathwork, urges, journaling, affirmations, MIR and more.",

  // Providers card copy
  providersSubtitle:
    "Connect with clinicians, peers, sober living, and supports.",

  // Dashboard card copy
  dashboardSubtitle:
    "See your patterns, streaks, and risk signals at a glance.",
};

function loadFromStorage() {
  if (typeof window === "undefined") return defaultAdminConfig;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultAdminConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultAdminConfig, ...parsed };
  } catch {
    return defaultAdminConfig;
  }
}

export const useAdminConfigStore = create((set) => ({
  config: loadFromStorage(),

  updateConfig(partial) {
    set((state) => {
      const next = { ...state.config, ...partial };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        }
      } catch {
        // ignore storage errors – never break the UI
      }
      return { config: next };
    });
  },

  resetConfig() {
    set(() => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify(defaultAdminConfig)
          );
        }
      } catch {
        // ignore
      }
      return { config: defaultAdminConfig };
    });
  },

  // Placeholder: safe to call, does nothing until Firestore is wired.
  // Later, we'll:
  //  - read from Firestore
  //  - merge into local state
  async loadFromRemote() {
    // TODO: Implement Firestore read
    // const db = getFirestore(app);
    // const docRef = doc(db, "adminConfig", "global");
    // const docSnap = await getDoc(docRef);
    // if (docSnap.exists()) {
    //   const remote = docSnap.data();
    //   set({ config: { ...defaultAdminConfig, ...remote } });
    // }
    return;
  },

  // Placeholder: safe to call, does nothing until Firestore is wired.
  // Later, we'll:
  //  - write current config to Firestore
  async saveToRemote() {
    // TODO: Implement Firestore write
    // const db = getFirestore(app);
    // const docRef = doc(db, "adminConfig", "global");
    // await setDoc(docRef, get().config, { merge: true });
    return;
  },
}));

