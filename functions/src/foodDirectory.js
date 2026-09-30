const { onCall, HttpsError } = require("firebase-functions/v2/https");

const REGION = "us-central1";
const SEARCH_URL = "https://feedam.org/api/resources/search";
const AUTOCOMPLETE_URL = "https://feedam.org/api/autocomplete";
const BULK_URL = "https://feedam.org/api/resources/bulk";
const LOOKUP_TIMEOUT_MS = 10000;
const SEARCH_LIMIT = 40;
const STATE_LIMIT = 1000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const rateLimits = new Map();
const US_STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));
const STATE_NAMES = {
  ALABAMA: "AL", ALASKA: "AK", ARIZONA: "AZ", ARKANSAS: "AR", CALIFORNIA: "CA", COLORADO: "CO", CONNECTICUT: "CT", DELAWARE: "DE", FLORIDA: "FL", GEORGIA: "GA", HAWAII: "HI", IDAHO: "ID", ILLINOIS: "IL", INDIANA: "IN", IOWA: "IA", KANSAS: "KS", KENTUCKY: "KY", LOUISIANA: "LA", MAINE: "ME", MARYLAND: "MD", MASSACHUSETTS: "MA", MICHIGAN: "MI", MINNESOTA: "MN", MISSISSIPPI: "MS", MISSOURI: "MO", MONTANA: "MT", NEBRASKA: "NE", NEVADA: "NV", "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM", "NEW YORK": "NY", "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", OHIO: "OH", OKLAHOMA: "OK", OREGON: "OR", PENNSYLVANIA: "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC", "SOUTH DAKOTA": "SD", TENNESSEE: "TN", TEXAS: "TX", UTAH: "UT", VERMONT: "VT", VIRGINIA: "VA", WASHINGTON: "WA", "WEST VIRGINIA": "WV", WISCONSIN: "WI", WYOMING: "WY", "DISTRICT OF COLUMBIA": "DC",
};

function stateCode(value) {
  const state = String(value || "").trim().toUpperCase();
  return US_STATES.has(state) ? state : STATE_NAMES[state] || "";
}

