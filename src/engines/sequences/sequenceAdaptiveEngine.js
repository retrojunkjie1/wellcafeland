// src/engines/sequences/sequenceAdaptiveEngine.js
// ===========================================================
// Phase 48 — Adaptive Brain for Ritual Branches
// Reads emotional + risk context and recommends a path
// ===========================================================

/**
 * Build a minimal context object from the OS messages array.
 * We stay defensive so missing fields never break the UI.
 */
export function buildSequenceContext(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {};
  }

  const last = messages[messages.length - 1] || {};
  const emotion = last.emotion || {};
  const risk = last.risk || {};

  return {
    emotionLabel: emotion.primary || emotion.label || null,
    valence: emotion.valence || null,
    intensity: typeof emotion.intensity === "number" ? emotion.intensity : null,
    riskLevel: risk.level || null,
    humanMode: last.humanMode || null,
  };
}

/**
 * Choose the best option index for a branch step,
 * based on the current emotional + risk context.
 *
 * Returns: index (number) or null if no clear recommendation.
 */
export function chooseBranchOption(step, context) {
  if (!step || step.type !== "branch" || !Array.isArray(step.options)) {
    return null;
  }

  const opts = step.options;
  const { riskLevel, emotionLabel, humanMode, intensity } = context || {};

  // 1. If high risk or crisis tone → pick option tagged as high-risk
  if (riskLevel === "high" || humanMode === "risk_sensitive") {
    const idx = findOptionByTag(opts, "high-risk");
    if (idx !== -1) return idx;
  }

  // 2. Panic / anxiety focused language → panic/moderate tags
  const panicish = ["panic", "panicked", "terrified", "overwhelmed"];
  if (emotionLabel && panicish.includes(emotionLabel.toLowerCase())) {
    const idx = findOptionByTag(opts, "panic");
    if (idx !== -1) return idx;
  }

  // 3. Moderate risk / anxious → moderate-risk path
  const anxiousish = ["anxious", "nervous", "stressed"];
  if (
    riskLevel === "moderate" ||
    (emotionLabel && anxiousish.includes(emotionLabel.toLowerCase()))
  ) {
    const idx = findOptionByTag(opts, "moderate-risk");
    if (idx !== -1) return idx;
  }

  // 4. Low risk / flat / numb → low-risk or flat tag
  const flatish = ["numb", "tired", "empty", "down"];
  if (
    riskLevel === "low" ||
    (emotionLabel && flatish.includes(emotionLabel.toLowerCase()))
  ) {
    const idx =
      findOptionByTag(opts, "low-risk") !== -1
        ? findOptionByTag(opts, "low-risk")
        : findOptionByTag(opts, "flat");
    if (idx !== -1) return idx;
  }

  // 5. High intensity → prioritize more structured support
  if (typeof intensity === "number" && intensity >= 70) {
    const idx =
      findOptionByTag(opts, "high-risk") !== -1
        ? findOptionByTag(opts, "high-risk")
        : findOptionByTag(opts, "panic");
    if (idx !== -1) return idx;
  }

  // 6. Fallback: no recommendation
  return null;
}

function findOptionByTag(options, tag) {
  return options.findIndex(
    (opt) => Array.isArray(opt.tags) && opt.tags.includes(tag)
  );
}

