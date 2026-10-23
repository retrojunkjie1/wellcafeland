/**
 * Nigeria recovery and substance-use service contacts.
 *
 * NDLEA state-command contacts below are transcribed only for entries currently
 * present on its public rehabilitation-centres page. Providers and meeting
 * contacts are published by their respective organizations. These are contact
 * pathways, not live capacity, eligibility, or meeting-attendance guarantees.
 */
const NDLEA_DIRECTORY_URL = "https://www.ndlea.gov.ng/rehabilitation";
const CHECKED_AT = "2026-10-22";

const stateCommands = [
  ["abia", "Aba", "Old Party Secretariat, Ogbor Hill, Aba, Abia State", "08065536820"],
  ["adamawa", "Jimeta", "Old SDP Secretariat, No. 1 Abdullahi Bashir Street, Yola Road, Jimeta, Adamawa State", "08033104216"],
  ["akwa-ibom", "Uyo", "291 Nwana-Iba Road, Uyo, Akwa Ibom State", "08037206872"],
  ["anambra", "Onitsha", "Old Party Secretariat, Nsugbe Road, Rans Nkis, Onitsha, Anambra State", "08033191414"],
  ["bauchi", "Bauchi", "White House, Mechanic Village, Jos Road, Bauchi State", "08028440684"],
  ["bayelsa", "Yenagoa", "Okutukuta, Nbiama, Yenegoa Road, Bayelsa State", "07032552366"],
  ["benue", "Makurdi", "Old SDP Secretariat, Ankpa Road, Makurdi, Benue State", "08065317464"],
  ["borno", "Maiduguri", "Old Party Secretariat, Gamborou Ngala Road, Maiduguri, Borno State", "08100513954"],
  ["delta", "Ogwashi-Uku", "Old SDP Party Secretariat, Isah Road, Ogwashi-Uku, Delta State", "07060818881"],
  ["ebonyi", "Abakaliki", "10 Elias Odili Street, Abakaliki, Ebonyi State", "08033912316"],
  ["edo", "Benin City", "Old SDP Secretariat, Upper Sokponba, Benin City, Edo State", "08029601278"],
  ["enugu", "Enugu", "Old SDP Secretariat, Vosan Drive, Independence Layout, Enugu State", "08037029447"],
  ["fct", "Abuja", "Plot 1093 Joseph Gomwalk Street, Gudu, Abuja, FCT, Nigeria", "07035356722"],
  ["gombe", "Gombe", "Old BASAC Office BCJ, Gombe State", "07038715512"],
  ["imo", "Owerri", "Old NRC Party Office, Aba Road, Owerri, Imo State", "08038072505"],
  ["jigawa", "Dutse", "NIFOR Quarters, Dutse, Jigawa State", "08132267383"],
  ["kaduna", "Kaduna", "Olusegun Obasanjo Secretariat, Yakubu Gowon Road, Kaduna State", "08030695875"],
  ["kano", "Kano", "Kano State Command, Airport Road, Kano State", "08033498396"],
  ["katsina", "Katsina", "Party Secretariat, Kofar Kwaya, Katsina State", "08036057045"],
  ["kebbi", "Birnin Kebbi", "No. 25 Emir Haruna Road, Birnin Kebbi, Kebbi State", "08023865986"],
  ["kogi", "Lokoja", "New Layout, Liberty Hotel, Lokoja, Kogi State", "08023509600"],
  ["kwara", "Ilorin", "Defunct NRC Party Office, KM 2 Sobi Barracks Road, Ilorin, Kwara State", "08028928936"],
  ["lagos", "Lagos", "5 Jogunomi Street, Gwagada Phase 2 Estate, Lagos State", "08039673044"],
  ["nasarawa", "Lafia", "Makurdi Road, Lafia, Nasarawa State", "08065658160"],
  ["niger", "Minna", "Defunct NRC Secretariat, Western Bypass, opposite Police Secondary School, Minna, Niger State", "08060738608"],
  ["ondo", "Akure", "257 Alagbaka, GRA, Akure, Ondo State", "08033426773"],
  ["oyo", "Ibadan", "Quarter 585 Link Reservation, Onikere GRA, Ibadan, Oyo State", "08062180325"],
  ["plateau", "Jos", "New Rikkos Layout, Jos, Plateau State", "07065762063"],
  ["rivers", "Port Harcourt", "Defunct SDP Secretariat, Artillery Junction, Aba Road, Port Harcourt, Rivers State", "08033667277"],
  ["sokoto", "Sokoto", "Former Party House, Kalam Baina Road, Arkilla-Nasarawa, Sokoto State", "08039393352"],
];

export const NIGERIA_STATE_RECOVERY_SERVICES = stateCommands.map(([id, city, address, phone]) => {
  const state = id === "fct" ? "Federal Capital Territory" : id.charAt(0).toUpperCase() + id.slice(1).replaceAll("-", " ");
  return {
    id: `ndlea-${id}-counselling-rehabilitation`,
    name: `NDLEA ${state} state-command contact`,
    resourceType: "Public substance-use counseling and treatment referral",
    description: "NDLEA publishes this state-command address and contact for counseling and rehabilitation enquiries. This is a government contact and referral route, not proof of a treatment bed or a complete list of providers in the state. Call to confirm the current service, intake steps, and address before travelling. For additional referrals, call NDLEA’s published national line.",
    phone: phone === "080010203040" ? null : phone,
    link: NDLEA_DIRECTORY_URL,
    source: "National Drug Law Enforcement Agency (NDLEA) · rehabilitation directory and state formations",
    verified: true,
    city,
    state,
    country: "Nigeria",
    region: `${city}, ${state}, Nigeria`,
    address,
    locationLine: `${city}, ${state}, Nigeria · state-command address listed by NDLEA · call before visiting`,
    directoryRole: "state-referral",
    checkedAt: CHECKED_AT,
  };
});

