// src/services/sessionTelemetry.js

/**
 * Session Telemetry Service
 * Logs session events through the emotional telemetry matrix and fusion engine
 */

import { handleTelemetryWithFusion } from "../ai/fusion/fusionEngine";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { recordSessionEvent as recordMilestoneEvent } from "./milestoneService";

/**
 * Log a session event
 * @param {object} params
 * @param {string|string[]} params.userIds - User ID(s) involved in the session
 * @param {string} params.createdBy - Provider/admin UID who created the log
 * @param {string} params.groupType - Type of group/session (MIR, Men's Group, etc.)
 * @param {string} params.summaryText - Summary or notes from the session
 * @param {object} params.metadata - Additional metadata (optional)
 * @param {number} params.createdAt - Timestamp (optional, defaults to now)
 * @returns {Promise<boolean>} Success status (always returns true to not break UI)
 */
export async function logSessionEvent({
  userIds,
  createdBy,
  groupType,
  summaryText,
  notes,
  metadata = {},
  createdAt,
}) {
  try {
    if (!groupType || (!summaryText && !notes)) {
      console.warn("logSessionEvent: Missing required fields (groupType, summaryText/notes)");
      return true; // Return success even if validation fails
    }

    const creatorId = createdBy || auth?.currentUser?.uid || "unknown";
    const now = createdAt || new Date().getTime();
    const summary = summaryText || notes || "";

    // Normalize userIds to array
    const userIdArray = Array.isArray(userIds) ? userIds : userIds ? [userIds] : [];

    // Store in session_logs collection
    if (db) {
      try {
        const sessionLog = {
          createdBy: creatorId,
          userIds: userIdArray,
          groupType,
          summaryText: summary,
          notes: summary,
          metadata,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };

        await addDoc(collection(db, "session_logs"), sessionLog);
      } catch (err) {
        console.warn("Failed to store session log (non-critical):", err.message);
        // Continue to telemetry processing even if storage fails
      }
    }

    // Process telemetry for each user involved
    for (const userId of userIdArray) {
      try {
        const normalizedEvent = {
          type: "session_event",
          userId,
          groupType,
          eventType: groupType, // Alias
          summaryText: summary,
          notes: summary,
          createdAt: now,
          metadata: {
            createdBy: creatorId,
            ...metadata,
          },
        };

        // Route through fusion engine (non-blocking)
        try {
          await handleTelemetryWithFusion(normalizedEvent);
        } catch (err) {
          // Don't break session logging if telemetry fails
          console.warn(`Session telemetry fusion failed for user ${userId} (non-critical):`, err.message);
        }
        
        // Record milestone event (non-blocking)
        try {
          await recordMilestoneEvent(normalizedEvent);
        } catch (err) {
          // Don't break session logging if milestone tracking fails
          console.warn(`Milestone tracking failed for user ${userId} (non-critical):`, err.message);
        }
      } catch (err) {
        console.warn(`Failed to process session telemetry for user ${userId} (non-critical):`, err.message);
      }
    }

    return true;
  } catch (err) {
    // Catch-all: never break UI
    console.warn("logSessionEvent failed (non-critical):", err.message);
    return true; // Always return success to not break UI
  }
}

/**
 * Track a risk event for telemetry
 * @param {Object} event - Risk event data
 * @param {string} event.riskLevel - Risk level ("low" | "moderate" | "high")
 * @param {string[]} event.reasons - Reasons for risk assessment
 * @param {string[]} event.domains - Risk domains
 * @param {string} event.messageId - Associated message ID
 * @param {number} event.timestamp - Event timestamp
 * @returns {Promise<void>}
 */
export async function trackRiskEvent(event) {
  try {
    if (!event || !event.riskLevel) {
      console.warn("trackRiskEvent: Invalid event data");
      return;
    }

    const riskEvent = {
      riskLevel: event.riskLevel,
      reasons: event.reasons || [],
      domains: event.domains || [],
      messageId: event.messageId || null,
      timestamp: event.timestamp || Date.now(),
    };

    // Log to console for now (Phase 17 requirement)
    console.log("[telemetry] Risk event:", riskEvent);

    // Optionally write to Firestore if collection exists
    if (db) {
      try {
        // Check if risk_events collection exists by attempting to write
        // This is best-effort only and won't break if collection doesn't exist
        await addDoc(collection(db, "risk_events"), {
          ...riskEvent,
          createdAt: new Date(riskEvent.timestamp),
        });
      } catch (err) {
        // Silently fail if Firestore write fails (collection may not exist yet)
        console.warn("Failed to write risk event to Firestore (non-critical):", err.message);
      }
    }
  } catch (err) {
    // Never throw - this is telemetry only
    console.warn("trackRiskEvent failed (non-critical):", err.message);
  }
}

