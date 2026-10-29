const CARE_PATHS = new Set([
  "primary-care",
  "licensed-mental-health",
  "substance-use-support",
  "peer-recovery-support",
  "care-coordination",
  "not-sure",
]);

function normalizeGatekeeperRequest(input = {}) {
  if (!CARE_PATHS.has(input.pathway)) {
    const error = new Error("Choose a supported care pathway to prepare a next-step conversation.");
    error.code = "INVALID_GATEKEEPER_PATHWAY";
    throw error;
  }
  return { pathway: input.pathway };
}

function buildGatekeeperPrompt({ pathway }) {
  const descriptions = {
    "primary-care": "a primary-care conversation",
    "licensed-mental-health": "a conversation about licensed mental-health support",
    "substance-use-support": "a conversation about substance-use treatment or recovery support",
    "peer-recovery-support": "a conversation about peer recovery support",
    "care-coordination": "a conversation about practical care coordination",
    "not-sure": "a conversation where the person is not yet sure which kind of support fits",
  };
  return [
    "Prepare a brief, client-centered conversation aid for a verified WellnessCafe practitioner.",
    "Use only the fixed pathway selected below. No client name, account, message, check-in, chart, diagnosis, or history is provided.",
    "Do not triage, diagnose, select a treatment, rank providers, claim availability, make referrals, or contact anyone.",
    "Use a consent-first question, one practical next step the client may accept or decline, and one check for the client's preference.",
    "Do not imply that the selected pathway is clinically indicated. Encourage the practitioner to use their own professional judgment and local protocols.",
    "Return JSON only: {\"openingQuestion\":string,\"nextStep\":string,\"preferenceCheck\":string}.",
    `The practitioner selected: ${descriptions[pathway]}.`,
  ].join("\n");
}

function normalizeGatekeeperResult(result = {}) {
  const fields = ["openingQuestion", "nextStep", "preferenceCheck"];
  if (fields.some((field) => typeof result[field] !== "string" || !result[field].trim())) {
    const error = new Error("Gatekeeper returned an incomplete response.");
    error.code = "INVALID_GATEKEEPER_OUTPUT";
    throw error;
  }
  return {
    openingQuestion: result.openingQuestion.trim().slice(0, 280),
    nextStep: result.nextStep.trim().slice(0, 320),
    preferenceCheck: result.preferenceCheck.trim().slice(0, 240),
  };
}

module.exports = { CARE_PATHS, normalizeGatekeeperRequest, buildGatekeeperPrompt, normalizeGatekeeperResult };
