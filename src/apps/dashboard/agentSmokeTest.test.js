import { describe, expect, it } from "vitest";
import { INTELLIGENCE_AGENTS } from "@/ai/agents/agentRegistry";
import { buildAgentSmokeTestPlan, canRunAdminAgentSmokeTest } from "./agentSmokeTest";

describe("God-Eye agent smoke-test plans", () => {
  it("builds a valid, non-personal payload for every agent that can be tested from admin", () => {
    const plans = INTELLIGENCE_AGENTS
      .filter((agent) => agent.id !== "witness")
      .map((agent) => buildAgentSmokeTestPlan(agent.id));

    expect(plans).toHaveLength(24);
    expect(plans.every((plan) => plan?.agentId && plan.payload)).toBe(true);
    expect(plans.find((plan) => plan.agentId === "healer")?.payload).toEqual({ concern: "sleep" });
    expect(plans.find((plan) => plan.agentId === "gatekeeper")?.payload).toEqual({ pathway: "not-sure" });
    expect(plans.find((plan) => plan.agentId === "seer")?.payload.telemetry).toBeDefined();
    expect(plans.find((plan) => plan.agentId === "oracle")?.payload.question).toContain("system test");
  });

  it("does not test Witness without an authorized client-sharing context", () => {
    expect(buildAgentSmokeTestPlan("witness")).toBeNull();
    expect(canRunAdminAgentSmokeTest("witness")).toBe(false);
    expect(buildAgentSmokeTestPlan("not-registered")).toBeNull();
  });

  it("uses only safe aggregate fields in the operational plans", () => {
    const plan = buildAgentSmokeTestPlan("overseer", {
      snapshotAgeSeconds: 12,
      agentExecutions: 4,
      errorRatePercent: 0,
      avgResponseTimeMs: 100,
      enabledHandlers: 25,
      implementedHandlers: 25,
      riskSignals: { state: "available", warningCount: 0, criticalCount: 0, totalEvents: 0 },
      reviewQueues: { practitioner: 0, communityGivers: 0, meetingSources: 0 },
      userText: "must not be included",
    });

    expect(plan.payload.state).not.toHaveProperty("userText");
    expect(plan.payload.state.agentExecutions).toBe(4);
  });
});
