import agentCatalog from "../../../functions/agentCatalog.json";

/**
 * Canonical agent catalog shared with Firebase Functions. Entries without a
 * handler are catalog ideas only and must not be presented as enabled agents.
 */
export const INTELLIGENCE_AGENTS = agentCatalog.agents;

export function getAgentById(id) {
  return INTELLIGENCE_AGENTS.find((agent) => agent.id === id);
}

export function getAgentControlId(agentOrId) {
  const agent = typeof agentOrId === "string" ? getAgentById(agentOrId) : agentOrId;
  return agent?.handlerId || null;
}

export function getDefaultActiveAgents() {
  return INTELLIGENCE_AGENTS.filter((agent) => agent.readiness === "implemented");
}

export default {
  INTELLIGENCE_AGENTS,
  getAgentById,
  getAgentControlId,
  getDefaultActiveAgents,
};
