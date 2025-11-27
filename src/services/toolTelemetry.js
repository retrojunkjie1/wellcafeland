// src/services/toolTelemetry.js

import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAnonymousUserId } from "../lib/userId";
import { trackAction } from "./telemetry";
import { handleTelemetryWithFusion, normalizeToolUsageEvent } from "../ai/fusion/fusionEngine";
import { recordToolCompletion } from "./milestoneService";

/**
 * Log tool usage to Firestore and telemetry
 * @param {string} toolId - Tool identifier
 * @param {object} eventData - Tool-specific event data
 * @returns {Promise<boolean>} Success status (always returns true to not break UI)
 */
export async function logToolUsage(toolId, eventData = {}) {
  try {
  // Use Firebase Auth UID if available, otherwise fall back to anonymous ID
  const userId = auth?.currentUser?.uid || getAnonymousUserId();
  const now = new Date().getTime();

  const toolEvent = {
    userId,
    toolId,
    startedAt: eventData.startedAt || now,
    completedAt: eventData.completedAt || now,
    durationMs: eventData.durationMs || 0,
    context: {
      intensityBefore: eventData.intensityBefore,
      intensityAfter: eventData.intensityAfter,
      moodTag: eventData.moodTag,
      notes: eventData.notes,
      preset: eventData.preset,
      duration: eventData.duration,
      concernType: eventData.concernType,
      ...(eventData.context || {}),
    },
    createdAt: now,
  };

  // Track via telemetry service
  trackAction("tool_usage", {
    toolId,
    durationMs: toolEvent.durationMs,
    ...toolEvent.context,
  });

  // Store in Firestore if available
  if (db) {
    try {
      await addDoc(collection(db, "tool_usage"), {
        ...toolEvent,
        createdAt: new Date(toolEvent.createdAt),
        startedAt: eventData.startedAt
          ? new Date(eventData.startedAt)
          : new Date(),
        completedAt: eventData.completedAt
          ? new Date(eventData.completedAt)
          : new Date(),
      });
    } catch (err) {
      console.error("Failed to log tool usage to Firestore:", err);
      // Don't throw - telemetry still tracked
    }
  }

  // NEW: Route through emotional telemetry matrix and fusion engine
  try {
    const normalizedEvent = normalizeToolUsageEvent(toolId, {
      ...eventData,
      userId,
      completedAt: toolEvent.completedAt,
      startedAt: toolEvent.startedAt,
    });
    
    await handleTelemetryWithFusion(normalizedEvent);
  } catch (err) {
    // Don't break tool usage if fusion fails
    console.error("Failed to process telemetry fusion:", err);
  }
  
  // Record milestone event (non-blocking)
  try {
    await recordToolCompletion(toolId, eventData);
  } catch (err) {
    // Don't break tool logging if milestone tracking fails
    console.warn(`Milestone tracking failed for tool ${toolId} (non-critical):`, err.message);
  }

    // Legacy: If high intensity (e.g., urge surfing >= 8), also create agent event
    // This is now redundant but kept for backward compatibility
    if (
      eventData.intensityBefore >= 8 ||
      eventData.intensityAfter >= 8 ||
      eventData.severity === "high"
    ) {
      try {
        await logHighIntensityEvent(toolId, eventData);
      } catch (err) {
        console.warn("High-intensity event logging failed (non-critical):", err.message);
      }
    }

    return true;
  } catch (err) {
    // Catch-all: never break UI
    console.warn("logToolUsage failed (non-critical):", err.message);
    return true; // Always return success to not break UI
  }
}

/**
 * Log high-intensity events to agent_events for Admin Console
 */
async function logHighIntensityEvent(toolId, eventData) {
  if (!db) return;

  try {
    const agentId =
      toolId === "urge-surfing" ? "sentinel" : "seer";
    const severity =
      eventData.intensityBefore >= 9 || eventData.intensityAfter >= 9
        ? "critical"
        : "warning";

    // Use Firebase Auth UID if available, otherwise fall back to anonymous ID
    const userId = auth?.currentUser?.uid || getAnonymousUserId();

    await addDoc(collection(db, "agent_events"), {
      userId,
      agentId,
      eventType: "risk_signal",
      severity,
      message: `High intensity detected in ${toolId} tool`,
      meta: {
        toolId,
        intensityBefore: eventData.intensityBefore,
        intensityAfter: eventData.intensityAfter,
        ...eventData.context,
      },
      timestamp: new Date(),
      success: true,
    });
  } catch (err) {
    console.error("Failed to log high-intensity event:", err);
  }
}

