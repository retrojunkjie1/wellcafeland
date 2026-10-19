const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CLIENT_AGENT_CONTRACTS,
  normalizeClientAgentRequest,
  normalizeClientAgentResult,
} = require("../src/clientAgentContracts");

const VALID_CASES = {
  scribe: [{ question: "Offer one optional prompt." }, { summary: "A gentle opening.", prompt: "What would feel supportive?", followUp: "You may skip this." }],
  anchor: [{ question: "Offer one grounding option." }, { summary: "A grounding choice.", invitation: "Notice one neutral color.", nextStep: "Continue or stop." }],
  breathkeeper: [{ question: "Offer one natural-breath cue." }, { summary: "A gentle invitation.", invitation: "Let your breathing stay natural.", nextStep: "Begin when ready." }],
  rhythm: [{ question: "Offer one small step." }, { summary: "One small choice.", invitation: "Take one sip of water.", nextStep: "Pause if that is enough." }],
  lantern: [{ question: "Explain urges simply." }, { summary: "An urge can rise and fall.", takeaway: "A feeling does not require an action.", nextStep: "Notice what support you want." }],
  gardener: [{ question: "Reflect on the selected practice count." }, { summary: "One practice was recorded.", win: "You chose a practice.", reinforcement: "That is what the count shows.", nextStep: "You may acknowledge it or move on." }],
};

test("each shared client agent has its own bounded request and output contract", () => {
  assert.deepEqual(Object.keys(CLIENT_AGENT_CONTRACTS), Object.keys(VALID_CASES));
  for (const [agentId, [request, response]] of Object.entries(VALID_CASES)) {
    assert.deepEqual(normalizeClientAgentRequest(agentId, { ...request, privateExtra: "discarded" }), request);
    assert.deepEqual(normalizeClientAgentResult(agentId, { ...response, privateExtra: "discarded" }), {
      ...response,
      ...(agentId === "anchor" ? { toolId: "grounding" } : {}),
      ...(agentId === "breathkeeper" ? { toolId: "breathing" } : {}),
    });
  }
});

test("rejects empty, unbounded, or incomplete shared-agent requests before model work", () => {
  for (const [agentId, contract] of Object.entries(CLIENT_AGENT_CONTRACTS)) {
    assert.throws(() => normalizeClientAgentRequest(agentId, { question: " " }), { code: `INVALID_${agentId.toUpperCase()}_REQUEST` });
    assert.throws(() => normalizeClientAgentRequest(agentId, { question: "x".repeat(contract.maxInput + 1) }), { code: `INVALID_${agentId.toUpperCase()}_REQUEST` });
    const [, output] = VALID_CASES[agentId];
    const requiredField = contract.required[0];
    assert.throws(() => normalizeClientAgentResult(agentId, { ...output, [requiredField]: " " }), { code: "INVALID_AGENT_OUTPUT" });
  }
});

test("never trusts a model-selected practice route", () => {
  expectTool("anchor", "breathing", "grounding");
  expectTool("breathkeeper", "grounding", "breathing");
});

function expectTool(agentId, suppliedTool, expectedTool) {
  const [, output] = VALID_CASES[agentId];
  assert.equal(normalizeClientAgentResult(agentId, { ...output, toolId: suppliedTool }).toolId, expectedTool);
}
