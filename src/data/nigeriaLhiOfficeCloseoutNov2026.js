/**
 * Source-reviewed local Life Helpers Initiative field-office contacts added
 * during Nigeria directory closeout. These are programme enquiry routes, not
 * proof of current local intake or guaranteed material assistance.
 */
const LHI_CONTACT = "https://lhinigeria.org/contact";

const offices = [
  {
    id: "bauchi-life-helpers-initiative-field-office",
    name: "Life Helpers Initiative — Bauchi field-office programme enquiries",
    city: "Bauchi",
    state: "Bauchi",
    address: "Suite 51, IbroSulada Plaza, opposite Keystone Bank, Bank Road, Bauchi, Bauchi State 740241, Nigeria",
  },
  {
    id: "borno-life-helpers-initiative-maiduguri-office",
    name: "Life Helpers Initiative — Maiduguri humanitarian-office enquiries",
    city: "Maiduguri",
    state: "Borno",
    address: "House 12, Gidan Giwa, Sale Kida Street, near ICRC, off Damboa Road, Maiduguri, Borno State 600001, Nigeria",
  },
  {
    id: "ebonyi-life-helpers-initiative-abakaliki-office",
    name: "Life Helpers Initiative — Abakaliki field-office programme enquiries",
    city: "Abakaliki",
    state: "Ebonyi",
    address: "No. 8 Engr Dave Eze Street, around Ebebe Junction, Abakaliki, Ebonyi State 480101, Nigeria",
  },
  {
    id: "fct-life-helpers-initiative-gwarimpa-office",
    name: "Life Helpers Initiative — Abuja programme and referral enquiries",
    city: "Abuja",
    state: "Federal Capital Territory",
    address: "House 4, 11 Road, A Close, 3rd Avenue, Gwarimpa, Abuja, Federal Capital Territory 900108, Nigeria",
  },
  {
    id: "katsina-life-helpers-initiative-field-office",
    name: "Life Helpers Initiative — Katsina field-office programme enquiries",
    city: "Katsina",
    state: "Katsina",
    address: "Plot 14 Bayajidda Road, along INEC State Office, behind ICPC, GRA, Katsina State 820101, Nigeria",
  },
  {
    id: "plateau-life-helpers-initiative-jos-office",
    name: "Life Helpers Initiative — Jos field-office programme enquiries",
    city: "Jos",
    state: "Plateau",
    address: "No. 28 Jengre Road, British American Junction, Jos, Plateau State 930101, Nigeria",
  },
];

export const NIGERIA_LHI_CLOSEOUT_OFFICES_NOV2026 = offices.map((office) => ({
  ...office,
  primaryCategory: "programs",
  resourceType: "Humanitarian nonprofit field office · health, livelihoods and protection programme enquiries",
  description: `Life Helpers Initiative publishes this ${office.city} office in its current 11-office directory. The organization describes work in health, education, livelihoods, agriculture and protection. Contact the local office to ask which programme is active in your LGA, who it serves, whether individual referrals are accepted, and how to access support safely. The published office is an enquiry point; it does not confirm a current clinic, shelter placement, cash grant, food distribution or open intake.`,
  phone: "+2349017159526",
  email: "official@lhinigeria.org",
  link: LHI_CONTACT,
  source: "Life Helpers Initiative · official state-office directory, programme scope and published office hours",
  sourceEvidenceUrl: LHI_CONTACT,
  country: "Nigeria",
  region: `${office.city}, ${office.state}, Nigeria`,
  locationLine: `${office.city} · office enquiries Monday–Friday, 8:00 a.m.–5:00 p.m. WAT · confirm service access before travelling`,
  directoryRole: "local-service",
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  sourceReviewedAt: "2026-11-01",
  checkedAt: "2026-11-01",
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
}));
