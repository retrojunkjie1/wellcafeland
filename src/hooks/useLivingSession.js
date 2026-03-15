// src/hooks/useLivingSession.js — Persist role + turn counter (Phase 54I)

import { useState, useCallback, useMemo } from "react";

const SESSION_KEY = "wc_session_id";
const ROLE_KEY = "wc_chat_role";
const TURN_KEY = "wc_turn_id";

function getSessionId() {
  if (typeof sessionStorage === "undefined") return "wc_" + Date.now() + "_" + Math.random();
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : "wc_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getStoredRole() {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(ROLE_KEY);
}

export function useLivingSession() {
  const [sessionId] = useState(getSessionId);
  const [role, setRoleState] = useState(getStoredRole);

  const setRole = useCallback((r) => {
    const val = r ?? null;
    if (typeof sessionStorage !== "undefined") {
      if (val) sessionStorage.setItem(ROLE_KEY, val);
      else sessionStorage.removeItem(ROLE_KEY);
    }
    setRoleState(val);
  }, []);

  const nextTurnId = useCallback(() => {
    if (typeof sessionStorage === "undefined") return 0;
    const n = parseInt(sessionStorage.getItem(TURN_KEY) || "0", 10) + 1;
    sessionStorage.setItem(TURN_KEY, String(n));
    return n;
  }, []);

  return useMemo(() => ({ role, setRole, nextTurnId, sessionId }), [role, setRole, nextTurnId, sessionId]);
}
