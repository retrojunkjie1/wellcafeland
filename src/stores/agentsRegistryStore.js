// src/stores/agentsRegistryStore.js

import { create } from "zustand";
import {
  loadAgentsRegistry,
  updateAgentStatus,
  recordAgentRun,
  resetAgent,
  resetAllAgents,
} from "../services/agentsRegistry";

export const useAgentsRegistryStore = create((set, get) => ({
  agents: loadAgentsRegistry(),

  // Load registry
  loadRegistry: () => {
    const registry = loadAgentsRegistry();
    set({ agents: registry });
    return registry;
  },

  // Get single agent
  getAgent: (agentId) => {
    return get().agents[agentId] || null;
  },

  // Get all agents as array
  getAllAgents: () => {
    return Object.values(get().agents);
  },

  // Update agent
  updateAgent: (agentId, updates) => {
    const registry = updateAgentStatus(agentId, updates);
    set({ agents: registry });
    return registry;
  },

  // Record agent execution
  recordRun: (agentId, responseTime, success = true) => {
    const registry = recordAgentRun(agentId, responseTime, success);
    set({ agents: registry });
    return registry;
  },

  // Toggle agent enabled/disabled
  toggleAgent: (agentId) => {
    const agent = get().agents[agentId];
    if (!agent) return;

    const updates = {
      config: {
        ...agent.config,
        enabled: !agent.config.enabled,
      },
      status: !agent.config.enabled ? "active" : "inactive",
    };

    return get().updateAgent(agentId, updates);
  },

  // Set agent auto-run interval
  setAutoRunInterval: (agentId, intervalMinutes) => {
    const agent = get().agents[agentId];
    if (!agent) return;

    return get().updateAgent(agentId, {
      config: {
        ...agent.config,
        autoRun: intervalMinutes !== null,
        runInterval: intervalMinutes,
      },
    });
  },

  // Update agent config
  updateAgentConfig: (agentId, configUpdates) => {
    const agent = get().agents[agentId];
    if (!agent) return;

    return get().updateAgent(agentId, {
      config: {
        ...agent.config,
        ...configUpdates,
      },
    });
  },

  // Reset agent
  resetAgent: (agentId) => {
    const registry = resetAgent(agentId);
    set({ agents: registry });
    return registry;
  },

  // Reset all agents
  resetAll: () => {
    const registry = resetAllAgents();
    set({ agents: registry });
    return registry;
  },

  // Get agent health summary
  getHealthSummary: () => {
    const agents = Object.values(get().agents);
    return {
      total: agents.length,
      healthy: agents.filter((a) => a.health === "healthy").length,
      degraded: agents.filter((a) => a.health === "degraded").length,
      down: agents.filter((a) => a.health === "down").length,
      active: agents.filter((a) => a.status === "active").length,
      inactive: agents.filter((a) => a.status === "inactive").length,
    };
  },
}));

