// src/ai/human/humanMap.js
// Human Map Engine: Canonical emotional states, distress patterns, trigger domains, and vocabulary layers
// Pure data structures - no side effects, no React, no network calls, no Firebase

/**
 * Canonical emotional states WellnessCafe OS understands.
 * Each entry: { id, label, valence, defaultIntensity }
 */
export const EMOTIONAL_STATES = [
  { id: "overwhelmed", label: "Overwhelmed", valence: "distressed", defaultIntensity: 0.8 },
  { id: "anxious", label: "Anxious", valence: "distressed", defaultIntensity: 0.7 },
  { id: "stressed", label: "Stressed", valence: "distressed", defaultIntensity: 0.6 },
  { id: "frustrated", label: "Frustrated", valence: "distressed", defaultIntensity: 0.6 },
  { id: "angry", label: "Angry", valence: "distressed", defaultIntensity: 0.7 },
  { id: "irritable", label: "Irritable", valence: "distressed", defaultIntensity: 0.5 },
  { id: "restless", label: "Restless", valence: "distressed", defaultIntensity: 0.5 },
  { id: "fearful", label: "Fearful", valence: "distressed", defaultIntensity: 0.7 },
  { id: "panicked", label: "Panicked", valence: "distressed", defaultIntensity: 0.9 },
  { id: "hopeless", label: "Hopeless", valence: "distressed", defaultIntensity: 0.9 },
  { id: "defeated", label: "Defeated", valence: "distressed", defaultIntensity: 0.8 },
  { id: "numb", label: "Numb", valence: "distressed", defaultIntensity: 0.7 },
  { id: "detached", label: "Detached", valence: "distressed", defaultIntensity: 0.6 },
  { id: "ashamed", label: "Ashamed", valence: "distressed", defaultIntensity: 0.8 },
  { id: "guilty", label: "Guilty", valence: "distressed", defaultIntensity: 0.8 },
  { id: "regretful", label: "Regretful", valence: "distressed", defaultIntensity: 0.7 },
  { id: "insecure", label: "Insecure", valence: "distressed", defaultIntensity: 0.6 },
  { id: "lonely", label: "Lonely", valence: "distressed", defaultIntensity: 0.7 },
  { id: "abandoned", label: "Abandoned", valence: "distressed", defaultIntensity: 0.8 },
  { id: "misunderstood", label: "Misunderstood", valence: "distressed", defaultIntensity: 0.6 },
  { id: "sad", label: "Sad", valence: "distressed", defaultIntensity: 0.6 },
  { id: "grieving", label: "Grieving", valence: "distressed", defaultIntensity: 0.8 },
  { id: "tender", label: "Tender", valence: "vulnerable", defaultIntensity: 0.5 },
  { id: "vulnerable", label: "Vulnerable", valence: "vulnerable", defaultIntensity: 0.6 },
  { id: "confused", label: "Confused", valence: "distressed", defaultIntensity: 0.5 },
  { id: "uncertain", label: "Uncertain", valence: "distressed", defaultIntensity: 0.5 },
  { id: "depleted", label: "Depleted", valence: "distressed", defaultIntensity: 0.7 },
  { id: "exhausted", label: "Exhausted", valence: "distressed", defaultIntensity: 0.8 },
  { id: "distracted", label: "Distracted", valence: "distressed", defaultIntensity: 0.5 },
  { id: "frozen", label: "Frozen", valence: "distressed", defaultIntensity: 0.7 },
  { id: "avoidant", label: "Avoidant", valence: "distressed", defaultIntensity: 0.6 },
  { id: "resigned", label: "Resigned", valence: "distressed", defaultIntensity: 0.7 },
  { id: "calm", label: "Calm", valence: "supportive", defaultIntensity: 0.4 },
  { id: "grounded", label: "Grounded", valence: "supportive", defaultIntensity: 0.4 },
  { id: "hopeful", label: "Hopeful", valence: "supportive", defaultIntensity: 0.5 },
  { id: "determined", label: "Determined", valence: "supportive", defaultIntensity: 0.6 },
];

/**
 * Distress patterns describe HOW suffering shows up in behavior/language.
 */
