// ===============================================
// Session Dispatcher — Phase 46
// Routes Living Guide actions → exact tool/session
// ===============================================

import { sessionMap } from "@/data/sessionMap";

/**
 * Launch a session by key
 * @param {string} key - Session key from sessionMap
 * @param {Function} navigate - React Router navigate function
 */
export function launchSession(key, navigate) {
  const route = sessionMap[key];

  if (!route) {
    console.warn("[sessionDispatcher] Missing session route for key:", key);
    return;
  }

  if (!navigate) {
    console.warn("[sessionDispatcher] Navigate function not provided");
    return;
  }

  // Optional future: log session start, capture telemetry
  navigate(route);
}

