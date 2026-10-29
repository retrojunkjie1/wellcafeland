// src/services/agentsRegistry.js

/**
 * Agents Registry Service
 * Central registry for all AI agents in WellnessCafe OS
 * Tracks agent status, capabilities, health, and configuration
 */

// Operational display and local metrics are projected from the shared catalog.
import agentCatalog from "../../functions/agentCatalog.json";

const AGENT_ICONS = {
  overseer: "🧭", sentinel: "🛡️", seer: "🔭", oracle: "🕯️", cherubim: "🪽",
  healer: "♡", towncrier: "🔔", scribe: "✎", cartographer: "⌖", bridge: "⌁",
  mirror: "◉", anchor: "⚓", breathkeeper: "〰️", shepherd: "♧", gatekeeper: "⌑",
  rhythm: "♫", lantern: "✦", witness: "◌", pulse: "♥", steward: "◇", compass: "⌖",
  gardener: "❀", translator: "文", hearth: "⌂", lighthouse: "☼",
};

export const AGENT_DEFINITIONS = Object.fromEntries(agentCatalog.agents.map((agent) => {
  const ready = agent.readiness === "implemented";
  return [agent.id, {
    id: agent.id,
    name: agent.name,
    icon: AGENT_ICONS[agent.id] || "✦",
    description: agent.notes,
    role: agent.role,
    capabilities: agent.produces,
    status: ready ? "active" : "inactive",
    health: "unknown",
    lastRun: null,
    runCount: 0,
    avgResponseTime: 0,
    errorCount: 0,
    config: { enabled: ready, autoRun: false, runInterval: null, temperature: 0.6, maxTokens: 900 },
  }];
}));

const STORAGE_KEY = "wc-agents-registry-v2";

/**
 * Load agent registry from localStorage
 */
export function loadAgentsRegistry() {
  if (typeof window === "undefined") return AGENT_DEFINITIONS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return AGENT_DEFINITIONS;

    const parsed = JSON.parse(stored);
    // Preserve prior Spiritual Healer metrics under the canonical Healer card.
    if (!parsed.healer && parsed.healer_spiritual) parsed.healer = parsed.healer_spiritual;
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
        if (!merged[agentId].lastRun && Number(merged[agentId].runCount || 0) === 0) {
          merged[agentId].health = "unknown";
        }
      }
    });
    // Client-side storage is not an operational control plane. Prevent old
    // local toggles from making catalog-only agents appear active.
    Object.values(merged).forEach((agent) => {
      const definition = agentCatalog.agents.find((entry) => entry.id === agent.id);
      const ready = definition?.readiness === "implemented";
      agent.status = ready ? "active" : "inactive";
      agent.config = { ...agent.config, enabled: ready, autoRun: false, runInterval: null };
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
