// src/ai/agents/agentClient.js
// Phase 25+ companion to agentRegistry.js
// Provides a single, clean entry point for calling any registered agent.
// Currently a placeholder — easy to wire to a real LLM later.
// NO side-effects, NO React imports.

import { getAgentById } from "./agentRegistry";

/**
 * Calls the specified intelligence agent.
 *
 * @param {string} agentId - The stable ID from INTELLIGENCE_AGENTS (e.g. "overseer", "sentinel")
 * @param {object} [payload={}] - Input data for the agent
 * @returns {Promise<object>} Structured response object
 */
export async function callAgent(agentId, payload = {}) {
  const agent = getAgentById(agentId);

  if (!agent) {
    throw new Error(`Agent "${agentId}" not found in registry`);
  }

  if (!agent.enabledByDefault) {
    // In a real system you could also check a runtime toggle from Firestore
    console.warn(`[agentClient] Agent "${agent.name}" is disabled by default`);
  }

  // TODO: Replace this placeholder with an actual LLM / fusion-engine call
  // Example: return await fusionEngine.call(agent, payload);
  console.log(`[agentClient] Calling ${agent.name} (${agentId})`, payload);

  // Simulate a short network delay (remove in production)
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    agentId: agent.id,
    agentName: agent.name,
    timestamp: new Date().toISOString(),
    status: "success",
    data: {
      message: `Placeholder response from ${agent.name}`,
      // In production this would contain the actual model output / recommendations
      ...payload,
    },
    meta: {
      role: agent.role,
      priority: agent.priority,
      scope: agent.scope,
    },
  };
}

export default callAgent;
