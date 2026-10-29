import { getCuratedFallback, US_LOCAL_RESOURCE_CATALOG } from "@/lib/directoryCuratedFallback";

export const US_DIRECTORY_CATEGORIES = [
  { id: "programs", label: "Treatment & recovery" },
  { id: "peer", label: "Peer & community" },
  { id: "housing", label: "Housing & safe place" },
  { id: "food.essentials", label: "Food & essentials" },
  { id: "grants", label: "Funding & benefits" },
  { id: "hotlines", label: "Urgent support" },
];

// Planning target for the initial U.S. catalog, not a cap on valid records.
// Counts are unique, state-tagged resource records across the six categories;
// nationwide-only pathways are excluded from state progress.
export const US_DIRECTORY_TARGET = {
  minimumRecordsPerState: 75,
  upperPlanningRangePerState: 125,
};

export const US_JURISDICTIONS = [
  ["Alabama", "AL"], ["Alaska", "AK"], ["Arizona", "AZ"], ["Arkansas", "AR"], ["California", "CA"],
  ["Colorado", "CO"], ["Connecticut", "CT"], ["Delaware", "DE"], ["Florida", "FL"], ["Georgia", "GA"],
  ["Hawaii", "HI"], ["Idaho", "ID"], ["Illinois", "IL"], ["Indiana", "IN"], ["Iowa", "IA"], ["Kansas", "KS"],
  ["Kentucky", "KY"], ["Louisiana", "LA"], ["Maine", "ME"], ["Maryland", "MD"], ["Massachusetts", "MA"],
  ["Michigan", "MI"], ["Minnesota", "MN"], ["Mississippi", "MS"], ["Missouri", "MO"], ["Montana", "MT"],
  ["Nebraska", "NE"], ["Nevada", "NV"], ["New Hampshire", "NH"], ["New Jersey", "NJ"], ["New Mexico", "NM"],
  ["New York", "NY"], ["North Carolina", "NC"], ["North Dakota", "ND"], ["Ohio", "OH"], ["Oklahoma", "OK"],
  ["Oregon", "OR"], ["Pennsylvania", "PA"], ["Rhode Island", "RI"], ["South Carolina", "SC"], ["South Dakota", "SD"],
  ["Tennessee", "TN"], ["Texas", "TX"], ["Utah", "UT"], ["Vermont", "VT"], ["Virginia", "VA"], ["Washington", "WA"],
  ["West Virginia", "WV"], ["Wisconsin", "WI"], ["Wyoming", "WY"], ["District of Columbia", "DC"],
].map(([state, code]) => ({ state, code }));

const dedupe = (records) => records.filter((record, index) => records.findIndex((other) => other.id === record.id) === index);

export function getUSStateCoverage(stateName) {
  const jurisdiction = US_JURISDICTIONS.find((entry) => entry.state.toLowerCase() === String(stateName).toLowerCase() || entry.code.toLowerCase() === String(stateName).toLowerCase());
  if (!jurisdiction) return [];
  const categories = US_DIRECTORY_CATEGORIES.map((category) => {
    const localRecords = dedupe(US_LOCAL_RESOURCE_CATALOG[category.id] || [])
      .filter((record) => record.state === jurisdiction.code);
    const searchRecords = dedupe(getCuratedFallback(category.id, "", jurisdiction.state));
    const countywideRoutes = searchRecords.filter((record) => record.state === jurisdiction.code && record.coverageScope === "county");
    const statewideRoutes = searchRecords.filter((record) => record.state === jurisdiction.code && !record.city && record.coverageScope !== "county");
    const nationwideRoutes = searchRecords.filter((record) => !record.state && !record.city);
    const localContacts = localRecords.filter((record) => Boolean(record.city));
    return { ...category, records: dedupe([...localRecords, ...countywideRoutes, ...statewideRoutes]), localContacts, countywideRoutes, statewideRoutes, nationwideRoutes };
  });
  return categories;
}

const countStateLinkedRecords = (categories) => dedupe(categories.flatMap((category) => category.records)).length;

export const US_DIRECTORY_COVERAGE = US_JURISDICTIONS.map(({ state, code }) => {
  const categories = getUSStateCoverage(state);
  const stateLinkedRecordCount = countStateLinkedRecords(categories);
  const targetStatus = stateLinkedRecordCount < US_DIRECTORY_TARGET.minimumRecordsPerState
    ? "below-minimum"
    : stateLinkedRecordCount <= US_DIRECTORY_TARGET.upperPlanningRangePerState
      ? "in-range"
      : "above-range";
  return {
    state,
    code,
    categories,
    stateLinkedRecordCount,
    targetStatus,
    meetsMinimum: targetStatus !== "below-minimum",
    localContacts: dedupe(categories.flatMap((category) => category.localContacts)).length,
    categoriesWithLocalContacts: categories.filter((category) => category.localContacts.length > 0).length,
  };
});

export const US_COVERAGE_TOTALS = {
  jurisdictions: US_DIRECTORY_COVERAGE.length,
  categories: US_DIRECTORY_CATEGORIES.length,
  statesInTargetRange: US_DIRECTORY_COVERAGE.filter((entry) => entry.targetStatus === "in-range").length,
  statesAboveTargetRange: US_DIRECTORY_COVERAGE.filter((entry) => entry.targetStatus === "above-range").length,
  statesBelowMinimum: US_DIRECTORY_COVERAGE.filter((entry) => entry.targetStatus === "below-minimum").length,
  statesAtMinimum: US_DIRECTORY_COVERAGE.filter((entry) => entry.meetsMinimum).length,
  stateLinkedRecords: US_DIRECTORY_COVERAGE.reduce((sum, entry) => sum + entry.stateLinkedRecordCount, 0),
  jurisdictionsWithLocalContacts: US_DIRECTORY_COVERAGE.filter((entry) => entry.localContacts > 0).length,
  localContacts: US_DIRECTORY_COVERAGE.reduce((sum, entry) => sum + entry.localContacts, 0),
};
