import agentCatalog from "../../functions/agentCatalog.json";
import type { AgentProfile } from "./agentTypes";

/** The fusion layer projects the shared operational catalog; it owns no roster. */
export const agentRegistry: AgentProfile[] = agentCatalog.agents.map((agent) => ({
  id: agent.id,
  displayName: agent.name,
  primaryCapabilities: agent.produces,
  description: agent.notes,
}));

export const getAgentProfile = (id: AgentProfile["id"]): AgentProfile =>
  agentRegistry.find((agent) => agent.id === id) ?? agentRegistry[0];
