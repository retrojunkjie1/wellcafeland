/**
 * Evidence-based micro-interventions with contraindications and when-to-use.
 * Deterministic, no external model dependency.
 */

const INTERVENTIONS = [
  { id: "breath-4-7-8", domain: "body", title: "4-7-8 Breath", durationMinutes: 2, goal: "Calm nervous system", steps: ["Breathe in 4 counts", "Hold 7 counts", "Exhale 8 counts", "Repeat 4 times"], whenToUse: ["anxiety", "stress", "sleep prep"], avoidWhen: ["acute respiratory distress"], tags: ["breathing", "regulation"] },
  { id: "grounding-5-4-3-2-1", domain: "mind", title: "5-4-3-2-1 Grounding", durationMinutes: 3, goal: "Anchor in present moment", steps: ["Name 5 things you see", "4 you hear", "3 you touch", "2 you smell", "1 you taste"], whenToUse: ["dissociation", "anxiety", "overwhelm"], avoidWhen: [], tags: ["grounding", "trauma-informed"] },
  { id: "urge-surf-60", domain: "mind", title: "Urge Surfing (60 sec)", durationMinutes: 2, goal: "Ride urge without acting", steps: ["Notice the urge", "Breathe", "Watch it rise and fall", "Do not act for 60 seconds"], whenToUse: ["craving", "impulse"], avoidWhen: ["acute danger"], tags: ["recovery", "DBT"] },
  { id: "self-compassion-phrase", domain: "spirit", title: "Self-Compassion Phrase", durationMinutes: 2, goal: "Kind self-talk", steps: ["Place hand on heart", "Say: I am doing the best I can today", "Breathe", "Repeat if needed"], whenToUse: ["shame", "self-criticism"], avoidWhen: [], tags: ["ACT", "compassion"] },
  { id: "values-check", domain: "spirit", title: "Values Check-In", durationMinutes: 5, goal: "Connect to what matters", steps: ["Name one value that matters today", "One small action aligned with it", "Commit to that step"], whenToUse: ["direction", "meaning"], avoidWhen: ["acute crisis"], tags: ["ACT", "meaning"] },
  { id: "body-scan-brief", domain: "body", title: "Brief Body Scan", durationMinutes: 5, goal: "Notice sensations without judgment", steps: ["Feet to head", "Notice each area", "No fixing", "Breathe"], whenToUse: ["tension", "disconnection"], avoidWhen: ["trauma flashback"], tags: ["body", "trauma-informed"] },
  { id: "mi-open-question", domain: "mind", title: "Motivational Open Question", durationMinutes: 3, goal: "Explore readiness", steps: ["What would a small win look like today?", "What support do you have?", "What gets in the way?"], whenToUse: ["low commitment", "ambivalence"], avoidWhen: ["crisis"], tags: ["MI", "motivation"] },
  { id: "opposite-action", domain: "mind", title: "Opposite Action", durationMinutes: 5, goal: "Act opposite to urge", steps: ["Identify urge", "Identify opposite action", "Do it for 2 minutes"], whenToUse: ["avoidance", "withdrawal"], avoidWhen: ["safety risk"], tags: ["DBT"] },
  { id: "gratitude-three", domain: "spirit", title: "Three Gratitudes", durationMinutes: 3, goal: "Shift focus to support", steps: ["Name 3 things you are grateful for today", "One can be small"], whenToUse: ["low mood", "isolation"], avoidWhen: [], tags: ["positive", "meaning"] },
  { id: "cold-water-face", domain: "body", title: "Cold Water Face Dip", durationMinutes: 1, goal: "Activate dive reflex", steps: ["Splash cold water on face", "Or hold cold compress to eyes 30 sec"], whenToUse: ["acute distress", "panic"], avoidWhen: ["heart condition"], tags: ["TIPP", "DBT"] },
];

function getInterventionsForDomain(domain) {
  return INTERVENTIONS.filter((i) => i.domain === domain);
}

function getInterventionById(id) {
  return INTERVENTIONS.find((i) => i.id === id) || null;
}

function matchInterventions(answers, contraindications = []) {
  const avoid = new Set(contraindications.flatMap((c) => c.toLowerCase().split(/\s+/)));
  const concerns = (answers.concerns || []).map((c) => String(c).toLowerCase());
  const commitment = (answers.commitment || "medium").toLowerCase();
  const support = (answers.support || "some").toLowerCase();

  let pool = [...INTERVENTIONS];
  pool = pool.filter((i) => !i.avoidWhen.some((a) => avoid.has(a.toLowerCase())));

  const scored = pool.map((i) => {
    let score = 0;
    const when = i.whenToUse.map((w) => w.toLowerCase());
    if (concerns.some((c) => when.some((w) => w.includes(c) || c.includes(w)))) score += 2;
    if (commitment === "low" && i.tags.includes("MI")) score += 1;
    if (support === "low" && i.durationMinutes <= 3) score += 1;
    if (i.domain === "body") score += 0.5;
    return { ...i, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map(({ score, ...i }) => i);
}

module.exports = { INTERVENTIONS, getInterventionsForDomain, getInterventionById, matchInterventions };
