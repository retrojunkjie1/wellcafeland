const EARLY_CUES = new Set([
  "thoughts-racing",
  "body-tense",
  "restless",
  "urge-building",
  "pulling-away",
  "not-sure",
]);

function normalizeLighthouseRequest(input = {}) {
  if (!EARLY_CUES.has(input.cue)) {
    const error = new Error("Choose an early cue, or leave this support for later.");
    error.code = "INVALID_LIGHTHOUSE_CUE";
    throw error;
  }
  return { cue: input.cue };
}

function buildLighthousePrompt({ cue }) {
  const descriptions = {
    "thoughts-racing": "thoughts feel fast or crowded",
    "body-tense": "they notice tension in their body",
    restless: "they feel restless",
    "urge-building": "an urge seems to be building",
    "pulling-away": "they notice a pull to withdraw",
    "not-sure": "they are not sure what they notice yet",
  };
  return [
    "Offer a brief, non-clinical early-support reflection based only on the single cue the person selected.",
    "Do not monitor, infer, score, diagnose, predict escalation, or describe the cue as a warning sign or proof of risk.",
    "Offer one optional, immediately available stabilizing choice and one optional human-support step; make it easy to decline both.",
    "Do not prescribe breathing, tell the person to close their eyes, require body contact, or promise an outcome.",
    "Do not replace crisis support. If a person indicates immediate danger in a future interaction, direct them to local emergency services; this request contains no such signal.",
    "Return JSON only: {\"reflection\":string,\"option\":string,\"supportStep\":string}.",
    `The person selected: ${descriptions[cue]}.`,
  ].join("\n");
}

function normalizeLighthouseResult(result = {}) {
  const fields = ["reflection", "option", "supportStep"];
  if (fields.some((field) => typeof result[field] !== "string" || !result[field].trim())) {
    const error = new Error("Lighthouse returned an incomplete response.");
    error.code = "INVALID_LIGHTHOUSE_OUTPUT";
    throw error;
  }
  return {
    reflection: result.reflection.trim().slice(0, 200),
    option: result.option.trim().slice(0, 320),
    supportStep: result.supportStep.trim().slice(0, 240),
  };
}

module.exports = { EARLY_CUES, normalizeLighthouseRequest, buildLighthousePrompt, normalizeLighthouseResult };
