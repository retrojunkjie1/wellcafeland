const CONNECTION_CHOICES = new Set(["browse_first", "peer_circle", "trusted_person", "not_sure"]);

function normalizeShepherdRequest(input = {}) {
  if (!CONNECTION_CHOICES.has(input.preference)) {
    const error = new Error("Choose what kind of connection, if any, feels comfortable.");
    error.code = "INVALID_SHEPHERD_PREFERENCE";
    throw error;
  }
  return { preference: input.preference };
}

function buildShepherdPrompt({ preference }) {
  const labels = {
    browse_first: "look around without joining yet",
    peer_circle: "consider a peer circle",
    trusted_person: "consider connecting with one trusted person",
    not_sure: "keep the options open and decide later",
  };
  return [
    "Offer one brief, optional next step for someone exploring community connection.",
    "Do not assume loneliness, isolation, readiness, safety, or that they want a group.",
    "Do not identify available people, promise that a group is active, or join/contact anyone for them.",
    "Treat the selected preference as the only context. Keep the response practical and low-pressure.",
    "Return JSON only: {\"summary\":string,\"invitation\":string,\"nextStep\":string}.",
    `Selected preference: ${labels[preference]}.`,
  ].join("\n");
}

module.exports = { CONNECTION_CHOICES, normalizeShepherdRequest, buildShepherdPrompt };
