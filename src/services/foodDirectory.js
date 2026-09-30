import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";
// Project owner reviewed the two FeedAM license pages and directed us to use
// CC BY-SA 4.0 as the canonical internal attribution for this integration.
// Keep license/API implementation details out of the user-facing results.
const FEEDAM_DATA_LICENSE = "CC BY-SA 4.0";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 40;
const US_STATE_CODES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const STATE_NAME_TO_CODE = new Map(Object.entries({
  ALABAMA: "AL", ALASKA: "AK", ARIZONA: "AZ", ARKANSAS: "AR", CALIFORNIA: "CA", COLORADO: "CO", CONNECTICUT: "CT", DELAWARE: "DE", FLORIDA: "FL", GEORGIA: "GA", HAWAII: "HI", IDAHO: "ID", ILLINOIS: "IL", INDIANA: "IN", IOWA: "IA", KANSAS: "KS", KENTUCKY: "KY", LOUISIANA: "LA", MAINE: "ME", MARYLAND: "MD", MASSACHUSETTS: "MA", MICHIGAN: "MI", MINNESOTA: "MN", MISSISSIPPI: "MS", MISSOURI: "MO", MONTANA: "MT", NEBRASKA: "NE", NEVADA: "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", OHIO: "OH", OKLAHOMA: "OK", OREGON: "OR", PENNSYLVANIA: "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC", "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", UTAH: "UT", VERMONT: "VT", VIRGINIA: "VA", WASHINGTON: "WA", "WEST VIRGINIA": "WV", WISCONSIN: "WI", WYOMING: "WY", "DISTRICT OF COLUMBIA": "DC",
}));

function stateCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return US_STATE_CODES.has(normalized) ? normalized : STATE_NAME_TO_CODE.get(normalized) || null;
}

function locationStateCode(location) {
  const match = String(location || "").trim().match(/,\s*([A-Za-z]{2}|[A-Za-z][A-Za-z\s]+)$/);
  return match ? stateCode(match[1]) : null;
}

function isPreciseFoodSearchArea(location) {
  if (/^\d{5}$/.test(location)) return true;
  const match = location.match(/^(.+),\s*([A-Za-z]{2}|[A-Za-z][A-Za-z\s]+)$/);
  if (!match || !match[1].trim()) return false;
  return stateCode(match[2]) !== null;
}

export function getFoodStateCode(value) {
  return stateCode(value);
}

function suggestionLabel(entry) {
  if (typeof entry === "string") return entry.trim();
  if (!entry || typeof entry !== "object") return "";
  const explicit = entry.label || entry.display_name || entry.displayName || entry.name || entry.location || entry.text || entry.suggestion;
  if (explicit) return String(explicit).trim();
  const city = entry.city || entry.locality;
  const state = entry.state_code || entry.stateCode || entry.state_abbr || entry.stateAbbr || entry.state;
  if (city && state) return `${city}, ${state}`.trim();
  return "";
}

function parseSuggestions(data) {
  const candidates = Array.isArray(data)
    ? data
    : [data?.suggestions, data?.results, data?.locations, data?.items, data?.data?.suggestions, data?.data?.results]
      .find(Array.isArray) || [];
  return [...new Set(candidates.map(suggestionLabel).filter((label) => label.length >= 3))].slice(0, 8);
}

async function callDirectory(action, payload, signal) {
  if (signal?.aborted) throw new DOMException("Search cancelled.", "AbortError");
  if (!functions) throw new Error("The food directory is unavailable right now.");
  let result;
  try {
    result = await httpsCallable(functions, "foodDirectoryLookup", { timeout: 15000 })({ action, ...payload });
  } catch (error) {
    // Record only the failure class, never a searched city/ZIP or returned listing data.
    console.error("[Food directory] Lookup failed", { code: error?.code || null, name: error?.name || null });
    throw error;
  }
  if (signal?.aborted) throw new DOMException("Search cancelled.", "AbortError");
  return result.data || {};
}

