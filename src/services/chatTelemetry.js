// src/services/chatTelemetry.js

/**
 * Chat Telemetry Service
 * Logs chat messages through the emotional telemetry matrix and fusion engine
 */

import { handleTelemetryWithFusion } from "../ai/fusion/fusionEngine";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAnonymousUserId } from "../lib/userId";

/**
 * Log a chat message event
 * @param {object} params
 * @param {string} params.messageText - The chat message content
 * @param {object} params.context - Additional context (optional)
 * @param {number} params.createdAt - Timestamp (optional, defaults to now)
 * @returns {Promise<boolean>} Success status (always returns true to not break UI)
 */
export async function logChatEvent({ messageText, context = {}, createdAt }) {
  try {
    if (!messageText || !messageText.trim()) {
      return true; // Don't log empty messages, but return success
    }

    const userId = auth?.currentUser?.uid || getAnonymousUserId();
    const now = createdAt || new Date().getTime();

    // Normalize event for telemetry engine
    const normalizedEvent = {
      type: "chat_message",
      userId,
      messageText: messageText.trim(),
      content: messageText.trim(), // Alias for compatibility
      createdAt: now,
      metadata: {
        ...context,
      },
    };

    // Route through fusion engine (non-blocking)
    try {
      await handleTelemetryWithFusion(normalizedEvent);
    } catch (err) {
      // Don't break chat UX if telemetry fails
      console.warn("Chat telemetry fusion failed (non-critical):", err.message);
    }

    // Optionally store in telemetry_events collection
    if (db) {
      try {
        await addDoc(collection(db, "telemetry_events"), {
          ...normalizedEvent,
          createdAt: new Date(now),
        });
      } catch (err) {
        // Non-critical - telemetry still processed via fusion
        console.debug("Failed to store chat event in telemetry_events:", err.message);
      }
    }

    return true;
  } catch (err) {
    // Catch-all: never break UI
    console.warn("logChatEvent failed (non-critical):", err.message);
    return true; // Always return success to not break UI
  }
}

