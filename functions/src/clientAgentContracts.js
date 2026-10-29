const CONTRACTS = Object.freeze({
  scribe: { maxInput: 1800, required: ["summary", "prompt"], optional: ["followUp"] },
  anchor: { maxInput: 900, required: ["summary", "invitation", "nextStep"] },
  breathkeeper: { maxInput: 900, required: ["summary", "invitation", "nextStep"] },
  rhythm: { maxInput: 900, required: ["summary", "invitation", "nextStep"] },
  lantern: { maxInput: 1800, required: ["summary", "takeaway", "nextStep"] },
  gardener: { maxInput: 1800, required: ["summary", "win", "reinforcement", "nextStep"] },
});

const OUTPUT_LIMITS = Object.freeze({
  summary: 500,
  prompt: 360,
  followUp: 240,
  invitation: 500,
  nextStep: 400,
  takeaway: 500,
  win: 500,
  reinforcement: 500,
});

function invalidRequest(agentId) {
  const error = new Error(`Share a short, selected request for ${agentId}.`);
  error.code = `INVALID_${agentId.toUpperCase()}_REQUEST`;
  return error;
}

function normalizeClientAgentRequest(agentId, input = {}) {
  const contract = CONTRACTS[agentId];
  if (!contract) throw invalidRequest(agentId || "agent");
  const raw = typeof input.question === "string" ? input.question : input.prompt;
  if (typeof raw !== "string" || !raw.trim() || raw.length > contract.maxInput) throw invalidRequest(agentId);
  return { question: raw.trim() };
}

function normalizeClientAgentResult(agentId, input = {}) {
  const contract = CONTRACTS[agentId];
  if (!contract || !input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error(`${agentId || "Agent"} returned an incomplete response.`);
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  const output = {};
  for (const field of [...contract.required, ...(contract.optional || [])]) {
    const value = input[field];
    if (contract.required.includes(field) && (typeof value !== "string" || !value.trim())) {
      const error = new Error(`${agentId} returned an incomplete response.`);
      error.code = "INVALID_AGENT_OUTPUT";
      throw error;
    }
    if (typeof value === "string") output[field] = value.trim().slice(0, OUTPUT_LIMITS[field] || 500);
  }
  if (agentId === "anchor") output.toolId = "grounding";
  if (agentId === "breathkeeper") output.toolId = "breathing";
  return output;
}

module.exports = { CLIENT_AGENT_CONTRACTS: CONTRACTS, normalizeClientAgentRequest, normalizeClientAgentResult };
