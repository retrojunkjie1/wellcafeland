/**
 * Additive, source-reviewed contacts for the next five lowest-coverage states.
 * Contacts were copied from public sources; WellnessCafe has not called them.
 */
const reviewed = (record) => ({
  ...record,
  country: "Nigeria",
  checkedAt: "2026-10-31",
  sourceReviewedAt: "2026-10-31",
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
});

const imoSource = "https://www.myimoapp.com/hospitals";
const tarabaSource = "https://health.tarabastate.gov.ng/facilities";

// The Imo directory publishes these numbers under PHCC Contacts, with a
// named contact person for each LGA. The two malformed and one nonstandard
// entries on the source page (Owerri West, Owerri Municipal, Obowo) are omitted.
const imoPhccContacts = [
  ["aboh-mbaise", "Aboh Mbaise", "08037903116"],
  ["ahiazu-mbaise", "Ahiazu Mbaise", "08039381920"],
  ["ehime-mbano", "Ehime Mbano", "08167015506"],
  ["ezinihitte-mbaise", "Ezinihitte Mbaise", "09066047133"],
  ["ideato-north", "Ideato North", "07035877688"],
  ["ideato-south", "Ideato South", "08037647844"],
  ["ihitte-uboma", "Ihitte Uboma", "08034201636"],
  ["ikeduru", "Ikeduru", "07031335832"],
  ["isiala-mbano", "Isiala Mbano", "08033655708"],
  ["isu", "Isu", "08124688475"],
  ["mbaitoli", "Mbaitoli", "08036746057"],
  ["ngor-okpala", "Ngor Okpala", "09060101532"],
  ["njaba", "Njaba", "08037760555"],
  ["nkwerre", "Nkwerre", "08038693688"],
  ["nwangele", "Nwangele", "08030921239"],
  ["oguta", "Oguta", "08036770371"],
  ["ohaji-egbema", "Ohaji Egbema", "08176089731"],
  ["okigwe", "Okigwe", "08063722315"],
  ["onuimo", "Onuimo", "08064523964"],
  ["orlu", "Orlu", "08056321737"],
  ["orsu", "Orsu", "08137920412"],
  ["oru-east", "Oru East", "09139230498"],
  ["oru-west", "Oru West", "09063986175"],
  ["owerri-north", "Owerri North", "08035010376"],
];

export const NIGERIA_IMO_PHCC_ACCESS_OCT31 = imoPhccContacts.map(([id, lga, phone]) => reviewed({
  id: `imo-phcc-navigation-${id}`,
  name: `${lga} PHCC network — local primary-care contact`,
  primaryCategory: "programs",
  resourceType: "Public primary-healthcare navigation · PHCC contact person",
  description: `Imo’s public health-facilities directory lists a contact person and phone under ${lga} PHCC Contacts, and names facilities in the LGA. Call to identify the nearest currently operating facility, confirm its services and hours, and ask about referral or accessibility needs. This is a primary-care navigation contact, not a direct mental-health, addiction-treatment, ambulance, or 24-hour line.`,
  phone,
  link: imoSource,
  source: "MyImo · Imo State health-facilities directory",
  sourceEvidenceUrl: imoSource,
  city: lga,
  state: "Imo",
  region: `${lga} LGA, Imo State, Nigeria`,
  locationLine: `${lga} LGA · public directory contact for PHCC navigation; confirm the facility and service before travel`,
  directoryRole: "local-service-contact",
}));

// The Ministry page identifies these as PHCCs included in its published
// renovation/re-equipping cohort. It provides no facility-level phone number.
const tarabaPhccs = [
  ["abbare", "Abbare PHCC", "Lau"],
  ["anguwan-dampar", "Anguwan Dampar PHCC", "Ibi"],
  ["bambuka", "Bambuka PHCC", null],
  ["dadin-kowa", "Dadin Kowa PHCC", null],
  ["dooshima-sarkin-kudu", "Dooshima PHCC, Sarkin Kudu", "Ibi"],
  ["gindin-waya", "Gindin Waya PHCC", "Ibi"],
  ["gwamu", "Gwamu PHCC", null],
  ["kodei", "Kodei PHCC", null],
  ["kona", "Kona PHCC", "Jalingo"],
  ["maihula", "Maihula PHCC", "Bali"],
  ["mayo-ndaga", "Mayo Ndaga PHCC", "Sardauna"],
  ["mayokam", "Mayokam PHCC", "Bali"],
  ["mutum-deya", "Mutum Deya PHCC", null],
  ["takalafiya", "Takalafiya PHCC", "Bali"],
  ["tutare", "Tutare PHCC", "Gassol"],
  ["wuro-sembe", "Wuro Sembe PHCC", "Jalingo"],
  ["yerima", "Yerima PHCC", "Gassol"],
  ["zangon-ajiya", "Zangon Ajiya PHCC", "Sardauna"],
];