export const NIGERIA_LOCAL_RECOVERY_RESOURCES = [
  ...NIGERIA_STATE_RECOVERY_SERVICES,
  {
    id: "ndlea-national-treatment-referral", name: "NDLEA / WADA — national counseling and treatment referral line",
    resourceType: "National substance-use counseling · referral to state services",
    description: "NDLEA publishes this free counseling line and advises people to contact their nearest state command to locate rehabilitation services. Call to ask for the current treatment or counseling contact serving your state, including when no direct provider address is listed here.",
    phone: "080010203040", link: "https://ndlea.gov.ng/rehabilitation", source: "National Drug Law Enforcement Agency (NDLEA) · rehabilitation directory and hotline", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide · call for the current service contact in your state", checkedAt: CHECKED_AT,
    directoryRole: "national-referral",
  },
  {
    id: "synapse-mustard-abuja", name: "Synapse Mustard Center — addiction and mental-health care",
    resourceType: "Clinical treatment · outpatient and residential",
    description: "Synapse lists this Abuja facility within its mental-health and addiction-care network. Call to confirm current services, intake, cost, and availability before traveling.",
    phone: "+2348152882329", link: "https://synapseservices.org/index.html", source: "Synapse Services",
    verified: true, city: "Abuja", state: "Federal Capital Territory", country: "Nigeria", region: "Abuja, Federal Capital Territory, Nigeria",
    address: "No. 10 Inuwa Wada Crescent, off T.O.S. Benson Street, Utako District, Abuja, Nigeria", locationLine: "Utako District, Abuja", checkedAt: CHECKED_AT,
  },
  {
    id: "synapse-magnolia-lagos", name: "Synapse Magnolia Center — addiction and mental-health care",
    resourceType: "Clinical treatment · outpatient and residential",
    description: "Synapse lists this Lagos facility within its mental-health and addiction-care network. Call to confirm current services, intake, cost, and availability before traveling.",
    phone: "+2349092190476", link: "https://synapseservices.org/index.html", source: "Synapse Services",
    verified: true, city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria",
    address: "14A Alabi Street, off Toyin Street, Ikeja, Lagos, Nigeria", locationLine: "Ikeja, Lagos", checkedAt: CHECKED_AT,
  },
  {
    id: "synapse-japonica-port-harcourt", name: "Synapse Japonica Center — addiction and mental-health care",
    resourceType: "Clinical treatment · outpatient and residential",
    description: "Synapse lists this Port Harcourt facility within its mental-health and addiction-care network. Call to confirm current services, intake, cost, and availability before traveling.",
    phone: "+2349056811133", link: "https://synapseservices.org/index.html", source: "Synapse Services",
    verified: true, city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers, Nigeria",
    address: "5B Rumuibekwe Road, Rumuibekwe, Port Harcourt, Rivers State, Nigeria", locationLine: "Rumuibekwe, Port Harcourt", checkedAt: CHECKED_AT,
  },
  {
    id: "paxora-port-harcourt-rehabilitation", name: "Paxora Rehabilitation Center — addiction treatment",
    resourceType: "Clinical treatment · rehabilitation",
    description: "Paxora describes addiction-rehabilitation services at its Port Harcourt center. Contact the provider to confirm the treatment options, intake process, costs, and current availability before traveling.",
    phone: "+2348132658202", alternatePhone: "+2349156296285", email: "paxorarehab@gmail.com", link: "https://www.paxorarehabcenter.com/", source: "Paxora Rehabilitation Center",
    verified: true, city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers, Nigeria",
    address: "No. 3 Road 12, Pipeline, Rumuogholu, Port Harcourt, Rivers State, Nigeria", locationLine: "Rumuogholu, Port Harcourt", checkedAt: CHECKED_AT,
  },
  {
    id: "elpida-port-harcourt-rehabilitation", name: "Elpida Rehabilitation Center — addiction treatment",
    resourceType: "Clinical treatment · inpatient and outpatient rehabilitation",
    description: "Elpida describes inpatient and outpatient rehabilitation. Call to discuss the right level of care, intake, fees, and current availability; confirm the address before traveling.",
    phone: "+2347025800331", alternatePhone: "+2347088490825", link: "https://elpidarehab.com/contact-us/", source: "Elpida Rehabilitation Center",
    verified: true, city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers, Nigeria",
    address: "No. 12 Mini Avenue, beside Emsoch Emirates Hotel, off Odaraware Road, off NTA Road, Port Harcourt, Rivers State, Nigeria", locationLine: "Off NTA Road, Port Harcourt", checkedAt: CHECKED_AT,
  },
  {
    id: "shalom-medical-resources-port-harcourt", name: "Shalom Medical Resources — addiction and recovery care",
    resourceType: "Clinical treatment · addiction care",
    description: "Shalom Medical Resources describes addiction care and rehabilitation services in Port Harcourt. Contact the provider to confirm its current services, clinical intake, fees, and availability.",
    phone: "+2347036527993", email: "princewill.stanley@uniport.edu.ng", link: "https://www.shalommedicalresources.com/", source: "Shalom Medical Resources",
    verified: true, city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers, Nigeria",
    address: "No. 1 Da Sunday Stanley Circular Close, off KM 1.5 East-West Road, Port Harcourt, Rivers State, Nigeria", locationLine: "East-West Road, Port Harcourt", checkedAt: CHECKED_AT,
  },
  {
    id: "gamblers-anonymous-port-harcourt-monday", name: "Port Harcourt Gamblers Anonymous — Monday meeting",
    resourceType: "Peer support · gambling recovery · in person",
    description: "The official meeting finder lists this Port Harcourt gathering as in person, but does not publish a current meeting time on the listing. Confirm the schedule and entry details before attending.",
    link: "https://gamblersanonymous.org/find-a-meeting/port-harcourt-g-a-monday/", source: "Gamblers Anonymous · official meeting finder",
    verified: true, city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers, Nigeria",
    address: "Koral Center YKC, Elelenwo-Woji Road, Woji, Port Harcourt, Rivers State, Nigeria", locationLine: "Woji, Port Harcourt · schedule needs confirmation", checkedAt: CHECKED_AT,
  },
  {
    id: "synapse-oak-awka", name: "Synapse Oak Center — addiction and mental-health care",
    resourceType: "Clinical treatment · outpatient and residential",
    description: "Synapse lists this Anambra facility within its mental-health and addiction-care network. Call to confirm current services, intake, cost, and availability before traveling.",
    phone: "+2347056409301", link: "https://synapseservices.org/index.html", source: "Synapse Services",
    verified: true, city: "Awka", state: "Anambra", country: "Nigeria", region: "Awka, Anambra, Nigeria",
    address: "No. 24 Senator Uche Ekwunife Crescent, by Valuation House, Awka, Anambra State, Nigeria", locationLine: "Awka, Anambra", checkedAt: CHECKED_AT,
  },
  {
    id: "emmanuel-alayande-ibadan-rehabilitation", name: "Emmanuel Alayande Rehabilitation Centre",
    resourceType: "Rehabilitation and recovery care",
    description: "Ibadan recovery centre. Call to confirm which programs are currently offered, admission requirements, cost, and availability before traveling.",
    phone: "+23480511112222", link: "https://www.earc-ng.com/location-contact", source: "Emmanuel Alayande Rehabilitation Centre",
    verified: true, city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria",
    address: "Awotunde Estate, Elewuro, Ibadan, Oyo State, Nigeria", locationLine: "Ibadan, Oyo", checkedAt: CHECKED_AT,
  },
  {
    id: "sure-hope-ibadan-addiction-counseling", name: "Sure Hope Counseling Clinic — addiction and recovery therapy",
    resourceType: "Addiction counseling · family support · online and in person",
    description: "The clinic describes counseling for substance and behavioral addictions, relapse-prevention planning, and family support. Contact the clinic to confirm appointment availability, fees, and current service format.",
    phone: "+2347067921204", email: "info@shcounselingclinic.org.ng", link: "https://shcounselingclinic.org.ng/service/addiction-and-recovery-therapy/", source: "Sure Hope Counseling Clinic",
    verified: true, city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria",
    address: "Store G16, Ground Floor, Jericho Mall, Ibadan, Oyo State, Nigeria", locationLine: "Jericho, Ibadan", checkedAt: CHECKED_AT,
  },
  {
    id: "gamble-pause-lagos-peer-groups", name: "Gamble Pause — peer-led support groups",
    resourceType: "Peer support · gambling recovery · free, in person and online",
    description: "Lagos MiND’s provider directory lists peer-led groups and psychosocial support for people affected by gambling. This profile is not yet verified by the Lagos State Ministry of Health; contact the organization to confirm group access and current details.",
    phone: "+2349137667191", link: "https://lagosmind.org/provider-gamble-pause", source: "Lagos MiND Community of Providers · provider-submitted profile",
    verified: false, city: "Lagos", state: "Lagos", country: "Nigeria", region: "Surulere, Lagos, Nigeria",
    locationLine: "Surulere, Lagos · in person and online; address not published", checkedAt: CHECKED_AT,
  },
  {
    id: "lagos-mind-referral-line", name: "Lagos MiND — provider and support referrals",
    resourceType: "Free mental-health helpline and referral",
    description: "Lagos State’s mental-health information and development service offers free confidential support and can help callers navigate local providers. Ask specifically for substance-use counseling, peer groups, or rehabilitation referrals in your area.",
    phone: "+2347000006463", link: "https://lagosmind.org/providers", source: "Lagos State Mental Health in Development (Lagos MiND)",
    verified: true, city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria",
    locationLine: "Lagos State · also lists 020 1410 6463 and WhatsApp 090 9000 6463", checkedAt: CHECKED_AT,
  },
];

