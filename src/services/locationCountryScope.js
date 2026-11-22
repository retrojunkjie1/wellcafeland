import { isNigeriaLocation } from "@/lib/directoryCuratedFallback";
import { resolveSupportCountry } from "@/data/internationalSupportDirectory";

function countryFromLocation(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (isNigeriaLocation(text)) return "Nigeria";
  const resolved = resolveSupportCountry(text);
  if (resolved) return resolved;
  if (/\b(?:united kingdom|great britain|britain|uk|gb|england|scotland|wales|northern ireland)\b/i.test(text)) return "United Kingdom";
  if (/\b(?:united states|united states of america|usa|u\.s\.a?\.)\b/i.test(text)) return "United States";
  return null;
}

function countryFromCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (["GB", "GBR", "UK"].includes(code)) return "United Kingdom";
  if (["NG", "NGA"].includes(code)) return "Nigeria";
  if (["US", "USA"].includes(code)) return "United States";
  return null;
}

function listingCountries(item) {
  const explicit = countryFromLocation(item?.country) || countryFromCode(item?.countryCode);
  if (explicit) return [explicit];

  return [item?.city, item?.state, item?.province, item?.region, item?.locationLine, item?.address]
    .map(countryFromLocation)
    .filter(Boolean);
}

/**
 * Keep search results within a recognized country boundary. Country-wide and
 * city-level results in the selected country remain available in the wider
 * area section; foreign and unscoped results do not cross that boundary.
 * Unknown user-entered locations preserve the existing search behavior.
 */
export function filterListingsToCountryScope(items = [], requestedLocation = "") {
  const requestedCountry = countryFromLocation(requestedLocation);
  if (!requestedCountry) return items;

  return items.filter((item) => {
    const countries = listingCountries(item);
    return countries.length > 0 && countries.every((country) => country === requestedCountry);
  });
}
