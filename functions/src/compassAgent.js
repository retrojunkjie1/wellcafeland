const PERSONAL_VALUES = new Set(["Health", "Connection", "Family", "Stability", "Freedom", "Creativity", "Rest", "Growth"]);
const SUPPORT_MOVES = new Set(["create-distance", "reach-someone", "hands-busy", "basic-need"]);

function normalizeCompassRequest(input = {}) {
  const values = Array.isArray(input.values)
    ? [...new Set(input.values.filter((value) => PERSONAL_VALUES.has(value)))]
    : [];
  if (values.length < 1 || values.length > 3 || values.length !== input.values.length) {
    const error = new Error("Choose one to three values from the list before asking Compass.");
    error.code = "INVALID_COMPASS_VALUES";
    throw error;
  }
  if (!SUPPORT_MOVES.has(input.selectedMove)) {
    const error = new Error("Choose one practical move before asking Compass.");
    error.code = "INVALID_COMPASS_MOVE";
    throw error;
  }
  return { values, selectedMove: input.selectedMove };
}

function buildCompassPrompt({ values, selectedMove }) {
  const moveLabels = {
    "create-distance": "create a little distance from a trigger",
    "reach-someone": "reach someone the person considers safe",
    "hands-busy": "start a familiar, nearby task",
    "basic-need": "meet one basic need such as food, water, rest, or prescribed medication",
  };
  return [
    "Offer one concise, optional values-aligned suggestion for the next few minutes.",
    "Use only the selected values and move below. Do not infer urge severity, diagnosis, readiness, personal history, or safety.",
    "Do not moralize, promise results, or call any choice success or failure. Do not add medical advice.",
    "The person keeps control: frame the choice as optional and easy to change or decline.",
    "Return JSON only: {\"summary\":string,\"value\":string,\"choice\":string,\"nextStep\":string}.",
    `Values the person selected: ${values.join(", ")}.`,
    `Move the person selected: ${moveLabels[selectedMove]}.`,
  ].join("\n");
}

module.exports = { PERSONAL_VALUES, SUPPORT_MOVES, normalizeCompassRequest, buildCompassPrompt };