export const NIGERIA_CITIES = [
  "Abuja", "Lagos", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin City", "Awka",
  "Aba", "Uyo", "Onitsha", "Bauchi", "Yenagoa", "Makurdi", "Maiduguri", "Ogwashi-Uku",
  "Abakaliki", "Gombe", "Owerri", "Dutse", "Kaduna", "Katsina", "Birnin Kebbi", "Lokoja",
  "Ilorin", "Lafia", "Minna", "Akure", "Jos", "Sokoto",
];

export const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory", "FCT",
];

// Additional verified pathways for the Nigeria-first launch. A nationwide
// referral is kept separate from an address-confirmed local service; these
// records describe the service area honestly and do not imply open beds,
// eligibility, or current funding rounds.
export const NIGERIA_HOUSING_RESOURCES = [
  {
    id: "dsvsf-national-survivor-support", name: "DSVSF — survivor support and safe-shelter referrals",
    resourceType: "Survivor support · counselling · legal aid · emergency shelter referral",
    description: "The Domestic and Sexual Violence Survivors Foundation says it provides survivor support, counselling, legal aid, safety planning, and emergency shelter referrals across Nigeria. Call before sharing identifying details or travelling; ask whether they serve your state, how to contact them safely, and whether a referral or place to stay is available.",
    phone: "+2348081907305", email: "contact@dsvsf.org.ng", link: "https://dsvsf.org.ng/", source: "Domestic and Sexual Violence Survivors Foundation (DSVSF)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide referral · 24/7 hotline · confirm local coverage and current shelter access", checkedAt: CHECKED_AT,
  },
  {
    id: "wela-safe-accommodation-referral", name: "WELA Home — safe accommodation for women and children",
    resourceType: "Safe accommodation · confidential referral",
    description: "WELA says its temporary accommodation supports women and children leaving abuse, with feeding and other resources, and lists capacity for up to 15 people. Contact its Lagos office to request a safe referral and confirm eligibility and current capacity. WELA also lists offices in Ado-Ekiti and Abuja; those are support offices, not shelter walk-in locations.",
    phone: "+2347055802420", link: "https://welaonline.org/wela-home/", source: "Women Empowerment and Legal Aid (WELA) · accommodation and contact pages",
    verified: true, country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide shelter referral · support office: 25 Adekunle Fajuyi Way, GRA, Ikeja, Lagos · call before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "wavehi-safety-planning-lagos", name: "WAVEHI — safety planning and shelter referral (Lagos)",
    resourceType: "Domestic-violence support · shelter referral",
    description: "WAVEHI supports women and girls affected by violence and can discuss safety support and referral options. Contact them to confirm the right service, current availability, and a safe contact method; this listing does not promise a shelter bed.",
    phone: "+2349077128075", alternatePhone: "+2348144015052", link: "https://www.wavehi-ng.com/contact-us/", source: "Women at Risk and Vulnerable Initiative (WAVEHI)",
    verified: true, city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", address: "321 Road, D Close, House 30, Festac Town, Lagos, Nigeria", locationLine: "Festac Town, Lagos · safety support and referral; confirm before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "wavehi-safety-planning-abuja", name: "WAVEHI — safety planning and shelter referral (Abuja)",
    resourceType: "Domestic-violence support · shelter referral",
    description: "WAVEHI supports women and girls affected by violence and can discuss safety support and referral options. Contact them to confirm the right service, current availability, and a safe contact method; this listing does not promise a shelter bed.",
    phone: "+2349077128075", alternatePhone: "+2348144015052", link: "https://www.wavehi-ng.com/contact-us/", source: "Women at Risk and Vulnerable Initiative (WAVEHI)",
    verified: true, city: "Abuja", state: "Federal Capital Territory", country: "Nigeria", region: "Abuja, Federal Capital Territory, Nigeria", address: "Plot 257, Doma Extension Layout, Gwagwalada, Abuja, Nigeria", locationLine: "Gwagwalada, Abuja · safety support and referral; confirm before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "unhcr-nigeria-protection", name: "UNHCR Nigeria — protection help for refugees and asylum-seekers",
    resourceType: "Protection · shelter and safety referrals · eligibility-limited",
    description: "For refugees and asylum-seekers in Nigeria, UNHCR lists protection contacts and country support. Ask about safe accommodation, legal/protection help, and current referral routes. This service is eligibility-specific and is not a general public shelter line.",
    phone: "+2349010660647", alternatePhone: "+2348031230399", link: "https://help.unhcr.org/nigeria/about-unhcr-in-nigeria/contact-us/", source: "UNHCR Nigeria", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria · for refugees and asylum-seekers; call for current office hours and local referral", checkedAt: CHECKED_AT,
  },
  {
    id: "rivers-social-welfare-safe-home", name: "Rivers State Ministry of Social Welfare — Safe Home referral",
    resourceType: "State safe-home service · temporary shelter · protection referral",
    description: "The Rivers State Ministry lists temporary shelter, care coordination, and safety planning for vulnerable people needing urgent protection. Call to ask for assessment, eligibility, safe referral steps, and current availability before travelling. The published ministry contact is not a shelter walk-in address.",
    phone: "07040410523", alternatePhone: "07040410081", link: "https://socialwelfare.riversstate.gov.ng/Services", source: "Rivers State Ministry of Social Welfare and Rehabilitation · official services page", verified: true,
    city: "Port Harcourt", state: "Rivers", country: "Nigeria", region: "Port Harcourt, Rivers State, Nigeria", locationLine: "Port Harcourt, Rivers State · call the ministry for safe-home referral; no public shelter address listed", checkedAt: CHECKED_AT,
  },
  {
    id: "oyo-women-safe-house-referral", name: "Women Safe House and Sustenance Initiative — confidential shelter contact",
    resourceType: "Emergency shelter referral · women and girls",
    description: "The organization’s own site describes a 24-hour emergency and temporary shelter for women and girls affected by violence, with confidential intake, care coordination, counseling, healthcare, and safety planning. Contact the team for a safe referral. The shelter address is intentionally not published.",
    phone: "+2348121133399", email: "info@womensafehouse.org", link: "https://www.womensafehouse.org/", source: "Women Safe House Sustenance Initiative · official site", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", locationLine: "Ibadan · confidential shelter location; contact for safe referral; 24-hour shelter service described by organization", checkedAt: CHECKED_AT,
  },
];

