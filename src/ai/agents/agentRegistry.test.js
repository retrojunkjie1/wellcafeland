import { describe, expect, it } from "vitest";
import { AGENT_DEFINITIONS } from "@/services/agentsRegistry";
import { LIVE_AGENT_IDS } from "@/agents/aiAgents";
import { getAgentControlId, getDefaultActiveAgents, INTELLIGENCE_AGENTS } from "./agentRegistry";

describe("shared agent catalog", () => {
  it("exposes one unique 25-agent roster to the UI and operations registry", () => {
    const ids = INTELLIGENCE_AGENTS.map((agent) => agent.id);
    expect(ids).toHaveLength(25);
    expect(new Set(ids).size).toBe(25);
    expect(Object.keys(AGENT_DEFINITIONS).sort()).toEqual([...ids].sort());
  });

  it("only marks agents with production handlers as active by default", () => {
    expect(getDefaultActiveAgents().map((agent) => agent.id).sort()).toEqual([
      "anchor", "breathkeeper", "bridge", "cartographer", "cherubim", "compass", "gardener", "gatekeeper", "healer", "hearth", "lantern", "lighthouse", "mirror", "oracle", "overseer", "pulse", "rhythm", "scribe", "seer", "sentinel", "shepherd", "steward", "towncrier", "translator", "witness",
    ]);
    expect(getAgentControlId("healer")).toBe("healer_spiritual");
    expect(getAgentControlId("bridge")).toBe("bridge");
    expect(getAgentControlId("anchor")).toBe("anchor");
    expect(getAgentControlId("breathkeeper")).toBe("breathkeeper");
    expect(getAgentControlId("mirror")).toBe("mirror");
    expect(getAgentControlId("shepherd")).toBe("shepherd");
    expect(getAgentControlId("compass")).toBe("compass");
    expect(getAgentControlId("gardener")).toBe("gardener");
    expect(getAgentControlId("pulse")).toBe("pulse");
    expect(getAgentControlId("cartographer")).toBe("cartographer");
    expect(getAgentControlId("hearth")).toBe("hearth");
    expect(getAgentControlId("steward")).toBe("steward");
    expect(getAgentControlId("lighthouse")).toBe("lighthouse");
    expect(getAgentControlId("gatekeeper")).toBe("gatekeeper");
    expect(getAgentControlId("translator")).toBe("translator");
    expect(getAgentControlId("witness")).toBe("witness");
    expect([...LIVE_AGENT_IDS].sort()).toEqual([...new Set(INTELLIGENCE_AGENTS.map((agent) => agent.handlerId).filter(Boolean))].sort());
  });
});
