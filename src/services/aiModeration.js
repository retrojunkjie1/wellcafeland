// src/services/aiModeration.js
// AI moderation service for social content

import { guideEngine } from "./multimodalClient";
import { logError, logInfo } from "./logService";

/**
 * Moderate text content using AI
 * @param {string} text - Text to moderate
 * @returns {Promise<{ok: boolean, blocked: boolean, suggestion?: string, reason?: string}>}
 */
export async function moderateText(text) {
  try {
    if (!text || !text.trim()) {
      return { ok: true, blocked: false };
    }

    // Use guideEngine with moderation mode
    const moderationPrompt = `Please moderate this message for safety. Check for:
- Self-harm or suicide content
- Harmful substance use encouragement
- Violence or threats
- Hate speech or discrimination
- Explicit sexual content
- Spam or scams

Message to moderate: "${text}"

Respond with JSON only:
{
  "safe": true/false,
  "reason": "brief reason if unsafe",
  "suggestion": "safe alternative message if unsafe"
}`;

    try {
      const result = await guideEngine(moderationPrompt, {
        mode: "moderation",
      });

      if (!result.ok) {
        // If moderation fails, default to blocking
        logError("aiModeration", new Error("Moderation check failed"), { text });
        return {
          ok: false,
          blocked: true,
          suggestion: "This message could not be verified for safety. Please revise.",
        };
      }

      // Parse AI response
      const content = result.content || "";
      let moderationResult;
      
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          moderationResult = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: check for keywords
          const lowerContent = content.toLowerCase();
          if (lowerContent.includes("safe: false") || lowerContent.includes("unsafe")) {
            moderationResult = { safe: false, reason: "Content flagged", suggestion: "Please revise your message." };
          } else {
            moderationResult = { safe: true };
          }
        }
      } catch (parseErr) {
        // If JSON parsing fails, check for unsafe keywords directly
        const unsafeKeywords = [
          "kill myself", "suicide", "hurt myself", "hurt someone",
          "use drugs", "get high", "overdose",
          "violence", "threat", "harm",
        ];
        
        const lowerText = text.toLowerCase();
        const hasUnsafeKeyword = unsafeKeywords.some(kw => lowerText.includes(kw));
        
        if (hasUnsafeKeyword) {
          moderationResult = {
            safe: false,
            reason: "Contains potentially harmful content",
            suggestion: "If you're in crisis, please contact 988 or local emergency services. We're here to support you in a safe way.",
          };
        } else {
          moderationResult = { safe: true };
        }
      }

      if (moderationResult.safe === false) {
        logInfo("aiModeration", "Content blocked", { reason: moderationResult.reason });
        return {
          ok: true,
          blocked: true,
          reason: moderationResult.reason || "Content flagged",
          suggestion: moderationResult.suggestion || "Please revise your message.",
        };
      }

      return { ok: true, blocked: false };
    } catch (err) {
      logError("aiModeration", err, { text });
      // On error, default to allowing (but log it)
      return { ok: true, blocked: false };
    }
  } catch (err) {
    logError("aiModeration", err, { function: "moderateText" });
    return { ok: false, blocked: false };
  }
}

export default {
  moderateText,
};

