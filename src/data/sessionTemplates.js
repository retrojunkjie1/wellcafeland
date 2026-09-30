// src/data/sessionTemplates.js

export const DEFAULT_SESSION_TEMPLATES = [
  {
    id: "grounding-5min",
    title: "Choose an Anchor",
    tags: ["grounding", "anxiety", "body"],
    category: "Grounding",
    durationMinutes: 5,
    summary:
      "A short optional pause: choose one point of orientation or a change to your surroundings.",
    steps: [
      "Choose one steady object or color to rest your eyes on, if that suits you.",
      "Or listen for one familiar sound—or choose a quieter place.",
      "Hold a familiar object if it feels useful; nothing needs to be described.",
      "You can change the light, sound, or where you are, or finish here."
    ]
  },
  {
    id: "urge-support-3min",
    title: "Urge Support",
    tags: ["cravings", "urge", "sobriety"],
    category: "Cravings",
    durationMinutes: 3,
    summary:
      "Choose one practical next move, bring in a trusted person, or take an optional short pause. Urges vary; there is no required timeline.",
    steps: [
      "Create a little distance from a trigger if that feels safe and possible.",
      "Contact someone you trust, a peer, or a support group if company would help.",
      "Choose a familiar, manageable activity to do next.",
      "A short pause is optional. You can stop or seek live support at any time."
    ]
  },
  {
    id: "sleep-soft-15min",
    title: "Sleep Soft Landing",
    tags: ["sleep", "night", "reset"],
    category: "Sleep",
    durationMinutes: 15,
    summary:
      "Make room for rest with a quieter setting, a familiar sound, or a comfortable position.",
    steps: [
      "Dim the lights and put your phone on silent if you can.",
      "Choose whether a natural breath, a familiar sound, or quiet feels best.",
      "Settle into a comfortable position or shift until the setup suits you.",
      "If thoughts come, notice them and let them pass like clouds.",
      "Keep a familiar object nearby if that is comforting.",
      "End whenever you like; there is no need to feel a certain way."
    ]
  }
];
