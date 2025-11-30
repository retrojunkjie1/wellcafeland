// src/ai/human/identityModel.js
// Phase 28 — Identity Fracture Modeling
// Pure, synchronous, recovery-focused identity signals.

/**
 * Detect identity-related roles mentioned or implied in text.
 * @param {string} text
 * @returns {string[]} roles
 */
export function detectIdentityRoles(text) {
  if (!text || typeof text !== "string") return [];
  const lower = text.toLowerCase();

  const roles = new Set();

  // Performer / Masking
  if (
    lower.includes("put on a face") ||
    lower.includes("put on a mask") ||
    lower.includes("fake it") ||
    lower.includes("pretend") ||
    lower.includes("perform") ||
    lower.includes("act like everything is fine") ||
    lower.includes("act like i'm okay")
  ) {
    roles.add("performer");
  }

  // Caretaker / Rescuer
  if (
    lower.includes("take care of everyone") ||
    lower.includes("take care of everybody") ||
    lower.includes("always there for everyone") ||
    lower.includes("i'm the strong one") ||
    lower.includes("i have to be strong") ||
    lower.includes("i can't fall apart") ||
    lower.includes("i can't show weakness")
  ) {
    roles.add("caretaker");
  }

  // Survivor / Fighter
  if (
    lower.includes("survivor") ||
    lower.includes("i survived") ||
    lower.includes("i've been through hell") ||
    lower.includes("i've been through a lot") ||
    lower.includes("i had to grow up fast") ||
    lower.includes("i fought my whole life")
  ) {
    roles.add("survivor");
  }

  // Void / Numb Self
  if (
    lower.includes("feel empty") ||
    lower.includes("feel nothing") ||
    lower.includes("numb") ||
    lower.includes("hollow") ||
    lower.includes("i don't feel anything")
  ) {
    roles.add("void_self");
  }

  // Punisher / Inner critic
  if (
    lower.includes("i hate myself") ||
    lower.includes("i can't forgive myself") ||
    lower.includes("i should have known better") ||
    lower.includes("i deserve this") ||
    lower.includes("i always mess up") ||
    lower.includes("i'm a failure")
  ) {
    roles.add("punisher");
  }

  // Rebel / Saboteur
  if (
    lower.includes("i don't care anymore") ||
    lower.includes("screw it") ||
    lower.includes("fuck it") ||
    lower.includes("what's the point") ||
    lower.includes("i just want to watch it burn") ||
    lower.includes("i keep sabotaging myself")
  ) {
    roles.add("rebel");
  }

  // Abandoned / Lost child
  if (
    lower.includes("nobody ever chose me") ||
    lower.includes("nobody ever picked me") ||
    lower.includes("i was never wanted") ||
    lower.includes("i was on my own") ||
    lower.includes("i had no one") ||
    lower.includes("like a lost child")
  ) {
    roles.add("abandoned_child");
  }

  // Seeker / Hungry self
  if (
    lower.includes("trying to find myself") ||
    lower.includes("i don't know who i am") ||
    lower.includes("i'm trying to figure out who i am") ||
    lower.includes("searching for myself") ||
    lower.includes("looking for purpose") ||
    lower.includes("find my place")
  ) {
    roles.add("seeker");
  }

  // Controller
  if (
    lower.includes("i have to control everything") ||
    lower.includes("if i don't control it") ||
    lower.includes("i can't let go") ||
    lower.includes("i need everything perfect")
  ) {
    roles.add("controller");
  }

  return Array.from(roles);
}

/**
 * Detect double-life patterns – living as two different selves.
 * @param {string} text
 * @returns {string[]} flags
 */
export function detectDoubleLifePatterns(text) {
  if (!text || typeof text !== "string") return [];
  const lower = text.toLowerCase();

  const flags = [];

  if (
    lower.includes("they don't know the real me") ||
    lower.includes("if they knew who i really am") ||
    lower.includes("if they knew what i do") ||
    lower.includes("i'm a different person around them") ||
    lower.includes("i live two lives") ||
    lower.includes("double life") ||
    (lower.includes("online i'm") && lower.includes("in real life")) ||
    lower.includes("who they see is not who i am")
  ) {
    flags.push("two_lives");
  }

  if (
    lower.includes("i don't recognize myself") ||
    lower.includes("i don't know who this person is") ||
    lower.includes("this isn't me") ||
    lower.includes("i became someone else") ||
    lower.includes("i turned into someone i hate")
  ) {
    flags.push("self_alienation");
  }

  if (
    lower.includes("i'm one person at home") ||
    lower.includes("i'm a different person at work") ||
    lower.includes("with my friends i'm") ||
    lower.includes("with my family i'm")
  ) {
    flags.push("split_roles");
  }

  return flags;
}

