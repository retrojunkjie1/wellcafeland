const UPDATE_TYPES = Object.freeze({
  feature: "a new feature or practice is available",
  maintenance: "planned service maintenance",
  privacy: "a privacy or account-setting update",
  resource: "a new general support resource",
});

const AUDIENCES = Object.freeze({
  clients: "clients",
  practitioners: "practitioners",
  everyone: "clients and practitioners",
});

function normalizeTowncrierRequest(input = {}) {
  if (!Object.hasOwn(UPDATE_TYPES, input.updateType) || !Object.hasOwn(AUDIENCES, input.audience)) {
    const error = new Error("Choose an update type and intended audience.");
    error.code = "INVALID_TOWNCRIER_REQUEST";
    throw error;
  }
  return { updateType: input.updateType, audience: input.audience };
}

function buildTowncrierPrompt({ updateType, audience }) {
  return [
    "Draft a short, calm, accessible WellnessCafe service announcement for an administrator to review.",
    `The intended audience is ${AUDIENCES[audience]}. The only confirmed context is ${UPDATE_TYPES[updateType]}.`,
    "Do not invent dates, times, affected features, outages, benefits, links, or actions. Do not imply this draft has been published or delivered.",
    "Because details are not supplied, explicitly use a bracketed placeholder where specifics are needed; keep it ready for human editing.",
    "Avoid urgency, promotional pressure, clinical claims, or personal/client data. Keep the message warm and under 90 words.",
    "Return JSON only: {\"title\":string,\"message\":string,\"reviewNote\":string}.",
  ].join("\n");
}

function normalizeTowncrierResult(result) {
  if (!result || typeof result.title !== "string" || typeof result.message !== "string" || typeof result.reviewNote !== "string") {
    const error = new Error("Towncrier returned an incomplete draft.");
    error.code = "INVALID_AGENT_OUTPUT";
    throw error;
  }
  return {
    title: result.title.trim().slice(0, 100),
    message: result.message.trim().slice(0, 500),
    reviewNote: result.reviewNote.trim().slice(0, 240),
  };
}

module.exports = { UPDATE_TYPES, AUDIENCES, normalizeTowncrierRequest, buildTowncrierPrompt, normalizeTowncrierResult };
