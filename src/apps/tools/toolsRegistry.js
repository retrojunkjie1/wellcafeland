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
    description: "Select a paced breathing pattern or keep your breath natural; no holds are required.",
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
    name: "Reconnect with the room",
    description: "A brief sensory pause that may help bring attention back to the present. Stop or switch if it feels uncomfortable.",
    category: "body-breath",
    duration: "Self-paced",
    primaryAgentId: "healer_grounding",
    telemetryEventKey: "tool_grounding",
    tags: ["grounding", "orientation", "sensory-choice", "present-moment"],
    recommendedFor: ["present-moment orientation", "scattered attention"],
    icon: "🌍",
    public: true,
  },
  {
    id: "pmr",
    name: "Progressive Muscle Relaxation",
    description: "A guided tense-and-release sequence used as a practical skill in structured behavioral-health programs. Work gently, or choose release-only.",
    category: "body-breath",
    duration: "About 2 min",
    primaryAgentId: "healer_mindfulness",
    telemetryEventKey: "tool_pmr",
    tags: ["progressive-muscle-relaxation", "stress-support", "muscle-awareness", "recovery-skill"],
    recommendedFor: ["stress support", "muscle tension awareness", "recovery skills"],
    icon: "🫧",
    public: true,
  },
  {
    id: "body-scan",
    name: "Steady Ground",
    description: "Choose a small movement, a supportive surface, a familiar object, or a change to your space. No body ratings or written answers.",
    category: "body-breath",
    duration: "~10 min",
    primaryAgentId: "healer_grounding",
    telemetryEventKey: "tool_body_scan",
    tags: ["grounding", "movement", "comfort", "present-moment"],
    recommendedFor: ["overwhelm", "stress", "reorientation", "pause"],
    icon: "🪑",
    public: true,
  },
  {
    id: "journaling",
    name: "Journaling",
    description: "Choose an open page, gratitude, a feelings check, or a focused reflection; save only what you want to keep.",
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
    description: "Untangle one situation into facts, interpretations, needs, and a fair next step.",
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
    description: "Read practical explainers on recovery, shame, urges, sleep, grief, trauma, and boundaries at your own pace.",
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
    name: "Urge Support",
    description: "Choose a practical next move, contact someone you trust, or take an optional three-minute pause. No ratings or writing.",
    category: "stress-crisis",
    duration: "Optional 3 min",
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
    description: "Use optional imagery or a quiet attention practice; choose an external scene if body focus is not right for you.",
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
    description: "Explore gentle self-touch as a comfort cue, with clear opt-outs and no promised treatment effects.",
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
    description: "Generate grounded, editable phrases for a chosen concern; reject anything that feels false or unhelpful.",
    category: "mind-thoughts",
    duration: "Optional",
    primaryAgentId: "healer_spiritual",
    telemetryEventKey: "tool_affirmations",
    tags: ["affirmations", "self-compassion", "reflection"],
    recommendedFor: ["self-compassion", "reflection"],
    icon: "✨",
    public: true,
  },
  {
    id: "low-energy-plan",
    name: "One Small Step",
    description: "Choose one practical need, match it to the energy you have, and make a plan that allows for asking for help or pausing.",
    category: "everyday-support",
    duration: "2-10 min",
    telemetryEventKey: "tool_low_energy_plan",
    tags: ["low-energy", "daily-needs", "small-steps", "practical-support"],
    recommendedFor: ["low-energy", "overwhelm", "daily-needs", "practical-support"],
    icon: "🌱",
    public: true,
  },
  {
    id: "visit-prep",
    name: "Prepare for a visit",
    description: "Gather your questions and priorities privately, then choose whether to share selected fields with a connected practitioner.",
    category: "everyday-support",
    duration: "Self-paced",
    telemetryEventKey: "tool_visit_prep",
    tags: ["appointment", "questions", "shared-decision-making", "client-choice"],
    recommendedFor: ["appointment preparation", "asking questions", "care coordination"],
    icon: "📋",
    public: true,
  },
  {
    id: "care-coordination",
    name: "Ask for practical help",
    description: "Send a focused request to a connected recovery coach, peer supporter, or community supporter. Choose the details they can see and track the follow-up.",
    category: "everyday-support",
    duration: "Self-paced",
    telemetryEventKey: "tool_care_coordination",
    tags: ["practical-support", "care-coordination", "client-choice", "follow-up"],
    recommendedFor: ["finding resources", "practical barriers", "coordinating a next step"],
    icon: "🤝",
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
  { id: "everyday-support", label: "Everyday Support" },
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
