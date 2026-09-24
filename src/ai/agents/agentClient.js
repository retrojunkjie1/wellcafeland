// src/ai/agents/agentClient.js
// Phase 25+ companion to agentRegistry.js
// Provides a single, clean entry point for calling any registered agent.
// Currently a placeholder — easy to wire to a real LLM / fusion engine later.
// NO side-effects, NO React imports.

import { getAgentById } from "./agentRegistry";
import { callAgent as callRegisteredAgent } from "@/agents/aiAgents";

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

  if (!agent.enabledByDefault) throw new Error(`${agent.name} is not enabled.`);
  const response = await callRegisteredAgent(agentId, payload);
  return {
    ...response,
    agentId: agent.id,
    agentName: agent.name,
    status: "success",
    data: { message: response.reply, ...payload },
    meta: { ...response.meta, role: agent.role, priority: agent.priority, scope: agent.scope },
  };
}

export default callAgent;
