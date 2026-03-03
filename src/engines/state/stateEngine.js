/**
 * src/engines/state/stateEngine.js
 * Phase 55 — State Engine Spine: global nervous-system state + risk flags + intervention selector
 * Deterministic evaluator, no AI, in-memory only.
 */

const MAX_EVENTS = 50;

const DEFAULT_STATE = {
  ts: 0,
  mode: "arriving",
  signal: {label: "idle", intensity: 0, valence: "neu"},
  risk: {level: "low", flags: []},
  lastInput: {type: "system", value: undefined},
  lastTool: {id: undefined},
  recommended: {id: "breathing", label: "Breathing"},
};

function evaluate(state) {
  const {signal} = state;
  const label = (signal?.label || "").toLowerCase();
  const intensity = Math.min(10, Math.max(0, signal?.intensity ?? 0));

  let riskLevel = "low";
  const riskFlags = [];

  if (label.includes("panic") || intensity >= 8) {
    riskLevel = "high";
    riskFlags.push("high_arousal");
  } else if (label.includes("craving")) {
    riskLevel = "med";
    riskFlags.push("craving");
  } else if (intensity >= 6) {
    riskLevel = "med";
    riskFlags.push("elevated");
  }

  let recommendedId = "breathing";
  let recommendedLabel = "Breathing";

  if (riskLevel === "high") {
    recommendedId = "panic_reset";
    recommendedLabel = "Panic Reset";
  } else if (label.includes("craving")) {
    recommendedId = "craving_reset";
    recommendedLabel = "Craving Reset";
  } else if (intensity >= 5) {
    recommendedId = "grounding";
    recommendedLabel = "Grounding";
  } else {
    recommendedId = "breathing";
    recommendedLabel = "Breathing";
  }

  let mode = "arriving";
  if (intensity >= 7) mode = "stabilizing";
  else if (intensity <= 3) mode = "reclaiming";

  return {
    risk: {level: riskLevel, flags: riskFlags},
    mode,
    recommended: {id: recommendedId, label: recommendedLabel},
  };
}

/**
 * @param {{nowFn?: () => number}} opts
 * @returns {{getState: () => object, setState: (patch: object, meta?: object) => void, pushEvent: (event: object) => void, subscribe: (fn: (s: object) => void) => () => void, evaluate: () => object}}
 */
export function createStateEngine(opts = {}) {
  const nowFn = opts.nowFn ?? (() => Date.now());
  let state = {
    ...DEFAULT_STATE,
    ts: nowFn(),
  };
  const events = [];
  const listeners = new Set();

  function notify() {
    const snapshot = {...state};
    listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        console.warn("[StateEngine] Listener error:", err);
      }
    });
  }

  function getState() {
    return {...state};
  }

  function setState(patch, meta = {}) {
    if (!patch || typeof patch !== "object") return;
    state = {
      ...state,
      ...patch,
      ts: nowFn(),
    };
    if (meta?.signal) state.signal = {...(state.signal || {}), ...meta.signal};
    if (meta?.risk) state.risk = {...(state.risk || {}), ...meta.risk};
    if (meta?.lastInput) state.lastInput = {...(state.lastInput || {}), ...meta.lastInput};
    if (meta?.lastTool) state.lastTool = {...(state.lastTool || {}), ...meta.lastTool};
    if (meta?.recommended) state.recommended = {...(state.recommended || {}), ...meta.recommended};
    const ev = evaluate(state);
    state = {...state, risk: ev.risk, mode: ev.mode, recommended: ev.recommended};
    notify();
  }

  function pushEvent(event) {
    if (!event || typeof event !== "object") return;
    events.push({...event, ts: nowFn()});
    if (events.length > MAX_EVENTS) events.shift();
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return () => {};
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function runEvaluate() {
    return evaluate(state);
  }

  return {
    getState,
    setState,
    pushEvent,
    subscribe,
    evaluate: runEvaluate,
  };
}
