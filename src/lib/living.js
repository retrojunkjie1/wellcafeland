// src/lib/living.js — Living variation engine (Phase 54I). No deps.

function hash(str) {
  if (typeof str !== "string") str = String(str ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return Math.abs(h);
}

/**
 * @param {{ text: string, sessionId?: string, role?: string|null, turnId?: number }}
 * @returns {{ seed: number, turnId: number, thoughtMs: number, styleHints: string[], role: string|null, approachLevel: string, variationKey: number }}
 */
export function makeLivingMeta({ text, sessionId, role, turnId }) {
  const normalized = (text || "").toLowerCase().trim().slice(0, 500);
  const seed = (Date.now() % 100000) + hash(normalized);
  const turnIdVal = turnId ?? 0;
  const baseMs = 150 + (hash(normalized) % 1050);
  const lenMs = Math.min(800, (normalized.length || 0) * 2);
  const thoughtMs = Math.min(3500, baseMs + lenMs);
  return {
    seed: seed % 100000,
    turnId: turnIdVal,
    thoughtMs,
    styleHints: ["concise", "warm", "actionable", "no-templates"],
    role: role || null,
    approachLevel: "lite",
    variationKey: hash(normalized),
  };
}

const VARIANTS = {
  need_help: [
    "I'm here. What do you need right now—food, shelter, support, or someone to talk to?",
    "Tell me what you need (food, housing, treatment, or just to talk) and I'll point you to options.",
    "What would help most right now? You can say food, shelter, treatment, or something else.",
  ],
  ask_location: [
    "If you share your city or state, I can find options near you.",
    "Your city or state helps me show nearby resources.",
    "Where are you (city or state)? I'll tailor results.",
  ],
  offline_support: [
    "I can still help.\n- Tell me your city/state\n- Tell me what you need (food, shelter, treatment)",
    "No connection—but we're good.\n- Share your location (city/state)\n- Say what you need (food, shelter, support)",
    "Offline mode: share your city/state and what you need (food, shelter, treatment).",
  ],
  sign_in_optional: [
    "You don't need to sign in. Tell me your city/state and what you need.",
    "No sign-in required. Share your location and what you need (food, shelter, treatment).",
  ],
};

/**
 * @param {{ intent: string, key: string, n: number }}
 * @returns {string}
 */
export function pickVariantText({ intent, key, n }) {
  const list = VARIANTS[intent] || VARIANTS.need_help;
  const idx = (hash(key || "") + (n || 0)) % list.length;
  return list[idx];
}

const ROLE_PATTERNS = [
  { role: "therapist", re: /\b(you are my therapist|be my therapist|act as (my )?therapist|as my therapist)\b/i },
  { role: "doctor", re: /\b(you are my doctor|be my doctor|act as (my )?doctor|as my doctor)\b/i },
  { role: "counselor", re: /\b(you are my counselor|be my counselor|act as (my )?counselor)\b/i },
  { role: "coach", re: /\b(you are my coach|be my coach|act as (my )?coach|as my coach)\b/i },
  { role: "spiritual", re: /\b(you are my spiritual guide|spiritualist|be my spiritual guide|act as (my )?spiritual)\b/i },
];

/**
 * @param {string} text
 * @returns {{ role: string, confidence: number } | null}
 */
export function detectRoleIntent(text) {
  const t = (text || "").trim();
  if (!t) return null;
  for (const { role, re } of ROLE_PATTERNS) {
    if (re.test(t)) return { role, confidence: 0.95 };
  }
  return null;
}

const APPROACH_BY_ROLE = {
  therapist: "- I'll reflect what I'm hearing, ask 1 clarifying question, then offer 1–3 next steps.",
  doctor: "- I'll help you think through symptoms safely, suggest urgent red flags, and recommend next steps.",
  counselor: "- I'll listen, reflect back, and offer options without judgment.",
  coach: "- I'll clarify the goal, pick the next smallest step, and keep momentum.",
  spiritual: "- I'll ground you, offer a short practice, and help you find meaning without judgment.",
};

/**
 * @param {string} role
 * @returns {string}
 */
export function safeApproachForRole(role) {
  return APPROACH_BY_ROLE[role] || APPROACH_BY_ROLE.coach;
}
