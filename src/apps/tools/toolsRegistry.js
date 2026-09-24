// src/apps/tools/toolsRegistry.js

/**
 * Tools Registry
 * Central catalog of all wellness tools in WellnessCafe
 */

/**
 * All tools (including hidden/unfinished ones)
 * Use PUBLIC_TOOLS for public-facing pages
 */
const ALL_TOOLS = [
  {
    id: "breathing",
    name: "Breathing Practice",
    description: "Choose a gentle pace, include optional holds, or follow your natural breath.",
    category: "body-breath",
    duration: "1-10 min",
    primaryAgentId: "healer_breathwork",
    telemetryEventKey: "tool_breathing",
    tags: ["breathwork", "calm", "anxiety", "sleep"],
    recommendedFor: ["anxiety", "sleep", "stress", "panic"],
    icon: "🌬️",
    public: true,
  },
  {
    id: "grounding",
    name: "Grounding (5-4-3-2-1)",
    description: "Return to the present moment using your five senses.",
    category: "body-breath",
    duration: "~5 min",
    primaryAgentId: "healer_grounding",
    telemetryEventKey: "tool_grounding",
    tags: ["grounding", "present-moment", "dissociation", "anxiety"],
    recommendedFor: ["anxiety", "panic", "dissociation", "trauma"],
    icon: "🌍",
    public: true,
  },
  {
    id: "body-scan",
    name: "Body Scan",
    description: "Optional body-awareness prompts. Move at your own pace and skip any region.",
    category: "body-breath",
    duration: "~10 min",
    primaryAgentId: "healer_grounding",
    telemetryEventKey: "tool_body_scan",
    tags: ["body-awareness", "somatic", "relaxation", "present-moment"],
    recommendedFor: ["anxiety", "stress", "body-tension", "sleep"],
    icon: "🧍",
    public: true,
  },
  {
    id: "journaling",
    name: "Journaling",
    description: "Reflect and process with guided prompts. Dump, gratitude, or honest reflection.",
    category: "mind-thoughts",
    duration: "~10 min",
    primaryAgentId: "healer_mindfulness",
    telemetryEventKey: "tool_journaling",
    tags: ["journaling", "reflection", "processing", "self-awareness"],
    recommendedFor: ["grief", "trauma", "processing", "self-reflection"],
    icon: "📝",
    public: true,
  },
  {
    id: "self-surgeon",
    name: "Self-Inquiry",
    description: "Explore a situation with optional, compassionate prompts.",
    category: "mind-thoughts",
    duration: "~10 min",
    primaryAgentId: "healer_mindfulness",
    telemetryEventKey: "tool_self_surgeon",
    tags: ["self-compassion", "reframing", "inner-dialogue", "healing"],
    recommendedFor: ["shame", "self-criticism", "processing", "self-reflection"],
    icon: "💭",
    public: true,
  },
  {
    id: "education",
    name: "Education",
    description: "Learn about recovery, trauma, nervous system regulation, and more.",
    category: "mind-thoughts",
    duration: "~5 min",
    primaryAgentId: "oracle",
    telemetryEventKey: "tool_education",
    tags: ["education", "learning", "recovery", "trauma-informed"],
    recommendedFor: ["education", "understanding", "self-awareness"],
    icon: "📚",
    public: true,
  },
  {
    id: "urge-surfing",
    name: "Urge Surfing",
    description: "A timed pause with optional reflection and check-ins. Choose the support you need.",
    category: "stress-crisis",
    duration: "3-10 min",
    primaryAgentId: "sentinel",
    telemetryEventKey: "tool_urge_surfing",
    tags: ["cravings", "urges", "addiction", "recovery"],
    recommendedFor: ["cravings", "urges", "addiction", "relapse-prevention"],
    icon: "🌊",
    public: true,
  },
  {
    id: "meditation",
    name: "Visualization & Imagery",
    description: "Set a timer and practice mindfulness. Optional guided meditation themes.",
    category: "sleep-winddown",
    duration: "5-20 min",
    primaryAgentId: "oracle",
    telemetryEventKey: "tool_meditation",
    tags: ["meditation", "mindfulness", "focus", "calm"],
    recommendedFor: ["anxiety", "focus", "stress", "sleep"],
    icon: "🧘",
    public: true,
  },
  {
    id: "acuwellness",
    name: "Acupressure-Inspired Self-Care",
    description: "Optional, gentle touch practices. No pressure points or outcomes are required.",
    category: "body-breath",
    duration: "Optional",
    primaryAgentId: "healer_acuwellness",
    telemetryEventKey: "tool_acuwellness",
    tags: ["acuwellness", "self-care", "body-awareness"],
    recommendedFor: ["self-care", "body-awareness"],
    icon: "🤲",
    public: true,
  },
  {
    id: "affirmations",
    name: "Supportive Phrases",
    description: "Explore optional phrases for a concern you choose. Keep only what feels true to you.",
    category: "mind-thoughts",
    duration: "Optional",
    primaryAgentId: "healer_spiritual",
    telemetryEventKey: "tool_affirmations",
    tags: ["affirmations", "self-compassion", "reflection"],
    recommendedFor: ["self-compassion", "reflection"],
    icon: "✨",
    public: true,
  },
];

/**
 * Public-facing tools (only fully functional ones)
 * Breathing tool MUST always be available (offline-safe, no dependencies)
 */
export const TOOLS = ALL_TOOLS.filter((tool) => {
  // Breathing tool is always public (offline-safe, no AI/network required)
  if (tool.id === "breathing") return true;
  return tool.public !== false;
});

/**
 * All tools (including hidden ones) - for admin/internal use
 */
export const ALL_TOOLS_INTERNAL = ALL_TOOLS;

export const CATEGORIES = [
  { id: "all", label: "All Tools" },
  { id: "body-breath", label: "Body & Breath" },
  { id: "mind-thoughts", label: "Mind & Thoughts" },
  { id: "stress-crisis", label: "Stress & Crisis" },
  { id: "sleep-winddown", label: "Sleep & Wind-down" },
];

/**
 * Get tool by ID
 */
export function getToolById(toolId) {
  return TOOLS.find((tool) => tool.id === toolId) || null;
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category) {
  if (category === "all") return TOOLS;
  return TOOLS.filter((tool) => tool.category === category);
}

/**
 * Get tools by recommendation
 */
export function getToolsForConcern(concern) {
  return TOOLS.filter((tool) => tool.recommendedFor.includes(concern));
}
