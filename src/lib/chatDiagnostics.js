/**
 * God-Eye diagnostics: last AI status for wc_debug drawer.
 * Updated by aiClient; read by GodEyeDrawer.
 */

let lastStatus = null;
let lastCorrelationId = null;
let lastToolRoute = null;
let lastError = null;
let listeners = new Set();

export function getChatDiagnostics() {
  return {
    lastStatus,
    lastCorrelationId,
    lastToolRoute,
    lastError,
  };
}

export function updateChatDiagnostics(update) {
  if (update.status !== undefined) lastStatus = update.status;
  if (update.correlationId !== undefined) lastCorrelationId = update.correlationId;
  if (update.toolRoute !== undefined) lastToolRoute = update.toolRoute;
  if (update.error !== undefined) lastError = update.error;
  listeners.forEach((fn) => fn(getChatDiagnostics()));
}

export function subscribeChatDiagnostics(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
