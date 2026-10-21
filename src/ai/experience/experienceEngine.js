import { callAgent } from "@/ai/agents/agentClient";

/**
 * Choice-led routes for the support experience.
 *
 * The engine does not inspect free text, infer a clinical state, read history,
 * or fan a request out to multiple agents. Each route forwards one explicit
 * selection to one specialist through the canonical callAgent entry point.
 */
const EXPERIENCE_ROUTES = Object.freeze({
  "patterns.client-review": Object.freeze({
    agentId: "seer",
    buildPayload(selection) {
      const fields = ["mood", "cravingIntensity", "triggerIntensity", "energy", "stress", "sleep"];
      const selectedFields = selection?.selectedFields;
      const entries = selection?.entries;
      if (selection?.consent !== true || !Array.isArray(selectedFields) || selectedFields.length < 1 || selectedFields.length > fields.length
        || new Set(selectedFields).size !== selectedFields.length || selectedFields.some((field) => !fields.includes(field))
        || !Array.isArray(entries) || entries.length < 3 || entries.length > 20) {
        throw invalidRequest("Choose the details to share and confirm before asking for a review.", "INVALID_EXPERIENCE_SELECTION");
      }
      const allowedMoods = ["excellent", "good", "okay", "difficult", "challenging"];
      const normalizedEntries = entries.map((entry) => {
        if (!entry || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
          || !entry.fields || typeof entry.fields !== "object" || Array.isArray(entry.fields)) {
          throw invalidRequest("The selected check-in details could not be prepared.", "INVALID_EXPERIENCE_SELECTION");
        }
        const normalizedFields = {};
        for (const key of selectedFields) {
          const value = entry.fields[key];
          if (key === "mood" && allowedMoods.includes(value)) normalizedFields[key] = value;
          if (key !== "mood" && Number.isInteger(value) && value >= 0 && value <= 10) normalizedFields[key] = value;
        }
        return { date: entry.date, fields: normalizedFields };
      }).filter((entry) => Object.keys(entry.fields).length > 0);
      if (normalizedEntries.length < 3) throw invalidRequest("At least three saved check-ins need one of the selected details.", "INVALID_EXPERIENCE_SELECTION");
      return { clientPatternReview: { consent: true, selectedFields: [...selectedFields], entries: normalizedEntries } };
    },
  }),
  "patterns.meaning-reflection": Object.freeze({
    agentId: "oracle",
    buildPayload(selection) {
      const insight = requireBoundedText(selection, "insight", 500);
      if (selection?.consent !== true) throw invalidRequest("Confirm before sharing this observation for a reflection.", "INVALID_EXPERIENCE_SELECTION");
      return {
        question: "Offer a brief, non-clinical reflection on this observation. Explain that it may or may not feel meaningful to the person. End with one optional question. Do not infer causes, safety risk, diagnosis, treatment needs, or what the person should do.",
        memory: { selectedSeerObservation: insight },
      };
    },
  }),
  "support.human-route": Object.freeze({
    agentId: "sentinel",
    selectionKey: "supportNeed",
    choices: Object.freeze(["immediate-danger", "need-a-person", "unsure"]),
  }),
  "support.companion": Object.freeze({
    agentId: "hearth",
    selectionKey: "choice",
    choices: Object.freeze(["quiet-company", "miss-someone", "feel-disconnected", "not-sure"]),
  }),
  "support.early-option": Object.freeze({
    agentId: "lighthouse",
    selectionKey: "cue",
    choices: Object.freeze(["thoughts-racing", "body-tense", "restless", "urge-building", "pulling-away", "not-sure"]),
  }),
  "recovery.affirmation": Object.freeze({
    agentId: "healer",
    buildPayload(selection) {
      return { concern: requireChoice(selection, "concern", ["anxiety", "cravings", "shame", "sleep", "grief", "self-worth"]) };
    },
  }),
  "community.connection-option": Object.freeze({
    agentId: "shepherd",
    buildPayload(selection) {
      return { preference: requireChoice(selection, "preference", ["browse_first", "peer_circle", "trusted_person", "not_sure"]) };
    },
  }),
  "recovery.values-choice": Object.freeze({
    agentId: "compass",
    buildPayload(selection) {
      const values = selection?.values;
      if (!Array.isArray(values) || values.length < 1 || values.length > 3
        || new Set(values).size !== values.length
        || values.some((value) => !["Health", "Connection", "Family", "Stability", "Freedom", "Creativity", "Rest", "Growth"].includes(value))) {
        throw invalidRequest("Choose one to three values from the list.", "INVALID_EXPERIENCE_SELECTION");
      }
      return {
        values: [...values],
        selectedMove: requireChoice(selection, "selectedMove", ["create-distance", "reach-someone", "hands-busy", "basic-need"]),
      };
    },
  }),
  "resources.contact-preparation": Object.freeze({
    agentId: "bridge",
    buildPayload(selection) {
      return {
        category: requireChoice(selection, "category", ["housing", "food", "funding", "programs", "circles"]),
        contactMethod: requireChoice(selection, "contactMethod", ["phone", "website"]),
      };
    },
  }),
  "privacy.explanation": Object.freeze({
    agentId: "steward",
    buildPayload(selection) {
      return { topicId: requireChoice(selection, "topicId", ["export", "sharing", "deletion", "retention"]) };
    },
  }),
  "preferences.map": Object.freeze({
    agentId: "cartographer",
    buildPayload(selection) {
      const allowed = {
        situations: ["uncertainty", "low_energy", "strong_urge", "disconnection", "difficult_conversation", "sleep_disruption"],
        helps: ["one_step", "quiet", "grounding", "natural_breath", "trusted_person", "writing", "movement", "learning"],
        avoid: ["forced_positivity", "long_explanations", "breath_counting", "spiritual_language", "pressure_to_contact", "advice_without_asking"],
      };
      const normalized = {};
      for (const key of Object.keys(allowed)) {
        const values = selection?.[key] ?? (key === "avoid" ? [] : null);
        if (!Array.isArray(values) || values.length > 4 || new Set(values).size !== values.length
          || values.some((value) => !allowed[key].includes(value))) {
          throw invalidRequest("Choose from the support-map options shown.", "INVALID_EXPERIENCE_SELECTION");
        }
        if (key !== "avoid" && values.length === 0) {
          throw invalidRequest("Choose at least one situation and one support.", "INVALID_EXPERIENCE_SELECTION");
        }
        normalized[key] = [...values];
      }
      return normalized;
    },
  }),
  "learning.translation": Object.freeze({
    agentId: "translator",
    buildPayload(selection) {
      return {
        topicId: requireChoice(selection, "topicId", ["shame-and-recovery", "cravings-and-urges", "nervous-system-regulation", "trauma-and-recovery", "sleep-and-recovery", "boundaries-in-recovery", "grief-and-loss", "self-compassion"]),
        language: requireChoice(selection, "language", ["es", "fr", "pt"]),
      };
    },
  }),
  "learning.explanation": Object.freeze({
    agentId: "lantern",
    buildPayload(selection) {
      return { question: requireBoundedText(selection, "question", 1800) };
    },
  }),
  "practice.grounding-variation": Object.freeze({
    agentId: "anchor",
    buildPayload(selection) {
      return { question: requireBoundedText(selection, "question", 900) };
    },
  }),
  "practice.low-energy-option": Object.freeze({
    agentId: "rhythm",
    buildPayload(selection) {
      return { question: requireBoundedText(selection, "question", 900) };
    },
  }),
  "practice.breathing-cue": Object.freeze({
    agentId: "breathkeeper",
    buildPayload() {
      return { question: BREATHKEEPER_QUESTION };
    },
  }),
  "progress.reflection": Object.freeze({
    agentId: "gardener",
    buildPayload(selection) {
      const counts = selection?.counts;
      const countKeys = ["savedCheckIns", "checkInsNamingASkill", "gratitudeNotes", "plansOrSupportNotes", "completedPractices", "practiceDaysLast7"];
      if (!counts || typeof counts !== "object" || Array.isArray(counts)
        || countKeys.some((key) => !Number.isSafeInteger(counts[key]) || counts[key] < 0)
        || !(counts.recoveryDaysRecorded === null || (Number.isSafeInteger(counts.recoveryDaysRecorded) && counts.recoveryDaysRecorded >= 0))) {
        throw invalidRequest("The selected progress summary is unavailable. Refresh it and try again.", "INVALID_EXPERIENCE_SELECTION");
      }
      const summary = Object.fromEntries([...countKeys, "recoveryDaysRecorded"].map((key) => [key, counts[key]]));
      return {
        question: `The person explicitly asked for a reflection on these self-recorded aggregate counts: ${JSON.stringify(summary)}. Recognize only effort reasonably represented by these counts. Do not infer clinical progress, recovery status, or personal meaning.`,
      };
    },
  }),
});

