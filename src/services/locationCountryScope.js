import { isNigeriaLocation } from "@/lib/directoryCuratedFallback";
import { resolveSupportCountry } from "@/data/internationalSupportDirectory";

function locationText(value) {
  if (value && typeof value === "object") {
    return Object.values(value).map(locationText).filter(Boolean).join(" ");
  }
  return String(value || "").trim();
}

function countryFromLocation(value) {
  const text = locationText(value);
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
  // Reconcile every known signal, including the city/address, against the
  // explicit country fields. A provider can mislabel a result's country while
  // still returning an unmistakable foreign city or address.
  return [item?.country, countryFromCode(item?.countryCode), item?.city, item?.state, item?.province, item?.region, item?.locationLine, item?.address]
    .map(countryFromLocation)
    .filter(Boolean)
    .filter((country, index, countries) => countries.indexOf(country) === index);
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