export const NIGERIA_TARABA_PHCC_ACCESS_OCT31 = tarabaPhccs.map(([id, name, lga]) => reviewed({
  id: `taraba-phcc-${id}`,
  name: `${name} — public primary-care location`,
  primaryCategory: "programs",
  resourceType: "State-listed primary healthcare centre · local care access",
  description: `Taraba’s Ministry of Health lists ${name}${lga ? ` in ${lga} LGA` : ""} among the PHCCs in its published renovation and re-equipping directory. The page does not provide a direct facility phone, street directions, opening hours, or current service status. Use the Ministry’s facility page to request directions and confirm the nearest operating facility and available care before travelling; this listing does not imply specialist or emergency coverage.`,
  email: "info@health.tarabastate.gov.ng",
  link: tarabaSource,
  source: "Taraba State Ministry of Health · Facilities Across the State",
  sourceEvidenceUrl: tarabaSource,
  city: lga || name.replace(/ PHCC$/, ""),
  state: "Taraba",
  region: `${lga ? `${lga} LGA, ` : ""}Taraba State, Nigeria`,
  locationLine: `${lga ? `${lga} LGA · ` : "Taraba State · "}Ministry-listed PHCC · request directions and confirm service status before travelling`,
  directoryRole: "local-service-contact",
}));

export const NIGERIA_NEXT_LOWEST_FOOD_OCT31 = [
  reviewed({
    id: "ondo-sunshine-food-bank-akure",
    name: "Sunshine Food Bank — emergency food and essentials enquiries",
    primaryCategory: "food",
    resourceType: "Community food bank · food, hygiene and household essentials",
    description: "Sunshine Food Bank says people and families can request assistance directly or through a referral agency, and describes emergency food, hygiene products and household essentials. Contact the Akure team to confirm intake, eligibility, current distribution or collection arrangements, and hours. The published office address is not a promise of walk-in stock or same-day aid.",
    phone: "+2348104362303",
    email: "info@sunshinefoodbank.org",
    link: "https://sunshinefoodbank.org/",
    source: "Sunshine Food Bank · official assistance information and contact page",
    sourceEvidenceUrl: "https://sunshinefoodbank.org/",
    city: "Akure",
    state: "Ondo",
    region: "Akure, Ondo State, Nigeria",
    address: "Plot 10, Block VI, Agape Avenue, Ilesa Road, Akure, Ondo State, Nigeria",
    locationLine: "Akure · contact first to ask about eligibility, current food assistance and safe collection",
  }),
];

