/**
 * Deterministic pathway cards returned when RapidAPI is circuit-open or unavailable.
 * Ensures the OS never goes "dead" — always returns actionable guidance.
 */

const PATHWAY_CARDS = [
  {
    id: "pathway-crisis",
    title: "Crisis Support",
    category: "crisis",
    description: "If you feel unsafe or might harm yourself or others, call local emergency services or a crisis line immediately.",
    actionText: "Call 988 or local emergency services",
    searchHint: "988 Suicide & Crisis Lifeline — call or text 24/7",
    priority: 1,
    url: "https://988lifeline.org",
  },
  {
    id: "pathway-housing",
    title: "Housing & Shelter",
    category: "housing",
    description: "Call 2-1-1 (United Way) for local housing and shelter resources.",
    actionText: "Dial 211",
    searchHint: "211 + your city or state",
    priority: 2,
    url: "https://www.211.org",
  },
  {
    id: "pathway-treatment",
    title: "Treatment & Programs",
    category: "treatment",
    description: "Search: SAMHSA FindTreatment for treatment locator and program options.",
    actionText: "Find treatment",
    searchHint: "SAMHSA FindTreatment",
    priority: 3,
    url: "https://findtreatment.gov",
  },
  {
    id: "pathway-recovery",
    title: "Recovery Support",
    category: "recovery",
    description: "Search: SMART Recovery meetings or NA meetings near me.",
    actionText: "Find meetings",
    searchHint: "SMART Recovery meetings, NA meetings near me",
    priority: 4,
    url: "https://www.smartrecovery.org",
  },
  {
    id: "pathway-financial",
    title: "Financial Assistance",
    category: "financial",
    description: "Search: state benefits portal + your state + Medicaid or SNAP.",
    actionText: "Find benefits",
    searchHint: "state benefits portal [your state] Medicaid SNAP",
    priority: 5,
    url: "https://www.medicaid.gov",
  },
];

function getPathwayCardsForQuery(query, domain) {
  const q = (query || "").toLowerCase().trim();
  const d = (domain || "").toLowerCase();
  const domainMap = {
    housing: "housing",
    grants: "financial",
    programs: "treatment",
    assistance: "treatment",
    hotlines: "crisis",
    "food.essentials": "financial",
  };
  const preferredCategory = domainMap[d] || null;
  let cards = [...PATHWAY_CARDS];
  if (preferredCategory) {
    const preferred = cards.filter((c) => c.category === preferredCategory);
    const rest = cards.filter((c) => c.category !== preferredCategory);
    cards = [...preferred, ...rest];
  }
  if (q.length >= 2) {
    const matches = cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.searchHint.toLowerCase().includes(q) ||
        c.category.includes(q)
    );
    if (matches.length > 0) cards = matches;
  }
  return cards.slice(0, 10).map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    description: c.description,
    actionText: c.actionText,
    searchHint: c.searchHint,
    priority: c.priority,
    url: c.url,
    source: "WellnessCafe",
    verified: true,
  }));
}

module.exports = { PATHWAY_CARDS, getPathwayCardsForQuery };
