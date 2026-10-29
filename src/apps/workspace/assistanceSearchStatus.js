const CATEGORY_LABELS = {
  housing: "housing",
  food: "food",
  funding: "financial assistance and benefits",
  programs: "treatment or recovery programs",
  emergency: "urgent-support",
  circles: "peer support",
};

/** Keep transport and backend codes out of the client-facing help experience. */
export function getFriendlySearchFailure(error) {
  const message = String(error?.message || error || "").trim();
  if (!message) return "We couldn’t load new matches just now. Your search is still here; use the contacts below or try again shortly.";
  if (/\b(?:status\s*)?5\d\d\b|\b(?:http|internal|unavailable|deadline-exceeded|failed to fetch)\b|functions\/|firebase|rapidapi/i.test(message)) {
    return "We couldn’t load new matches just now. Your search is still here; use the contacts below or try again shortly.";
  }
  return message;
}

/**
 * Describe the source status without presenting a curated contact as a live
 * directory result or claiming it serves the person's location.
 */
export function getAssistanceSearchStatus({ category, region = "", localCount = 0, international = false } = {}) {
  const area = String(region || "").trim();
  const label = CATEGORY_LABELS[category] || "support";
  const hasLocalContact = localCount > 0;

  if (hasLocalContact) {
    if (category === "circles") {
      return "Use these meeting details to find a group and ask about joining. Local health services and recovery communities may know about additional groups.";
    }
    const localCountLabel = `${localCount} ${localCount === 1 ? "contact" : "contacts"}`;
    const detail = category === "funding"
      ? "Contact them to confirm eligibility, current applications, and available assistance."
      : category === "circles"
        ? "Use these meeting details to find a group and ask about joining. Local health services and recovery communities may know about additional groups."
        : category === "emergency"
          ? "Contact them to confirm the right local service. For immediate danger, call 911."
          : "Contact them to confirm current hours, openings, and eligibility.";
    return `${localCountLabel} listed for ${area}. ${detail}`;
  }

  if (area) {
    if (international) {
      return category === "circles"
        ? `Explore the groups below and ask whether they can connect you with peer support in ${area}. More local groups may be available through community organizations.`
        : `Explore the organizations below and contact them to ask about services available in ${area}.`;
    }
    return `Explore the organizations below and contact them to ask about services available in ${area}.`;
  }

  return `Explore these ${label} organizations and contact them to confirm current details.`;
}

export function getCuratedSearchStatus({ category, region = "", localCount = 0, international = false } = {}) {
  const area = String(region || "").trim();
  if (localCount > 0 && area) {
    if (category === "emergency") return `Showing listed urgent-support contacts for ${area}. For immediate danger, call 911.`;
    if (category === "circles") return `Showing listed peer-support contacts for ${area}. Call to confirm group times and whether you can join.`;
    if (category === "funding") return `Showing listed benefits contacts for ${area}. Call to confirm eligibility and current applications.`;
    return `Showing support contacts listed for ${area}. Call to confirm current details.`;
  }

  if (area && international) return `Explore the organizations below and contact them to ask about ${CATEGORY_LABELS[category] || "support"} available in ${area}.`;
  if (area) return `Explore the organizations below and ask which services are available in ${area}.`;
  return "Explore these support organizations and contact them to confirm current details.";
}
