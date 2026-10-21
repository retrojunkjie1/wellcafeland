import { INTELLIGENCE_AGENTS } from "./agentRegistry";

const SHARED_CONTRACT_AGENTS = new Set([
  "scribe",
  "anchor",
  "breathkeeper",
  "rhythm",
  "lantern",
  "gardener",
]);

const LOCAL_CONTRACT_AGENT_IDS = new Set([
  "overseer", "sentinel", "seer", "oracle", "cherubim", "healer", "towncrier",
  "scribe", "cartographer", "bridge", "mirror", "anchor", "breathkeeper",
  "shepherd", "gatekeeper", "rhythm", "lantern", "witness", "pulse", "steward",
  "compass", "gardener", "translator", "hearth", "lighthouse",
]);

const AUTHENTICATED_EMULATOR_AGENT_IDS = new Set(LOCAL_CONTRACT_AGENT_IDS);

const VERIFIED_ON = "2026-10-21";

/**
 * Summarize the evidence recorded for the current 25-agent release gate.
 * Local fixture/emulator evidence is deliberately separate from live production
 * observations, which remain pending until the guarded smoke suite is run.
 */
export function getAgentEvidenceSummary(agents = INTELLIGENCE_AGENTS) {
  const registered = agents.length;
  const handlerReady = agents.filter((agent) => agent.handlerId && agent.readiness === "implemented").length;
  const localContracts = agents.filter((agent) => LOCAL_CONTRACT_AGENT_IDS.has(agent.id)).length;
  const authenticatedEmulatorWorkflows = agents.filter((agent) => AUTHENTICATED_EMULATOR_AGENT_IDS.has(agent.id)).length;

  return {
    verifiedOn: VERIFIED_ON,
    registered,
    handlerReady,
    localContracts,
    authenticatedEmulatorWorkflows,
    productionObserved: 0,
    agents: agents.map((agent) => ({
      id: agent.id,
      contractSuite: SHARED_CONTRACT_AGENTS.has(agent.id)
        ? "functions/test/clientAgentContracts.test.cjs"
        : `functions/test/${agent.id}Agent.test.cjs`,
      emulatorSuite: "functions/test/clientAgentWorkflows.emulator.test.cjs",
      localEvidence: LOCAL_CONTRACT_AGENT_IDS.has(agent.id)
        && AUTHENTICATED_EMULATOR_AGENT_IDS.has(agent.id),
      productionObserved: false,
    })),
  };
}

export function getAgentEvidence(agentId, agents = INTELLIGENCE_AGENTS) {
  return getAgentEvidenceSummary(agents).agents.find((agent) => agent.id === agentId) || null;
}