export const NIGERIA_NEXT_LOWEST_PROGRAMS_OCT31 = [
  reviewed({
    id: "kebbi-life-helpers-health-nutrition-enquiries",
    name: "Life Helpers Initiative Kebbi Office — health and nutrition programme enquiries",
    primaryCategory: "programs",
    resourceType: "Humanitarian nonprofit field office · health and nutrition referrals",
    description: "Life Helpers Initiative identifies health and nutrition as programme areas and publishes a Kebbi field office. Contact the office to ask whether a health or nutrition activity is currently operating in your LGA, who can access it, and how referrals work. Its public information does not establish walk-in clinical care, a current nutrition intake, or guaranteed food assistance.",
    phone: "+2349017159526",
    email: "official@lhinigeria.org",
    link: "https://lhinigeria.org/programs",
    source: "Life Helpers Initiative · programme and Kebbi office pages",
    sourceEvidenceUrl: "https://lhinigeria.org/programs",
    city: "Birnin Kebbi",
    state: "Kebbi",
    region: "Birnin Kebbi, Kebbi State, Nigeria",
    address: "Plot 130 & 131, off Sani Abacha Bypass, behind Leisure City Garden and Event Centre, Kawara Area, Birnin Kebbi, Kebbi State, Nigeria",
    locationLine: "Birnin Kebbi field office · call first to confirm active local programme, access and referral",
  }),
  reviewed({
    id: "ondo-tsfrf-mental-health-outreach-enquiries",
    name: "Tosola Sunshine Faith and Relief Foundation — mental-health outreach enquiries",
    primaryCategory: "programs",
    resourceType: "Community foundation · mental-health and health-outreach enquiries",
    description: "TSFRF lists mental health and medical outreach among its services and publishes an Akure headquarters. Contact the foundation to ask what mental-health support is currently offered, whether a qualified clinician is involved, who can access it, and whether any fee applies. Its public page does not describe a clinical intake pathway or crisis service, so do not treat this as therapy or emergency care.",
    phone: "07011444475",
    email: "hello@tsfrf.org",
    link: "https://tsfrf.org/",
    source: "Tosola Sunshine Faith and Relief Foundation · official services and contact page",
    sourceEvidenceUrl: "https://tsfrf.org/",
    city: "Akure",
    state: "Ondo",
    region: "Akure, Ondo State, Nigeria",
    address: "No. 4, Omosebi Lane, Ijapo Estate, Akure, Ondo State, Nigeria",
    locationLine: "Akure · contact first to confirm the specific service, provider qualifications and access",
  }),
  reviewed({
    id: "yobe-lhi-conflict-affected-household-health-nutrition",
    name: "Life Helpers Initiative Yobe — health, nutrition and protection referral enquiries",
    primaryCategory: "programs",
    resourceType: "Humanitarian field office · health and nutrition referral",
    description: "Life Helpers Initiative reports a Save the Children-led programme providing nutrition, WASH and protection services in communities in Damaturu, Gujba, Tarmuwa, Geidam and Gulani LGAs. Call the published Yobe office to confirm which activities remain active, the local partner or service point, eligibility and safe access. This is a programme enquiry route, not a clinic, food-distribution promise, shelter placement, or emergency dispatch line.",
    phone: "+2349017159526",
    email: "official@lhinigeria.org",
    link: "https://lhinigeria.org/health",
    source: "Life Helpers Initiative · current health programme and Yobe office pages",
    sourceEvidenceUrl: "https://lhinigeria.org/health",
    city: "Damaturu",
    state: "Yobe",
    region: "Damaturu, Yobe State, Nigeria",
    address: "Red Roof Building, near Doctors’ House, HabaMaza, Maiduguri Bypass, Damaturu, Yobe State, Nigeria",
    locationLine: "Damaturu · ask for a current programme contact serving your LGA before travelling",
  }),
];

export const NIGERIA_NEXT_LOWEST_EMERGENCY_OCT31 = [
  reviewed({
    id: "zamfara-lhi-echo-humanitarian-referral",
    name: "Life Helpers Initiative Zamfara Office — Anka humanitarian-support enquiries",
    primaryCategory: "emergency",
    resourceType: "Humanitarian field office · conflict-affected community referrals",
    description: "Life Helpers Initiative describes its role in an IRC-led resilience programme serving Anka LGA in Zamfara, with health, nutrition, WASH and basic-needs support for conflict- and crisis-affected communities. Contact the Gusau office to ask whether this activity is currently open, which communities and groups it serves, and the safe referral route. This is not a rescue dispatcher, shelter address, or guarantee of assistance.",
    phone: "+2349017159526",
    email: "official@lhinigeria.org",
    link: "https://lhinigeria.org/causes/echo-project/",
    source: "Life Helpers Initiative · ECHO programme and Zamfara office pages",
    sourceEvidenceUrl: "https://lhinigeria.org/causes/echo-project/",
    city: "Gusau",
    state: "Zamfara",
    region: "Gusau and Anka LGA, Zamfara State, Nigeria",
    address: "House 1, behind Haido Filling Station, adjacent to Tafida House, Gada Biyu, Gusau, Zamfara State, Nigeria",
    locationLine: "Gusau office · ask about a safe, current referral for Anka LGA before travelling",
  }),
];

export const NIGERIA_NEXT_LOWEST_HOUSING_OCT31 = [];