function checkRateLimit(request) {
  const ip = request.rawRequest?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || request.rawRequest?.ip || "unknown";
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.startedAt >= RATE_WINDOW_MS) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    if (rateLimits.size > 1000) for (const [key, value] of rateLimits) if (now - value.startedAt >= RATE_WINDOW_MS) rateLimits.delete(key);
    return;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) throw new HttpsError("resource-exhausted", "Please wait a minute before searching again.");
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!response.ok) throw new HttpsError("unavailable", "The food directory could not complete this search right now.");
    const data = await response.json();
    if (!data || data.success === false) throw new HttpsError("unavailable", "The food directory could not complete this search right now.");
    return data;
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("unavailable", controller.signal.aborted ? "The food directory took too long to respond. Please try again." : "The food directory is temporarily unavailable. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}

function suggestionsFrom(data) {
  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : Array.isArray(data?.results) ? data.results : [];
  return [...new Set(suggestions.map((item) => typeof item === "string" ? item.trim() : String(item?.label || item?.display_name || "").trim()).filter((value) => value.length >= 3))].slice(0, 8);
}

function validateCityOrZip(area) {
  const value = String(area || "").trim();
  if (value.length < 3 || value.length > 100) throw new HttpsError("invalid-argument", "Enter a town, state, or ZIP code using at least three characters.");
  if (/^\d{5}$/.test(value)) return value;
  const match = value.match(/^(.+),\s*([A-Za-z]{2}|[A-Za-z][A-Za-z\s]+)$/);
  if (!match || !match[1].trim() || !stateCode(match[2])) throw new HttpsError("invalid-argument", "Choose a city and state, or enter a 5-digit ZIP code.");
  return value;
}

function foodProjection(resource, { statewide = false } = {}) {
  if (!resource || typeof resource !== "object" || !resource.name) return null;
  const verificationStatus = String(resource.verification_status || "").toLowerCase();
  if (!statewide && !["verified", "partner_verified"].includes(verificationStatus)) return null;
  return {
    id: resource.id,
    name: String(resource.name).slice(0, 180),
    address: String(resource.address || "").slice(0, 240),
    city: String(resource.city || "").slice(0, 100),
    state: String(resource.state || "").slice(0, 2).toUpperCase(),
    zip: String(resource.zip || "").slice(0, 12),
    phone: String(resource.phone || "").slice(0, 40),
    resource_type: String(resource.resource_type || "food_pantry").slice(0, 60),
    requirements_text: String(resource.requirements_text || "").slice(0, 500),
    services_offered_json: resource.services_offered_json || null,
    last_verified_date: resource.last_verified_date || null,
    hours_json: resource.hours_json || null,
    hours_status: String(resource.hours_status || "unknown").slice(0, 40),
    verification_status: verificationStatus,
    ...(!statewide && { distance: Number.isFinite(Number(resource.distance)) ? Number(resource.distance) : null }),
  };
}

// Public searches can fan out to a third-party directory; require a valid
// Firebase App Check attestation before the callable reaches this handler.
const foodDirectoryLookup = onCall({ region: REGION, timeoutSeconds: 15, enforceAppCheck: true }, async (request) => {
  checkRateLimit(request);
  const action = String(request.data?.action || "").trim();
  if (action === "suggest") {
    const query = String(request.data?.query || "").trim();
    if (query.length < 3 || query.length > 100) throw new HttpsError("invalid-argument", "Enter a place name with at least three characters.");
    const url = new URL(AUTOCOMPLETE_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "8");
    const data = await fetchJson(url);
    return { ok: true, items: suggestionsFrom(data) };
  }

  if (action === "nearby") {
    const area = validateCityOrZip(request.data?.area);
    const url = new URL(SEARCH_URL);
    url.searchParams.set("zip", area);
    url.searchParams.set("type", "food_pantry");
    url.searchParams.set("limit", String(Math.max(1, Math.min(SEARCH_LIMIT, Number(request.data?.limit) || 20))));
    const data = await fetchJson(url);
    const requestedState = /^\d{5}$/.test(area) ? "" : stateCode(area.split(",").at(-1));
    const responseState = stateCode(data.location?.state || "");
    if (requestedState && responseState && requestedState !== responseState) throw new HttpsError("failed-precondition", "The directory matched that place to a different state. Try a 5-digit ZIP code.");
    const resources = Array.isArray(data.resources) ? data.resources : [];
    const items = resources.map((resource) => foodProjection(resource)).filter(Boolean);
    return {
      ok: true,
      items,
      totalAvailable: Number.isFinite(Number(data.total_available)) ? Number(data.total_available) : items.length,
      area: responseState ? `${data.location?.city || area.split(",")[0].trim()}, ${responseState}` : area,
      attribution: "Feed America",
    };
  }

  if (action === "statewide") {
    const state = stateCode(request.data?.state);
    if (!state) throw new HttpsError("invalid-argument", "Choose a U.S. state to browse food listings.");
    const url = new URL(BULK_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("state", state);
    url.searchParams.set("type", "food_pantry");
    const limit = Math.max(1, Math.min(STATE_LIMIT, Number(request.data?.limit) || STATE_LIMIT));
    const page = Math.max(1, Math.min(100, Number(request.data?.page) || 1));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("page", String(page));
    const data = await fetchJson(url);
    const rows = Array.isArray(data) ? data : Array.isArray(data?.resources) ? data.resources : [];
    const items = rows.filter((resource) => String(resource.resource_type || resource.type || "").toLowerCase() === "food_pantry")
      .filter((resource) => !resource.state || stateCode(resource.state) === state)
      .map((resource) => foodProjection(resource, { statewide: true })).filter(Boolean);
    return { ok: true, items, totalAvailable: rows.length, area: state, mode: "statewide", page, nextPage: rows.length >= limit ? page + 1 : null, hasMore: rows.length >= limit, attribution: "Feed America" };
  }

  throw new HttpsError("invalid-argument", "Choose a food search action.");
});

module.exports = { foodDirectoryLookup, _foodProjection: foodProjection, _suggestionsFrom: suggestionsFrom, _stateCode: stateCode, _rateLimits: rateLimits };
