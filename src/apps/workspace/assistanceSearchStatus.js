const CATEGORY_LABELS = {
  housing: "housing",
  food: "food",
  funding: "financial assistance and benefits",
  programs: "treatment or recovery programs",
  emergency: "urgent-support",
  circles: "peer support",
};

/**
 * Describe the source status without presenting a curated contact as a live
 * directory result or claiming it serves the person's location.
 */
export function getAssistanceSearchStatus({ category, region = "", localCount = 0 } = {}) {
  const area = String(region || "").trim();
  const label = CATEGORY_LABELS[category] || "support";
  const hasLocalContact = localCount > 0;

  if (hasLocalContact) {
    const localCountLabel = `${localCount} ${localCount === 1 ? "contact" : "contacts"}`;
    const detail = category === "funding"
      ? "Contact them to confirm eligibility, current applications, and available assistance."
      : category === "circles"
        ? "Contact them to confirm group times and whether you can join."
        : category === "emergency"
          ? "Contact them to confirm the right local service. For immediate danger, call 911."
          : "Contact them to confirm current hours, openings, and eligibility.";
    return `${localCountLabel} listed for ${area}. ${detail}`;
  }

  if (area) {
    return `No ${label} listing with a confirmed location in ${area} is available yet. The options below are broader support pathways; contact them to ask about local help.`;
  }

  return `The options below are trusted ${label} support pathways. Contact each organization to confirm current details.`;
}

export function getCuratedSearchStatus({ category, region = "", localCount = 0 } = {}) {
  const area = String(region || "").trim();
  if (localCount > 0 && area) {
    if (category === "emergency") return `Showing listed urgent-support contacts for ${area}. For immediate danger, call 911.`;
    if (category === "circles") return `Showing listed peer-support contacts for ${area}. Call to confirm group times and whether you can join.`;
    if (category === "funding") return `Showing listed benefits contacts for ${area}. Call to confirm eligibility and current applications.`;
    return `Showing support contacts listed for ${area}. Call to confirm current details.`;
  }

  if (area) return `No listing with a confirmed location in ${area} is available for ${CATEGORY_LABELS[category] || "support"}. Broader options are shown below.`;
  return "Showing trusted support pathways. Contact each organization to confirm current details.";
}