export const DISTRESS_PATTERNS = [
  "spiraling",
  "catastrophizing",
  "internal_collapse",
  "shutting_down",
  "emotional_flooding",
  "hypervigilance",
  "intrusive_thinking",
  "self_blame_loop",
  "perfectionism_panic",
  "people_pleasing_collapse",
  "identity_confusion",
  "existential_dread",
  "shame_implosion",
  "anger_projection",
  "loneliness_echo",
  "pressure_stacking",
  "crisis_mode",
  "disconnection",
  "nothing_matters_mindset",
  "avoidance_spike",
  "survival_mode",
  "guilt_replay",
  "regret_fixation",
  "fear_of_failure",
  "fear_of_judgment",
  "hidden_distress",
  "masking",
  "dissociation_light",
  "frustration_overflow",
  "boundary_fatigue",
];

/**
 * Trigger domains: where in life this shows up.
 * Keep this list large and extensible.
 */
export const TRIGGER_DOMAINS = [
  "cravings",
  "relapse_pressure",
  "boredom",
  "loneliness",
  "social_isolation",
  "money_stress",
  "work_pressure",
  "legal_issues",
  "family_conflict",
  "relationship_conflict",
  "breakup",
  "trust_wounds",
  "childhood_memory",
  "abandonment_fear",
  "rejection_sensitivity",
  "identity_crisis",
  "shame",
  "guilt",
  "anger",
  "resentment",
  "hopelessness",
  "self_worth_collapse",
  "spiritual_emptiness",
  "purpose_confusion",
  "burnout",
  "sleep_deprivation",
  "exhaustion",
  "performance_anxiety",
  "social_anxiety",
  "intimacy_fear",
  "emotional_withdrawal",
  "perfectionism",
  "comparison_insecurity",
  "boundary_issues",
  "parenting_stress",
  "time_pressure",
  "future_worry",
  "loss_grief",
  "disappointment",
  "stagnation",
  "longing",
  "fear_of_change",
  "fear_of_unknown",
  "accountability_fear",
  "judgment_fear",
  "control_loss",
  "emotional_numbness",
];

/**
 * Vocabulary layers: how people actually SAY these things.
 *  - direct: explicit words
 *  - indirect: phrases and patterns that imply it
 *  - impliedSignals: structural / stylistic signals
 */
export const VOCABULARY_LAYERS = {
  direct: {
    cravings: [
      "craving", "urge", "use again", "get high", "get drunk", "relapse",
      "slip up", "pick up", "hit the bottle", "hit the pipe",
    ],
    shame: [
      "ashamed", "embarrassed", "humiliated", "disgusted with myself",
      "i hate myself", "i'm a failure",
    ],
    guilt: [
      "guilty", "i messed up", "my fault", "shouldn't have done",
      "i let everyone down",
    ],
    hopelessness: [
      "what's the point", "nothing matters", "can't do this",
      "it will never get better", "i'm done",
    ],
    anxiety: [
      "anxious", "worried", "panicking", "freaking out", "on edge",
      "can't calm down",
    ],
    overwhelm: [
      "overwhelmed", "too much", "can't keep up", "drowning",
      "everything is piling up",
    ],
    isolation: [
      "alone", "nobody understands", "no one gets it", "no one cares",
      "by myself",
    ],
    grief: [
      "lost someone", "i miss them", "can't let go", "it still hurts",
      "since they died",
    ],
  },
  indirect: {
    cravings: [
      "i just need something to take the edge off",
      "i can't sit with this",
      "i need an escape",
      "anything to stop feeling like this",
      "no coping skills left",
      "i know what would make this easier",
    ],
    shame: [
      "i don't want to talk about it",
      "forget it",
      "it's stupid",
      "i'm not proud of it",
      "you don't want to know",
      "if you knew you would judge me",
    ],
    guilt: [
      "i keep replaying it",
      "i can't forgive myself",
      "i should have known better",
      "everyone would be better without me",
    ],
    anxiety: [
      "my mind won't shut off",
      "i can't stop thinking about it",
      "i'm waiting for something bad to happen",
      "i feel keyed up",
    ],
    overwhelm: [
      "i don't know where to start",
      "everything is hitting at once",
      "i'm buried",
      "i feel like i'm drowning in responsibilities",
    ],
    isolation: [
      "i don't want to bother anyone",
      "nobody wants to hear this",
      "i always end up alone",
      "i'm just staying in my room",
    ],
    grief: [
      "it's like a part of me is gone",
      "i still look for them",
      "it's hard to move on",
      "i feel stuck in that moment",
    ],
  },
  impliedSignals: {
    // Structural patterns, not explicit words.
    shortDismissive: ["whatever", "it's fine", "nm", "idk"],
    overExplainingMarkers: ["because", "i mean", "it's just that"],
    apologyMarkers: ["sorry", "my bad", "i shouldn't", "i know it's stupid"],
  },
};

