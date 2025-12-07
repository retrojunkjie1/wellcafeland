// src/content/contentRegistry.js

/**
 * Central registry mapping content IDs to files and metadata.
 * This is Phase 34 only – simple, file-based registry.
 */

export const CONTENT_SECTIONS = {
  TOOLS: "tools",
  RECOVERY: "recovery",
  EDUCATION: "education",
  SPIRITUAL: "spiritual",
  ASSISTANCE: "assistance",
  ONBOARDING: "onboarding",
  DIRECTORY: "directory",
};

/**
 * contentRegistry keyed by a stable ID.
 * Keep IDs simple, predictable, and future-proof.
 */
export const contentRegistry = {
  // TOOLS
  "tool.breathing.basic1": {
    id: "tool.breathing.basic1",
    section: CONTENT_SECTIONS.TOOLS,
    title: "Breathing Reset — 4·6 Breathing",
    tags: ["breathing", "anxiety", "reset"],
    file: "tools/breathing-basic1.md",
  },
  "tool.grounding.54321": {
    id: "tool.grounding.54321",
    section: CONTENT_SECTIONS.TOOLS,
    title: "5-4-3-2-1 Grounding",
    tags: ["grounding", "overwhelm", "panic"],
    file: "tools/grounding-54321.md",
  },

  // RECOVERY - Phase 45: Learning Paths (7-tile dynamic system)
  "recovery.shame-and-recovery": {
    id: "recovery.shame-and-recovery",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Shame and Recovery",
    tags: ["shame", "recovery", "learning-path"],
    // Content loaded from learningPathsEngine, not a file
  },
  "recovery.cravings-and-urges": {
    id: "recovery.cravings-and-urges",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Cravings and Urges",
    tags: ["cravings", "urges", "learning-path"],
  },
  "recovery.nervous-system-regulation": {
    id: "recovery.nervous-system-regulation",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Nervous System Regulation",
    tags: ["nervous-system", "regulation", "trauma", "learning-path"],
  },
  "recovery.trauma-and-recovery": {
    id: "recovery.trauma-and-recovery",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Trauma and Recovery",
    tags: ["trauma", "recovery", "learning-path"],
  },
  "recovery.sleep-and-recovery": {
    id: "recovery.sleep-and-recovery",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Sleep and Recovery",
    tags: ["sleep", "recovery", "learning-path"],
  },
  "recovery.boundaries-in-recovery": {
    id: "recovery.boundaries-in-recovery",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Boundaries in Recovery",
    tags: ["boundaries", "recovery", "learning-path"],
  },
  "recovery.grief-and-loss": {
    id: "recovery.grief-and-loss",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Grief and Loss",
    tags: ["grief", "loss", "recovery", "learning-path"],
  },
  "recovery.self-compassion": {
    id: "recovery.self-compassion",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Self-Compassion",
    tags: ["self-compassion", "recovery", "learning-path"],
  },

  // Legacy entries (for backward compatibility)
  "recovery.cravings.intro": {
    id: "recovery.cravings.intro",
    section: CONTENT_SECTIONS.RECOVERY,
    title: "Understanding Cravings",
    tags: ["cravings", "urges"],
    file: "recovery/cravings-intro.md",
  },

  // EDUCATION
  "education.shame.basics": {
    id: "education.shame.basics",
    section: CONTENT_SECTIONS.EDUCATION,
    title: "Shame vs Guilt — Basic Distinction",
    tags: ["shame", "guilt", "education"],
    file: "education/shame-basics.md",
  },

  // SPIRITUAL (placeholder)
  "spiritual.grounding.water": {
    id: "spiritual.grounding.water",
    section: CONTENT_SECTIONS.SPIRITUAL,
    title: "Water & Grounding — Simple Ritual",
    tags: ["spiritual", "grounding", "water"],
    file: "spiritual/water-grounding.md",
  },

  // ASSISTANCE
  "assistance.realhelp.start": {
    id: "assistance.realhelp.start",
    section: CONTENT_SECTIONS.ASSISTANCE,
    title: "Where Do I Even Start?",
    tags: ["real help", "orientation"],
    file: "assistance/realhelp-start.md",
  },
};

/**
 * Helper to list content by section.
 */
export function listContentBySection(section) {
  return Object.values(contentRegistry).filter(
    (entry) => entry.section === section
  );
}

/**
 * Helper to get a single registry entry by ID.
 */
export function getContentRegistryEntry(id) {
  return contentRegistry[id] || null;
}