/**
 * Estimate identity tension and dissonance scores based on language.
 * @param {string} text
 * @param {Object} [emotion]
 * @returns {{ tensionScore:number, dissonanceScore:number, summaryTag:string|null }}
 */
export function computeIdentityTension(text, emotion) {
  if (!text || typeof text !== "string") {
    return { tensionScore: 0, dissonanceScore: 0, summaryTag: null };
  }
  const lower = text.toLowerCase();

  let tension = 0;
  let dissonance = 0;
  let tag = null;

  // Parts language – “part of me”
  if (
    lower.includes("part of me wants") ||
    lower.includes("part of me says") ||
    lower.includes("another part of me") ||
    lower.includes("there's a side of me")
  ) {
    tension += 0.4;
    tag = tag || "two_sides";
  }

  // “Should” vs “want” tension
  if (
    (lower.includes("should") || lower.includes("supposed to")) &&
    (lower.includes("i want") || lower.includes("i don't want"))
  ) {
    tension += 0.3;
    dissonance += 0.3;
    tag = tag || "should_vs_want";
  }

  // “Old me” vs “new me” conflict
  if (
    lower.includes("old me") ||
    lower.includes("the old version of me") ||
    lower.includes("new me") ||
    lower.includes("the person i'm trying to be")
  ) {
    tension += 0.3;
    tag = tag || "old_self_vs_new_self";
  }

  // Self-betrayal language
  if (
    lower.includes("i betrayed myself") ||
    lower.includes("i sold myself out") ||
    lower.includes("i went against my values") ||
    lower.includes("i knew better but did it anyway")
  ) {
    dissonance += 0.5;
    tag = tag || "self_betrayal";
  }

  // Combine with emotional intensity if available
  const intensity = typeof emotion?.intensity === "number" ? emotion.intensity : 0;
  const boostedTension = Math.min(1, tension + intensity * 0.3);

  // Cap scores between 0–1
  const tensionScore = Math.min(1, Math.max(0, boostedTension));
  const dissonanceScore = Math.min(1, Math.max(0, dissonance));

  return {
    tensionScore,
    dissonanceScore,
    summaryTag: tag,
  };
}

/**
 * Main identity analysis function for a single message.
 * @param {{ content?:string, emotion?:Object }} message
 * @returns {{
 *   roles: string[],
 *   tensionScore: number,
 *   dissonanceScore: number,
 *   doubleLifeSignals: string[],
 *   summaryTag: string | null
 * }}
 */
export function analyzeIdentitySignals(message) {
  try {
    const text =
      (message && typeof message.content === "string" && message.content.trim()) || "";
    if (!text) {
      return {
        roles: [],
        tensionScore: 0,
        dissonanceScore: 0,
        doubleLifeSignals: [],
        summaryTag: null,
      };
    }

    const roles = detectIdentityRoles(text);
    const doubleLifeSignals = detectDoubleLifePatterns(text);
    const { tensionScore, dissonanceScore, summaryTag } = computeIdentityTension(
      text,
      message.emotion || null
    );

    return {
      roles,
      tensionScore,
      dissonanceScore,
      doubleLifeSignals,
      summaryTag,
    };
  } catch (err) {
    console.warn("[identityModel] analyzeIdentitySignals failed:", err);
    return {
      roles: [],
      tensionScore: 0,
      dissonanceScore: 0,
      doubleLifeSignals: [],
      summaryTag: null,
    };
  }
}

/**
 * Build a compact identity snapshot for timelines / graphs.
 * @param {Object} message
 */
export function buildIdentitySnapshot(message) {
  const identity = message?.identity || {};
  return {
    id: message?.id || null,
    timestamp: message?.timestamp || Date.now(),
    roles: Array.isArray(identity.roles) ? identity.roles : [],
    tensionScore:
      typeof identity.tensionScore === "number" ? identity.tensionScore : 0,
    dissonanceScore:
      typeof identity.dissonanceScore === "number" ? identity.dissonanceScore : 0,
    summaryTag: identity.summaryTag || null,
  };
}

export default {
  detectIdentityRoles,
  detectDoubleLifePatterns,
  computeIdentityTension,
  analyzeIdentitySignals,
  buildIdentitySnapshot,
};


