const COMPANY_CHOICES = new Set(["quiet-company", "miss-someone", "feel-disconnected", "not-sure"]);

function normalizeHearthRequest(input = {}) {
  if (!COMPANY_CHOICES.has(input.choice)) {
    const error = new Error("Choose the kind of support that feels closest, or skip this moment.");
    error.code = "INVALID_HEARTH_CHOICE";
    throw error;
  }
  return { choice: input.choice };
}

function buildHearthPrompt({ choice }) {
  const labels = {
    "quiet-company": "want a sense of quiet company without being asked to talk",
    "miss-someone": "are missing someone",
    "feel-disconnected": "feel disconnected right now",
    "not-sure": "are unsure what would help",
  };
  return [
    "Offer one brief, warm, non-clinical moment of support to someone who explicitly selected an option below.",
    "Do not infer loneliness, abandonment, depression, risk, diagnosis, history, or need for treatment.",
    "Do not pressure social contact, suggest that the person is alone, or promise that you can stay or remember them.",
    "Offer a choice that can be accepted, changed, or ignored. Do not give medical or crisis advice.",
    "Return JSON only: {\"summary\":string,\"invitation\":string,\"nextStep\":string}.",
    `The person selected that they ${labels[choice]}.`,
  ].join("\n");
}

module.exports = { COMPANY_CHOICES, normalizeHearthRequest, buildHearthPrompt };
