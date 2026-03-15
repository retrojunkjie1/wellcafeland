/**
 * src/engines/liveIntervention/liveInterventionStore.js
 * Session-scoped state for live interventions (no new deps).
 * Keyed by sessionId from useSessionIdentity / memory.
 */

const store = new Map();

const DEFAULT_INTENT = { history: [], level: 0 };

function getSession(sessionId) {
  if (!store.has(sessionId)) {
    store.set(sessionId, { sessionId, intents: {} });
  }
  return store.get(sessionId);
}

/**
 * @param {string} sessionId
 * @param {string} intent
 * @returns {{ history: Array<{variantId:string, ts:number, level:number}>, level: number }}
 */
export function getIntentState(sessionId, intent) {
  const session = getSession(sessionId);
  if (!session.intents[intent]) {
    session.intents[intent] = { history: [], level: 0 };
  }
  return session.intents[intent];
}

/**
 * @param {string} sessionId
 * @param {string} intent
 * @param {{ variantId: string, level: number }} payload
 */
export function recordIntent(sessionId, intent, payload) {
  const state = getIntentState(sessionId, intent);
  state.history.push({
    variantId: payload.variantId,
    ts: Date.now(),
    level: payload.level ?? state.level,
  });
  // Keep last 20 entries
  if (state.history.length > 20) {
    state.history = state.history.slice(-20);
  }
  state.level = payload.level ?? state.level;
}

/**
 * Escalate level on rapid repeats (call when same intent fired again within 90s).
 * @param {string} sessionId
 * @param {string} intent
 * @returns {number} new level (0..3)
 */
export function bumpLevel(sessionId, intent) {
  const state = getIntentState(sessionId, intent);
  state.level = Math.min(3, state.level + 1);
  return state.level;
}

/**
 * @param {string} sessionId
 * @param {string} intent
 * @param {number} n
 * @returns {string[]} last n variantIds (most recent last)
 */
export function recentVariants(sessionId, intent, n = 5) {
  const state = getIntentState(sessionId, intent);
  const slice = state.history.slice(-n);
  return slice.map((e) => e.variantId);
}
