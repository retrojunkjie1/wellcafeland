// src/services/logService.js
// Centralized logging service with Firestore persistence (production)
// Always fails silently - never crashes the app

import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { isProdLike } from "./envInspector";

const LOG_PREFIX = "[WC]";
const MAX_LOG_ENTRIES_PER_DAY = 1000; // Prevent log spam

// In-memory buffer for recent logs (for admin console)
const logBuffer = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Get current user ID (authenticated or anonymous)
 */
function getCurrentUserId() {
  try {
    return auth?.currentUser?.uid || getAnonymousUserId();
  } catch {
    return "unknown";
  }
}

/**
 * Write log to Firestore (fire-and-forget)
 */
async function writeToFirestore(level, scope, message, extra) {
  if (!db || !isProdLike()) {
    return; // Only write to Firestore in production
  }

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const userId = getCurrentUserId();

    await addDoc(collection(db, "system_logs", today, "entries"), {
      level,
      scope,
      message: typeof message === "string" ? message : JSON.stringify(message),
      extra: extra ? (typeof extra === "object" ? JSON.stringify(extra) : String(extra)) : null,
      timestamp: new Date().toISOString(),
      userId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (err) {
    // Silently fail - logging should never break the app
    console.warn("[logService] Failed to write to Firestore:", err);
  }
}

/**
 * Add to in-memory buffer
 */
function addToBuffer(level, scope, message, extra) {
  logBuffer.push({
    level,
    scope,
    message,
    extra,
    timestamp: new Date().toISOString(),
  });

  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

/**
 * Log info message
 */
export function logInfo(scope, message, extra = null) {
  const prefix = `${LOG_PREFIX}[INFO][${scope}]`;
  
  if (import.meta.env.DEV) {
    console.log(prefix, message, extra || "");
  }

  addToBuffer("info", scope, message, extra);
  writeToFirestore("info", scope, message, extra).catch(() => {
    // Silently fail
  });
}

/**
 * Log warning message
 */
export function logWarn(scope, message, extra = null) {
  const prefix = `${LOG_PREFIX}[WARN][${scope}]`;
  
  if (import.meta.env.DEV) {
    console.warn(prefix, message, extra || "");
  }

  addToBuffer("warn", scope, message, extra);
  writeToFirestore("warn", scope, message, extra).catch(() => {
    // Silently fail
  });
}

/**
 * Log error
 */
export function logError(scope, error, extra = null) {
  const prefix = `${LOG_PREFIX}[ERROR][${scope}]`;
  const errorMessage = error?.message || error?.error || String(error);
  const errorStack = error?.stack || null;

  if (import.meta.env.DEV) {
    console.error(prefix, errorMessage, extra || "", errorStack || "");
  }

  addToBuffer("error", scope, errorMessage, { ...extra, stack: errorStack });
  writeToFirestore("error", scope, errorMessage, { ...extra, stack: errorStack }).catch(() => {
    // Silently fail
  });
}

/**
 * Get recent logs from buffer (for admin console)
 */
export function getRecentLogs(limit = 50) {
  return logBuffer.slice(-limit).reverse(); // Most recent first
}

/**
 * Get logs by level
 */
export function getLogsByLevel(level, limit = 50) {
  return logBuffer
    .filter(log => log.level === level)
    .slice(-limit)
    .reverse();
}

/**
 * Clear log buffer (for testing or memory management)
 */
export function clearLogBuffer() {
  logBuffer.length = 0;
}

export default {
  logInfo,
  logWarn,
  logError,
  getRecentLogs,
  getLogsByLevel,
  clearLogBuffer,
};

