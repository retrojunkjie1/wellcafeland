// src/engines/sequences/sequenceEngine.js

// ===========================================================
// Phase 47 + 48 — Adaptive Ritual Sequence Engine
// Linear + Multi-Path sequences for guided healing flows
// ===========================================================

import { launchSession } from "@/engines/sessions/sessionDispatcher";

// Master list of guided ritual sequences
// NOTE: steps use simple array indexes;
// branch steps point to `toIndex` targets.
export const ritualSequences = {
  // -------------------------------------------------
  // 5-Minute Grounding Ritual (linear)
  // -------------------------------------------------
  "ritual-grounding-seq": {
    id: "ritual-grounding-seq",
    title: "5-Minute Grounding Ritual",
    description: "A gentle sequence to settle your body and return to safety.",
    estimatedMinutes: 5,
    steps: [
      {
        type: "text",
        title: "Pause & Arrive",
        body:
          "Place both feet on the ground. Let your jaw unclench. Let your shoulders soften. Nothing else is required of you right now.",
      },
      {
        type: "tool",
        title: "Three Slow Breaths",
        body: "We'll start with three slow, deliberate breaths to let your nervous system know it can downshift.",
        toolKey: "ritual-breathing", // mapped inside sessionDispatcher
      },
      {
        type: "text",
        title: "Orient to the Room",
        body:
          "Slowly look around and name three things you can see. One by one. Let your eyes land gently. You are here. You are now.",
      },
      {
        type: "tool",
        title: "5–4–3–2–1 Grounding",
        body:
          "We'll move through the senses. This pulls your attention away from the storm and back into your body.",
        toolKey: "ritual-grounding",
      },
      {
        type: "completion",
        title: "You're Back on Solid Ground",
        body:
          "Notice what is different in your body now, even if it's just 5% softer. That 5% matters. You did that.",
      },
    ],
  },

  // -------------------------------------------------
  // Cravings Reset Ritual — Multi-Path Branching
  // -------------------------------------------------
  "ritual-craving-reset-seq": {
    id: "ritual-craving-reset-seq",
    title: "Cravings Reset Ritual",
    description:
      "A structured ritual to ride the craving wave without letting it decide your next move.",
    estimatedMinutes: 8,
    multiPath: true,
    steps: [
      // 0
      {
        type: "text",
        title: "Notice Without Blame",
        body:
          "A craving does not mean you've failed. It means your body and brain are asking for relief the old way. We're going to offer relief a different way.",
      },
      // 1 — Branch step
      {
        type: "branch",
        title: "What feels most true right now?",
        question:
          "Answer honestly. There's no punishment here—only better support.",
        options: [
          {
            key: "edge",
            label: "I feel right on the edge of acting on it",
            description:
              "I feel shaky, impulsive, or like I could say yes at any moment.",
            toIndex: 2,
            tags: ["high-risk", "panic"],
          },
          {
            key: "wave",
            label: "It's strong, but I think I can ride it",
            description:
              "Uncomfortable but I still feel a tiny bit of space to choose.",
            toIndex: 4,
            tags: ["moderate-risk", "anxious"],
          },
          {
            key: "echo",
            label: "It's more like a background echo",
            description:
              "The craving is there, but I mostly feel tired, numb, or just low.",
            toIndex: 6,
            tags: ["low-risk", "flat"],
          },
        ],
      },
      // 2 — High-risk path
      {
        type: "tool",
        title: "Emergency Reset",
        body:
          "We'll use the Panic Reset protocol to bring your system down from the edge.",
        toolKey: "ritual-craving-reset", // maps to Panic / Urge reset tool
        path: "edge",
      },
      // 3
      {
        type: "text",
        title: "Name What You Just Saved",
        body:
          "If you had acted on the craving, what would have been at risk? A relationship? Your freedom? Your health? Name at least one thing.",
        path: "edge",
      },

      // 4 — Moderate-risk path
      {
        type: "tool",
        title: "Wave Breathing",
        body:
          "We'll use the breathing orb to ride the wave instead of fighting it.",
        toolKey: "ritual-breathing",
        path: "wave",
      },
      // 5
      {
        type: "text",
        title: "Let the Wave Peak and Fall",
        body:
          "Cravings feel permanent when you're inside them, but they always peak and fall. Notice if this one feels even 10% softer now.",
        path: "wave",
      },

      // 6 — Low-energy / flat path
      {
        type: "text",
        title: "Underneath the Craving",
        body:
          "Sometimes the craving is actually about exhaustion, loneliness, or shame. If you had to guess, what is this one really about?",
        path: "echo",
      },
      // 7
      {
        type: "tool",
        title: "Gentle Grounding",
        body:
          "We'll do a short grounding practice to reconnect you with your body without demanding too much.",
        toolKey: "ritual-grounding",
        path: "echo",
      },

      // 8 — Shared completion
      {
        type: "completion",
        title: "You Stayed in the Story",
        body:
          "The craving rose. You stayed. You chose support over silence. This is how a new story is written—in quiet decisions like this.",
      },
    ],
  },

  // -------------------------------------------------
  // Nervous System Reset — linear, short
  // -------------------------------------------------
  "ritual-nervous-reset-seq": {
    id: "ritual-nervous-reset-seq",
    title: "Nervous System Reset",
    description:
      "A short regulation sequence to bring your nervous system back within its window of tolerance.",
    estimatedMinutes: 6,
    steps: [
      {
        type: "text",
        title: "First: Notice",
        body:
          "Is your energy more wired, more frozen, or just scattered? You don't have to fix it. Just name it.",
      },
      {
        type: "tool",
        title: "Coherence Breathing",
        body:
          "We'll guide your breath into a steady rhythm so your heart and nervous system can resync.",
        toolKey: "ritual-breathing",
      },
      {
        type: "text",
        title: "Anchor the Shift",
        body:
          "Place one hand on your chest, one on your belly. Feel where your breath is landing now compared to when you started.",
      },
      {
        type: "completion",
        title: "A Small Reset Is Still a Reset",
        body:
          "Stability is built from small resets repeated often. Today counts.",
      },
    ],
  },
};

export function getSequence(key) {
  return ritualSequences[key] || null;
}

export function beginSequence(key, navigate) {
  const seq = getSequence(key);
  if (!seq) {
    console.warn("Sequence not found:", key);
    return;
  }
  if (!navigate) {
    console.warn("Navigate function not provided");
    return;
  }
  navigate(`/sequence/${key}`);
}

export function executeStep(step, navigate) {
  if (!step) return;
  if (step.type === "tool" && step.toolKey) {
    launchSession(step.toolKey, navigate);
  }
}
