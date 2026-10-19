const SUPPORT_AREAS = Object.freeze({
  housing: "housing or a safe place",
  food: "food or grocery support",
  funding: "funding or public benefits",
  programs: "treatment or recovery programs",
  circles: "peer or community support",
});

function normalizeBridgeRequest(input = {}) {
  const category = typeof input.category === "string" ? input.category : "";
  const contactMethod = typeof input.contactMethod === "string" ? input.contactMethod : "";
  if (!Object.hasOwn(SUPPORT_AREAS, category)) {
    const error = new Error("Choose a supported resource category before asking Bridge.");
    error.code = "INVALID_BRIDGE_CATEGORY";
    throw error;
  }
  if (!["phone", "website"].includes(contactMethod)) {
    const error = new Error("Choose whether you are preparing to call or use a website.");
    error.code = "INVALID_BRIDGE_CONTACT_METHOD";
    throw error;
  }
  return { category, supportArea: SUPPORT_AREAS[category], contactMethod };
}

function buildBridgePrompt(request) {
  return [
    `The person chose support category: ${request.supportArea}.`,
    `They are preparing to contact a resource by ${request.contactMethod}.`,
    "Create a short, optional opening line and up to three questions they may ask.",
    "Do not claim the resource offers a particular service, has openings, accepts their insurance, or will find them eligible.",
    "Use no personal facts, location, listing name, or assumptions. Make it easy to edit, skip, or stop.",
    "Return JSON: {\"summary\":\"brief purpose\",\"openingLine\":\"one plain sentence\",\"questions\":[\"up to three questions\"],\"nextStep\":\"one optional follow-up\"}.",
  ].join(" ");
}

module.exports = { normalizeBridgeRequest, buildBridgePrompt };
