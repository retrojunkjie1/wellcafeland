// src/ai/relationship/relationshipModel.js
// Phase 29 — Relationship Stress Mapping Engine
// Pure functions only, no React, no Firestore.

const RELATIONSHIP_KEYWORDS = {
  conflict: [
    "argued", "fight", "fighting", "conflict", "disagree", "blow up",
    "tension", "heated", "argument"
  ],
  abandonment: [
    "they left", "she left", "he left", "walked away", "abandoned",
    "afraid they will leave", "fear of being left"
  ],
  betrayal: [
    "cheated", "betrayed", "lied", "deceived", "backstabbed", "unfaithful"
  ],
  rejection: [
    "rejected", "they don't want me", "left out", "pushed away",
    "ignored", "ghosted"
  ],
  control: [
    "controlling", "manipulative", "gaslight", "gaslighting", "pressure",
    "forced", "won't let me"
  ],
  distance: [
    "distant", "we are drifting", "pulling away", "not close", "fading"
  ],
  enmeshment: [
    "attached", "can't separate", "too close", "dependent", "clingy"
  ],
  resentment: [
    "resent", "resentful", "fed up", "done with", "frustrated with them"
  ],
  mistrust: [
    "can't trust", "don't trust", "suspicious", "hiding something"
  ],
};

const PATTERN_TAGS = {
  push_pull: ["drifting", "pulling away", "come close", "push me away"],
  avoidant: ["avoidant", "avoid", "shut down", "closed off"],
  clingy: ["clingy", "needy", "too attached"],
  volatile_bond: ["fight", "argue", "heated", "blow up"],
  caretaker_loop: ["i fix", "i take care", "i always help", "i always give"],
  abandonment_loop: ["afraid they will leave", "fear of being left", "left again"],
  resentment_cycle: ["resent", "fed up", "angry at them"],
};

// ----------------------------------------------------------

export function detectRelationshipDomains(text = "") {
  const lower = text.toLowerCase();
  const domains = [];

  for (const [domain, words] of Object.entries(RELATIONSHIP_KEYWORDS)) {
    if (words.some((w) => lower.includes(w))) {
      domains.push(domain);
    }
  }

  return domains;
}

// ----------------------------------------------------------

export function computeRelationshipTension(text = "", emotion = null) {
  const domains = detectRelationshipDomains(text);
  let score = 0;

  score += domains.length * 0.15;

  if (emotion && typeof emotion.intensity === "number") {
    score += Math.min(emotion.intensity * 0.5, 0.5);
  }

  return Math.min(1, score);
}

// ----------------------------------------------------------

export function detectRelationshipPatternTags(text = "") {
  const lower = text.toLowerCase();
  const tags = [];

  for (const [tag, signals] of Object.entries(PATTERN_TAGS)) {
    if (signals.some((s) => lower.includes(s))) {
      tags.push(tag);
    }
  }

  return tags;
}

// ----------------------------------------------------------

export function analyzeRelationshipSignals(message) {
  if (!message || typeof message.content !== "string") {
    return {
      domains: [],
      tensionScore: 0,
      patternTags: [],
      summaryTag: null,
    };
  }

  const text = message.content;
  const emotion = message.emotion || null;

  const domains = detectRelationshipDomains(text);
  const patternTags = detectRelationshipPatternTags(text);
  const tension = computeRelationshipTension(text, emotion);

  const summaryTag = patternTags.length > 0
    ? patternTags[0]
    : domains.length > 0
    ? domains[0]
    : null;

  return {
    domains,
    tensionScore: tension,
    patternTags,
    summaryTag,
  };
}

// ----------------------------------------------------------

export function buildRelationshipSnapshot(message) {
  return {
    id: message.id || `rel-${Date.now()}`,
    timestamp: Date.now(),
    domains: message.relationship?.domains || [],
    tension: message.relationship?.tensionScore || 0,
    patterns: message.relationship?.patternTags || [],
    summary: message.relationship?.summaryTag || null,
  };
}

export default {
  detectRelationshipDomains,
  computeRelationshipTension,
  detectRelationshipPatternTags,
  analyzeRelationshipSignals,
  buildRelationshipSnapshot,
};