export const NIGERIA_FOOD_RESOURCES = [
  {
    id: "no-hunger-food-bank-abuja", name: "No Hunger Food Bank — Abuja food and nutrition support",
    resourceType: "Food bank · targeted food and nutrition support",
    description: "No Hunger Food Bank says it supports vulnerable households across Northern Nigeria and IDP communities nationwide. Contact the team to ask whether they can refer or assist your household, where current distributions are happening, and what eligibility applies. The office is not a walk-in pantry and food availability is not guaranteed.",
    phone: "+2347063875444", alternatePhone: "+2347048867678", whatsapp: "+2349162768387", email: "info@nohungerfoodbank.org", link: "https://www.nohungerfoodbank.org/contact/", source: "No Hunger Food Bank", verified: true,
    city: "Abuja", state: "FCT", country: "Nigeria", region: "Abuja, Nigeria", address: "90C Golden Spring Estate, Abuja, Nigeria", locationLine: "Abuja office · call first to ask about beneficiary referral and current distribution", checkedAt: CHECKED_AT,
  },
  {
    id: "ibadan-food-bank-network", name: "Ibadan Food Bank Network — food assistance contact",
    resourceType: "Food bank · community food assistance",
    description: "Contact the Ibadan Food Bank Network to ask about current food assistance, beneficiary intake, distribution or pickup arrangements, and any referral requirements before traveling.",
    phone: "+2348037187637", email: "ibadanfoodbanknetwork@gmail.com", link: "https://ibadanfoodbanknetwork.mystrikingly.com/contact", source: "Ibadan Food Bank Network", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", address: "Suite 18, Odua Shopping Center, Idi-Ape, Ibadan, Oyo State, Nigeria", locationLine: "Administrative office · Monday–Friday, 10am–5pm; call before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "tgnc-ibadan-food-bank", name: "TGNC Food Bank — nutrition and food support",
    resourceType: "Food bank · nutrition support · community outreach",
    description: "The Nutrition Professionals Network Initiative publishes a food-bank volunteer handbook with an Ibadan pantry address and contact email. Ask about current beneficiary intake, distribution times, eligibility, and whether visitors should use a different distribution location before travelling.",
    phone: null, email: "tgncfoodbank@gmail.com", link: "https://www.tgnc.com.ng/static/Comprehensive-Handbook-for-Volunteers.pdf", source: "TGNC Food Bank · Nutrition Professionals Network Initiative", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", address: "No. 4, Oshuntokun Avenue, Old Bodija, Ibadan, Oyo State, Nigeria", locationLine: "Old Bodija · confirm public access and current food distribution by email before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "thchf-ibadan-food-bank", name: "Transformation Haven Caring Hearts Foundation — food bank project",
    resourceType: "Food bank project · vulnerable households",
    description: "The foundation lists a food-bank project supporting vulnerable families in Ibadan. Its public page does not give distribution dates or eligibility, so contact the team to ask whether food support is currently available and how to request it.",
    phone: "+2349044554284", alternatePhone: "+2349050586502", email: "info@thchf.org", link: "https://thchf.org/projects", source: "Transformation Haven Caring Hearts Foundation", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", address: "55 Excellent Road (8 Flats), Alabidun, Airport Road, Ibadan, Oyo State, Nigeria", locationLine: "Alabidun, Airport Road · call to confirm intake and distribution before visiting", checkedAt: CHECKED_AT,
  },
  {
    id: "hands-of-love-ibadan-food-relief", name: "Hands of Love Family Foundation — food relief",
    resourceType: "Food relief · emergency and ongoing community distribution",
    description: "The foundation describes emergency and ongoing food relief for families facing hardship. Contact its Oke Ado office to ask where distributions are happening, how to request support, and what eligibility applies; the office is not confirmed as a walk-in pantry.",
    phone: "+2348034991199", whatsapp: "+2348034991199", email: "handsoflovefamilynigeria@gmail.com", link: "https://www.holfoundation.org/", source: "Hands of Love Family Foundation", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", address: "23 Afani Road, Haven House, Oke Ado, Ibadan 200034, Oyo State, Nigeria", locationLine: "Oke Ado office · contact first to confirm current food relief and intake", checkedAt: CHECKED_AT,
  },
  {
    id: "ptti-ibadan-food-bank-outreach", name: "Positive Think Tanks Initiative — Ibadan food-bank outreach",
    resourceType: "Food bank · scheduled community food relief",
    description: "PTTI lists food-bank work in Ibadan and says its World Food Day outreach feeds more than 500 people each October 16. This is a scheduled outreach, not a daily pantry; contact the team for the next date, location, and how to request or qualify for support.",
    phone: "+2349121111150", email: "positivethinktanks@gmail.com", link: "https://ptti.org.ng/", source: "Positive Think Tanks Initiative (PTTI)", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", address: "Upper Chamber, Pentonrise Event Centre, Bodija, Ibadan, Oyo State, Nigeria", locationLine: "Bodija office · annual food-bank outreach; contact for next distribution date", checkedAt: CHECKED_AT,
  },
  {
    id: "lagos-food-bank-ibadan-outreach", name: "Lagos Food Bank Initiative — Ibadan community outreach contact",
    resourceType: "Temporary food assistance · partner-led community outreach",
    description: "The organization reported a Temporary Food Assistance Program outreach in Molete, Ibadan on August 22, 2026. This confirms a past Ibadan distribution, not a permanent local pantry. Contact the food bank to ask whether another Ibadan outreach is scheduled and how residents can be referred.",
    phone: "+2342012918754", alternatePhone: "+2347058617222", email: "contactus@lagosfoodbank.org", link: "https://lagosfoodbank.org/sun-king-nigeria-returns-for-another-partnership-with-lagos-food-bank-to-support-families-in-molete-ibadan/", source: "Lagos Food Bank Initiative · official outreach report", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", locationLine: "Molete, Ibadan · outreach documented August 2026; call for the next one", checkedAt: CHECKED_AT,
  },
  {
    id: "olatunbosun-care-ibadan-food-relief", name: "Olatunbosun Care Foundation — food and welfare support",
    resourceType: "Food relief · welfare support · vulnerable families",
    description: "The foundation describes food and essential-resource support for vulnerable families and lists Ibadan as an operating location. Contact the foundation to confirm current food-assistance intake, distribution location, and eligibility before visiting.",
    phone: "+2349050563967", link: "https://olatunbosuncarefoundation.com/", source: "Olatunbosun Care Foundation", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan, Oyo, Nigeria", locationLine: "Ibadan service area · call to confirm active food-relief intake and distribution", checkedAt: CHECKED_AT,
  },
  {
    id: "jp-geteloma-foundation-food-support", name: "Pa J.P. Geteloma Foundation — free food support",
    resourceType: "Community food support · family and youth assistance",
    description: "The foundation lists free food provision and support for families, young people, and older adults, with services in Ibadan and Lagos. Contact them to confirm which location is currently distributing food, eligibility, and how to request assistance.",
    phone: "+2348022013071", email: "info@jpgetelomafoundation.com", link: "https://jpgetelomafoundation.com/services/", source: "Pa J.P. Geteloma Foundation", verified: true,
    city: "Ibadan", state: "Oyo", country: "Nigeria", region: "Ibadan and Lagos, Nigeria", address: "Julius Geteloma Close, Ibadan, Oyo State, Nigeria", locationLine: "Ibadan office · call to confirm current food-support location and intake", checkedAt: CHECKED_AT,
  },
  {
    id: "lagos-food-bank-emergency-relief", name: "Lagos Food Bank Initiative — food relief",
    resourceType: "Food pantry · emergency food relief · Lagos State",
    description: "Lagos Food Bank runs food-relief programs for vulnerable families and works with community organizations. Call to ask about beneficiary intake, outreach locations, eligibility, and the next available distribution; food is not guaranteed by this listing.",
    phone: "+2342012918754", alternatePhone: "+2347058617222", email: "contactus@lagosfoodbank.org", link: "https://lagosfoodbank.org/contactus/", source: "Lagos Food Bank Initiative", verified: true,
    city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", address: "Plot 2, Lagos Food Bank Building, Taiwo Ologun Avenue, off Oluaboderin Street, Punch Estate, Mangoro Bus Stop, Ikeja, Lagos, Nigeria", locationLine: "Ikeja, Lagos · ask about current community distribution sites", checkedAt: CHECKED_AT,
  },
  {
    id: "ark-food-bank-lagos", name: "Ark Food Bank — Lagos food assistance contact",
    resourceType: "Food bank · food-assistance contact",
    description: "Contact Ark Food Bank to ask about current food support, service areas, eligibility, and pickup or referral steps before visiting.",
    phone: "+2348051233486", email: "info@arkfoodbanklagos.ng", link: "https://arkfoodbanklagos.ng/contact/", source: "Ark Food Bank Lagos", verified: true,
    city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", locationLine: "Lagos · confirm current service area and pickup details by phone", checkedAt: CHECKED_AT,
  },
  {
    id: "food-bank-network-nigeria", name: "Food Bank Network Nigeria — find a member organization",
    resourceType: "Food-bank directory · network referral",
    description: "The network connects food banks and community organizations working on hunger relief. Ask the network for a current member organization serving your state or city; this is a referral directory, not a promise that a nearby pantry has food today.",
    phone: null, email: "info@foodbanknetworknigeria.org", link: "https://foodbanknetworknigeria.org/", source: "Food Bank Network Nigeria", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide network · request the current member serving your area", checkedAt: CHECKED_AT,
  },
  {
    id: "nsipa-home-grown-school-feeding", name: "NSIPA — Home-Grown School Feeding Programme",
    resourceType: "School meals · eligible public-primary pupils",
    description: "The federal school-feeding programme provides meals through participating public primary schools. It is for enrolled pupils at participating schools, not a general food pantry; ask the school or NSIPA about local participation and current delivery.",
    phone: "+2348021266483", alternatePhone: "+2348061995335", email: "info@nsipa.gov.ng", link: "https://nsipa.gov.ng/", source: "National Social Investment Programme Agency (NSIPA)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Participating public primary schools nationwide · pupil eligibility applies", checkedAt: CHECKED_AT,
  },
];

