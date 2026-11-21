/** Shared constructor for country-scoped support directory records. */
export const REVIEWED_AT = "2026-10-23";

export function pathway(country, countryCode, category, id, name, resourceType, description, phone, link, source, extra = {}) {
  return {
    id: `${countryCode.toLowerCase()}-${id}`,
    country,
    countryCode,
    region: country,
    directoryRole: extra.directoryRole || (extra.city ? "local-provider" : "national-referral"),
    resourceType,
    name,
    description,
    phone: phone || null,
    link,
    source,
    checkedAt: REVIEWED_AT,
    locationLine: `Nationwide ${country} contact or service finder`,
    ...extra,
    category,
  };
}
