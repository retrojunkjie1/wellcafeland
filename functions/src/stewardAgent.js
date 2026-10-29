const PRIVACY_TOPICS = Object.freeze({
  export: {
    label: "Download my data",
    facts: "The account export is prepared when requested and is provided as a readable plain-text report. It is not sent to a practitioner. The user should keep the downloaded file somewhere private.",
  },
  sharing: {
    label: "Practitioner access",
    facts: "A practitioner does not receive check-ins just because the client has an account. The client can review what each connected practitioner is allowed to see in Practitioner sharing settings.",
  },
  deletion: {
    label: "Delete saved check-ins",
    facts: "The current control permanently removes saved check-in entries. This changes check-in history, milestones, and any practitioner view of those entries. It does not delete the account, plans, messages, appointments, or practitioner connections.",
  },
  retention: {
    label: "How long data is kept",
    facts: "Saved check-ins stay in the account until deleted by the user. Guide conversation memory stays until the user clears it. Automatic timed deletion is not available yet.",
  },
});

function normalizeStewardRequest(input = {}) {
  if (!Object.hasOwn(PRIVACY_TOPICS, input.topicId)) {
    const error = new Error("Choose one of the privacy topics shown on this page.");
    error.code = "INVALID_STEWARD_TOPIC";
    throw error;
  }
  return { topicId: input.topicId, ...PRIVACY_TOPICS[input.topicId] };
}

function buildStewardPrompt({ label, facts }) {
  return [
    "Explain this WellnessCafe privacy topic in plain language, using only the verified product facts below.",
    `Topic: ${label}. Verified facts: ${facts}`,
    "Do not make legal, HIPAA, confidentiality, retention, or security guarantees beyond these exact facts. Do not claim that you inspected the user's account or settings.",
    "Do not infer anything about the user or ask them to disclose private information. Keep the answer practical, calm, and under 100 words.",
    "Return JSON only: {\"answer\":string}.",
  ].join("\n");
}

function normalizeStewardResult(result) {
  if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
    const error = new Error("Steward returned an incomplete explanation.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  return { answer: result.answer.trim().slice(0, 700) };
}

module.exports = { PRIVACY_TOPICS, normalizeStewardRequest, buildStewardPrompt, normalizeStewardResult };
