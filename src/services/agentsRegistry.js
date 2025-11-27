// src/services/agentsRegistry.js

/**
 * Agents Registry Service
 * Central registry for all AI agents in WellnessCafe OS
 * Tracks agent status, capabilities, health, and configuration
 */

// Agent definitions with metadata
export const AGENT_DEFINITIONS = {
  seer: {
    id: "seer",
    name: "The Seer",
    icon: "🔭",
    description: "Reads telemetry & patterns. Observes how people use WellnessCafe and identifies trends.",
    role: "Pattern Observer",
    capabilities: ["telemetry_analysis", "pattern_detection", "usage_insights"],
    status: "active", // active, inactive, error, maintenance
    health: "healthy", // healthy, degraded, down
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null, // minutes, null = manual only
      temperature: 0.7,
      maxTokens: 1000,
    },
  },
  oracle: {
    id: "oracle",
    name: "The Oracle",
    icon: "🕯️",
    description: "Fuses memory + question into deep guidance. Provides wisdom by connecting user context with long-term memory.",
    role: "Wisdom Guide",
    capabilities: ["memory_fusion", "contextual_guidance", "deep_insight"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.8,
      maxTokens: 1200,
    },
  },
  overseer: {
    id: "overseer",
    name: "The Overseer",
    icon: "🧭",
    description: "Turns insight into next-right-step plans. Orchestrates actions and creates structured session plans.",
    role: "Action Orchestrator",
    capabilities: ["plan_generation", "session_orchestration", "action_planning"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.6,
      maxTokens: 1500,
    },
  },
  sentinel: {
    id: "sentinel",
    name: "The Sentinel",
    icon: "🛡️",
    description: "Watches for risk and flags alerts. Monitors for triggers, escalation signals, and crisis indicators.",
    role: "Risk Monitor",
    capabilities: ["risk_detection", "alert_generation", "crisis_signals"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: true,
      runInterval: 15, // Run every 15 minutes
      temperature: 0.5,
      maxTokens: 800,
    },
  },
  cherubim: {
    id: "cherubim",
    name: "The Cherubim",
    icon: "👼",
    description: "Guardian of sacred spaces. Protects user privacy, ensures ethical AI use, and maintains boundaries.",
    role: "Ethics Guardian",
    capabilities: ["privacy_protection", "ethical_oversight", "boundary_enforcement"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.4,
      maxTokens: 600,
    },
  },
  healer_breathwork: {
    id: "healer_breathwork",
    name: "Breathwork Healer",
    icon: "🌬️",
    description: "Specialized in breathing exercises and breathwork practices. Guides users through various breathing techniques.",
    role: "Breathwork Specialist",
    capabilities: ["breathwork_guidance", "breathing_exercises", "nervous_system_regulation"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.6,
      maxTokens: 1000,
    },
  },
  healer_grounding: {
    id: "healer_grounding",
    name: "Grounding Healer",
    icon: "🌍",
    description: "Specialized in grounding techniques. Helps users return to their body and the present moment.",
    role: "Grounding Specialist",
    capabilities: ["grounding_techniques", "body_awareness", "present_moment_guidance"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.6,
      maxTokens: 1000,
    },
  },
  healer_mindfulness: {
    id: "healer_mindfulness",
    name: "Mindfulness Healer",
    icon: "🧘",
    description: "Specialized in mindfulness practices and meditation. Guides users in present-moment awareness.",
    role: "Mindfulness Specialist",
    capabilities: ["mindfulness_guidance", "meditation_instruction", "awareness_practices"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.7,
      maxTokens: 1200,
    },
  },
  healer_spiritual: {
    id: "healer_spiritual",
    name: "Spiritual Healer",
    icon: "✨",
    description: "Specialized in spiritual concepts and practices. Provides guidance on spiritual wellness without forcing beliefs.",
    role: "Spiritual Guide",
    capabilities: ["spiritual_guidance", "sacred_practices", "meaning_making"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.8,
      maxTokens: 1400,
    },
  },
  healer_acuwellness: {
    id: "healer_acuwellness",
    name: "Acuwellness Healer",
    icon: "📍",
    description: "Specialized in acupressure and acuwellness techniques. Guides users through pressure points and meridian work.",
    role: "Acuwellness Specialist",
    capabilities: ["acuwellness_guidance", "pressure_point_instruction", "meridian_work"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: false,
      runInterval: null,
      temperature: 0.6,
      maxTokens: 1000,
    },
  },
  towncrier: {
    id: "towncrier",
    name: "The Towncrier",
    icon: "📢",
    description: "Manages notifications and announcements. Delivers important messages, alerts, and system updates to users.",
    role: "Notification Manager",
    capabilities: ["notification_delivery", "alert_management", "announcement_system"],
    status: "active",
    health: "healthy",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: {
      enabled: true,
      autoRun: true,
      runInterval: 5, // Check every 5 minutes
      temperature: 0.5,
      maxTokens: 500,
    },
  },
};

