// src/experience/audio/spokenGuidance.js
// Phase 56 Day 3: registry of guidance audio keys + metadata. Do not block on missing files.

export const SPOKEN_GUIDANCE_REGISTRY = [
  {
    id: "breathing_intro",
    src: "/audio/guidance_breathing_intro.mp3",
    durationHint: 8,
    fallbackText: "Let's breathe together.",
  },
  {
    id: "grounding_intro",
    src: "/audio/guidance_grounding_intro.mp3",
    durationHint: 6,
    fallbackText: "Grounding can help you feel present.",
  },
  {
    id: "support_intro",
    src: "/audio/guidance_support_intro.mp3",
    durationHint: 5,
    fallbackText: "Support is available.",
  },
];

export function getGuidanceById(id) {
  return SPOKEN_GUIDANCE_REGISTRY.find((g) => g.id === id) ?? null;
}

export function getGuidanceSrc(id) {
  const g = getGuidanceById(id);
  return g?.src ?? null;
}
