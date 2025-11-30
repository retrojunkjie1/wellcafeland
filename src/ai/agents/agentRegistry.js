// src/ai/agents/agentRegistry.js
// Phase 25 — First 25 Intelligence Agents
// Pure metadata registry for the multi-agent fusion protocol.
// NO side-effects, NO React imports, NO external calls.

/**
 * Each agent describes:
 * - id: stable internal ID (snake-case)
 * - name: human-friendly label
 * - role: high-level responsibility
 * - scope: "system" | "user" | "provider"
 * - triggersWhen: what signals wake this agent up
 * - consumes: which signal fields it reads
 * - produces: which fields it writes / recommends (conceptual)
 * - priority: 1–5 (1 = critical safety/core)
 * - enabledByDefault: boolean toggle for Admin Console
 * - notes: short, human-readable description
 */

/** @typedef {{
 *   id: string;
 *   name: string;
 *   role: string;
 *   scope: "system" | "user" | "provider";
 *   triggersWhen: string[];
 *   consumes: string[];
 *   produces: string[];
 *   priority: 1 | 2 | 3 | 4 | 5;
 *   enabledByDefault: boolean;
 *   notes: string;
 * }} IntelligenceAgent */

export const INTELLIGENCE_AGENTS = /** @type {IntelligenceAgent[]} */ ([
  // 1. Overseer — global system state
  {
    id: "overseer",
    name: "Overseer",
    role: "Global state watcher",
    scope: "system",
    triggersWhen: [
      "chat.message.user",
      "chat.message.assistant",
      "tool.completed",
      "api.error",
    ],
    consumes: [
      "message.content",
      "message.emotion",
      "message.risk",
      "trajectory",
      "system.metrics",
    ],
    produces: [
      "systemState.current",
      "systemState.preferredMode",
      "systemState.lastNeed",
    ],
    priority: 1,
    enabledByDefault: true,
    notes:
      "Keeps a bird's-eye view of emotional state, risk, and usage patterns to keep the OS coherent.",
  },

  // 2. Sentinel — risk & safety
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Risk and safety monitor",
    scope: "user",
    triggersWhen: ["chat.message.user", "risk.high", "risk.moderate"],
    consumes: [
      "message.content",
      "message.emotion",
      "message.risk",
      "triggers",
      "trajectory.forecast",
    ],
    produces: ["safety.riskEvents", "safety.flags", "safety.providerAlerts"],
    priority: 1,
    enabledByDefault: true,
    notes:
      "Watches for concerning patterns and marks messages/events that may need escalation or provider attention.",
  },

  // 3. Seer — trajectory & forecasting
  {
    id: "seer",
    name: "Seer",
    role: "Trajectory forecaster",
    scope: "user",
    triggersWhen: ["chat.message.user", "emotion.history.updated"],
    consumes: ["emotionalHistory", "message.emotion", "message.triggers"],
    produces: ["trajectory.drift", "trajectory.cluster", "trajectory.forecast"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Reads the emotional timeline and forecasts whether things are improving, declining, or becoming volatile.",
  },

  // 4. Oracle — intervention chooser
  {
    id: "oracle",
    name: "Oracle",
    role: "Intervention selector",
    scope: "user",
    triggersWhen: ["chat.message.user", "signals.ready"],
    consumes: [
      "message.content",
      "message.emotion",
      "message.triggers",
      "message.risk",
      "trajectory",
      "humanMap.layers",
    ],
    produces: ["recommendation.tool", "recommendation.style"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Chooses which tool or approach to suggest next, based on risk, triggers, and human map context.",
  },

  // 5. Cherubim — boundary guardian
  {
    id: "cherubim",
    name: "Cherubim",
    role: "Boundary & guardrail agent",
    scope: "system",
    triggersWhen: ["chat.message.user", "chat.message.assistant"],
    consumes: [
      "message.content",
      "message.risk",
      "policy.rules",
      "safety.flags",
    ],
    produces: ["safety.contentGuards", "safety.softRedirects"],
    priority: 1,
    enabledByDefault: true,
    notes:
      "Ensures responses stay safe, non-triggering, non-diagnostic, and aligned with ethical boundaries.",
  },

  // 6. Healer — self-compassion nudges
  {
    id: "healer",
    name: "Healer",
    role: "Compassion & gentleness",
    scope: "user",
    triggersWhen: [
      "message.triggers.shame",
      "message.triggers.guilt",
      "message.emotion.label=ashamed",
    ],
    consumes: ["message.content", "message.emotion", "message.triggers"],
    produces: ["microNudges.selfCompassion", "toneAdjustments"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Adds gentle language and self-compassion cues when shame, self-blame, or collapse shows up.",
  },

  // 7. Towncrier — notifications & updates
  {
    id: "towncrier",
    name: "Towncrier",
    role: "Announcements & updates",
    scope: "user",
    triggersWhen: ["system.events", "provider.message", "resource.found"],
    consumes: ["notifications.queue", "system.changes"],
    produces: ["notifications.toUser"],
    priority: 4,
    enabledByDefault: true,
    notes:
      "Handles how updates, reminders, and new opportunities are gently surfaced without overwhelming the user.",
  },

  // 8. Scribe — journaling & reflection
  {
    id: "scribe",
    name: "Scribe",
    role: "Reflection & journaling prompts",
    scope: "user",
    triggersWhen: [
      "message.triggers.guilt",
      "message.triggers.grief",
      "message.triggers.regret",
    ],
    consumes: ["message.content", "message.emotion", "message.triggers"],
    produces: ["prompt.journaling", "recommendation.tool=journaling"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Offers gently-phrased prompts when writing or reflection would help process what just surfaced.",
  },

  // 9. Cartographer — Human Map architect
  {
    id: "cartographer",
    name: "Cartographer",
    role: "Human Map maintainer",
    scope: "user",
    triggersWhen: ["chat.message.user", "humanMap.updateRequested"],
    consumes: [
      "message.content",
      "message.emotion",
      "message.triggers",
      "risk",
      "trajectory",
    ],
    produces: ["humanMap.layers", "humanMap.segments", "humanMap.tags"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Maintains the user's Human Map snapshot—patterns, themes, and segments that guide future care.",
  },

  // 10. Bridge — real-world resource linker
  {
    id: "bridge",
    name: "Bridge",
    role: "Real-world connection agent",
    scope: "user",
    triggersWhen: ["directory.intent.detected", "realHelp.requested"],
    consumes: ["directory.query", "message.content", "location.region"],
    produces: ["directory.searchParams", "resource.recommendations"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Connects what the user says with housing, grants, programs, and support options in the real world.",
  },

  // 11. Mirror — pattern reflection
  {
    id: "mirror",
    name: "Mirror",
    role: "Gentle pattern naming",
    scope: "user",
    triggersWhen: ["trajectory.cluster.detected", "loop.detected"],
    consumes: [
      "emotionalHistory",
      "trajectory.cluster",
      "trajectory.drift",
      "message.content",
    ],
    produces: ["microReflections.patterns"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Gently reflects back repeating patterns (like loops or cycles) in language that feels kind and non-clinical.",
  },

  // 12. Anchor — grounding & body presence
  {
    id: "anchor",
    name: "Anchor",
    role: "Grounding & body-based support",
    scope: "user",
    triggersWhen: [
      "message.triggers.overwhelm",
      "message.emotion.label=overwhelmed",
      "risk.moderate",
    ],
    consumes: ["message.emotion", "message.triggers", "risk"],
    produces: ["recommendation.tool=grounding", "microNudges.bodyAwareness"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Leans toward body-based practices when the system senses overwhelm, collapse, or disconnection.",
  },

  // 13. Breathkeeper — nervous system regulation
  {
    id: "breathkeeper",
    name: "Breathkeeper",
    role: "Breath & nervous system agent",
    scope: "user",
    triggersWhen: [
      "message.triggers.anxiety",
      "message.emotion.label=anxious",
      "panic.keywords",
    ],
    consumes: ["message.content", "message.emotion", "triggers"],
    produces: ["recommendation.tool=breathing", "breathing.scripts"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Handles breathing-based practices and chooses which pattern is most appropriate for the current state.",
  },

  // 14. Shepherd — connection & community
  {
    id: "shepherd",
    name: "Shepherd",
    role: "Connection & community agent",
    scope: "user",
    triggersWhen: [
      "message.triggers.isolation",
      "message.triggers.loneliness",
      "social.intent",
    ],
    consumes: ["message.content", "message.triggers", "social.state"],
    produces: ["recommendation.circles", "recommendation.connections"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Suggests Circles, partners, or social spaces when isolation and loneliness start to show.",
  },

  // 15. Gatekeeper — provider routing
  {
    id: "gatekeeper",
    name: "Gatekeeper",
    role: "Provider & care routing",
    scope: "provider",
    triggersWhen: ["risk.high", "provider.timeline.update"],
    consumes: ["risk", "humanMap.layers", "providerRegistry", "user.profile"],
    produces: ["providerRouting.suggestions", "providerTimeline.entries"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Maps high-risk or complex patterns to the right provider views or interventions without interrupting the user's flow.",
  },

  // 16. Rhythm — routines & habits
  {
    id: "rhythm",
    name: "Rhythm",
    role: "Daily rhythm & micro-habit agent",
    scope: "user",
    triggersWhen: ["time.ofDay", "streaks.updated", "tool.usagePattern"],
    consumes: ["usage.streaks", "time.local", "tool.usageHistory"],
    produces: ["microNudges.routines", "suggested.checkIns"],
    priority: 4,
    enabledByDefault: true,
    notes:
      "Looks at time-of-day and usage rhythm to suggest gentle check-ins and micro-practices.",
  },

  // 17. Lantern — education & psychoeducation
  {
    id: "lantern",
    name: "Lantern",
    role: "Education & understanding",
    scope: "user",
    triggersWhen: ["education.intent", "message.triggers.confusion"],
    consumes: ["message.content", "message.triggers", "education.catalog"],
    produces: ["education.recommendations", "education.snippets"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Recommends educational modules when the user is confused, curious, or asking to understand what's happening.",
  },

  // 18. Witness — provider timeline mirroring
  {
    id: "witness",
    name: "Witness",
    role: "Provider-facing storyline agent",
    scope: "provider",
    triggersWhen: ["risk.high", "trajectory.declining", "tool.completed"],
    consumes: ["risk", "trajectory", "tool.usageHistory", "humanMap.layers"],
    produces: ["providerTimeline.snapshots"],
    priority: 2,
    enabledByDefault: true,
    notes:
      "Summarizes key emotional turns and moments for providers, without flooding them with raw transcript.",
  },

  // 19. Pulse — system health & diagnostics
  {
    id: "pulse",
    name: "Pulse",
    role: "System health monitor",
    scope: "system",
    triggersWhen: ["healthCheck.run", "api.error", "latency.spike"],
    consumes: ["health.metrics", "api.errors", "latency.stats"],
    produces: ["health.status", "health.alerts"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Keeps track of OS and API health so that human support and admins know when the system itself needs attention.",
  },

  // 20. Steward — privacy & data hygiene
  {
    id: "steward",
    name: "Steward",
    role: "Data hygiene & privacy guardian",
    scope: "system",
    triggersWhen: ["data.write", "session.end", "export.requested"],
    consumes: ["telemetry.events", "session.data", "privacy.policies"],
    produces: ["data.cleanupPlans", "privacy.summaries"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Ensures data is treated as sacred—handles expiry, cleanup, and clarity about what is stored.",
  },

  // 21. Compass — values & direction
  {
    id: "compass",
    name: "Compass",
    role: "Values-alignment agent",
    scope: "user",
    triggersWhen: ["values.intent", "identity.reflection"],
    consumes: ["message.content", "humanMap.values", "goals"],
    produces: ["reflection.valuesAligned", "prompt.valuesCheck"],
    priority: 4,
    enabledByDefault: true,
    notes:
      "Helps bring the user back to their values, direction, and what kind of life they are trying to build.",
  },

  // 22. Gardener — progress & micro-wins
  {
    id: "gardener",
    name: "Gardener",
    role: "Progress & small wins agent",
    scope: "user",
    triggersWhen: ["tool.completed", "streaks.updated", "milestone.earned"],
    consumes: ["tool.usageHistory", "milestones", "streaks"],
    produces: ["microCelebrations", "progress.stories"],
    priority: 4,
    enabledByDefault: true,
    notes:
      "Notices small wins, marks growth, and protects the user from only seeing their failures.",
  },

  // 23. Translator — tone & language adapter
  {
    id: "translator",
    name: "Translator",
    role: "Tone, culture, and language agent",
    scope: "user",
    triggersWhen: ["chat.message.user", "tone.mismatch.detected"],
    consumes: ["message.content", "language.preferences", "tone.preferences"],
    produces: ["toneAdjustments", "phrasing.variants"],
    priority: 4,
    enabledByDefault: true,
    notes:
      "Shapes language and tone so it lands in a way that matches the user's world, culture, and nervous system.",
  },

  // 24. Hearth — loneliness & isolation responder
  {
    id: "hearth",
    name: "Hearth",
    role: "Loneliness & isolation agent",
    scope: "user",
    triggersWhen: ["message.triggers.loneliness", "message.triggers.abandonment"],
    consumes: ["message.content", "message.emotion", "message.triggers"],
    produces: ["microNudges.warmth", "recommendation.socialOrTool"],
    priority: 3,
    enabledByDefault: true,
    notes:
      "Responds specifically to loneliness, abandonment, and disconnection with warmth, presence, and options.",
  },

  // 25. Lighthouse — pre-crisis lookout
  {
    id: "lighthouse",
    name: "Lighthouse",
    role: "Pre-crisis lookout",
    scope: "user",
    triggersWhen: ["risk.rising", "trajectory.declining", "loop.anxiety"],
    consumes: ["risk", "trajectory", "emotionalHistory", "triggers"],
    produces: ["earlyWarnings", "gentleSafetyPrompts"],
    priority: 1,
    enabledByDefault: true,
    notes:
      "Does not panic or diagnose; it quietly watches rising risk and suggests stabilizing steps before a full crisis.",
  },
]);

/**
 * Helper to get an agent by ID
 * @param {string} id
 * @returns {IntelligenceAgent | undefined}
 */
export function getAgentById(id) {
  return INTELLIGENCE_AGENTS.find((a) => a.id === id);
}

/**
 * Helper to list active agents (for Admin Console / fusion protocol)
 * @returns {IntelligenceAgent[]}
 */
export function getDefaultActiveAgents() {
  return INTELLIGENCE_AGENTS.filter((a) => a.enabledByDefault);
}

export default {
  INTELLIGENCE_AGENTS,
  getAgentById,
  getDefaultActiveAgents,
};

