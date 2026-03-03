/**
 * src/context/StateEngineContext.jsx
 * Phase 55 — State Engine Provider: exposes state + actions
 */

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { createStateEngine } from "@/engines/state/stateEngine";

const StateEngineContext = createContext(null);

export function StateEngineProvider({children}) {
  const engine = useMemo(() => createStateEngine(), []);
  const [state, setState] = useState(() => engine.getState());

  useEffect(() => {
    return engine.subscribe((s) => setState({...s}));
  }, [engine]);

  const actions = useMemo(() => ({
    setSignal(payload) {
      if (!payload || typeof payload !== "object") return;
      engine.setState({signal: {...(engine.getState().signal || {}), ...payload}});
    },
    setLastInput(payload) {
      if (!payload || typeof payload !== "object") return;
      engine.setState({lastInput: {...(engine.getState().lastInput || {}), ...payload}});
    },
    setLastTool(payload) {
      if (!payload || typeof payload !== "object") return;
      engine.setState({lastTool: {...(engine.getState().lastTool || {}), ...payload}});
    },
    bumpActivation(delta) {
      const s = engine.getState();
      const intensity = Math.min(10, Math.max(0, (s.signal?.intensity ?? 0) + (delta ?? 0)));
      engine.setState({signal: {...(s.signal || {}), intensity}});
    },
  }), [engine]);

  useEffect(() => {
    if (import.meta.env.DEV && typeof console?.debug === "function") {
      const ev = engine.evaluate();
      console.debug("[StateEngine]", {mode: state.mode, risk: state.risk?.level, recommended: state.recommended?.id});
    }
  }, [state, engine]);

  const value = useMemo(() => ({state, actions, engine}), [state, actions, engine]);

  return (
    <StateEngineContext.Provider value={value}>
      {children}
    </StateEngineContext.Provider>
  );
}

export function useStateEngine() {
  const ctx = useContext(StateEngineContext);
  if (!ctx) {
    return {
      state: {ts: 0, mode: "arriving", signal: {}, risk: {}, lastInput: {}, lastTool: {}, recommended: {}},
      actions: {
        setSignal: () => {},
        setLastInput: () => {},
        setLastTool: () => {},
        bumpActivation: () => {},
      },
      engine: null,
    };
  }
  return ctx;
}
