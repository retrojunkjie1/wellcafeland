// ===========================================================
// RITUAL SEQUENCES — Declarative multi-step healing flows
// Phase 47 — Adaptive Ritual Sequences
// ===========================================================
//
// A ritual has:
//  - id
//  - title
//  - steps[]: each step defines a tool, text, or breathing pattern
//  - variants: emotional-state-based overrides
//
// Tools automatically route via sessionDispatcher.
//
// ===========================================================

export const ritualSequences = {
  groundingMorning: {
    id: "groundingMorning",
    title: "Morning Grounding Ritual",
    steps: [
      { type: "breathing", pattern: "box", duration: 60 },
      { type: "instruction", text: "Notice one thing you can see, touch, and hear." },
      { type: "tool", key: "ritual-grounding" },
    ],
    variants: {
      anxious: [
        { type: "breathing", pattern: "4-7-8", duration: 90 },
        { type: "instruction", text: "Place both feet on the floor. Slow your exhale." },
        { type: "tool", key: "ritual-grounding" },
      ],
      low: [
        { type: "instruction", text: "Sit upright. Roll your shoulders slowly forward and back." },
        { type: "breathing", pattern: "coherence", duration: 60 },
        { type: "tool", key: "ritual-grounding" },
      ],
    },
  },

  cravingReset: {
    id: "cravingReset",
    title: "Craving Reset Flow",
    steps: [
      { type: "instruction", text: "A craving rises, peaks, and falls. We ride the wave." },
      { type: "breathing", pattern: "elongated-exhale", duration: 120 },
      { type: "tool", key: "ritual-craving-reset" },
    ],
    variants: {
      highCraving: [
        { type: "instruction", text: "Pause. Place your hand on your chest. You're here." },
        { type: "breathing", pattern: "elongated-exhale", duration: 180 },
        { type: "tool", key: "ritual-craving-reset" },
      ],
    },
  },
};

