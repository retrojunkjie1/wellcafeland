import { beforeEach, describe, expect, it, vi } from "vitest";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));

import { BREATHKEEPER_QUESTION, planWellnessExperience, runWellnessExperience, WELLNESS_EXPERIENCE_IDS } from "./experienceEngine";

describe("choice-led WellnessCafe Experience Engine", () => {
  beforeEach(() => callAgent.mockReset());

  it("routes an explicit support choice to exactly one specialist and strips all other context", async () => {
    callAgent.mockResolvedValue({ result: { summary: "A gentle option." } });

    const outcome = await runWellnessExperience("support.companion", {
      choice: "quiet-company",
      message: "private writing that must not be forwarded",
      history: [{ mood: "distressed" }],
      clientId: "private-id",
    });

    expect(callAgent).toHaveBeenCalledTimes(1);
    expect(callAgent).toHaveBeenCalledWith("hearth", { choice: "quiet-company" });
    expect(outcome).toEqual({
      experienceId: "support.companion",
      agentId: "hearth",
      result: { summary: "A gentle option." },
    });
  });

  it("keeps safety routing choice-led and does not forward message or history", () => {
    expect(planWellnessExperience("support.human-route", {
      supportNeed: "need-a-person",
      message: "not included",
      priorConversation: "not included",
    })).toEqual({
      experienceId: "support.human-route",
      agentId: "sentinel",
      payload: { supportNeed: "need-a-person" },
    });
  });

  it("rejects unknown experiences and unselected or unsupported options before any model call", async () => {
    await expect(runWellnessExperience("guess-from-message", { message: "help" }))
      .rejects.toMatchObject({ code: "UNKNOWN_EXPERIENCE" });
    await expect(runWellnessExperience("support.early-option", { cue: "my text implies risk" }))
      .rejects.toMatchObject({ code: "INVALID_EXPERIENCE_SELECTION" });
    expect(callAgent).not.toHaveBeenCalled();
  });

  it("exposes the 15 named journeys currently wired through this engine", () => {
    expect(WELLNESS_EXPERIENCE_IDS).toEqual([
      "patterns.client-review",
      "patterns.meaning-reflection",
      "support.human-route",
      "support.companion",
      "support.early-option",
      "recovery.affirmation",
      "community.connection-option",
      "recovery.values-choice",
      "resources.contact-preparation",
      "privacy.explanation",
      "preferences.map",
      "learning.translation",
      "learning.explanation",
      "practice.grounding-variation",
      "practice.low-energy-option",
      "practice.breathing-cue",
      "progress.reflection",
    ]);
  });

  it("requires confirmed consent and strips journal and identity data from Seer and Oracle handoffs", () => {
    const entries = [
      { date: "2026-10-01", fields: { stress: 3, journal: "private note", userId: "private-id" } },
      { date: "2026-10-02", fields: { stress: 5 } },
      { date: "2026-10-03", fields: { stress: 7 } },
    ];
    expect(() => planWellnessExperience("patterns.client-review", { selectedFields: ["stress"], entries }))
      .toThrow(/confirm/i);
    const plan = planWellnessExperience("patterns.client-review", { consent: true, selectedFields: ["stress"], entries });
    expect(plan).toMatchObject({ agentId: "seer", payload: { clientPatternReview: { consent: true, selectedFields: ["stress"] } } });
    expect(JSON.stringify(plan.payload)).not.toMatch(/private note|private-id/);

    const oraclePlan = planWellnessExperience("patterns.meaning-reflection", { consent: true, insight: "Stress ratings varied in these entries." });
    expect(oraclePlan).toMatchObject({ agentId: "oracle", payload: { memory: { selectedSeerObservation: "Stress ratings varied in these entries." } } });
    expect(() => planWellnessExperience("patterns.meaning-reflection", { insight: "No consent" })).toThrow(/Confirm/i);
    expect(callAgent).not.toHaveBeenCalled();
  });

  it.each([
    ["support.human-route", "sentinel", { supportNeed: "need-a-person" }, { supportNeed: "need-a-person" }],
    ["support.companion", "hearth", { choice: "quiet-company" }, { choice: "quiet-company" }],
    ["support.early-option", "lighthouse", { cue: "body-tense" }, { cue: "body-tense" }],
    ["recovery.affirmation", "healer", { concern: "sleep" }, { concern: "sleep" }],
    ["community.connection-option", "shepherd", { preference: "trusted_person" }, { preference: "trusted_person" }],
    ["recovery.values-choice", "compass", { values: ["Health", "Connection"], selectedMove: "reach-someone" }, { values: ["Health", "Connection"], selectedMove: "reach-someone" }],
    ["resources.contact-preparation", "bridge", { category: "housing", contactMethod: "phone" }, { category: "housing", contactMethod: "phone" }],
    ["privacy.explanation", "steward", { topicId: "sharing" }, { topicId: "sharing" }],
    ["preferences.map", "cartographer", { situations: ["uncertainty"], helps: ["one_step"], avoid: [] }, { situations: ["uncertainty"], helps: ["one_step"], avoid: [] }],
    ["learning.translation", "translator", { topicId: "cravings-and-urges", language: "es" }, { topicId: "cravings-and-urges", language: "es" }],
    ["learning.explanation", "lantern", { question: "Explain cravings in plain language." }, { question: "Explain cravings in plain language." }],
    ["practice.grounding-variation", "anchor", { question: "Offer a non-visual grounding option." }, { question: "Offer a non-visual grounding option." }],
    ["practice.low-energy-option", "rhythm", { question: "Suggest one small step." }, { question: "Suggest one small step." }],
    ["practice.breathing-cue", "breathkeeper", { message: "ignored" }, { question: BREATHKEEPER_QUESTION }],
    ["progress.reflection", "gardener", { counts: {
      savedCheckIns: 2,
      checkInsNamingASkill: 1,
      gratitudeNotes: 0,
      plansOrSupportNotes: 1,
      recoveryDaysRecorded: null,
      completedPractices: 3,
      practiceDaysLast7: 2,
    } }, { question: expect.stringContaining('"savedCheckIns":2') }],
  ])("validates and minimizes the %s route payload", (experienceId, agentId, selection, expectedPayload) => {
    expect(planWellnessExperience(experienceId, { ...selection, unexpectedPrivateText: "must not pass through" }))
      .toMatchObject({ experienceId, agentId, payload: expectedPayload });
    expect(planWellnessExperience(experienceId, { ...selection, unexpectedPrivateText: "must not pass through" }).payload)
      .not.toHaveProperty("unexpectedPrivateText");
  });

  it("routes only supported structured recovery choices and approved progress counts", () => {
    expect(planWellnessExperience("recovery.affirmation", { concern: "cravings", journal: "not shared" })).toMatchObject({
      agentId: "healer",
      payload: { concern: "cravings" },
    });
    expect(planWellnessExperience("privacy.explanation", { topicId: "sharing", uid: "not shared" })).toMatchObject({
      agentId: "steward",
      payload: { topicId: "sharing" },
    });
    expect(planWellnessExperience("practice.breathing-cue", { message: "not shared" })).toMatchObject({
      agentId: "breathkeeper",
      payload: { question: expect.stringContaining("fixed 4-second inhale and 6-second exhale") },
    });
    expect(planWellnessExperience("progress.reflection", { counts: {
      savedCheckIns: 2,
      checkInsNamingASkill: 1,
      gratitudeNotes: 0,
      plansOrSupportNotes: 1,
      recoveryDaysRecorded: null,
      completedPractices: 3,
      practiceDaysLast7: 2,
    }, journal: "not shared" })).toMatchObject({
      agentId: "gardener",
      payload: { question: expect.stringContaining('"savedCheckIns":2') },
    });
  });

  it("rejects invalid map choices, values, privacy topics, and malformed progress before invocation", async () => {
    const invalidRequests = [
      ["preferences.map", { situations: ["unlisted"], helps: ["quiet"], avoid: [] }],
      ["recovery.values-choice", { values: ["Health", "Health"], selectedMove: "reach-someone" }],
      ["privacy.explanation", { topicId: "guess" }],
      ["progress.reflection", { counts: { savedCheckIns: -1 } }],
    ];
    for (const [experienceId, selection] of invalidRequests) {
      expect(() => planWellnessExperience(experienceId, selection)).toThrow();
    }
    expect(callAgent).not.toHaveBeenCalled();
  });
});
