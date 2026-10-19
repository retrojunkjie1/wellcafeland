const SUPPORT_ROUTES = Object.freeze({
  "immediate-danger": {
    summary: "You chose immediate safety support.",
    invitation: "If you or someone else is in immediate danger, contact your local emergency service now.",
    nextStep: "In the U.S. and its territories, call or text 988 for emotional crisis support. If there is immediate danger, call 911.",
    resourcePath: "/resources?type=hotlines",
    route: "emergency-and-crisis-support",
  },
  "need-a-person": {
    summary: "You asked for a person to talk with now.",
    invitation: "In the U.S. and its territories, call or text 988 to reach the 988 Suicide & Crisis Lifeline. You can also use its online chat.",
    nextStep: "If you are in immediate danger, contact your local emergency service. You can browse more support options whenever you are ready.",
    resourcePath: "/resources?type=hotlines",
    route: "human-crisis-support",
  },
  unsure: {
    summary: "It is okay not to know what kind of help fits yet.",
    invitation: "If talking to someone would help, in the U.S. and its territories you can call or text 988. You do not need to explain everything at once.",
    nextStep: "If you or someone else is in immediate danger, contact your local emergency service. Or browse support options without contacting anyone.",
    resourcePath: "/resources?type=hotlines",
    route: "optional-human-support",
  },
});

function normalizeSentinelRequest(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)
    || !Object.hasOwn(SUPPORT_ROUTES, input.supportNeed)) {
    const error = new Error("Choose one of the available support options.");
    error.code = "INVALID_SENTINEL_SUPPORT_NEED";
    throw error;
  }
  // Deliberately discard all other fields: no message, history, or client data is read.
  return { supportNeed: input.supportNeed };
}

function createSentinelRoute(request) {
  const route = SUPPORT_ROUTES[request.supportNeed];
  return { ...route };
}

module.exports = { normalizeSentinelRequest, createSentinelRoute };
