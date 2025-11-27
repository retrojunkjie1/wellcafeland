// src/lib/logger.js
// Global logging utility for debugging and error tracking

/**
 * Log an error with context
 * @param {string} name - Service/component name
 * @param {Error|Object} error - Error object or error details
 * @param {Object} context - Additional context (file, function, status, body, etc.)
 */
export function logError(name, error, context = {}) {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    name,
    file: context.file || "unknown",
    function: context.function || "unknown",
    message: error?.message || error?.error || String(error),
    status: error?.status || context.status || null,
    statusText: error?.statusText || context.statusText || null,
    code: error?.code || context.code || null,
    body: context.body || null,
    stack: error?.stack || null,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${name}] Error:`, errorDetails);
  }

  // In production, you could send to a logging service
  // For now, we'll also log to console but with less detail
  if (!import.meta.env.DEV) {
    console.error(`[${name}] ${errorDetails.message}`, {
      file: errorDetails.file,
      function: errorDetails.function,
      status: errorDetails.status,
    });
  }

  return errorDetails;
}

/**
 * Log a warning
 */
export function logWarning(name, message, context = {}) {
  const timestamp = new Date().toISOString();
  const warningDetails = {
    timestamp,
    name,
    file: context.file || "unknown",
    function: context.function || "unknown",
    message,
    ...context,
  };

  if (import.meta.env.DEV) {
    console.warn(`[${name}] Warning:`, warningDetails);
  }

  return warningDetails;
}

/**
 * Log info (for debugging)
 */
export function logInfo(name, message, data = {}) {
  if (import.meta.env.DEV) {
    console.log(`[${name}] ${message}`, data);
  }
}

export default {
  logError,
  logWarning,
  logInfo,
};

