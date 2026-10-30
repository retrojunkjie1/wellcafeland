// Source-reviewed Maryland Assertive Community Treatment (ACT) access contacts.
// The Maryland Department of Health lists these county/region provider phones;
// phone confirmation and statewide exhaustive provider coverage are not claimed.
const makeAct = (id, name, county, provider, phone, serviceArea = county) => ({
  id: `md-act-${id}`,
  name: `${provider} — ${name}`,
  description: `Maryland’s March 2026 Crisis Services and Assertive Community Treatment guide lists ${provider} as an ACT provider serving ${serviceArea}. ACT is community-based, ongoing support for people with serious mental-health needs; the guide says routine intake is weekdays 9 a.m.–5 p.m. Call this provider to ask about referral steps, eligibility, catchment, and whether the program fits your needs. This is not an emergency line.`,
  city: county,
  county,
  state: "MD",
  phone,
  link: "https://health.maryland.gov/bha/Documents/MCT.ACT%20Resource%20Guide.pdf",
  source: "Maryland Department of Health BHA Crisis Services and ACT Program Information by County guide (updated March 17, 2026)",
  serviceArea,
  coverageScope: serviceArea === county ? "county" : "multi-county region",
  resourceType: "Assertive Community Treatment (ACT) program access",
  locationLine: `${serviceArea} · ACT community behavioral-health support · weekday intake; call to confirm`,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

export const MARYLAND_ACT = [
  makeAct("allegany-garrett-archway", "ACT community treatment", "Cumberland", "Archway Station, Inc.", "301-777-1700", "Allegany and Garrett counties"),
  makeAct("anne-arundel-pep", "ACT community treatment", "Annapolis", "People Encouraging People, Inc.", "410-768-0123", "Anne Arundel County"),
  makeAct("baltimore-city-hopkins", "ACT community treatment", "Baltimore", "Johns Hopkins ACT", "410-955-2207", "Baltimore City"),
  makeAct("baltimore-city-sheppard", "ACT community treatment", "Baltimore", "Sheppard Pratt ACT", "410-366-4360", "Baltimore City"),
  makeAct("baltimore-city-grace", "ACT community treatment", "Baltimore", "Grace Medical Center at LifeBridge Health", "443-472-0445", "Baltimore City"),
  makeAct("baltimore-city-ummc", "ACT community treatment", "Baltimore", "University of Maryland Medical Center ACT", "410-328-2564", "Baltimore City"),
  makeAct("southern-md-cornerstone", "ACT community treatment", "Prince Frederick", "Cornerstone Southern Maryland", "240-376-6650", "Calvert, Charles, and St. Mary’s counties"),
  makeAct("carroll-youth-services", "ACT community treatment", "Westminster", "Carroll County Youth Services Bureau", "443-244-8691", "Carroll County"),
  makeAct("cecil-upper-bay", "ACT community treatment", "Elkton", "Upper Bay Counseling", "410-996-5104", "Cecil County"),
  makeAct("cecil-support-services", "ACT community treatment", "Elkton", "Support Services, Inc.", "410-996-5104", "Cecil County"),
  makeAct("frederick-sheppard", "ACT community treatment", "Frederick", "Sheppard Pratt", "301-662-0099 ext. 3580", "Frederick County"),
  makeAct("garrett-archway", "ACT community treatment", "Oakland", "Archway Station, Inc.", "301-777-1700", "Garrett County"),
  makeAct("harford-sheppard", "ACT community treatment", "Bel Air", "Sheppard Pratt", "443-823-6119", "Harford County"),
  makeAct("howard-sheppard", "ACT community treatment", "Columbia", "Sheppard Pratt", "410-740-1901 ext. 7752", "Howard County"),
  makeAct("midshore-lower-shore-clinic", "ACT community treatment", "Salisbury", "Lower Shore Clinic", "443-235-1932", "Caroline, Dorchester, Kent, Queen Anne’s, and Talbot counties"),
  makeAct("midshore-corsica-river", "ACT community treatment", "Centreville", "Corsica River Mental Health Services", "410-758-2211", "Kent, Queen Anne’s, and Talbot counties"),
  makeAct("montgomery-cornerstone", "ACT community treatment", "Silver Spring", "Cornerstone Montgomery", "301-493-4200", "Montgomery County"),
  makeAct("montgomery-pathways", "ACT community treatment", "Rockville", "Pathways to Housing D.C.", "202-441-1464", "Montgomery County"),
  makeAct("st-marys-cornerstone", "ACT community treatment", "Leonardtown", "Cornerstone Southern Maryland", "240-376-6650", "St. Mary’s County"),
  makeAct("washington-sheppard", "ACT community treatment", "Hagerstown", "Sheppard Pratt", "301-733-6063 ext. 8225", "Washington County"),
  makeAct("lower-shore-region", "ACT community treatment", "Salisbury", "Lower Shore, Inc.", "443-944-6468", "Somerset, Wicomico, and Worcester counties"),
  makeAct("people-encouraging-people-multi-county", "ACT community treatment", "Baltimore", "People Encouraging People, Inc.", "410-366-4299", "Baltimore City, Baltimore County, Montgomery, and Prince George’s counties"),
];

const makeFood = (id, name, address, phone, details, website = null) => ({
  id: `md-food-${id}`,
  name,
  description: `${details} Maryland Food Bank currently publishes this location in its partner food finder. Contact the organization before visiting to confirm current hours, intake, eligibility, and availability; schedules and supplies can change.`,
  city: "Baltimore",
  state: "MD",
  address,
  phone,
  link: website ? `https://${website}` : "https://mdfoodbank.org/find-food/",
  source: "Maryland Food Bank partner Find Food directory",
  serviceArea: "Baltimore City; confirm any eligibility or service-area requirements directly",
  coverageScope: "local provider",
  resourceType: "food pantry or meal service",
  locationLine: `${address} · Baltimore, MD · confirm distribution schedule before travel`,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

export const MARYLAND_FOOD = [
  makeFood("grace-hope-mission", "Grace and Hope Mission — food pantry", "4 S Gay St, Baltimore, MD 21202", "410-685-5252", "The Food Bank lists pantry service Monday, Tuesday, Thursday, and Friday from 3–4 p.m. by appointment only."),
  makeFood("st-vincent-de-paul-church", "St. Vincent de Paul Church — food pantry", "120 N Front St, Baltimore, MD 21202", "410-962-5078", "The listed pantry hours are Mondays 12:30–2 p.m.; the directory says photo ID and proof of residence are required to sign up.", "www.stvchurch.org"),
  makeFood("va-crrc", "VA Community Resource and Referral Center — veteran food access", "209 W Fayette St, Baltimore, MD 21201", "410-637-3246", "The directory lists weekday hours 8:30 a.m.–3 p.m., federal holidays closed, and eligibility limited to military veterans."),
  makeFood("beans-and-bread", "Beans and Bread — breakfast and lunch service", "400 S Bond St, Baltimore, MD 21231", "410-732-1892", "The directory lists weekday breakfast 8:30–9:30 a.m. and lunch 11 a.m.–1 p.m.", "vincentbaltimore.org"),
  makeFood("south-creek-cdc", "South Creek Community Development Corporation — food assistance", "1021 Leadenhall St, Baltimore, MD 21230", "410-752-5191", "The directory lists Monday service from 10 a.m.–1 p.m.", "leadenhallbc.org"),
  makeFood("compassion-center", "The Compassion Center — food distribution", "1706 Eastern Ave, Baltimore, MD 21231", "410-327-2220", "The directory lists Tuesdays and Fridays from 10 a.m. until supplies last.", "www.baltimorerelief.com"),
  makeFood("our-right-our-life", "Our Right Our Life Youth Empowerment Initiative — food distribution", "1725 Eastern Ave, Baltimore, MD 21231", null, "The directory lists Monday and Wednesday 12–3 p.m., Thursday 11 a.m.–3 p.m., and Saturday and Sunday 10 a.m.–2 p.m.", "www.orolyep.org"),
  makeFood("mack-lewis-foundation", "The Mr. Mack Lewis Foundation — food distribution", "913 N Bond St, Baltimore, MD 21205", "410-299-1999", "The directory lists Tuesdays from noon until supplies last.", "www.macklewisfoundation.org"),
  makeFood("pauls-place", "Paul’s Place — weekday community lunch", "1118 Ward St, Baltimore, MD 21230", "410-625-0775", "The directory lists lunch Monday–Friday from 11 a.m.–12:30 p.m.", "www.paulsplaceoutreach.org"),
  makeFood("the-door", "The Door — food distribution", "219 N Chester St, Baltimore, MD 21231", "410-675-3288", "The directory lists distribution Tuesdays and Thursdays from 11 a.m.–noon.", "www.thedoorinc.org"),
];

// Additive statewide coverage: regional food access, peer support, benefit
// navigation, and local crisis contacts. These records preserve source scope
// and are not represented as phone-confirmed or exhaustive.
const makeMarylandAccess = ({ id, category, name, city, county, serviceArea, phone, address, link, source, description, resourceType }) => ({
  id: `md-${category}-${id}`,
  name,
  description,
  city,
  county,
  state: "MD",
  phone,
  address,
  link,
  source,
  serviceArea,
  coverageScope: county ? (serviceArea === county ? "county" : "multi-county region") : "statewide",
  resourceType,
  locationLine: `${serviceArea}${address ? ` · ${address}` : ""} · call to confirm current intake and availability`,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const MD_FOOD_SOURCE = "Maryland Department of Human Services food-bank and community-resource directory";
const MD_FOOD_LINK = "https://dhs.maryland.gov/community-resources-page/food-bank/";
export const MARYLAND_FOOD_REGIONAL = [
  makeMarylandAccess({ id: "carroll-human-services", category: "food", name: "Human Services Programs of Carroll County — food assistance", city: "Westminster", county: "Carroll County", serviceArea: "Carroll County", phone: "410-857-2999", address: "10 Distillery Drive, Westminster, MD 21157", link: "https://hspinc.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Human Services Programs of Carroll County in its food-resource directory. Call to ask about current pantry or food-assistance options, intake times, service-area rules, and what to bring; this listing does not guarantee food availability or same-day service.", resourceType: "food assistance and pantry referral" }),
  makeMarylandAccess({ id: "garrett-community-action", category: "food", name: "Garrett County Community Action — food assistance", city: "Oakland", county: "Garrett County", serviceArea: "Garrett County", phone: "301-334-9431", address: "104 East Center Street, Oakland, MD 21550", link: "https://garrettcac.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Garrett County Community Action among local food-resource contacts. Call the Oakland office to ask where food support is currently delivered, whether an appointment or referral is needed, and what eligibility or documentation rules apply before traveling.", resourceType: "food assistance and pantry referral" }),
  makeMarylandAccess({ id: "harford-community-action", category: "food", name: "Harford Community Action Agency — food and household support", city: "Edgewood", county: "Harford County", serviceArea: "Harford County", phone: "410-612-9909", address: "1321-B Woodbridge Station Way, Edgewood, MD 21040", link: "https://harfordcaa.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS includes Harford Community Action Agency in its food-resource directory. Contact the agency to ask about current food distribution or referral options, intake requirements, and location; services and supplies vary and must be confirmed directly.", resourceType: "food assistance and pantry referral" }),
  makeMarylandAccess({ id: "montgomery-choice-pantry", category: "food", name: "Choice Pantry — food access", city: "Germantown", county: "Montgomery County", serviceArea: "Montgomery County", phone: "301-793-3321", link: "https://senecacreek.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Choice Pantry as a Montgomery County food-resource contact and links it to Seneca Creek Community Church. Call before visiting to confirm the current pantry address, appointment process, household eligibility, and distribution schedule.", resourceType: "food pantry" }),
  makeMarylandAccess({ id: "mow-takoma-silver-spring", category: "food", name: "Meals on Wheels of Takoma Park/Silver Spring — meal access", city: "Takoma Park", county: "Montgomery County", serviceArea: "Takoma Park and Silver Spring area", phone: "301-434-1922", address: "6909 Laurel Avenue, Takoma Park, MD 20913", link: "https://www.mowtakoma.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists this local Meals on Wheels provider. Call to ask whether home-delivered meals are available for the person's location and circumstances, what assessment or eligibility applies, and whether there is a cost or waitlist; the listing does not promise immediate meal delivery.", resourceType: "home-delivered meals inquiry" }),
  makeMarylandAccess({ id: "mow-wheaton", category: "food", name: "Meals on Wheels of Wheaton — meal access", city: "Kensington", county: "Montgomery County", serviceArea: "Wheaton and nearby Montgomery County communities", phone: "301-942-1111", address: "10101 Connecticut Avenue, Kensington, MD 20895", link: "https://mowwheaton.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Meals on Wheels of Wheaton among county food contacts. Call to confirm the current service territory, meal-delivery eligibility, referral or assessment process, and any fees or waitlist before relying on this option.", resourceType: "home-delivered meals inquiry" }),
  makeMarylandAccess({ id: "mow-rockville", category: "food", name: "Rockville Meals on Wheels — meal access", city: "Rockville", county: "Montgomery County", serviceArea: "Rockville and nearby Montgomery County communities", phone: "301-340-1559", address: "1605 Veirs Mill Road, Rockville, MD 20851", link: "https://www.rockvillemealsonwheels.org/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Rockville Meals on Wheels as a Montgomery County food-resource contact. Call to confirm geographic coverage, referral or eligibility steps, delivery availability, and any costs; do not assume meals are available without the provider's confirmation.", resourceType: "home-delivered meals inquiry" }),
  makeMarylandAccess({ id: "mow-germantown", category: "food", name: "Meals on Wheels of Germantown — meal access", city: "Germantown", county: "Montgomery County", serviceArea: "Germantown area", phone: "301-706-0262", link: "https://www.mowgermantown.com/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists this Meals on Wheels organization in its Montgomery County food directory. Contact the organization to check its current delivery area, eligibility, assessment/referral steps, fees, and wait times.", resourceType: "home-delivered meals inquiry" }),
  makeMarylandAccess({ id: "seton-center-somerset", category: "food", name: "Seton Center / Catholic Charities — food assistance", city: "Princess Anne", county: "Somerset County", serviceArea: "Somerset County and nearby Lower Shore communities; confirm catchment", phone: "410-651-9608", address: "30632 Hampden Avenue, Princess Anne, MD 21853", link: "https://www.ccwilm.org/seton-center/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Seton Center/Catholic Charities as a Somerset County food-resource contact. Call to ask about current food assistance, distribution location and dates, eligibility, and whether an appointment or referral is required.", resourceType: "food assistance and pantry referral" }),
  makeMarylandAccess({ id: "allegany-gateway-to-hope", category: "food", name: "Gateway to Hope — food assistance", city: "Cumberland", county: "Allegany County", serviceArea: "Allegany County", phone: "301-724-2378", address: "401 W. Industrial Boulevard, Cumberland, MD 21502", link: "https://www.rise4me.com/", source: MD_FOOD_SOURCE, description: "Maryland DHS lists Gateway to Hope as an Allegany County food-resource contact. Call the organization to confirm current food support, where and when it is provided, any eligibility or intake requirements, and whether supplies are available before traveling.", resourceType: "food assistance and pantry referral" }),
  makeMarylandAccess({ id: "allegany-interfaith-pantry", category: "food", name: "Interfaith Community Pantry — food pantry", city: "Cumberland", county: "Allegany County", serviceArea: "Allegany County; confirm any residency requirements", phone: "301-777-7882", address: "301 Cumberland Street, Cumberland, MD 21502", link: MD_FOOD_LINK, source: MD_FOOD_SOURCE, description: "Maryland DHS lists Interfaith Community Pantry as an Allegany County food-resource contact. Call before visiting to verify current distribution times, any registration or residency requirements, and whether food is available that day.", resourceType: "food pantry" }),
];

const MD_SNAP_SOURCE = "Maryland Department of Human Services SNAP Outreach Community-Based Organization directory";
const MD_SNAP_DESCRIPTION = "Maryland DHS authorizes this community organization to provide free information and application assistance for SNAP in its published service area. It can help with an application but does not determine eligibility or issue benefits. Call to confirm appointment options, language access, service boundaries, and documents that may be useful.";
export const MARYLAND_BENEFITS = [
  makeMarylandAccess({ id: "snap-mrelief-statewide", category: "benefits", name: "mRelief — Maryland SNAP application screening and navigation", city: "Statewide", serviceArea: "Maryland statewide", phone: "844-785-7627", link: "https://www.mrelief.com/", source: MD_SNAP_SOURCE, description: `${MD_SNAP_DESCRIPTION} Maryland DHS lists mRelief as a statewide SNAP outreach provider.`, resourceType: "SNAP benefit application navigation" }),
  makeMarylandAccess({ id: "snap-cash-campaign-baltimore", category: "benefits", name: "CASH Campaign of Maryland — SNAP application help", city: "Baltimore", county: "Baltimore City", serviceArea: "Baltimore City", phone: "443-692-9430", address: "575 S. Charles Street, Suite 500, Baltimore, MD 21201", link: "https://cashmd.org/", source: MD_SNAP_SOURCE, description: `${MD_SNAP_DESCRIPTION} Maryland DHS lists CASH Campaign of Maryland as a SNAP outreach contact serving Baltimore City.`, resourceType: "SNAP benefit application navigation" }),
  makeMarylandAccess({ id: "snap-lifestyles-southern-maryland", category: "benefits", name: "LifeStyles of Maryland — SNAP outreach for Southern Maryland", city: "La Plata", county: "Charles County", serviceArea: "Anne Arundel, Charles, Calvert, Prince George’s, and St. Mary’s counties", phone: "301-609-9900", address: "101 Catalpa Drive, Suite 103, La Plata, MD 20646", link: "https://www.lifestylesofmd.org/", source: MD_SNAP_SOURCE, description: `${MD_SNAP_DESCRIPTION} The DHS directory names LifeStyles of Maryland as a lead SNAP outreach organization for five Southern Maryland and central Maryland counties.`, resourceType: "SNAP benefit application navigation" }),
  makeMarylandAccess({ id: "snap-harford-community-action", category: "benefits", name: "Harford Community Action Agency — SNAP application help", city: "Edgewood", county: "Harford County", serviceArea: "Harford and Cecil counties", phone: "443-686-0029", address: "1321-B Woodbridge Station Way, Edgewood, MD 21040", link: "https://harfordcaa.org/", source: MD_SNAP_SOURCE, description: `${MD_SNAP_DESCRIPTION} Maryland DHS lists Harford Community Action Agency as a lead SNAP outreach organization for Harford and Cecil counties.`, resourceType: "SNAP benefit application navigation" }),
  makeMarylandAccess({ id: "snap-manna-montgomery", category: "benefits", name: "Manna Food Center — SNAP application assistance", city: "Silver Spring", county: "Montgomery County", serviceArea: "Montgomery County", phone: "301-424-1130 ext. 7383", address: "12301 Old Columbia Pike, Suite 200, Silver Spring, MD 20904", link: "https://www.mannafood.org/", source: MD_SNAP_SOURCE, description: `${MD_SNAP_DESCRIPTION} Maryland DHS lists Manna Food Center as a SNAP outreach contact for Montgomery County.`, resourceType: "SNAP benefit application navigation" }),
];

const MD_PEER_SOURCE = "Maryland Department of Health and local county health department peer-support service pages";
export const MARYLAND_PEER = [
  makeMarylandAccess({ id: "family-peer-parents-place", category: "peer", name: "Parents’ Place of Maryland — family peer support", city: "Glen Burnie", county: "Anne Arundel County", serviceArea: "Every Maryland county; Spanish support is available", phone: "410-768-9100", address: "802 Cromwell Park Drive, Suite H, Glen Burnie, MD 21061", link: "https://health.maryland.gov/bha/Pages/Family-Peer-Support-and-Navigation.aspx", source: MD_PEER_SOURCE, description: "The Maryland Behavioral Health Administration says Parents’ Place of Maryland provides free family peer support and Good Samaritan education in every county, with Spanish support available. Family peer specialists help caregivers understand systems and connect with treatment and recovery supports. Call to ask for the local specialist and current ways to connect.", resourceType: "family peer support and navigation" }),
  makeMarylandAccess({ id: "family-peer-coalition", category: "peer", name: "Maryland Coalition of Families — statewide family peer navigation", city: "Columbia", county: "Howard County", serviceArea: "Every Maryland county", phone: "410-730-8267", address: "10632 Little Patuxent Parkway, Suite 234, Columbia, MD 21044", link: "https://health.maryland.gov/bha/Pages/Family-Peer-Support-and-Navigation.aspx", source: MD_PEER_SOURCE, description: "Maryland BHA reports free family peer specialists are available through Maryland Coalition of Families in every county. The service helps families caring for someone with mental-health, substance-use, gambling, or co-occurring needs navigate systems and find supports. Call 410-730-8267 and press 1 to request a community connection; language access options are described on the state page.", resourceType: "family peer support and navigation" }),
  makeMarylandAccess({ id: "howard-peer-recovery", category: "peer", name: "Howard County Peer Recovery Support — lived-experience support", city: "Columbia", county: "Howard County", serviceArea: "Howard County", phone: "667-203-1253", address: "8930 Stanford Boulevard, Columbia, MD 21045", link: "https://www.howardcountymd.gov/health/peer-recovery-support", source: "Howard County Health Department Peer Recovery Support", description: "Howard County Health Department offers peer support from specialists with lived experience related to substance use. The county publishes a confidential voice and text message line; posted staffed hours are Monday–Thursday 8:00 a.m.–5:30 p.m. and 24/7 Friday–Sunday. Call or text and confirm current response time and in-person drop-in locations.", resourceType: "peer recovery support" }),
  makeMarylandAccess({ id: "carroll-peer-recovery", category: "peer", name: "Carroll County Health Department — Peer Recovery Support Services", city: "Westminster", county: "Carroll County", serviceArea: "Carroll County; adults 18 and older", phone: "410-876-2152", address: "290 S. Center Street, Westminster, MD 21157", link: "https://health.maryland.gov/carroll/Pages/Peer-Recovery-Support-Services.aspx", source: "Maryland Department of Health, Carroll County Peer Recovery Support Services", description: "Carroll County Health Department describes peer recovery support for adults 18 and older with mental-health or substance-use needs who are seeking recovery. Peer specialists draw on lived experience to connect people with community resources. Call the department to confirm intake, scheduling, and current program availability.", resourceType: "peer recovery support" }),
  makeMarylandAccess({ id: "pg-peer-recovery", category: "peer", name: "Prince George’s County Peer Recovery Services", city: "Suitland", county: "Prince George’s County", serviceArea: "Prince George’s County; Bridge Center services include county residents age 18+ in designated groups", phone: "301-817-1900", address: "Bridge Center at Adam’s House, 5001 Silver Hill Road, Suite 300, Suitland, MD 20746", link: "https://www.princegeorgescountymd.gov/departments-offices/health/behavioral-health/peer-recovery-services", source: "Prince George’s County Behavioral Health Division Peer Recovery Services and Bridge Center contact page", description: "Prince George’s County describes peer-led recovery support for people with mental-health and substance-use challenges, including forensic peer support for people returning to the community after incarceration. Peer SUD referrals are accepted by email, while the Bridge Center publishes 301-817-1900 for contact. Call to ask about the right peer referral path, eligibility, and current hours before visiting.", resourceType: "peer recovery support and navigation" }),
];

const MD_URGENT_SOURCE = "Maryland county behavioral-health crisis provider and county crisis-services pages";
export const MARYLAND_URGENT = [
  makeMarylandAccess({ id: "anne-arundel-warmline", category: "urgent", name: "Anne Arundel County Community Warmline — 24/7 crisis support", city: "Annapolis", county: "Anne Arundel County", serviceArea: "Anne Arundel County", phone: "410-768-5522", link: "https://aamentalhealth.org/programs-services/crisis-services", source: "Anne Arundel County Mental Health Agency Crisis Services", description: "The county's Community Warmline is staffed 24 hours a day, 7 days a week for mental-health and substance-use crises. Staff can offer support and link callers to county resources, including mobile crisis teams and urgent care. For immediate danger or a life-threatening emergency, call 911. This county service is not a substitute for emergency dispatch.", resourceType: "county behavioral-health crisis warmline" }),
  makeMarylandAccess({ id: "harford-crisis-response", category: "urgent", name: "Harford Crisis Response — 24/7 hotline and mobile crisis teams", city: "Bel Air", county: "Harford County", serviceArea: "Harford County; adults and children", phone: "800-639-8783", address: "Office on Mental Health, 2231 Conowingo Road, Suite A, Bel Air, MD 21015", link: "https://harfordmentalhealth.org/harford-crisis-response/", source: "Office on Mental Health/Core Service Agency of Harford, Inc.", description: "Harford Crisis Response provides 24-hour phone counseling and mobile crisis teams for adults and children facing behavioral-health or substance-use crises. Its provider says mobile teams can assess and stabilize people at home or in the community and connect them to follow-up support. Call 800-639-8783 or local 410-874-0711. In immediate danger, call 911.", resourceType: "county crisis hotline and mobile response" }),
  makeMarylandAccess({ id: "howard-grassroots-crisis", category: "urgent", name: "Grassroots Crisis Intervention — Howard County 24/7 crisis line", city: "Columbia", county: "Howard County", serviceArea: "Howard County", phone: "410-531-6677", link: "https://www.howardcountymd.gov/health/behavioral-health", source: "Howard County Behavioral Health and Maryland BHA crisis contacts", description: "Howard County lists Grassroots Crisis Intervention at 410-531-6677 as a 24-hour, 7-day crisis support option, including mobile response. Call for urgent behavioral-health support and to ask whether a local response is appropriate. For immediate danger or a life-threatening emergency, call 911.", resourceType: "county crisis line and mobile response" }),
  makeMarylandAccess({ id: "montgomery-crisis-center", category: "urgent", name: "Montgomery County Crisis Center — 24/7 urgent mental-health support", city: "Rockville", county: "Montgomery County", serviceArea: "Montgomery County; 24 hours a day, 7 days a week", phone: "240-777-4000", address: "1301 Piccard Drive, Rockville, MD 20850", link: "https://www3.montgomerycountymd.gov/311/Solutions.aspx?AspxAutoDetectCookieSupport=1&SolutionId=1-64VITH", source: "Montgomery County Department of Health and Human Services", description: "Montgomery County's Crisis Center operates 24/7. County counselors can assess an acute mental-health crisis, discuss recommendations, and connect people with urgent resources; the county also lists mobile crisis outreach through this center. Call 240-777-4000 before traveling. For immediate danger, call 911.", resourceType: "county crisis center and mobile response" }),
  makeMarylandAccess({ id: "eastern-shore-operations-center", category: "urgent", name: "Eastern Shore Operations Center — regional crisis response", city: "Easton", county: "Talbot County", serviceArea: "Eastern Shore counties; call to confirm local coverage and response", phone: "888-407-8018", address: "28577 Mary’s Court, Suite 5, Easton, MD 21601", link: "https://midshorebehavioralhealth.org/programs/safe-stations/", source: "Mid Shore Behavioral Health and Eastern Shore Safe Stations", description: "Mid Shore Behavioral Health publishes 888-407-8018 for its regional Eastern Shore crisis and Safe Station network. Safe Stations are available around the clock at specified partner locations for people seeking individualized substance-use and recovery options; they are not shelters. Call first to identify the nearest active location and confirm the right service. For immediate danger, call 911.", resourceType: "regional substance-use crisis and recovery access" }),
];
