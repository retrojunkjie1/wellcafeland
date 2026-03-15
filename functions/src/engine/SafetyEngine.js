/**
 * Risk stratification (green/yellow/orange/red) with conservative rules.
 * Red triggers escalation guidance; never diagnostic.
 */

const ESCALATION_PHRASE = "If you feel unsafe or might harm yourself or others, call local emergency services or a crisis line immediately.";

function stratifyRisk(answers) {
  const drivers = [];
  const protective = [];
  let level = "green";

  const text = String(answers.rawText || answers.freeText || "").toLowerCase();
  const concerns = (answers.concerns || []).map((c) => String(c).toLowerCase());
  const support = String(answers.support || "some").toLowerCase();
  const safety = String(answers.safety || "").toLowerCase();

  if (safety.includes("unsafe") || safety.includes("harm") || safety.includes("suicid") || safety.includes("hurt myself") || safety.includes("hurt others")) {
    level = "red";
    drivers.push("safety_indicator");
  }

  if (text.includes("want to die") || text.includes("end it") || text.includes("kill myself") || text.includes("no way out")) {
    level = "red";
    drivers.push("crisis_language");
  }

  if (support === "none" || support === "no one") {
    protective.push("low_support");
    if (level === "green") level = "yellow";
  }

  if (concerns.includes("suicide") || concerns.includes("self-harm")) {
    level = "red";
    drivers.push("concern_flagged");
  }

  if (concerns.includes("crisis") || concerns.includes("emergency")) {
    if (level !== "red") level = "orange";
    drivers.push("crisis_concern");
  }

  if (level === "green" && (concerns.includes("anxiety") || concerns.includes("stress"))) {
    protective.push("identified_concerns");
  }

  return {
    level,
    drivers,
    protective,
    escalationPhrase: level === "red" || level === "orange" ? ESCALATION_PHRASE : null,
  };
}

function requiresEscalationScreen(risk) {
  return risk && (risk.level === "red" || risk.level === "orange");
}

function blocksCasualCoaching(risk) {
  return risk && risk.level === "red";
}

module.exports = { stratifyRisk, requiresEscalationScreen, blocksCasualCoaching, ESCALATION_PHRASE };