const STORAGE_KEY = "wc-agents-registry-v1";

/**
 * Load agent registry from localStorage
 */
export function loadAgentsRegistry() {
  if (typeof window === "undefined") return AGENT_DEFINITIONS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return AGENT_DEFINITIONS;

    const parsed = JSON.parse(stored);
    // Merge stored data with defaults (preserve structure)
    const merged = { ...AGENT_DEFINITIONS };
    Object.keys(parsed).forEach((agentId) => {
      if (merged[agentId]) {
        merged[agentId] = {
          ...merged[agentId],
          ...parsed[agentId],
          // Preserve config structure
          config: {
            ...merged[agentId].config,
            ...(parsed[agentId].config || {}),
          },
        };
      }
    });
    return merged;
  } catch (err) {
    console.error("Failed to load agents registry:", err);
    return AGENT_DEFINITIONS;
  }
}

/**
 * Save agent registry to localStorage
 */
export function saveAgentsRegistry(registry) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error("Failed to save agents registry:", err);
  }
}

/**
 * Update agent status
 */
export function updateAgentStatus(agentId, updates) {
  const registry = loadAgentsRegistry();
  if (!registry[agentId]) return registry;

  registry[agentId] = {
    ...registry[agentId],
    ...updates,
    // Preserve config if updating other fields
    config: updates.config || registry[agentId].config,
  };

  saveAgentsRegistry(registry);
  return registry;
}

/**
 * Record agent execution
 */
export function recordAgentRun(agentId, responseTime, success = true) {
  const registry = loadAgentsRegistry();
  if (!registry[agentId]) return;

  const agent = registry[agentId];
  const now = Date.now();

  agent.lastRun = now;
  agent.runCount = (agent.runCount || 0) + 1;

  if (success) {
    // Update average response time
    const currentAvg = agent.avgResponseTime || 0;
    const count = agent.runCount;
    agent.avgResponseTime = Math.round(
      (currentAvg * (count - 1) + responseTime) / count
    );
    agent.health = "healthy";
  } else {
    agent.errorCount = (agent.errorCount || 0) + 1;
    if (agent.errorCount > 5) {
      agent.health = "degraded";
    }
    if (agent.errorCount > 10) {
      agent.health = "down";
      agent.status = "error";
    }
  }

  saveAgentsRegistry(registry);
  return registry;
}

/**
 * Get agent by ID
 */
export function getAgent(agentId) {
  const registry = loadAgentsRegistry();
  return registry[agentId] || null;
}

/**
 * Get all agents
 */
export function getAllAgents() {
  return loadAgentsRegistry();
}

/**
 * Get agents by status
 */
export function getAgentsByStatus(status) {
  const registry = loadAgentsRegistry();
  return Object.values(registry).filter((agent) => agent.status === status);
}

/**
 * Get agents by health
 */
export function getAgentsByHealth(health) {
  const registry = loadAgentsRegistry();
  return Object.values(registry).filter((agent) => agent.health === health);
}

/**
 * Reset agent to defaults
 */
export function resetAgent(agentId) {
  const registry = loadAgentsRegistry();
  if (!registry[agentId] || !AGENT_DEFINITIONS[agentId]) return registry;

  registry[agentId] = {
    ...AGENT_DEFINITIONS[agentId],
    // Preserve runtime stats
    lastRun: registry[agentId].lastRun,
    runCount: registry[agentId].runCount,
    avgResponseTime: registry[agentId].avgResponseTime,
    errorCount: registry[agentId].errorCount,
  };

  saveAgentsRegistry(registry);
  return registry;
}

/**
 * Reset all agents to defaults
 */
export function resetAllAgents() {
  saveAgentsRegistry(AGENT_DEFINITIONS);
  return AGENT_DEFINITIONS;
}

