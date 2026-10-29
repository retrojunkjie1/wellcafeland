const MAP_CHOICES = Object.freeze({
  situations: Object.freeze({
    uncertainty: "uncertainty or too many decisions",
    low_energy: "low energy or exhaustion",
    strong_urge: "a strong urge or craving",
    disconnection: "feeling disconnected from people",
    difficult_conversation: "a difficult conversation",
    sleep_disruption: "a disrupted night or sleep routine",
  }),
  helps: Object.freeze({
    one_step: "one small practical step",
    quiet: "quiet and less input",
    grounding: "an optional sensory grounding practice",
    natural_breath: "being invited to breathe naturally, without counting",
    trusted_person: "considering a trusted person, when they choose",
    writing: "writing privately",
    movement: "gentle movement",
    learning: "a clear explanation or learning resource",
  }),
  avoid: Object.freeze({
    forced_positivity: "forced positivity",
    long_explanations: "long explanations",
    breath_counting: "counted breathing instructions",
    spiritual_language: "spiritual language",
    pressure_to_contact: "pressure to contact another person",
    advice_without_asking: "advice before being asked",
  }),
});

function normalizeChoiceList(value, choices, { required = false, max = 4 } = {}) {
  if (!Array.isArray(value) || value.length > max) return null;
  const normalized = [...new Set(value)];
  if (normalized.length !== value.length || normalized.some((item) => !Object.hasOwn(choices, item))) return null;
  if (required && normalized.length === 0) return null;
  return normalized;
}

function normalizeCartographerRequest(input = {}) {
  const situations = normalizeChoiceList(input.situations, MAP_CHOICES.situations, { required: true });
  const helps = normalizeChoiceList(input.helps, MAP_CHOICES.helps, { required: true });
  const avoid = normalizeChoiceList(input.avoid || [], MAP_CHOICES.avoid);
  if (!situations || !helps || !avoid) {
    const error = new Error("Choose one to four situations and one to four supports. Any number of avoid preferences is okay.");
    error.code = "INVALID_CARTOGRAPHER_CHOICES";
    throw error;
  }
  return { situations, helps, avoid };
}

function selectedLabels(ids, choices) {
  return ids.map((id) => choices[id]);
}

function buildCartographerPrompt({ situations, helps, avoid }) {
  const selected = {
    situations: selectedLabels(situations, MAP_CHOICES.situations),
    helps: selectedLabels(helps, MAP_CHOICES.helps),
    avoid: selectedLabels(avoid, MAP_CHOICES.avoid),
  };
  return [
    "Create a brief, user-owned support map from the person's explicit selections below.",
    "Treat every selection as a preference, not evidence of a diagnosis, trait, risk level, or fixed pattern.",
    "Use only the selected labels. Do not invent history, make predictions, or recommend treatment.",
    "Respect avoid preferences. Keep every support optional; never pressure disclosure, breath control, or contact with another person.",
    "Return JSON only: {\"overview\":string,\"helpfulSupports\":string[]}.",
    "The overview should say this map reflects choices the person made today and may change. helpfulSupports must contain only labels from the selected supports list.",
    `Situations the person chose: ${selected.situations.join("; ")}.`,
    `Supports the person chose: ${selected.helps.join("; ")}.`,
    `Approaches the person asked to avoid: ${selected.avoid.length ? selected.avoid.join("; ") : "none selected"}.`,
  ].join("\n");
}

function normalizeCartographerResult(result, request) {
  const overview = typeof result?.overview === "string" ? result.overview.trim().slice(0, 300) : "";
  const selectedHelps = new Set(selectedLabels(request.helps, MAP_CHOICES.helps));
  const helpfulSupports = Array.isArray(result?.helpfulSupports)
    ? result.helpfulSupports.filter((item) => typeof item === "string" && selectedHelps.has(item.trim())).map((item) => item.trim()).slice(0, 4)
    : [];
  return {
    overview,
    helpfulSupports: helpfulSupports.length ? helpfulSupports : selectedLabels(request.helps, MAP_CHOICES.helps),
    avoid: selectedLabels(request.avoid, MAP_CHOICES.avoid),
    firstStep: `One option you chose: ${selectedLabels([request.helps[0]], MAP_CHOICES.helps)[0]}. You can use it or ignore it.`,
  };
}

module.exports = { MAP_CHOICES, normalizeCartographerRequest, buildCartographerPrompt, normalizeCartographerResult };
