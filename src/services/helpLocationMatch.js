import { getFoodStateCode } from "@/services/foodDirectory";
import { INTERNATIONAL_SUPPORT_DIRECTORY, resolveSupportCountry } from "@/data/internationalSupportDirectory";

function text(value) {
  if (value && typeof value === "object") {
    return Object.values(value).map(text).filter(Boolean).join(" ");
  }
  return String(value || "").trim();
}

function normalize(value) {
  return text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function locationFields(record = {}) {
  const address = record.address && typeof record.address === "object" ? record.address : {};
  const location = record.location && typeof record.location === "object" ? record.location : {};
  return {
    city: record.city || address.city || location.city || "",
    state: record.state || address.state || location.state || "",
    postalCode: record.postalCode || record.zip || address.postalCode || address.zip || location.postalCode || "",
    all: normalize([
      record.city,
      record.state,
      record.country,
      record.region,
      record.locationLine,
      record.address,
      record.location,
      record.postalCode,
      record.zip,
    ].map(text).join(" ")),
  };
}

function inferredStateCode(value) {
  const raw = text(value);
  const direct = getFoodStateCode(raw);
  if (direct) return direct;
  const finalPart = raw.split(",").at(-1)?.trim();
  return getFoodStateCode(finalPart);
}

function isCountryWideLocation(requested) {
  if (["nigeria", "ng", "nga", "federal republic of nigeria"].includes(normalize(requested))) return true;
  const country = resolveSupportCountry(requested);
  if (!country) return false;
  const countryRecord = INTERNATIONAL_SUPPORT_DIRECTORY[country];
  const normalizedRequest = normalize(requested);
  return [country, countryRecord?.countryCode, ...(countryRecord?.aliases || [])]
    .filter(Boolean)
    .some((candidate) => normalize(candidate) === normalizedRequest);
}

/**
 * True only when a listing contains location evidence matching the user's area.
 * This intentionally confirms city/state/ZIP text only; it never estimates distance.
 */
export function matchesHelpLocation(record, requestedLocation) {
  const requested = text(requestedLocation);
  if (!requested) return true;
  const fields = locationFields(record);
  if (!fields.all) return false;

  const zip = requested.match(/\b\d{5}\b/);
  if (zip) {
    const listingZips = `${fields.postalCode} ${fields.all}`.match(/\b\d{5}\b/g) || [];
    return listingZips.includes(zip[0]);
  }

  const requestedState = inferredStateCode(requested);
  const requestedParts = requested.split(",").map((part) => part.trim()).filter(Boolean);
  const requestedCity = requestedState && requestedParts.length > 1 ? normalize(requestedParts[0]) : "";

  if (requestedState && !requestedCity) {
    return inferredStateCode(fields.state) === requestedState || inferredStateCode(record.region) === requestedState ||
      (fields.all.split(" ").some((part) => getFoodStateCode(part) === requestedState));
  }

  if (requestedState && requestedCity) {
    const cityMatches = normalize(fields.city)
      ? normalize(fields.city).includes(requestedCity)
      : fields.all.includes(requestedCity);
    const stateMatches = inferredStateCode(fields.state) === requestedState || inferredStateCode(record.region) === requestedState ||
      fields.all.split(" ").some((part) => getFoodStateCode(part) === requestedState);
    return cityMatches && stateMatches;
  }

  // A city-only search must compare the structured city field directly.
  // Searching all address text lets street names masquerade as cities (for
  // example, "London Road, Kilmarnock" was treated as local to London).
  // If a listing has no explicit city, keep it in the wider-area section
  // instead of labeling it as a nearby match based on an address fragment.
  if (!requestedState && !isCountryWideLocation(requested)) {
    const requestedCity = normalize(requested.split(",")[0]);
    if (fields.city) return normalize(fields.city) === requestedCity;
    return false;
  }

  const normalizedRequest = normalize(requested);
  const tokens = normalizedRequest.split(" ").filter((token) => token.length > 1);
  const fieldTokens = new Set(fields.all.split(" ").filter(Boolean));
  return tokens.length > 0 && tokens.every((token) => fieldTokens.has(token));
}