/** Resolve a user-entered place to readable city/state choices without geocoding on every keystroke. */
export async function suggestFoodLocations({ query, signal } = {}) {
  const text = String(query || "").trim();
  if (text.length < 3) return { ok: false, items: [], error: "Type at least 3 letters to find a place." };
  if (text.length > 100) return { ok: false, items: [], error: "Enter a shorter place name." };
  try {
    const data = await callDirectory("suggest", { query: text }, signal);
    return { ok: true, items: parseSuggestions(data.items), error: null };
  } catch (error) {
    if (error?.name === "AbortError" && signal?.aborted) throw error;
    return {
      ok: false,
      items: [],
      error: error?.name === "AbortError"
        ? "Place suggestions took too long. Try a city and state or ZIP code."
        : "Place suggestions are unavailable right now. Try a city and state or ZIP code.",
    };
  }
}

function summarizeFoodServices(value) {
  if (typeof value !== "string") return String(value);
  try {
    const parsed = JSON.parse(value);
    const values = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? Object.values(parsed) : null;
    if (values) {
      return values
        .filter((entry) => typeof entry !== "string" || !/^food[_\s-]*pantry$/i.test(entry.trim()))
        .map((entry) => typeof entry === "string" ? entry.replace(/_/g, " ").trim() : String(entry))
        .filter(Boolean)
        .join(" · ");
    }
  } catch {
    // Feed America also returns service descriptions as ordinary text.
  }
  return value.replace(/_/g, " ").trim();
}

function distanceMiles(resource) {
  const raw = resource?.distance_miles ?? resource?.distance;
  if (raw === null || raw === undefined || (typeof raw === "string" && !raw.trim())) return null;
  const distance = typeof raw === "number" ? raw : Number(String(raw).replace(/\s*(mi|miles?)\s*$/i, ""));
  return Number.isFinite(distance) && distance >= 0 ? distance : null;
}

const FOOD_DIRECTORY_SOURCES = {
  ampleharvest_org: "AmpleHarvest.org",
  plentiful_org: "Plentiful",
  usda_farm_to_school: "USDA Farm to School",
  verified_hfb_partner: "Houston Food Bank partner",
};

function normalizeFoodResource(resource, { requireVerified = true } = {}) {
  if (!resource || typeof resource !== "object" || !resource.name) return null;
  const verificationStatus = String(resource.verification_status || "").toLowerCase();
  // Do not surface FeedAM's unverified tier as a dependable local match.
  if (requireVerified && verificationStatus !== "verified" && verificationStatus !== "partner_verified") return null;

  const address = [resource.address, resource.city, resource.state, resource.zip].filter(Boolean).join(", ");
  const sourceCode = String(resource.data_source || "");
  return {
    id: `feedam:${resource.id}`,
    name: resource.name,
    title: resource.name,
    type: resource.resource_type || "food_pantry",
    description: resource.requirements_text || resource.services_offered_json
      ? [resource.requirements_text, resource.services_offered_json]
        .filter(Boolean)
        .map(summarizeFoodServices)
        .join(" · ")
      : null,
    address,
    city: resource.city || null,
    state: resource.state || null,
    locationLine: address,
    region: [resource.city, resource.state].filter(Boolean).join(", ") || address,
    phone: resource.phone || null,
    website: resource.website || null,
    url: resource.website || null,
    distance: distanceMiles(resource),
    source: "Feed America",
    sourceDetail: FOOD_DIRECTORY_SOURCES[sourceCode] || "Feed America public directory",
    sourceCode,
    directoryProvider: "Feed America (feedam.org)",
    directoryLicense: FEEDAM_DATA_LICENSE,
    directoryAttribution: "Feed America (feedam.org, EIN 92-1761881)",
    ...(verificationStatus && {
      verification: {
        status: verificationStatus,
        label: verificationStatus === "partner_verified" ? "Partner confirmed" : "Information checked",
        checkedAt: resource.last_verified_date || null,
      },
    }),
    hours: resource.hours_json || null,
    hoursStatus: resource.hours_status || "unknown",
    services: resource.services_offered_json || null,
    isFoodDirectoryResult: true,
  };
}

