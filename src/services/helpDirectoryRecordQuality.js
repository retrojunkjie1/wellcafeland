const RETIRED_DEMO_NAMES = new Set([
  "serenity house recovery",
  "new beginnings transitional housing",
  "hope haven emergency shelter",
  "samhsa treatment grant program",
  "california addiction treatment scholarship",
  "recovery foundation emergency fund",
  "phoenix recovery center",
  "mindful recovery outpatient",
  "calworks substance abuse services",
]);

const RETIRED_DEMO_CIRCLE_THEMES = new Set([
  "early_recovery",
  "trauma_healing",
  "family_recovery",
]);

function isReservedHost(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const hostname = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase();
    return ["example.com", "example.org", "example.net"].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) || hostname.endsWith(".example") || hostname.endsWith(".invalid") || hostname.endsWith(".test") || hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

function hasPlaceholderContact(record) {
  const contact = record?.contact && typeof record.contact === "object" ? record.contact : {};
  const urls = [record?.website, record?.url, record?.link, contact.website, contact.url];
  if (urls.some(isReservedHost)) return true;

  const emails = [record?.email, record?.contactEmail, contact.email].filter(Boolean);
  if (emails.some((email) => /\.(?:example|invalid|test)$/i.test(String(email).trim()))) return true;

  const phones = [record?.phone, record?.contactPhone, contact.phone].filter(Boolean);
  return phones.some((phone) => /(?:^|\D)555[ .-]?01\d{2}(?:\D|$)/.test(String(phone)));
}

/** Hide only known retired sample records and reserved example contacts. */
export function isRetiredDemoHelpRecord(record = {}) {
  const name = String(record.name || record.title || "").trim().toLowerCase();
  const theme = String(record.theme || "").trim().toLowerCase();
  return record.isDemo === true || record.isPlaceholder === true || RETIRED_DEMO_NAMES.has(name) || RETIRED_DEMO_CIRCLE_THEMES.has(theme) || hasPlaceholderContact(record);
}

export function formatHousingAddress(data = {}) {
  if (typeof data.address === "string" && data.address.trim()) return data.address.trim();

  const address = data.address && typeof data.address === "object" ? data.address : {};
  return [
    address.line1 || address.street || data.street || data.addressLine1,
    address.line2 || address.unit || data.addressLine2,
    address.city || data.city,
    address.state || data.state,
    address.zip || address.postalCode || data.zip || data.postalCode,
  ].filter(Boolean).join(", ");
}
