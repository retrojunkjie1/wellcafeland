/**
 * Additional Nigeria National Emergency Management Agency office contacts.
 * The official NEMA office directory was reviewed October 31, 2026. It lists
 * city/state and staff phone numbers but does not publish street addresses for
 * these entries. These are disaster-coordination contacts, not dispatch,
 * shelter-placement, or relief-capacity guarantees.
 */
const CHECKED_AT = "2026-10-31";
const DIRECTORY_URL = "https://nema.gov.ng/zonal-territorial-offices/";
const NEMA_SERVICE_CHARTER_URL = "https://nema.gov.ng/documentations/nema-service-charter.pdf";

const offices = [
  ["kaduna-zonal", "NEMA North West Zonal Office — disaster-response coordination", "Kaduna", "Kaduna", "08065123532", "Abbani Imam Garki", "North West zone; ask the office to confirm which state or local response team handles the incident."],
  ["jos-zonal", "NEMA North Central Zonal Office — disaster-response coordination", "Jos", "Plateau", "08033110983", "Eugene Nyelong", "North Central zone; ask the office to confirm which state or local response team handles the incident."],
  ["maiduguri-zonal", "NEMA North East Zonal Office — disaster-response coordination", "Maiduguri", "Borno", "08033275113", "Sirajo Garba", "North East zone; ask the office to confirm which state or local response team handles the incident."],
  ["lagos-zonal", "NEMA South West Zonal Office — disaster-response coordination", "Lagos", "Lagos", "08069845685", "Adewale Stephen", "South West zone; ask the office to confirm which state or local response team handles the incident."],
  ["enugu-zonal", "NEMA South East Zonal Office — disaster-response coordination", "Enugu", "Enugu", "09035609606", "Ngozi Echeazu", "South East zone; ask the office to confirm which state or local response team handles the incident."],
  ["ibadan-zonal", "NEMA South West Zonal Coordinator — disaster-response coordination", "Ibadan", "Oyo", "08033507814", "Kadiri Olanrewaju", "South West zone; call to confirm the office’s current role and incident coverage."],
  ["uyo-operations", "NEMA Uyo Operations Office — disaster-response coordination", "Uyo", "Akwa Ibom", "08035698886", "Aisueni Mmandu", "Call to report a disaster incident or ask for the current local coordination route."],
  ["yola-operations", "NEMA Yola Operations Office — disaster-response coordination", "Yola", "Adamawa", "08064257881", "Ladan Ayuba", "Call to report a disaster incident or ask for the current local coordination route."],
  ["gombe-operations", "NEMA Gombe Operations Office — disaster-response coordination", "Gombe", "Gombe", "08069043205", "Ummuna Ahmed", "Call to report a disaster incident or ask for the current local coordination route."],
  ["owerri-operations", "NEMA Owerri Operations Office — disaster-response coordination", "Owerri", "Imo", "08038242354", "Igwe Nnamdi", "Call to report a disaster incident or ask for the current local coordination route."],
  ["ado-ekiti-operations", "NEMA Ekiti Operations Office — disaster-response coordination", "Ado-Ekiti", "Ekiti", "08033004504", "Kofoworola Soleye", "Call to report a disaster incident or ask for the current local coordination route."],
  ["benin-operations", "NEMA Edo Operations Office — disaster-response coordination", "Benin City", "Edo", "08093349254", "Dahiru Yusuf", "Call to report a disaster incident or ask for the current local coordination route."],
  ["sokoto-operations", "NEMA Sokoto Operations Office — disaster-response coordination", "Sokoto", "Sokoto", "08035643701", "Aliyu Shehu Kafindangi", "Call to report a disaster incident or ask for the current local coordination route."],
  ["abuja-operations", "NEMA Abuja Operations Office — disaster-response coordination", "Abuja", "Federal Capital Territory", "08125603242", "Justin Nwazuronye", "Call to report a disaster incident or ask for the current local coordination route."],
];

export const NIGERIA_NEMA_OFFICE_OCT_2026_EXPANSION = offices.map(
  ([officeId, name, city, state, phone, publishedContact, scopeNote]) => ({
    id: `nema-office-${officeId}-disaster-coordination`,
    name,
    primaryCategory: "emergency",
    resourceType: "National disaster-management agency · regional response and relief coordination",
    description: `NEMA’s official office directory lists ${publishedContact} as the contact for this ${city} office and publishes ${phone}. ${scopeNote} NEMA coordinates disaster preparedness, response, search and rescue, and relief with state and local agencies; this contact is not a live dispatch line and does not confirm that assistance, transport, shelter, or relief supplies are available. Call to confirm the correct office, current address, safe access, and next steps. For immediate danger, use local emergency services where safe.`,
    phone,
    link: DIRECTORY_URL,
    sourceEvidenceUrl: NEMA_SERVICE_CHARTER_URL,
    source: "National Emergency Management Agency (NEMA) · Zonal & Territorial Offices directory",
    sourceReviewed: true,
    sourceReviewStatus: "opened-public-source",
    sourceReviewedAt: CHECKED_AT,
    checkedAt: CHECKED_AT,
    phoneConfirmed: false,
    exhaustiveCoverage: false,
    verified: true,
    directoryRole: "local-service",
    city,
    state,
    country: "Nigeria",
    region: `${city}, ${state}, Nigeria`,
    locationLine: `${city} · NEMA publishes this office locality and contact only; call to confirm its current address and coverage`,
  }),
);
