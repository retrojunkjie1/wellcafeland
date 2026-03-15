/**
 * Produces 72-hour stabilization + 14-day runway with daily plan items.
 * Micro-steps, 2–7 minutes, tagged Body/Mind/Spirit.
 */

const { matchInterventions } = require("./InterventionsLibrary");

function generateCarePlanItems(formulation, interventions, sessionId) {
  const items = [];
  const day0 = new Date();
  day0.setHours(0, 0, 0, 0);

  const bodyInterventions = interventions.filter((i) => i.domain === "body");
  const mindInterventions = interventions.filter((i) => i.domain === "mind");
  const spiritInterventions = interventions.filter((i) => i.domain === "spirit");

  for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
    const domains = ["body", "mind", "spirit"];
    for (const domain of domains) {
      const pool = domain === "body" ? bodyInterventions : domain === "mind" ? mindInterventions : spiritInterventions;
      const pick = pool[dayIndex % Math.max(pool.length, 1)] || pool[0];
      if (!pick) continue;

      const itemId = `item_${sessionId}_d${dayIndex}_${domain}`;
      items.push({
        id: itemId,
        dayIndex,
        domain,
        interventionId: pick.id,
        title: pick.title,
        steps: pick.steps,
        durationMinutes: pick.durationMinutes,
        measurementPrompt: `How did ${pick.title} feel today?`,
        createdAt: new Date(day0.getTime() + dayIndex * 86400000),
      });
    }
  }

  return items.slice(0, 42);
}

function buildCarePlan(formulation, interventions, sessionId) {
  const items = generateCarePlanItems(formulation, interventions, sessionId);

  const day0Items = items.filter((i) => i.dayIndex === 0);
  const firstThree = day0Items.slice(0, 3);

  return {
    sessionId,
    formulationId: sessionId,
    items,
    firstThree,
    horizon72h: items.filter((i) => i.dayIndex < 3),
    horizon14d: items,
    createdAt: new Date(),
  };
}

module.exports = { buildCarePlan, generateCarePlanItems };
