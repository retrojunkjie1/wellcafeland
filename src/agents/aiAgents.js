// src/agents/aiAgents.js

// High-level helpers so the frontend can ask for specific "voices"
// The heavy logic still lives in aiBrain.js on Firebase.

// Legacy AI – restricted scope: Agent utilities only
// This endpoint is used for agent orchestration, not primary conversational AI
const SESSION_ENDPOINT = "/aiSession";

/**
 * Call an AI agent with payload
 * @param {string} agent - Agent ID (seer, oracle, overseer, sentinel)
 * @param {object} payload - Agent-specific payload
 * @returns {Promise<object|null>} Agent response or null on error
 */
export const callAgent = async (agent, payload = {}) => {
  try {
    const res = await fetch(SESSION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "agent",
        agent,
        ...payload,
      }),
    });
    if (!res.ok) {
      console.error("Agent call failed", agent, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Agent call error", agent, err);
    return null;
  }
};

// 🔭 The Seer: reads telemetry & patterns
export const runSeer = async (telemetryBatch,question)=>{
  return await callAgent("seer",{telemetry:telemetryBatch,question});
};

// 🕯️ The Oracle: fuses memory + question into guidance
export const runOracle = async (memoryContext,question)=>{
  return await callAgent("oracle",{memory:memoryContext,question});
};

// 🧭 The Overseer: turns insight into next-right-step plans
export const runOverseer = async (stateSnapshot,goal)=>{
  return await callAgent("overseer",{state:stateSnapshot,goal});
};

// 🛡️ The Sentinel: watches for risk and flags alerts
export const runSentinel = async (telemetryBatch,thresholds)=>{
  return await callAgent("sentinel",{telemetry:telemetryBatch,thresholds});
};