// State-level referrals into the Food Bank Network Nigeria (FBNN). Its public
// site lists member organizations by state and provides a national contact
// route; partner names are not presented as confirmed walk-in pantry addresses.
const FBNN_STATE_PARTNERS = {
  "Abia": ["Youths Changing Youth's Lives Foundation", "Genesis Motherless Baby Home"],
  "Adamawa": ["Al-ihsan Charitable Foundation"],
  "Akwa Ibom": ["People's Rights To Life Development Foundation", "Wonder Life Care Mission International"],
  "Anambra": ["Nnaedozie Thomas Foundation", "Nascent Education and Development Initiative"],
  "Bauchi": [], "Bayelsa": [],
  "Benue": ["Initiative for Health and Social Development"],
  "Borno": [],
  "Cross River": ["Care for Social Welfare International (CASWI)", "Independent Business Development Network"],
  "Delta": ["Mobile Foundation for Health Security and Rehabilitation (MHSR)", "Timinimi Ediseimokumor Foundation (TEK Foundation)", "OMIWA Charity Foundation", "Tender Hearts Foundation"],
  "Ebonyi": ["Tomorrow Is a Girl Initiative", "Ude-Nneobi Womankind Foundation"],
  "Edo": ["Mobile Foundation for Health Security and Rehabilitation (MHSR)"],
  "Ekiti": ["Operation Feed The People Initiative", "Gold Heart Foundation for Teens and Orphans", "Foundation for Excellent Living and Development", "Handy Innovations Foundation"],
  "Enugu": ["Help for Humanity International", "Kasorama", "Dorcas Sustainable Global Initiative", "The Boythrive Initiative"],
  "Gombe": ["Alkali", "Initiative for Health and Social Development"],
  "Imo": ["Nnaedozie Thomas Foundation", "Chinyere Florence E Foundation"],
  "Jigawa": [],
  "Kaduna": ["Nafarm Agroallied Integrated Limited", "Faithmoves Foundation", "Initiative for Health and Social Development"],
  "Kano": ["Humanity, Kindness and Peace Initiative", "Victor Tulutu Briggs Foundation"],
  "Katsina": [], "Kebbi": [],
  "Kogi": ["Streets Africa People Empowerment and Development Foundation", "Initiative for Health and Social Development"],
  "Kwara": ["AOA Reach Foundation", "Tabbie Care Home Initiative", "Abdallah Olu Abdulkadir Charity Foundation", "Bakog Foundation"],
  "Lagos": ["147 organizations are named in the source directory; see the source for the full roster"],
  "Nasarawa": ["Sustainable Initiative for Protecting and Empowering the African Child"],
  "Niger": ["Al-Ihsan Charitable Foundation, Minna"],
  "Ogun": [],
  "Ondo": ["Initiative for Health and Social Development", "Gold Heart Foundation for Teens and Orphans", "The Acalypha Child Care Initiative", "Charakids Foundation"],
  "Osun": ["Peculiar Treasure Outreach", "Leovest Reassuring Hand Foundation", "Evolufy Africa", "Abi Welfare Foundation", "Lanre Ayoola Foundation", "Preesim Foundation", "Kehinde Olasupo Foundation"],
  "Oyo": ["Caris Charity Care Foundation", "Iftar and Fidyah Foundation", "Progressive Health for Nigeria Foundation", "Peace Wonderful Women of Impact Ministry International", "MaryO Food Bank", "Family Counselling Centre", "Nathaniel Albert Foundation", "Infinity Great Achievers", "Great Impact Foundation", "The Toyin Osibodu Foundation", "Ibadan Food Bank Initiative"],
  "Plateau": ["Nnaedozie Thomas Foundation", "Naza Agape Foundation", "Lead for Access and Social Development"],
  "Rivers": [], "Sokoto": [],
  "Taraba": ["Serving and Learning Together Initiative"],
  "Yobe": [], "Zamfara": [],
  "Federal Capital Territory": ["Ashake Foundation", "Outreaching for Jesus Ministry", "Smiles By Khadija Health Foundation", "Azar Initiative Empowerment for the Less Privileged", "Isodokan Foundation", "Givingplus African Foundation", "Victor Tulutu Briggs Foundation"],
};

