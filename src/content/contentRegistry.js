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

  // RECOVERY
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