/** Search Feed America's public food directory. The caller must provide the user's chosen area. */
export async function searchFoodDirectory({ area, limit = DEFAULT_LIMIT, signal } = {}) {
  const location = String(area || "").trim();
  if (!location) return { ok: false, items: [], error: "Enter a city or ZIP code to find nearby food support." };
  if (location.length > 100) return { ok: false, items: [], error: "Enter a shorter city or ZIP code." };
  if (!isPreciseFoodSearchArea(location)) {
    return { ok: false, items: [], error: "Enter a city and state, such as Steamboat Springs, CO, or a 5-digit ZIP code." };
  }
  const requestedState = locationStateCode(location);

  try {
    const data = await callDirectory("nearby", { area: location, limit: Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT)) }, signal);
    if (!data.ok || !Array.isArray(data.items)) return { ok: false, items: [], error: "The nearby food directory could not complete this search." };

    const resolvedState = locationStateCode(data.area);
    if (requestedState && resolvedState && requestedState !== resolvedState) {
      return { ok: false, items: [], error: "The directory matched that place to a different state. Try searching by a 5-digit ZIP code." };
    }

    const distanceOrigin = data.area || location;
    const originState = locationStateCode(distanceOrigin) || requestedState;
    const items = data.items.map(normalizeFoodResource).filter(Boolean)
      .filter((item) => {
        const resultState = stateCode(item.state);
        return !originState || !resultState || originState === resultState;
      })
      .map((item) => ({ ...item, distanceOrigin }));
    return {
      ok: true,
      items,
      totalAvailable: Number.isFinite(Number(data.totalAvailable)) ? Number(data.totalAvailable) : items.length,
      area: data.area || null,
      attribution: data.attribution || `Feed America (feedam.org, EIN 92-1761881), ${FEEDAM_DATA_LICENSE}`,
      error: null,
    };
  } catch (error) {
    if (error?.name === "AbortError" && signal?.aborted) throw error;
    return {
      ok: false,
      items: [],
      error: error?.name === "AbortError"
        ? "The nearby food search took too long. Try again."
        : error?.message || "The nearby food directory is temporarily unavailable. Try again in a moment.",
    };
  }
}

/** Browse statewide pantry listings without claiming they are nearby or assigning a distance. */
export async function searchFoodDirectoryByState({ state, page = 1, limit = 1000, signal } = {}) {
  const code = stateCode(state);
  if (!code) return { ok: false, items: [], error: "Choose a U.S. state to browse food listings." };
  try {
    const data = await callDirectory("statewide", { state: code, page: Math.max(1, Number(page) || 1), limit: Math.min(1000, Math.max(1, Number(limit) || 1000)) }, signal);
    if (!data.ok || !Array.isArray(data.items)) return { ok: false, items: [], error: "Statewide food listings are unavailable right now. Try a city or ZIP code, or call 211." };
    const items = data.items
      .map((resource) => normalizeFoodResource(resource, { requireVerified: false }))
      .filter(Boolean)
      .map(({ distance, distanceOrigin, ...item }) => item);
    return {
      ok: true,
      items,
      totalAvailable: Number.isFinite(Number(data.totalAvailable)) ? Number(data.totalAvailable) : items.length,
      area: data.area || code,
      mode: "statewide",
      hasMore: Boolean(data.hasMore),
      page: data.page || page,
      nextPage: data.nextPage || null,
      error: null,
    };
  } catch (error) {
    if (error?.name === "AbortError" && signal?.aborted) throw error;
    return { ok: false, items: [], error: "Statewide food listings are unavailable right now. Try a city or ZIP code, or call 211." };
  }
}

export { normalizeFoodResource };