const NIGERIA_STATE_CAPITALS = {
  "Abia": "Umuahia", "Adamawa": "Yola", "Akwa Ibom": "Uyo", "Anambra": "Awka", "Bauchi": "Bauchi",
  "Bayelsa": "Yenagoa", "Benue": "Makurdi", "Borno": "Maiduguri", "Cross River": "Calabar", "Delta": "Asaba",
  "Ebonyi": "Abakaliki", "Edo": "Benin City", "Ekiti": "Ado-Ekiti", "Enugu": "Enugu", "Gombe": "Gombe",
  "Imo": "Owerri", "Jigawa": "Dutse", "Kaduna": "Kaduna", "Kano": "Kano", "Katsina": "Katsina",
  "Kebbi": "Birnin Kebbi", "Kogi": "Lokoja", "Kwara": "Ilorin", "Lagos": "Ikeja", "Nasarawa": "Lafia",
  "Niger": "Minna", "Ogun": "Abeokuta", "Ondo": "Akure", "Osun": "Osogbo", "Oyo": "Ibadan",
  "Plateau": "Jos", "Rivers": "Port Harcourt", "Sokoto": "Sokoto", "Taraba": "Jalingo", "Yobe": "Damaturu",
  "Zamfara": "Gusau", "Federal Capital Territory": "Abuja",
};

