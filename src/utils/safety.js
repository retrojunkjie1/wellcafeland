// src/utils/safety.js
// Phase 27 — Architecture Safety Utilities
// Global fallback wrappers to prevent runtime crashes

/**
 * Safely call a function with fallback.
 * @param {Function} fn
 * @param {*} fallback
 * @returns {*}
 */
export function safeCall(fn, fallback = null) {
  try {
    if (typeof fn !== "function") {
      return fallback;
    }
    return fn();
  } catch (err) {
    console.warn("[safety] safeCall failed:", err);
    return fallback;
  }
}

/**
 * Safely parse JSON with fallback.
 * @param {*} value
 * @param {*} fallback
 * @returns {*}
 */
export function safeJSON(value, fallback = null) {
  try {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    if (typeof value === "object" && value !== null) {
      return value;
    }
    return fallback;
  } catch (err) {
    console.warn("[safety] safeJSON failed:", err);
    return fallback;
  }
}

/**
 * Safely render a component with error boundary.
 * @param {Function} Component
 * @param {Object} props
 * @param {React.ReactNode} fallback
 * @returns {React.ReactNode}
 */
export function safeComponent(Component, props = {}, fallback = null) {
  try {
    if (typeof Component !== "function") {
      return fallback;
    }
    return Component(props);
  } catch (err) {
    console.warn("[safety] safeComponent failed:", err);
    return fallback;
  }
}

export default {
  safeCall,
  safeJSON,
  safeComponent,
};

