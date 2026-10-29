const assert = require("node:assert/strict");
const { test } = require("node:test");
const { CARE_PATHS, normalizeGatekeeperRequest, buildGatekeeperPrompt, normalizeGatekeeperResult } = require("../src/gatekeeperAgent");

test("Gatekeeper accepts only a fixed, practitioner-selected pathway", () => {
  assert.equal(CARE_PATHS.size, 6);
  assert.deepEqual(normalizeGatekeeperRequest({ pathway: "primary-care", clientName: "Private", notes: "do not forward" }), { pathway: "primary-care" });
  assert.throws(() => normalizeGatekeeperRequest({ pathway: "diagnose-and-treat" }), { code: "INVALID_GATEKEEPER_PATHWAY" });
});

test("Gatekeeper prompt excludes client data and prevents triage or referral claims", () => {
  const prompt = buildGatekeeperPrompt({ pathway: "licensed-mental-health" });
  assert.match(prompt, /licensed mental-health support/);
  assert.match(prompt, /No client name, account, message, check-in, chart, diagnosis, or history is provided/);
  assert.match(prompt, /Do not triage, diagnose, select a treatment, rank providers/);
  assert.match(prompt, /consent-first question/);
});

test("Gatekeeper result requires bounded, complete conversation fields", () => {
  assert.deepEqual(normalizeGatekeeperResult({ openingQuestion: "Ask?", nextStep: "Offer.", preferenceCheck: "Check?", extra: "discard" }), {
    openingQuestion: "Ask?", nextStep: "Offer.", preferenceCheck: "Check?",
  });
  assert.throws(() => normalizeGatekeeperResult({ openingQuestion: "Ask?", nextStep: "", preferenceCheck: "Check?" }), { code: "INVALID_GATEKEEPER_OUTPUT" });
});
