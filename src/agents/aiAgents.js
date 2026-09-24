// src/agents/aiAgents.js

// High-level helpers so the frontend can ask for specific "voices"
// The heavy logic still lives in aiBrain.js on Firebase.

// Legacy AI – restricted scope: Agent utilities only
// This endpoint is used for agent orchestration, not primary conversational AI
import { callAiSession } from "@/services/aiSessionClient";

export const LIVE_AGENT_IDS = new Set(["seer", "oracle", "overseer", "sentinel", "healer_spiritual"]);

/**
 * Call an AI agent with payload
 * @param {string} agent - Agent ID (seer, oracle, overseer, sentinel)
 * @param {object} payload - Agent-specific payload
 * @returns {Promise<object|null>} Agent response or null on error
 */
export const callAgent = async (agent, payload = {}) => {
  const response = await callAiSession({ mode: "agent", agent, ...payload });
  if (!response || response.success !== true) {
    const message = response?.error?.message || response?.error || `Agent ${agent} did not complete successfully.`;
    throw new Error(typeof message === "string" ? message : `Agent ${agent} did not complete successfully.`);
  }
  const result = response.result || {};
  const reply = result.phrases?.length
    ? result.phrases.map((phrase) => `• ${phrase}`).join("\n")
    : result.reply || result.summary || result.wisdom || result.message || JSON.stringify(result);
  return { ...response, ...result, result, reply };
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