export const BREATHKEEPER_QUESTION = "Offer one short, choice-led supportive cue before a gentle breathing practice. The existing practice has a fixed 4-second inhale and 6-second exhale. Do not change or narrate the timed rhythm, add breath holds, or describe medical effects. Do not assume how the person feels. Keep the invitation to one sentence and under 20 words.";

function invalidRequest(message, code = "INVALID_EXPERIENCE_REQUEST") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function requireChoice(selection, key, choices) {
  const value = selection?.[key];
  if (typeof value !== "string" || !choices.includes(value)) {
    throw invalidRequest("Choose one of the available options.", "INVALID_EXPERIENCE_SELECTION");
  }
  return value;
}

function requireBoundedText(selection, key, maxLength) {
  const value = selection?.[key];
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw invalidRequest("This selected guide is unavailable. Choose an option and try again.", "INVALID_EXPERIENCE_SELECTION");
  }
  return value.trim();
}

/** Build a minimal route plan from an explicit user-selected support option. */
export function planWellnessExperience(experienceId, selection = {}) {
  const route = EXPERIENCE_ROUTES[experienceId];
  if (!route) throw invalidRequest("Choose an available WellnessCafe support option.", "UNKNOWN_EXPERIENCE");

  const payload = route.buildPayload
    ? route.buildPayload(selection)
    : { [route.selectionKey]: requireChoice(selection, route.selectionKey, route.choices) };

  return Object.freeze({
    experienceId,
    agentId: route.agentId,
    payload: Object.freeze(payload),
  });
}

/** Execute one choice-led specialist route; no content or history is forwarded. */
export async function runWellnessExperience(experienceId, selection = {}) {
  const plan = planWellnessExperience(experienceId, selection);
  const response = await callAgent(plan.agentId, plan.payload);
  return {
    experienceId: plan.experienceId,
    agentId: plan.agentId,
    result: response?.result || response || {},
  };
}

export const WELLNESS_EXPERIENCE_IDS = Object.freeze(Object.keys(EXPERIENCE_ROUTES));
