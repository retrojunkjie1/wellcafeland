/**
 * Additional Kebbi primary-care locations from the State Government's March
 * 2026 BHCPF PHC supervision list. Only rows whose LGA, ward and database name
 * are clear in the published table are used. A database/supervision entry is
 * a locator, not confirmation of current opening, staffing, services, or fees.
 */
const source = "https://mail.kebbistate.gov.ng/sites/default/files/KEBBI%20STATE%20LIST%20OF%20BHCPF%20FACILITIES%20TO%20SUPERVISE.pdf";
const rows = [
  // Aleiro; Danwarai and Kashin Zama are already present in the directory.
  ["Aleiro", "Dangaladima I", "Kofar Dangaladima"],
  ["Aleiro", "Dangaladima II", "Gumbin Dari"],
  ["Aleiro", "Sarkin Fada I", "Mallanawa"],
  ["Aleiro", "Sarkin Fada II", "Dorawai"],
  ["Aleiro", "Jiga Birni", "Jigar Birni"],
  ["Aleiro", "Jiga Makera", "Jigar Kambarori"],
  ["Aleiro", "Rafin Bauna", "Rafin Bauna"],
  ["Aleiro", "Sabiyal", "Sabiyel"],
  // Arewa; Bachaka and Dogon Daji already have directory entries.
  ["Arewa", "Falde", "Falde"],
  ["Arewa", "Feske/Jaffeji", "Amogoro"],
  ["Arewa", "Gorun Dikko", "Goron Dikko"],
  ["Arewa", "Gumunde/R/Tsaka", "Gumundai"],
  ["Arewa", "Kangiwa", "Kara"],
  ["Arewa", "Laima/Jantullu", "Kare"],
  ["Arewa", "Sarka/Dantsoho", "Sarka"],
  ["Arewa", "Yeldu", "Yeldu"],
  // Argungu; Gulma and the Kokani South service location already exist.
  ["Argungu", "Alwasa/Gotomo", "Alwasa"],
  ["Argungu", "Dikko", "Jada"],
  ["Argungu", "Felande", "Felande"],
  ["Argungu", "Galadima", "Argungu"],
  ["Argungu", "Gwazange", "Wali"],
  ["Argungu", "Kokani North", "Sabon Garin Kanta"],
  ["Argungu", "Lailaba", "Lailaba"],
  ["Argungu", "Sawwa/K. Sani", "Sauwa"],
  ["Argungu", "Tungar Zazzag", "T Zazzagawa"],
  // Augie; Augie South is already listed.
  ["Augie", "Augie North", "Mera"],
  ["Augie", "Bagaye/Mera", "Bagaye"],
  ["Augie", "Bayawa North", "Bayawa"],
  ["Augie", "Bayawa South", "Jabaka"],
  ["Augie", "Birnin Tudu", "Birnin Tudu"],
  ["Augie", "Bubuce", "Bubuche"],
  ["Augie", "Dundaye/Kwaido", "Kwaido"],
];

const slug = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const NIGERIA_KEBBI_BHCPF_EXPANSION_MAR2026 = rows.map(([lga, ward, facility]) => ({
  id: `nigeria-kebbi-bhcpf-2026-${slug(lga)}-${slug(facility)}`,
  name: `${facility} — ${lga} PHC locator`,
  primaryCategory: "programs",
  resourceType: "Kebbi State-listed BHCPF primary-health facility · general care locator",
  description: `Kebbi State Government’s March 2026 list of Basic Health Care Provision Fund facilities to supervise names ${facility} in ${ward} ward, ${lga} LGA. The register does not provide a direct phone, street address, opening hours, staffing or service menu for this location, and inclusion does not confirm that it is currently open. Contact the Kebbi State Ministry of Health or local PHC authority to verify the exact location, current operation, services, fees and referral requirements before travelling. This is a general primary-care locator, not confirmation of mental-health or addiction-treatment capacity.`,
  link: source,
  source: "Kebbi State Government · List of BHCPF facilities to supervise (published March 25, 2026)",
  sourceEvidenceUrl: source,
  sourcePublishedAt: "2026-03-25",
  sourceReviewedAt: "2026-10-31",
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
  country: "Nigeria",
  state: "Kebbi",
  city: ward,
  region: `${ward} ward, ${lga} LGA, Kebbi State, Nigeria`,
  locationLine: `${ward} ward · ${lga} LGA · source-listed locator; no street address or direct phone published`,
  checkedAt: "2026-10-31",
}));