const stateSlug = (state) => state === "Federal Capital Territory" ? "fct" : state.toLowerCase().replace(/[^a-z]/g, "");
export const NIGERIA_FOOD_STATE_REFERRALS = Object.entries(FBNN_STATE_PARTNERS)
  .map(([state, partners]) => {
  const partnerSummary = state === "Lagos"
    ? "The network's public directory names 147 Lagos organizations. Open the source directory for the full roster; its entries are leads, not individually confirmed food-distribution sites."
    : partners.length
      ? `Its public directory lists ${partners.join(", ")} for ${state}.`
      : `The network's regional directory currently names no partner under ${state}. The network says it coordinates food-bank partners across Nigeria; ask whether a current partner serves your area.`;
  return {
    id: `fbnn-state-referral-${stateSlug(state)}`,
    name: `Food Bank Network Nigeria — ${state} food-bank referrals`,
    resourceType: "State food-bank and community pantry referral",
    description: `${partnerSummary} Named organizations are leads from the network’s regional roster, not individually confirmed food-distribution locations. Contact the network to request a current local phone, address, eligibility details, and active distribution point before travelling.`,
    phone: "+2342012918754", alternatePhone: "+2347058617222", email: "info@foodbanknetworknigeria.org",
    link: "https://foodbanknetworknigeria.org/ngos-and-regions/", source: "Food Bank Network Nigeria · state partner directory", verified: true,
    state, country: "Nigeria", region: `${state}, Nigeria`,
    locationLine: `${state} food-bank referral route · central network contact; verify local partner and active distribution`, checkedAt: CHECKED_AT,
    directoryRole: "state-referral",
  };
  });

export const NIGERIA_FUNDING_RESOURCES = [
  {
    id: "nsipa-national-social-support", name: "NSIPA — federal social-support programmes",
    resourceType: "Government benefits · cash transfer · skills · enterprise support",
    description: "NSIPA coordinates national programmes including cash transfers, youth skills and employment, vulnerable-groups support, school feeding, and micro-enterprise schemes. Ask which programme is open in your state and what the official enrollment route is. NSIPA says registration is free; do not pay an agent or share banking codes.",
    phone: "+2348021266483", alternatePhone: "+2348061995335", email: "info@nsipa.gov.ng", link: "https://nsipa.gov.ng/", source: "National Social Investment Programme Agency (NSIPA)", verified: true,
    country: "Nigeria", region: "Nigeria", address: "Federal Secretariat Complex, Shehu Shagari Way, Central Business District, Abuja, Nigeria", locationLine: "Federal programmes across all 36 states and the FCT · eligibility and application windows vary", checkedAt: CHECKED_AT,
  },
  {
    id: "nsipa-vulnerable-groups-grant", name: "NSIPA — Grant for Vulnerable Groups",
    resourceType: "Targeted government support · eligibility-based",
    description: "A federal programme for targeted social protection and economic inclusion. Contact NSIPA to check whether a programme cycle is active in your state, how beneficiaries are selected, and which official channel to use. Do not treat this listing as an open grant application or guaranteed payment.",
    phone: "+2348021266483", alternatePhone: "+2348061995335", email: "info@nsipa.gov.ng", link: "https://www.nsipa.gov.ng/programmes/gvg", source: "National Social Investment Programme Agency (NSIPA)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide · targeted eligibility and active programme cycles vary", checkedAt: CHECKED_AT,
  },
  {
    id: "nassco-social-register", name: "NASSCO — National Social Register information",
    resourceType: "Social-protection enrollment information",
    description: "NASSCO coordinates the national social register used by some federal social-protection programmes. Ask your State Operations Coordinating Unit or local government how household identification works in your area and whether enrollment is active. Inclusion does not guarantee a particular benefit.",
    phone: "+2348021266483", alternatePhone: "+2348061995335", email: "info@nsipa.gov.ng", link: "https://nsipa.gov.ng/", source: "National Social Safety Nets Coordinating Office (NASSCO) / NSIPA", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "State and local-government implementation nationwide · ask about current local enrollment", checkedAt: CHECKED_AT,
  },
];

export const NIGERIA_STATE_BENEFIT_CONTACTS = Object.entries(NIGERIA_STATE_CAPITALS).map(([state, capital]) => {
  const email = `${stateSlug(state)}.socu@nassp.gov.ng`;
  return {
    id: `nassco-socu-${stateSlug(state)}`,
    name: `${state} social-protection and vulnerable-household contact`,
    resourceType: "State social registry · benefits and referral navigation",
    description: `Email the ${state} State Operations Coordinating Unit to ask how household identification or social-register enrollment works in ${state}, which cash-transfer or livelihood-support programmes are currently active, and what official steps are required. This office can direct you to the right state channel; it does not decide eligibility or guarantee a payment.`,
    phone: "969", email, link: "https://nassp.gov.ng/where-we-work", source: "National Social Safety-Nets Coordinating Office (NASSCO) · state contact directory", verified: true,
    city: capital, state, country: "Nigeria", region: `${capital}, ${state}, Nigeria`,
    locationLine: `${state} state contact · ${email} · national information line 969`, checkedAt: CHECKED_AT,
    directoryRole: "state-referral",
  };
});

export const NIGERIA_CURRENT_RELIEF_RESOURCES = [
  {
    id: "nersi-programme-help-line", name: "NERSI — emergency relief programme help line",
    resourceType: "Government emergency relief · programme questions",
    description: "The federal ministry publishes this number for questions about the National Emergency Relief and Stabilisation Intervention. Ask whether the programme currently serves your location and how a beneficiary can verify status. The programme warns that it is free: never pay an agent or share a PIN or one-time code.",
    phone: "07000222222", link: "https://fmhapr.gov.ng/nersi/", source: "Federal Ministry of Humanitarian Affairs and Poverty Reduction", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "National programme helpline · availability and eligibility vary", checkedAt: CHECKED_AT,
  },
];

