const CONCERNS = Object.freeze({
  anxiety: "anxiety",
  cravings: "cravings",
  shame: "shame and recovery",
  sleep: "sleep",
  grief: "grief",
  "self-worth": "self-worth",
});

function invalidRequest() {
  const error = new Error("Choose one of the available support topics before generating phrases.");
  error.code = "INVALID_HEALER_CONCERN";
  return error;
}

function normalizeHealerRequest(input = {}) {
  const concern = typeof input.concern === "string" ? input.concern.trim().toLowerCase() : "";
  if (!Object.hasOwn(CONCERNS, concern)) throw invalidRequest();
  return { concern, supportTopic: CONCERNS[concern] };
}

function buildHealerPrompt(request) {
  return [
    `The person selected the topic: ${request.supportTopic}.`,
    "Create four to six short supportive phrases they may keep, edit, or ignore.",
    "Do not assume their history, beliefs, diagnosis, current safety, or experience beyond this topic.",
    "Avoid promises, commands, spiritual claims, forced positivity, and claims about what the person has done or will feel.",
    "Write in first person only when the phrase remains a choice the person can adapt; otherwise use a gentle invitation.",
    "Return JSON: {\"summary\":\"brief purpose\",\"phrases\":[\"four to six optional phrases\"]}.",
  ].join(" ");
}

function normalizeHealerResult(input) {
  const summary = typeof input?.summary === "string" ? input.summary.trim().slice(0, 180) : "";
  const phrases = Array.isArray(input?.phrases)
    ? [...new Set(input.phrases
      .filter((phrase) => typeof phrase === "string")
      .map((phrase) => phrase.trim())
      .filter((phrase) => phrase.length >= 12)
      .map((phrase) => phrase.slice(0, 220)))].slice(0, 6)
    : [];
  if (!summary || phrases.length < 4) {
    const error = new Error("Healer returned an incomplete phrase set.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  return { summary, phrases };
}

module.exports = { normalizeHealerRequest, buildHealerPrompt, normalizeHealerResult };
