// src/utils/correlation.js
// Correlation ID generation for request tracing

/**
 * Generate a correlation ID for request tracing
 */
export function generateCorrelationId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (_) {}
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Get correlation ID from context or generate new one
 */
export function getCorrelationId() {
  // Try to get from window context (if set by previous request)
  if (typeof window !== "undefined" && window.__wc_correlation_id) {
    return window.__wc_correlation_id;
  }
  const id = generateCorrelationId();
  if (typeof window !== "undefined") {
    window.__wc_correlation_id = id;
  }
  return id;
}

