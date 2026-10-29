import { callAgent } from "@/ai/agents/agentClient";
import { logError, logWarn } from "./logService";

const MODERATION_UNAVAILABLE = "The message safety check is temporarily unavailable. Nothing was posted; please try again shortly.";

/**
 * Check proposed peer content before it is written.
 * Text is sent only to Cherubim for this single classification request. Logs
 * contain the failure code, never the message or generated moderation text.
 * If moderation cannot return a valid decision, callers must not post.
 */
export async function moderateText(text) {
  if (typeof text !== "string" || !text.trim()) {
    return { ok: true, blocked: false };
  }

  try {
    const response = await callAgent("cherubim", { content: text.trim() });
    const decision = response?.result;
    if (typeof decision?.safe !== "boolean") {
      logWarn("aiModeration", "Cherubim returned no valid decision", { code: "INVALID_MODERATION_OUTPUT" });
      return { ok: false, blocked: false, reason: "INVALID_MODERATION_OUTPUT", suggestion: MODERATION_UNAVAILABLE };
    }

    if (decision.safe) return { ok: true, blocked: false };
    return {
      ok: true,
      blocked: true,
      reason: typeof decision.reason === "string" ? decision.reason : "Please revise this message before sending it.",
      suggestion: typeof decision.suggestion === "string" && decision.suggestion.trim()
        ? decision.suggestion
        : "Please revise this message before sending it.",
    };
  } catch (error) {
    logError("aiModeration", new Error("Cherubim moderation request failed"), {
      code: error?.code || "MODERATION_UNAVAILABLE",
    });
    return {
      ok: false,
      blocked: false,
      reason: error?.code || "MODERATION_UNAVAILABLE",
      suggestion: MODERATION_UNAVAILABLE,
    };
  }
}

export default { moderateText };
