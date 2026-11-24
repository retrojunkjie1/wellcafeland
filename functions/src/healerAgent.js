const CONCERNS = Object.freeze({
  anxiety: "anxiety",
  cravings: "cravings",
  shame: "shame and recovery",
  sleep: "sleep",
  grief: "grief",
  "self-worth": "self-worth",
});
const LANGUAGE_FRAMES = Object.freeze({
  everyday: "everyday and non-religious",
  spiritual: "spiritual or meaning-centered, only in the optional way the person requested",
});

function invalidRequest() {
  const error = new Error("Choose one of the available support topics before generating phrases.");
  error.code = "INVALID_HEALER_CONCERN";
  return error;
}

function normalizeHealerRequest(input = {}) {
  const concern = typeof input.concern === "string" ? input.concern.trim().toLowerCase() : "";
  if (!Object.hasOwn(CONCERNS, concern)) throw invalidRequest();
  const frame = input.frame === undefined ? "everyday" : typeof input.frame === "string" ? input.frame.trim().toLowerCase() : "";
  if (!Object.hasOwn(LANGUAGE_FRAMES, frame)) {
    const error = new Error("Choose everyday or spiritual language before generating phrases.");
    error.code = "INVALID_HEALER_FRAME";
    throw error;
  }
  return { concern, supportTopic: CONCERNS[concern], frame, languageFrame: LANGUAGE_FRAMES[frame] };
}

function buildHealerPrompt(request) {
  return [
    `The person selected the topic: ${request.supportTopic}.`,
    "Create four to six short supportive phrases they may keep, edit, or ignore.",
    "Do not assume their history, beliefs, diagnosis, current safety, or experience beyond this topic.",
    `Use an ${request.languageFrame} frame.`,
    "For everyday language, do not introduce religious or spiritual framing.",
    "For spiritual language, do not infer a religion, deity, practice, belief, or community; do not quote scripture or make supernatural, clinical, or outcome claims.",
    "Any spiritual wording must be invitational, conditional (for example, 'if this fits your beliefs'), and easy to remove; use meaning-centered language if the person's beliefs are unknown.",
    "In both frames, avoid promises, commands, forced positivity, and claims about what the person has done or will feel.",
    "Write in first person only when the phrase remains a choice the person can adapt; otherwise use a gentle invitation.",
    "Return JSON: {\"summary\":\"brief purpose\",\"phrases\":[\"four to six optional phrases\"]}.",
  ].join(" ");
}

function normalizeHealerResult(input, request = { frame: "everyday" }) {
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
  const unrequestedBeliefLanguage = /\b(god|gods|jesus|allah|bible|qur['’]?an|scripture|church|mosque|temple|prayer|pray|religion|religious|faith)\b/i;
  if (request.frame === "everyday" && phrases.some((phrase) => unrequestedBeliefLanguage.test(phrase))) {
    const error = new Error("Healer returned language outside the selected everyday frame.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  if (request.frame === "spiritual" && phrases.some((phrase) => /\b(god|gods|jesus|allah|bible|qur['’]?an|scripture|church|mosque|temple|prayer|pray|religion|religious|faith)\b/i.test(phrase))) {
    const error = new Error("Healer returned a specific belief reference without the person selecting a tradition.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  return { summary, phrases };
}

module.exports = { normalizeHealerRequest, buildHealerPrompt, normalizeHealerResult };
