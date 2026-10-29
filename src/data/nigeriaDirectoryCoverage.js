import {
  NIGERIA_FOOD_RESOURCES,
  NIGERIA_FOOD_STATE_REFERRALS,
  NIGERIA_FUNDING_RESOURCES,
  NIGERIA_HOUSING_RESOURCES,
  NIGERIA_LOCAL_RECOVERY_RESOURCES,
  NIGERIA_PEER_RESOURCES,
  NIGERIA_STATE_BENEFIT_CONTACTS,
  NIGERIA_STATE_RECOVERY_SERVICES,
  NIGERIA_STATES,
  NIGERIA_URGENT_RESOURCES,
} from "./nigeriaRecoveryDirectory.js";

export const NIGERIA_DIRECTORY_CATEGORIES = [
  { id: "programs", label: "Treatment & recovery" },
  { id: "circles", label: "Peer & community" },
  { id: "housing", label: "Housing & safe place" },
  { id: "food", label: "Food & essentials" },
  { id: "funding", label: "Funding & benefits" },
  { id: "emergency", label: "Urgent support" },
];

const STATES = [...new Set(NIGERIA_STATES.filter((state) => state !== "FCT"))];
const SOURCES_BY_CATEGORY = {
  programs: NIGERIA_LOCAL_RECOVERY_RESOURCES,
  circles: [
    ...NIGERIA_PEER_RESOURCES,
    ...NIGERIA_LOCAL_RECOVERY_RESOURCES.filter((item) => /peer|meeting|group/i.test(item.resourceType || "")),
  ],
  housing: NIGERIA_HOUSING_RESOURCES,
  food: [...NIGERIA_FOOD_RESOURCES, ...NIGERIA_FOOD_STATE_REFERRALS],
  funding: [...NIGERIA_FUNDING_RESOURCES, ...NIGERIA_STATE_BENEFIT_CONTACTS],
  emergency: NIGERIA_URGENT_RESOURCES,
};

const normalized = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");
const normalizedState = (value) => {
  const key = normalized(value);
  return key === "fct" || key === "abuja" || key === "federalcapitalterritory" ? "federalcapitalterritory" : key;
};

const NDLEA_COVERED_STATE_KEYS = new Set(
  NIGERIA_STATE_RECOVERY_SERVICES.map((record) => normalizedState(record.state)),
);
export const NIGERIA_NDLEA_SOURCE_GAPS = NIGERIA_STATES
  .filter((state) => state !== "FCT" && !NDLEA_COVERED_STATE_KEYS.has(normalizedState(state)));

function recordState(record) {
  const explicit = record.state || record.subdivision || "";
  if (explicit) return normalizedState(explicit);
  // Do not infer a state from descriptive copy or a list of example cities:
  // national routes often name cities they can refer callers to. Only a
  // genuinely localized region can associate a record with a jurisdiction.
  const region = String(record.region || "").trim();
  if (!region || /^(nigeria|nationwide|nigeria-wide)$/i.test(region)) return "";
  const location = region.toLowerCase();
  if (/(^|[^a-z])abuja([^a-z]|$)/.test(location)) return "federalcapitalterritory";
  const state = STATES
    .filter((candidate) => candidate !== "Federal Capital Territory")
    .find((candidate) => new RegExp(`(^|[^a-z])${candidate.toLowerCase()}([^a-z]|$)`).test(location));
  return state ? normalizedState(state) : "";
}

function isLocalContact(record) {
  // A state office, hotline, meeting finder, or referral route can have a
  // city attached without being a local service location. Keep those routes
  // separate from service/provider contacts in the coverage counts.
  if (["state-referral", "national-referral", "meeting-finder", "administrative-office"].includes(record.directoryRole)) return false;
  return Boolean(record.city) && !/nationwide|nigeria-wide|statewide/i.test(`${record.region || ""} ${record.locationLine || ""}`);
}

function isReferral(record) {
  return !isLocalContact(record);
}

function isNigeriaWide(record) {
  const jurisdiction = normalizedState(record.state || record.subdivision || "");
  const scope = `${record.region || ""} ${record.locationLine || ""}`;
  return !jurisdiction && record.country === "Nigeria" && /(^|\b)nigeria(\b|$)|nigeria-wide|nationwide|across nigeria|all 36 states|all states/i.test(scope);
}

export function getNigeriaStateCoverage(stateName) {
  const stateKey = normalizedState(stateName);
  return NIGERIA_DIRECTORY_CATEGORIES.map((category) => {
    const records = (SOURCES_BY_CATEGORY[category.id] || [])
      .filter((item) => recordState(item) === stateKey)
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
    const localContacts = records.filter((item) => isLocalContact(item) && !isReferral(item));
    const referralRoutes = records.filter((item) => !localContacts.includes(item));
    const independentChecks = records.filter((item) => item.independentSourceUrl && item.independentlyVerifiedAt);
    const nationalRoutes = (SOURCES_BY_CATEGORY[category.id] || [])
      .filter((item) => isNigeriaWide(item))
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
    return { ...category, records, localContacts, referralRoutes, independentChecks, nationalRoutes };
  });
}

export const NIGERIA_DIRECTORY_COVERAGE = STATES.map((state) => {
  const categories = getNigeriaStateCoverage(state);
  return {
    state,
    categories,
    records: categories.reduce((count, category) => count + category.records.length, 0),
    independentChecks: categories.reduce((count, category) => count + category.independentChecks.length, 0),
  };
});

export const NIGERIA_COVERAGE_TOTALS = {
  jurisdictions: NIGERIA_DIRECTORY_COVERAGE.length,
  categories: NIGERIA_DIRECTORY_CATEGORIES.length,
  independentlyVerifiedJurisdictions: NIGERIA_DIRECTORY_COVERAGE.filter((item) => item.independentChecks > 0).length,
  stateCommandEntries: NIGERIA_STATE_RECOVERY_SERVICES.length,
  statesWithNdleaContact: NIGERIA_STATE_RECOVERY_SERVICES.filter((record) => normalizedState(record.state) !== "federalcapitalterritory").length,
  localServiceContacts: NIGERIA_DIRECTORY_COVERAGE.reduce((sum, state) => sum + state.categories.reduce((count, category) => count + category.localContacts.length, 0), 0),
  stateReferralRoutes: NIGERIA_DIRECTORY_COVERAGE.reduce((sum, state) => sum + state.categories.reduce((count, category) => count + category.referralRoutes.length, 0), 0),
};
