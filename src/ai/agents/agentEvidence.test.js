import { describe, expect, it } from "vitest";
import { getAgentEvidence, getAgentEvidenceSummary } from "./agentEvidence";
import { INTELLIGENCE_AGENTS } from "./agentRegistry";

describe("25-agent workflow evidence", () => {
  it("keeps local checks separate from live production observations", () => {
    const summary = getAgentEvidenceSummary();

    expect(summary.registered).toBe(25);
    expect(summary.handlerReady).toBe(25);
    expect(summary.localContracts).toBe(25);
    expect(summary.authenticatedEmulatorWorkflows).toBe(25);
    expect(summary.productionObserved).toBe(0);
    expect(summary.agents).toHaveLength(25);
    expect(summary.agents.every((agent) => agent.localEvidence)).toBe(true);
    expect(summary.agents.every((agent) => agent.productionObserved === false)).toBe(true);
  });

  it("provides one traceable local suite and production status for every roster entry", () => {
    const summary = getAgentEvidenceSummary();

    expect(summary.agents.map((agent) => agent.id).sort()).toEqual(INTELLIGENCE_AGENTS.map((agent) => agent.id).sort());
    for (const evidence of summary.agents) {
      expect(evidence.contractSuite).toMatch(/^functions\/test\/.+\.test\.cjs$/);
      expect(evidence.emulatorSuite).toBe("functions/test/clientAgentWorkflows.emulator.test.cjs");
      expect(getAgentEvidence(evidence.id)).toEqual(evidence);
    }
    expect(getAgentEvidence("unknown-agent")).toBeNull();
  });
});
