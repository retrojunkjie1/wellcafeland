// Only record the fact that a practice was completed and its duration.
// Notes, ratings, mood, concern labels, and practice context stay on-device.

import { trackAction } from "./telemetry";
import { recordToolCompletion } from "./milestoneService";

const SAFE_TOOL_ID = /^[a-z0-9][a-z0-9._-]{0,79}$/i;
const MAX_DURATION_MS = 24 * 60 * 60 * 1000;

function safeToolId(value) {
  return typeof value === "string" && SAFE_TOOL_ID.test(value) ? value.toLowerCase() : "other";
}

function safeDurationMs(value) {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration < 0) return 0;
  return Math.min(MAX_DURATION_MS, Math.round(duration));
}

/**
 * Record a privacy-minimal practice breadcrumb. Event details supplied by a
 * tool are intentionally ignored; practice notes and self-ratings are not
 * operational telemetry and are never used for automatic risk labels.
 */
export async function logToolUsage(toolId, eventData = {}) {
  const id = safeToolId(toolId);
  const durationMs = safeDurationMs(eventData?.durationMs);

  try {
    await trackAction("tool_usage", { toolId: id, durationMs });
  } catch {
    // Telemetry must not block a practice or expose content through error logs.
  }

  try {
    await recordToolCompletion(id);
  } catch {
    // Progress bookkeeping is best effort and contains no practice details.
  }

  return true;
}
