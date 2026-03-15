// src/core/system/phrasingEngine.js
// Phase 27 — Adaptive Response Phrasing Engine (ARP)
// Pure, side-effect-free phrasing style computation
// NO React imports, NO external calls, NO side effects

/**
 * Get phrasing style based on tone profile.
 * @param {Object} toneProfile
 * @param {string} [toneProfile.tone]
 * @param {boolean} [toneProfile.allowHumor]
 * @param {string} [toneProfile.safetyTier]
 * @param {string} [toneProfile.redirectStrategy]
 * @returns {{ tone: string, opener: string, softener: string, closer: string }}
 */
export function getPhrasingStyle(toneProfile) {
  try {
    if (!toneProfile || typeof toneProfile !== "object") {
      return {
        tone: "grounded",
        opener: "Let's slow it down for a second.",
        softener: "",
        closer: "",
      };
    }

    const tone = toneProfile.tone || "grounded";
    const allowHumor = toneProfile.allowHumor === true;

    switch (tone) {
      case "clinical":
        return {
          tone: "clinical",
          opener: "I hear you clearly.",
          softener: "Let's unpack this calmly.",
          closer: "I'm right here with you.",
        };

      case "grounded":
        return {
          tone: "grounded",
          opener: "Let's take this one moment at a time.",
          softener: "",
          closer: "",
        };

      case "warm":
        return {
          tone: "warm",
          opener: "I'm right here with you.",
          softener: "",
          closer: "",
        };

      case "playful":
        if (allowHumor) {
          return {
            tone: "playful",
            opener: "😂 Okay, that got me.",
            softener: "",
            closer: "",
          };
        }
        // Fall through to grounded if humor not allowed
        return {
          tone: "grounded",
          opener: "Let's take this one moment at a time.",
          softener: "",
          closer: "",
        };

      case "informative":
        return {
          tone: "informative",
          opener: "Here's what you should know.",
          softener: "",
          closer: "",
        };

      case "mentor":
        return {
          tone: "mentor",
          opener: "Let me share something useful.",
          softener: "",
          closer: "",
        };

      default:
        return {
          tone: "grounded",
          opener: "Let's slow it down for a second.",
          softener: "",
          closer: "",
        };
    }
  } catch (err) {
    console.warn("[phrasingEngine] getPhrasingStyle failed:", err);
    return {
      tone: "grounded",
      opener: "Let's slow it down for a second.",
      softener: "",
      closer: "",
    };
  }
}

// Phase 2C: Only add opener when baseText is very short (<40 chars); use rotation pool
const OPENER_POOL = [
  "I'm here with you.",
  "Let's take this one moment at a time.",
  "I hear you.",
];
let openerPoolIdx = 0;

/**
 * Build assistant response with phrasing style applied.
 * Phase 2C: Stop always prepending opener; only add when baseText < 40 chars.
 * @param {string} baseText
 * @param {Object} phrasingStyle
 * @param {string} [phrasingStyle.opener]
 * @param {string} [phrasingStyle.softener]
 * @param {string} [phrasingStyle.closer]
 * @returns {string}
 */
export function buildAssistantResponse(baseText, phrasingStyle) {
  try {
    if (!baseText || typeof baseText !== "string") {
      return baseText || "";
    }

    if (!phrasingStyle || typeof phrasingStyle !== "object") {
      return baseText;
    }

    const softener = phrasingStyle.softener || "";
    const closer = phrasingStyle.closer || "";
    const parts = [];

    // Phase 2C: Only prepend opener when assistantText is very short (<40 chars)
    const trimmed = baseText.trim();
    if (trimmed.length < 40) {
      const opener = phrasingStyle.opener || OPENER_POOL[openerPoolIdx % OPENER_POOL.length];
      openerPoolIdx += 1;
      parts.push(opener);
    }

    if (softener) {
      parts.push(softener);
    }

    parts.push(baseText);

    if (closer) {
      parts.push(closer);
    }

    return parts.filter((p) => p.trim()).join(" ");
  } catch (err) {
    console.warn("[phrasingEngine] buildAssistantResponse failed:", err);
    return baseText || "";
  }
}

export default {
  getPhrasingStyle,
  buildAssistantResponse,
};

