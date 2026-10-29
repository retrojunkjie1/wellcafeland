const MODES = Object.freeze(["guided_support", "voice_check_in_reflection", "voice_journal_summary"]);
const MAX_QUESTION_CHARS = 4000;
const MAX_TRANSCRIPT_CHARS = 5000;
const MAX_MEMORY_CHARS = 2000;

function invalidRequest(message = "Share a short question or choose a supported reflection.") {
  const error = new Error(message);
  error.code = "INVALID_ORACLE_REQUEST";
  return error;
}

function boundedText(value, maxLength) {
  return typeof value === "string" && value.trim() && value.length <= maxLength
    ? value.trim()
    : "";
}

function normalizeOracleRequest(input = {}) {
  // `mode: "agent"` is the outer aiBrain dispatch envelope. For Oracle's
  // regular guidance flow, treat that envelope as the default guided mode;
  // voice-specific Oracle modes remain explicit through `agentMode`.
  const requestedMode = input.agentMode ?? (input.mode === "agent" ? "guided_support" : input.mode);
  const mode = typeof requestedMode === "string" ? requestedMode : "guided_support";
  if (!MODES.includes(mode)) throw invalidRequest("Choose a supported Oracle reflection.");

  if (mode === "voice_check_in_reflection" || mode === "voice_journal_summary") {
    const transcript = boundedText(input.transcript, MAX_TRANSCRIPT_CHARS);
    if (!transcript) throw invalidRequest("The voice reflection is empty or too long to process.");
    return { mode, transcript };
  }

  const question = boundedText(input.question, MAX_QUESTION_CHARS)
    || boundedText(input.prompt, MAX_QUESTION_CHARS);
  if (!question) throw invalidRequest("Share a short question for Oracle.");

  let memory = null;
  if (input.memory !== undefined && input.memory !== null) {
    if (typeof input.memory !== "object" || Array.isArray(input.memory)) {
      throw invalidRequest("The selected support context could not be used.");
    }
    try {
      const serialized = JSON.stringify(input.memory);
      if (serialized.length > MAX_MEMORY_CHARS) throw invalidRequest("The selected support context is too large.");
      memory = JSON.parse(serialized);
    } catch (error) {
      if (error.code === "INVALID_ORACLE_REQUEST") throw error;
      throw invalidRequest("The selected support context could not be used.");
    }
  }
  return { mode, question, memory };
}

function buildOraclePrompt(request) {
  if (request.mode === "voice_check_in_reflection") {
    return [
      "The person chose a voice check-in reflection and supplied the transcript below.",
      "Offer one brief, non-diagnostic, optional reflection grounded only in these words.",
      "Do not infer immediate safety, prescribe breathing, or repeat sensitive details unnecessarily.",
      `Transcript: ${request.transcript}`,
    ].join(" ");
  }
  if (request.mode === "voice_journal_summary") {
    return [
      "The person chose a summary of their voice journal transcript.",
      "Summarize without diagnosis, emotional labeling, or added assumptions. Keep their meaning intact and be concise.",
      `Transcript: ${request.transcript}`,
    ].join(" ");
  }
  return [
    "Respond to the person's explicit question with brief, compassionate, non-diagnostic wellness guidance.",
    "Do not claim to be a clinician, infer immediate safety, make promises, or direct changes to treatment or medication.",
    request.memory ? `Client-selected support context: ${JSON.stringify(request.memory)}.` : "Do not assume personal history beyond the question.",
    `Question: ${request.question}`,
  ].join(" ");
}

function normalizeOracleResult(input = {}) {
  const summary = boundedText(input.summary, 1200);
  const wisdom = boundedText(input.wisdom, 1200);
  if (!summary && !wisdom) {
    const error = new Error("Oracle returned an incomplete reflection.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  return { summary: summary || wisdom, wisdom: wisdom || summary };
}

module.exports = { normalizeOracleRequest, buildOraclePrompt, normalizeOracleResult };
