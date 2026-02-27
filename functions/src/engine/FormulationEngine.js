/**
 * Answers -> clinical formulation (biopsychosocial + spiritual).
 * Deterministic, non-diagnostic, wellness-coaching language.
 */

const STAGES = ["precontemplation", "contemplation", "preparation", "action", "maintenance"];

function inferStage(answers) {
  const commitment = String(answers.commitment || "medium").toLowerCase();
  const map = { low: "contemplation", medium: "preparation", high: "action", very_high: "maintenance" };
  return map[commitment] || "preparation";
}

function buildFormulation(answers, risk) {
  const concerns = answers.concerns || [];
  const support = answers.support || "some";
  const stage = inferStage(answers);

  const maintainingFactors = [];
  if (support !== "none") maintainingFactors.push("support_available");
  if (concerns.length > 0) maintainingFactors.push("concerns_identified");

  const protectiveFactors = [];
  if (support === "strong" || support === "some") protectiveFactors.push("social_support");
  if (stage !== "precontemplation") protectiveFactors.push("readiness");

  const contraindications = [];
  if (answers.traumaSensitive === true) contraindications.push("trauma flashback");
  if (risk && risk.level === "red") contraindications.push("acute crisis");

  const recommendedPathways = [];
  if (risk && risk.level === "green") recommendedPathways.push("stabilization", "habits", "growth");
  else if (risk && risk.level === "yellow") recommendedPathways.push("stabilization", "support");
  else if (risk && risk.level === "orange" || risk.level === "red") recommendedPathways.push("safety_first");

  const toneDirectives = {
    avoidShame: true,
    avoidPressure: true,
    favorRegulation: true,
    smallSteps: true,
    todayFocused: true,
  };

  const headline = concerns.length > 0
    ? `Focusing on ${concerns.slice(0, 2).join(" and ")} with small steps today.`
    : "Building stability with small steps today.";

  const todayPriority = risk && risk.level !== "green"
    ? "Safety and stability first."
    : "One small win today.";

  const focus = concerns.slice(0, 3);
  if (focus.length === 0) focus.push("stability");

  return {
    stageOfChange: stage,
    risk: risk || { level: "green", drivers: [], protective: [] },
    maintainingFactors,
    protectiveFactors,
    recommendedPathways,
    contraindications,
    toneDirectives,
    summary: {
      headline,
      todayPriority,
      focus,
    },
  };
}

module.exports = { buildFormulation, inferStage };