export const NIGERIA_URGENT_RESOURCES = [
  {
    id: "nigeria-civil-defence-199", name: "Nigeria Security and Civil Defence Corps — emergency line",
    resourceType: "Immediate safety · civil-defence emergency response",
    description: "The NSCDC publishes 199 as its 24/7 emergency hotline. Use it for a civil-defence emergency or report; for immediate danger, also call Nigeria’s national emergency number 112.",
    phone: "199", link: "https://nscdc.gov.ng/", source: "Nigeria Security and Civil Defence Corps (NSCDC)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "24/7 emergency hotline · Nigeria", checkedAt: CHECKED_AT,
  },
  {
    id: "nigeria-human-rights-commission-hotline", name: "National Human Rights Commission — toll-free help line",
    resourceType: "Rights support · complaint and referral",
    description: "The Commission accepts human-rights complaints and can direct people to its state office. Call for help with violence, discrimination, detention, or another rights concern. For immediate physical danger, call 112.",
    phone: "08006472428", alternatePhone: "09032192577", link: "https://nhrc.gov.ng/focus-areas/women-and-gender-matters.html", source: "National Human Rights Commission (NHRC)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Toll-free nationwide line · ask for your state office", checkedAt: CHECKED_AT,
  },
  {
    id: "nigeria-emergency-112", name: "Nigeria emergency response — call 112",
    resourceType: "Immediate danger · police, ambulance, fire and public safety",
    description: "For immediate danger, serious injury, fire, or an urgent safety emergency in Nigeria, call 112 from a mobile network and ask for the relevant emergency response agency. If it does not connect, go to the nearest hospital or police station if it is safe to do so.",
    phone: "112", link: "https://ncc.gov.ng/media-centre/press-releases/press-release-emergency-communications-centres-launch-ncc?page=1", source: "Nigerian Communications Commission (NCC)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria · emergency number", checkedAt: CHECKED_AT,
  },
  {
    id: "nema-emergency-relief", name: "NEMA — disaster response and relief information",
    resourceType: "Disaster emergency · relief and response coordination",
    description: "For disaster-related emergencies such as flooding, displacement, or other large-scale incidents, contact NEMA for response and relief coordination and follow local emergency instructions. For immediate danger, call 112.",
    phone: "08002255362", alternatePhone: "0800CALLNEMA", link: "https://nema.gov.ng/", source: "National Emergency Management Agency (NEMA)", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "National emergency-management agency · relief response varies by incident and area", checkedAt: CHECKED_AT,
  },
  {
    id: "lagos-dsva-safety-line", name: "Lagos DSVA — abuse support and safe-shelter referrals",
    resourceType: "Gender-based violence · safety, medical and legal referrals",
    description: "Lagos State DSVA provides survivor support pathways including psychosocial care, counselling, legal aid, and access to safe shelters. Call its support line or use the state USSD code; if someone may monitor your device, use a safe phone and contact method.",
    phone: "08000333333", alternatePhone: "*6820#", link: "https://lagosstate.gov.ng/news/all/view/68fb599888319a643b69c28b", source: "Lagos State Domestic and Sexual Violence Agency (DSVA)", verified: true,
    city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", locationLine: "Lagos State · 24-hour support is stated by the agency; safe-shelter access must be confirmed", checkedAt: CHECKED_AT,
  },
];

export const NIGERIA_PEER_RESOURCES = [
  {
    id: "na-nigeria-lagos-tuesday-online", name: "NA Lagos Group — Tuesday literature meeting",
    resourceType: "Peer support · drug recovery · online meeting",
    description: "NA Nigeria currently lists a Tuesday Steps and Traditions literature meeting at 12:00 p.m. Nigeria time. The published meeting is online; confirm the schedule and joining details on the official meeting page before attending.",
    link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria · published meeting schedule", verified: true,
    city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria",
    locationLine: "Tuesday · 12:00 p.m. Nigeria time · online", checkedAt: CHECKED_AT,
  },
  {
    id: "na-nigeria-lagos-friday-online", name: "NA Lagos Group — Friday Just for Today meeting",
    resourceType: "Peer support · drug recovery · online meeting",
    description: "NA Nigeria currently lists a Friday Just for Today meeting at 8:00 p.m. Nigeria time. The published meeting is online; confirm the schedule and joining details on the official meeting page before attending.",
    link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria · published meeting schedule", verified: true,
    city: "Lagos", state: "Lagos", country: "Nigeria", region: "Lagos, Nigeria",
    locationLine: "Friday · 8:00 p.m. Nigeria time · online", checkedAt: CHECKED_AT,
  },
  {
    id: "aa-world-service-nigeria", name: "Alcoholics Anonymous — find Nigeria groups",
    resourceType: "Peer support · alcohol recovery · group finder",
    description: "Use the official country finder to reach A.A. groups and local service contacts. Ask for the city, language, meeting format, day/time, and whether the group is currently meeting; listings are maintained by local A.A. service contacts.",
    phone: null, link: "https://www.aa.org/find-aa/world", source: "Alcoholics Anonymous World Services", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria · ask the local service contact for Abuja, Lagos, Port Harcourt, Ibadan, Kano, Enugu, or another city", checkedAt: CHECKED_AT,
  },
  {
    id: "na-nigeria-local-meetings", name: "Narcotics Anonymous Nigeria — local meeting contacts",
    resourceType: "Peer support · drug recovery · meeting finder",
    description: "Contact the Nigeria fellowship or use its meeting directory to ask about groups in your city, including meeting format, language, current schedule, and joining details. Confirm details before travelling.",
    phone: null, link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria · local meeting listings and contacts", checkedAt: CHECKED_AT,
  },
  {
    id: "nigeria-addiction-peer-referral-ndlea", name: "NDLEA — ask for local peer and family support referrals",
    resourceType: "Peer and family support referral",
    description: "NDLEA state commands can point callers toward counseling, rehabilitation, and locally available support. Ask specifically about family groups, peer meetings, and community recovery support in the city; the command directory is a referral contact, not a meeting schedule.",
    phone: "080010203040", link: NDLEA_DIRECTORY_URL, source: "National Drug Law Enforcement Agency (NDLEA) · national helpline and state-command directory", verified: true,
    country: "Nigeria", region: "Nigeria", locationLine: "Nigeria-wide helpline and state commands · ask for a city-specific referral", checkedAt: CHECKED_AT,
  },
];
