// Iowa directory batch reviewed against state, county, provider, and nonprofit
// directories on 2026-10-25. Source review is not a phone confirmation, a
// guarantee of current capacity, or proof of exhaustive statewide coverage.
const reviewed = (record) => ({ ...record, state: "IA", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const coachUrl = "https://recovery-iowa.org/get-support/recovery-coaches-finder/";
const coachSource = "Recovery Iowa, Recovery Coaches Finder";
const coaches = [
  ["ames-cfr", "Community and Family Resources — recovery coaching", "Ames", "1619 S High Ave, Ames, IA 50010", null, "https://www.cfrhelps.org/"],
  ["ankeny-full-circle", "Full Circle Recovery Community Center — recovery coaching", "Ankeny", "641 S Ankeny Blvd, Ankeny, IA 50023", "515-783-6382", "https://fullcirclerecoveryiowa.org/"],
  ["atlantic-zion", "Zion Integrated Behavioral Health Services — recovery coaching", "Atlantic", "2307 Olive St, Atlantic, IA 50022", "712-243-5091", "https://zionibhs.org/"],
  ["burlington-adds", "Alcohol and Drug Dependency Services of Southeast Iowa — recovery coaching", "Burlington", "1340 Mt Pleasant St, Burlington, IA 52601", "319-753-6567", "https://addsiowa.org/"],
  ["carroll-new-opportunities", "New Opportunities — recovery coaching", "Carroll", "23751 Highway 30 E, PO Box 427, Carroll, IA 51401", "712-792-9266", "https://newopp.org/"],
  ["cedar-rapids-abbe", "Abbe Community Mental Health — recovery coaching", "Cedar Rapids", "520 11th St NW, Cedar Rapids, IA 52405", "319-398-3562", "https://www.abbehealth.org/"],
  ["cedar-rapids-asac", "Area Substance Abuse Council — recovery coaching", "Cedar Rapids", "3601 16th Ave SW, Cedar Rapids, IA 52404", "319-390-4611", "https://www.asac.us/"],
  ["cedar-rapids-crush", "CRUSH Iowa — peer recovery support", "Cedar Rapids", "317 7th Ave SE, Suite 304, Cedar Rapids, IA 52401", "319-200-5970", "https://crushiowa.org/"],
  ["clinton-rediscover", "Rediscover Recovery Community Center — recovery coaching", "Clinton", "232 5th Ave S, Clinton, IA 52732", "563-206-1479", "https://recovery-iowa.org/get-support/find-an-rcc/"],
  ["council-bluffs-full-circle", "Full Circle Recovery Community Center — recovery coaching", "Council Bluffs", "300 W Broadway, Suite 108, Council Bluffs, IA 51503", "712-560-6360", "https://fullcirclerecoveryiowa.org/"],
  ["davenport-vera-french", "Vera French Mental Health Center — recovery coaching", "Davenport", "808 N Harrison St, Davenport, IA 52804", "563-322-5276", "https://www.verafrenchmhc.org/"],
  ["decorah-neibh", "Northeast Iowa Behavioral Health — recovery coaching", "Decorah", "905 Montgomery St, Decorah, IA 52101", "563-382-3649", "https://neibh.org/"],
  ["des-moines-bridges-east-third", "Bridges of Iowa — recovery coaching, East 3rd Street", "Des Moines", "130 E 3rd St, Suite 01, Des Moines, IA 50309", "515-287-2855", "https://bridgesofiowa.org/"],
  ["des-moines-bridges-ne", "Bridges of Iowa — recovery coaching, Northeast 51st Place", "Des Moines", "1985 NE 51st Pl, Des Moines, IA 50313", "515-287-2855", "https://bridgesofiowa.org/"],
  ["des-moines-cfr", "Community and Family Resources — recovery coaching", "Des Moines", "3451 Easton Blvd, Des Moines, IA 50317", "515-262-0349", "https://www.cfrhelps.org/"],
  ["des-moines-eyerly-ball", "Eyerly Ball — recovery coaching", "Des Moines", "1319 Pennsylvania Ave, Des Moines, IA 50316", null, "https://eyerlyball.org/"],
  ["des-moines-full-circle", "Full Circle Recovery Community Center — recovery coaching", "Des Moines", "4725 Merle Hay Rd, Des Moines, IA 50313", "515-783-6382", "https://fullcirclerecoveryiowa.org/"],
  ["des-moines-mercyone", "MercyOne — recovery coaching", "Des Moines", "1409 Clark St, Des Moines, IA 50314", "515-643-6500", "https://www.mercyone.org/"],
  ["des-moines-rise", "RISE Recovery Center — recovery coaching", "Des Moines", "3120 SW 9th St, Des Moines, IA 50315", "515-499-2105", "https://riserecoverycenter.org/"],
  ["dubuque-asac", "Area Substance Abuse Council — recovery coaching", "Dubuque", "1940 Elm St, Dubuque, IA 52001", "563-582-3784", "https://www.asac.us/"],
  ["dubuque-fountain-youth", "Fountain of Youth — recovery coaching", "Dubuque", "220 W 7th St, Suite 101, Dubuque, IA 52001", "563-587-8316", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["dubuque-liberty", "Liberty Recovery Community / Operation Empower — recovery coaching", "Dubuque", "2216 White St, Dubuque, IA 52001", "563-213-5552", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["dubuque-nami", "NAMI Dubuque — recovery coaching", "Dubuque", "2225 W 6th St, Dubuque, IA 52002", "563-557-6264", "https://namidubuque.org/"],
  ["dubuque-ztm", "ZTM Sober Living — recovery coaching", "Dubuque", "3335 Sunset Park Cir, Dubuque, IA 52002", "561-722-1661", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["estherville-rosecrance", "Rosecrance Jackson Centers — recovery coaching", "Estherville", "208 N 8th St, Estherville, IA 51334", "712-631-4180", "https://rosecrance.org/"],
  ["fairfield-optimae", "Optimae Life Services — recovery coaching", "Fairfield", "301 W Burlington Ave, Fairfield, IA 52556", "641-472-7236", "https://optimaelifeservices.com/"],
  ["fort-dodge-cfr", "Community and Family Resources — recovery coaching", "Fort Dodge", "211 Avenue M W, Fort Dodge, IA 50501", "515-576-7261", "https://www.cfrhelps.org/"],
  ["independence-pathways", "Pathways Behavioral Services — recovery coaching", "Independence", "1827 1st St W, Suite C, Independence, IA 50644", "319-334-6163", "https://pathwaysb.org/"],
  ["iowa-city-abbe", "Abbe Community Mental Health — recovery coaching", "Iowa City", "300 Southgate Ave, Iowa City, IA 52240", "319-688-8000", "https://www.abbehealth.org/"],
  ["iowa-city-cfr", "Community and Family Resources — recovery coaching", "Iowa City", "430 Southgate Ave, Iowa City, IA 52240", "319-351-4357", "https://www.cfrhelps.org/"],
  ["iowa-city-uihc", "University of Iowa Health Care — recovery coaching", "Iowa City", "200 Hawkins Dr, Boyd Tower Level 5, Iowa City, IA 52242", "319-356-4658", "https://uihc.org/"],
  ["keokuk-adds", "Alcohol and Drug Dependency Services of Southeast Iowa — recovery coaching", "Keokuk", "928 Main St, Keokuk, IA 52632", "319-524-4397", "https://addsiowa.org/"],
  ["knoxville-inside-out", "Inside Out Wellness & Advocacy — recovery coaching", "Knoxville", "104 S 6th St, Knoxville, IA 50138", "515-642-4125", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["mount-pleasant-adds", "Alcohol and Drug Dependency Services of Southeast Iowa — recovery coaching", "Mount Pleasant", "122 N Main St, Mount Pleasant, IA 52641", "319-385-2216", "https://addsiowa.org/"],
  ["mount-pleasant-first-resources", "First Resources Corporation — recovery coaching", "Mount Pleasant", "211 W Monroe St, Mount Pleasant, IA 52641", "319-385-2216", "https://firstresources.us/"],
  ["newton-mercyone", "MercyOne — recovery coaching", "Newton", "200 N 8th Ave E, Newton, IA 50208", "641-792-0717", "https://www.mercyone.org/"],
  ["ottumwa-sieda", "Sieda Community Action — recovery coaching", "Ottumwa", "725 W 2nd St, Ottumwa, IA 52501", "641-683-6747", "https://sieda.org/"],
  ["ottumwa-smhc", "Southern Iowa Mental Health Center — recovery coaching", "Ottumwa", "531 Church St, Ottumwa, IA 52501", "641-683-6680", "https://simhcottumwa.org/"],
  ["perry-inside-out", "Inside Out Wellness & Advocacy — recovery coaching", "Perry", "410 12th St, Perry, IA 50220", "515-642-4125", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["pleasant-hill-thrive", "Thrive Now Recovery Center — recovery coaching", "Pleasant Hill", "6132 NE 12th Ave, Pleasant Hill, IA 50327", "515-824-5154", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
  ["sheldon-rosecrance", "Rosecrance Jackson Centers — recovery coaching", "Sheldon", "2400 Park St, Suite B, Sheldon, IA 51201", null, "https://rosecrance.org/"],
  ["sheldon-rosecrance-mcnaughton", "Rosecrance Jackson Centers — recovery coaching", "Sheldon", "1713 McNaughton Way, Sheldon, IA 51201", "712-631-4180", "https://rosecrance.org/"],
  ["sigourney-first-resources", "First Resources Corporation — recovery coaching", "Sigourney", "615 S Jefferson St, Sigourney, IA 52591", "641-622-2543", "https://firstresources.us/"],
  ["sioux-city-rosecrance", "Rosecrance Jackson Centers — recovery coaching", "Sioux City", "800 5th St, Suite 200, Sioux City, IA 51101", "712-339-2106", "https://rosecrance.org/"],
  ["spencer-seasons", "Seasons Center for Behavioral Health — recovery coaching", "Spencer", "201 E 11th St, Spencer, IA 51301", "712-262-2922", "https://seasonscenter.org/"],
  ["wapello-adds", "Alcohol and Drug Dependency Services of Southeast Iowa — recovery coaching", "Wapello", "304 Highway 61 N, Wapello, IA 52653", "319-523-8436", "https://addsiowa.org/"],
  ["washington-first-resources", "First Resources Corporation — recovery coaching", "Washington", "114 W 2nd St, Washington, IA 52353", "319-591-8176", "https://firstresources.us/"],
  ["waterloo-pathways", "Pathways Behavioral Services — O.R.E. recovery program", "Waterloo", "Waterloo, IA 50701", "319-232-6081", "https://pathwaysb.org/"],
  ["woodward-inside-out", "Inside Out Wellness & Advocacy — recovery coaching", "Woodward", "706 Cedar Ave, Woodward, IA 50276", "515-642-4125", "https://recovery-iowa.org/get-support/recovery-coaches-finder/"],
];
export const IOWA_PEER = coaches.map(([key, name, city, address, phone, link]) => local({
  id: `ia-peer-${key}`, name, city, address, phone,
  description: `Recovery Iowa's coach finder publishes this peer-support contact. Ask whether recovery coaching is accepting referrals, the current meeting or intake process, and which services are available near ${city}. A published contact does not confirm current capacity.`,
  link, source: coachSource, locationLine: `${city}, Iowa · contact to confirm intake and availability`,
}));
IOWA_PEER.push(
  statewide({ id: "ia-peer-abbe-online", name: "Abbe Community Mental Health — virtual recovery coaching", city: "Iowa City", description: "Recovery Iowa lists Abbe among its recovery coaching services and identifies online coaching access. Contact Abbe to confirm virtual availability, eligibility, and how to connect.", link: "https://www.abbehealth.org/", source: coachSource, locationLine: "Iowa statewide · virtual access; confirm availability" }),
  statewide({ id: "ia-peer-brave-online", name: "Brave Leadership — virtual peer recovery support", city: "Des Moines", description: "Recovery Iowa lists Brave Leadership as an online recovery-coaching option. Contact the organization to confirm current virtual sessions, eligibility, and referral steps.", link: coachUrl, source: coachSource, locationLine: "Iowa statewide · online option; confirm current schedule" }),
);

const foodGuide = "https://phciowa.org/food-pantry-resources/";
const foodBankSource = "Iowa HHS Emergency Food Assistance / Iowa Food Bank Association member directory";
const foodBanks = [
  ["food-bank-iowa", "Food Bank of Iowa — food assistance network", "Des Moines", "2220 E 17th St, Des Moines, IA 50316", "515-564-0330", "https://foodbankiowa.org/"],
  ["hacap-food-reservoir", "HACAP Food Reservoir — regional food access", "Hiawatha", "1515 Hiawatha Dr, Hiawatha, IA 52233", "319-393-7811", "https://www.hacap.org/"],
  ["ne-iowa-food-bank", "Northeast Iowa Food Bank — food assistance network", "Waterloo", "1605 Lafayette St, Waterloo, IA 50703", "319-235-0507", "https://www.northeastiowafoodbank.org/"],
  ["river-bend-food-bank", "River Bend Food Bank — food assistance network", "Davenport", "4010 Kimmel Dr, Davenport, IA 52802", "563-345-6490", "https://riverbendfoodbank.org/"],
  ["food-bank-siouxland", "Food Bank of Siouxland — food assistance network", "Sioux City", "1313 11th St, Sioux City, IA 51105", "712-255-9741", "https://www.siouxlandfoodbank.org/"],
  ["st-stephens-dubuque", "St. Stephen’s Food Bank — food assistance", "Dubuque", "3145 Cedar Crest Ridge, Dubuque, IA 52004", "563-557-7474", "https://www.ststephensfoodbank.org/"],
];
export const IOWA_FOOD = [
  ...foodBanks.map(([key, name, city, address, phone, link]) => statewide({
    id: `ia-food-${key}`, name, city, address, phone,
    description: "Listed by Iowa's emergency-food network as a food-bank access point. Call to locate its partner pantry or distribution serving your ZIP code and confirm hours, eligibility, intake, and current availability; this office may not operate as a walk-in pantry.",
    link, source: foodBankSource, locationLine: `${city}, Iowa · call for the pantry serving your area`,
  })),
  ...[
    ["dmarc-network", "DMARC Food Pantry Network — pantry, mobile, and delivery navigation", "Des Moines", null, "515-277-6969", "Network contact; ask which pantry or delivery option currently serves your neighborhood."],
    ["impact", "IMPACT Community Action Partnership — food and family support", "Des Moines", "3226 University Ave, Des Moines, IA 50311", "515-207-8908", "Ask about current food access, referrals, and eligibility."],
    ["caring-hands", "Caring Hands Outreach Center — food assistance", "Altoona", "603 3rd St SW, Altoona, IA 50009", "515-967-4533", "The community guide lists food assistance by appointment; call before visiting."],
    ["catholic-charities", "Catholic Charities — food assistance at River Place", "Des Moines", "2309 Euclid Ave, Des Moines, IA 50310", "515-286-3695", "Contact the agency to confirm current food support, eligibility, and intake."],
    ["bethel-cafe", "Bethel Mission Café — community meals", "Des Moines", "1310 6th Ave, Des Moines, IA 50314", "515-262-7290", "The local guide lists community meal service. Call to confirm meal times and current access."],
    ["polk-northside", "Polk County Northside Pantry — food assistance", "Des Moines", "3010 6th Ave, Des Moines, IA 50313", "515-286-2220", "Call Polk County to confirm pantry schedule, eligibility, and current intake."],
    ["food-at-first", "Food at First — free meals and pantry", "Ames", "611 Clark Ave, Ames, IA 50010", "515-344-4357", "Story County community guide lists meal service and a weekly pantry. Confirm schedule and current access before traveling."],
    ["mica-ames", "MICA — Ames food pantry and family assistance", "Ames", "230 SE 16th St, Ames, IA 50010", "515-956-3333", "Ask about emergency pantry access, family-development support, eligibility, and current appointments."],
    ["mica-marshalltown", "MICA — Marshalltown family development and food support", "Marshalltown", "1001 S 18th Ave, Marshalltown, IA 50158", "641-752-7162", "Call to confirm pantry hours, intake, and other family assistance."],
    ["salvation-army-marshalltown", "The Salvation Army — Marshalltown food assistance", "Marshalltown", "107 W State St, Marshalltown, IA 50158", "641-753-5236", "Contact the local service center to confirm current food assistance and requirements."],
    ["house-compassion", "House of Compassion — meals and food support", "Marshalltown", "211 W Church St, Marshalltown, IA 50158", "641-752-5999", "Call to ask about current meal service, pantry access, and hours."],
    ["fridge-sweet-tooth", "Sweet Tooth Community Fridge — community food access", "Des Moines", "1618 6th Ave, Des Moines, IA 50314", null, "Public community-fridge listing; access is self-service. Check the local guide for current status and do not rely on stocked inventory."],
    ["fridge-cyc", "Community Youth Concepts Community Fridge", "Des Moines", "1446 Martin Luther King Jr Pkwy, Des Moines, IA 50314", null, "Public community-fridge listing. Check the local guide for current operation and food availability."],
    ["fridge-budget-inn", "Budget Inn & Suites Community Fridge", "Des Moines", "5220 NE 14th St, Des Moines, IA 50313", null, "Community-fridge location published in the local resource guide; confirm current operation and availability before traveling."],
    ["fridge-st-andrews", "North DSM Community Fridge — St. Andrew’s Episcopal", "Des Moines", "5720 Urbandale Ave, Des Moines, IA 50310", null, "Community-fridge listing; confirm current access and food availability with the local guide."],
    ["fridge-hickman", "North DSM Community Fridge — Hickman Road", "Des Moines", "2300 Hickman Rd, Des Moines, IA 50310", null, "Community-fridge listing; confirm current operation and availability before traveling."],
    ["fridge-altoona-library", "Altoona Public Library community fridge", "Altoona", "700 8th St SW, Altoona, IA 50009", null, "Community-fridge listing at the library; access follows site hours and current availability is not guaranteed."],
    ["fridge-southside-library", "South Side Community Fridge — Des Moines Public Library", "Des Moines", "1111 SW Porter Ave, Des Moines, IA 50315", null, "Community-fridge listing at the library; access follows site hours and current availability is not guaranteed."],
    ["fridge-franklin-library", "Franklin Avenue Library community fridge", "Des Moines", "5000 Franklin Ave, Des Moines, IA 50310", null, "Community-fridge listing at the library; access follows site hours and current availability is not guaranteed."],
  ].map(([key, name, city, address, phone, note]) => local({
    id: `ia-food-${key}`, name, city, address, phone,
    description: `${note} The listing is a community food-access lead, not a guarantee of a stocked fridge or scheduled pantry service.`,
    link: foodGuide, source: "Primary Health Care Iowa, community food pantry resources (updated October 2025)",
    locationLine: `${city}, Iowa · confirm current operation and access`,
  })),
];

const housingSource = "Iowa Housing Help coordinated-entry portal and local government/community resource directories";
export const IOWA_HOUSING = [
  local({ id: "ia-housing-ciss", name: "Central Iowa Shelter & Services — emergency shelter and support", city: "Des Moines", address: "1420 Mulberry St, Des Moines, IA 50309", phone: "515-284-5719", description: "Shelter and support for people experiencing homelessness. Call for current intake instructions, eligibility, and capacity before traveling; available beds and services change.", link: "https://centraliowashelter.org/contact-us/", source: "Central Iowa Shelter & Services", locationLine: "Des Moines, Iowa · call for intake and current capacity" }),
  local({ id: "ia-housing-shelter-house", name: "Shelter House — emergency shelter and housing support", city: "Iowa City", address: "429 Southgate Ave, Iowa City, IA 52240", phone: "319-351-0326", description: "Shelter House provides emergency shelter and housing services. The organization lists a 24/7 shelter front desk; call for current intake, eligibility, and capacity before arriving.", link: "https://shelterhouseiowa.org/", source: "Shelter House Iowa", locationLine: "Iowa City, Iowa · call before traveling" }),
  local({ id: "ia-housing-waterloo-men", name: "Salvation Army — Waterloo men’s shelter", city: "Waterloo", address: "149 Argyle St, Waterloo, IA 50703", phone: "319-236-0058", description: "A county public-health resource page lists this men’s shelter. Call to confirm safe intake instructions, eligibility, and current availability before traveling.", link: "https://www.bentoncountyia.gov/public_health/resources_for_housing/", source: "Benton County Public Health, housing resources", locationLine: "Waterloo, Iowa · call for intake and availability" }),
  local({ id: "ia-housing-waterloo-women", name: "Salvation Army — Waterloo shelter for women and children", city: "Waterloo", address: "603 S Hackett Rd, Waterloo, IA 50701", phone: "319-232-0397", description: "A county public-health resource page lists this shelter for women and children. Call for confidential intake guidance, eligibility, and current space; do not travel without confirming safe access.", link: "https://www.bentoncountyia.gov/public_health/resources_for_housing/", source: "Benton County Public Health, housing resources", locationLine: "Waterloo, Iowa · call for confidential intake" }),
  local({ id: "ia-housing-cedar-valley-hospitality", name: "Cedar Valley Hospitality House — day shelter", city: "Waterloo", address: "1003 Mulberry St, Waterloo, IA 50703", phone: "319-234-1311", description: "The Waterloo community resource guide lists a day-shelter service. Call to confirm hours, access, and available support before visiting.", link: "https://www.waterloopubliclibrary.org/community-resources-guide", source: "Waterloo Public Library, community resources guide", locationLine: "Waterloo, Iowa · call to confirm hours" }),
  local({ id: "ia-housing-catholic-worker", name: "Saint Francis of Assisi Catholic Worker House — hospitality and support", city: "Waterloo", address: "321 E 8th St, Waterloo, IA 50703", phone: "319-232-2116", description: "Listed in Waterloo’s community resource guide. Call to ask about current hospitality, eligibility, and what support is available; confirm before traveling.", link: "https://www.waterloopubliclibrary.org/community-resources-guide", source: "Waterloo Public Library, community resources guide", locationLine: "Waterloo, Iowa · contact to confirm services" }),
  local({ id: "ia-housing-friends-family", name: "Friends of the Family — housing and family-violence support", city: "Waterloo", address: "1009 Peoples Square, Waterloo, IA 50702", phone: "319-234-0232", alternatePhone: "800-410-7233", description: "Provides support for people affected by domestic violence, sexual assault, and homelessness. Call the hotline for confidential safety planning and intake; shelter locations are not published here.", link: "https://friendsofthefamily.org/", source: "Waterloo community resources guide and Friends of the Family", locationLine: "Waterloo area · confidential phone support; call for safe access" }),
  local({ id: "ia-housing-hacap-ic", name: "HACAP — Iowa City housing and basic-needs assistance", city: "Iowa City", address: "367 Southgate Ave, Iowa City, IA 52240", phone: "319-337-5765", description: "Johnson County’s resource guide lists HACAP for assistance and referrals. Call to ask about current housing, energy, and basic-needs programs, eligibility, and intake.", link: "https://www.hacap.org/", source: "Johnson County community housing resource directory", locationLine: "Iowa City, Iowa · call to confirm program intake" }),
  local({ id: "ia-housing-housing-fellowship", name: "The Housing Fellowship — affordable housing support", city: "Iowa City", address: "322 E 2nd St, Iowa City, IA 52240", phone: "319-358-9212", description: "Johnson County’s resource guide lists this affordable-housing organization. Contact it about current rental or housing services, eligibility, and application availability.", link: "https://www.housingfellowship.com/", source: "Johnson County community housing resource directory", locationLine: "Iowa City, Iowa · ask about current housing availability" }),
  local({ id: "ia-housing-icha", name: "Iowa City Housing Authority — rental assistance", city: "Iowa City", address: "410 E Washington St, Iowa City, IA 52240", phone: "319-356-5400", description: "Public housing authority contact listed by the Johnson County resource guide. Call about current programs, waitlists, eligibility, and application procedures; a listing does not imply an open voucher.", link: "https://www.icgov.org/government/departments-and-divisions/neighborhood-and-development-services/housing-authority", source: "Johnson County community housing resource directory", locationLine: "Iowa City, Iowa · contact for eligibility and waitlist status" }),
  statewide({ id: "ia-housing-coordinated-entry", name: "Iowa Housing Help — coordinated entry and homelessness assessment", city: "Des Moines", phone: "833-739-0065", description: "Iowa’s coordinated-entry access line routes people experiencing homelessness or at risk to a regional assessment and referral process. Tell the navigator your current location and immediate needs. Assessment is not a guarantee of a shelter bed or housing placement.", link: "https://www.iowahousinghelp.com/", source: "Iowa Housing Help and Iowa HHS", locationLine: "Iowa statewide · call to reach the regional access point" }),
  regional({ id: "ia-housing-muscatine-mcsa", name: "Muscatine Center for Social Action — emergency shelter and housing help", city: "Muscatine", phone: "563-264-3278", description: "Iowa Housing Help identifies MCSA as a southeast Iowa emergency-shelter contact. Call to confirm the current address, confidential intake process, eligibility, and availability before traveling.", link: "https://www.iowahousinghelp.com/", source: "Iowa Housing Help, regional shelter contact", locationLine: "Muscatine and southeast Iowa · call before traveling" }),
];

const treatmentSource = "Iowa HHS, Find Mental Health Providers and certified provider directories";
const providerInfo = [
  ["cfr", "Community and Family Resources — substance-use and behavioral-health care", "Des Moines", "515-262-0349", "https://www.cfrhelps.org/"],
  ["asac", "Area Substance Abuse Council — addiction assessment and treatment", "Cedar Rapids", "319-390-4611", "https://www.asac.us/"],
  ["pathways", "Pathways Behavioral Services — substance-use and mental-health care", "Waterloo", "319-232-6081", "https://pathwaysb.org/"],
  ["rosecrance", "Rosecrance Jackson Centers — addiction treatment and recovery services", "Sioux City", "712-339-2106", "https://rosecrance.org/"],
  ["seasons", "Seasons Center for Behavioral Health — mental-health and substance-use care", "Spencer", "712-262-2922", "https://seasonscenter.org/"],
  ["simh", "Southern Iowa Mental Health Center — behavioral-health services", "Ottumwa", "641-683-6680", "https://simhcottumwa.org/"],
  ["uihc", "University of Iowa Health Care — psychiatry and addiction services", "Iowa City", "319-356-4658", "https://uihc.org/"],
  ["hhs-locator", "Iowa HHS — accredited mental-health provider locator", "Des Moines", null, "https://hhs.iowa.gov/health-prevention/behavioral-health-service-system/find-mental-health-providers"],
];
export const IOWA_TREATMENT = providerInfo.map(([key, name, city, phone, link]) => statewide({
  id: `ia-treatment-${key}`, name, city, phone,
  description: "Use this provider contact or the Iowa HHS locator to request an assessment and find an appropriate local service. Ask about substance-use treatment, level of care, insurance or fees, intake requirements, and current appointment availability; listings do not confirm an open placement.",
  link, source: treatmentSource, locationLine: `${city}, Iowa · confirm nearest service, intake, and cost`,
}));

const benefitsSource = "Iowa HHS and federal/state program access directories";
export const IOWA_BENEFITS = [
  statewide({ id: "ia-benefits-hhs-customer-service", name: "Iowa HHS Income Maintenance — SNAP, Medicaid, cash and child-care assistance", city: "Des Moines", phone: "877-347-5678", description: "Iowa HHS routes applications and questions for food assistance (SNAP), Medicaid, cash assistance, and Child Care Assistance. Ask which program fits your household and what documents are needed; eligibility and approval depend on the application.", link: "https://hhs.iowa.gov/medicaid/member-services", source: benefitsSource, locationLine: "Iowa statewide · benefits applications and case support" }),
  statewide({ id: "ia-benefits-snap", name: "Iowa SNAP / Food Assistance — apply and check case status", city: "Des Moines", phone: "877-347-5678", description: "Apply for Iowa Food Assistance or ask HHS about an existing case. Benefits depend on household eligibility; use the official portal or call for application help and required documents.", link: "https://hhs.iowa.gov/assistance-programs/food-assistance", source: "Iowa HHS, Food Assistance", locationLine: "Iowa statewide · food-benefit application and case support" }),
  statewide({ id: "ia-benefits-child-care", name: "Iowa Child Care Assistance — help with child-care costs", city: "Des Moines", phone: "866-448-4605", description: "Families may contact Iowa Child Care Assistance to ask about income and activity requirements, participating providers, application steps, and case status. Approval and provider availability are not guaranteed.", link: "https://hhs.iowa.gov/assistance-programs/child-care-assistance", source: "Iowa HHS, Child Care Assistance", locationLine: "Iowa statewide · eligibility and participating-provider rules apply" }),
  statewide({ id: "ia-benefits-liheap", name: "Iowa LIHEAP — home energy bill assistance", city: "Des Moines", phone: "515-281-3861", description: "Iowa’s Low-Income Home Energy Assistance Program accepts applications through local community-action agencies. Call or use the county agency locator to ask about the seasonal application window, required documents, and local intake.", link: "https://hhs.iowa.gov/programs/programs-and-services/energy-assistance", source: "Iowa HHS / Iowa LIHEAP program information", locationLine: "Iowa statewide · local agency intake and seasonal deadlines apply" }),
  statewide({ id: "ia-benefits-tanf", name: "Iowa Family Investment Program — temporary family cash assistance", city: "Des Moines", phone: "877-347-5678", description: "Iowa HHS administers time-limited cash and employment support for eligible families. Contact HHS to ask about application requirements, work activities, and available support; payment is not automatic.", link: "https://hhs.iowa.gov/assistance-programs/food-assistance", source: "Iowa HHS, family assistance contact information", locationLine: "Iowa statewide · eligibility and program rules apply" }),
  statewide({ id: "ia-benefits-medicaid", name: "Iowa Medicaid — enrollment and member services", city: "Des Moines", phone: "877-347-5678", description: "Contact Iowa HHS about Medicaid enrollment, plan assignment, covered behavioral-health services, and member support. Coverage and provider networks depend on eligibility and plan rules.", link: "https://hhs.iowa.gov/medicaid/member-services", source: "Iowa HHS, Medicaid member services", locationLine: "Iowa statewide · enrollment and plan coverage questions" }),
];

const urgentSource = "Iowa HHS behavioral-health crisis resources and national crisis services";
export const IOWA_URGENT = [
  statewide({ id: "ia-988", name: "988 Suicide & Crisis Lifeline", city: "Des Moines", phone: "988", description: "Call or text 988 for immediate emotional or behavioral-health crisis support. If someone is in immediate physical danger or needs urgent medical care, call 911.", link: "https://988lifeline.org/", source: urgentSource, locationLine: "Iowa statewide · call or text 24/7" }),
  statewide({ id: "ia-your-life-iowa", name: "Your Life Iowa — substance-use and mental-health support", city: "Des Moines", phone: "855-581-8111", alternatePhone: "855-895-8398", description: "Iowa HHS lists Your Life Iowa for free, confidential support and referrals related to alcohol, drugs, gambling, and mental health. Call or text to discuss options; it is not an emergency dispatch service.", link: "https://yourlifeiowa.org/", source: "Iowa HHS, Behavioral Health Service System", locationLine: "Iowa statewide · 24/7 phone and text support" }),
  statewide({ id: "ia-911", name: "Emergency services — immediate danger", city: "Des Moines", phone: "911", description: "Call 911 for an immediate threat to life, urgent medical emergency, or immediate physical danger. Provide the person’s exact location and any immediate safety concern.", source: "Iowa emergency-services guidance", locationLine: "Iowa statewide · emergency response" }),
  statewide({ id: "ia-poison-control", name: "Poison Control — exposure or possible poisoning", city: "Des Moines", phone: "800-222-1222", description: "Call Poison Control for an exposure or possible poisoning. Call 911 first for trouble breathing, collapse, seizure, or another immediate life-threatening emergency.", link: "https://www.poison.org/", source: "U.S. Poison Control Centers", locationLine: "Iowa and nationwide · phone guidance" }),
  statewide({ id: "ia-veterans-crisis", name: "Veterans Crisis Line", city: "Des Moines", phone: "988", description: "Veterans, service members, and their supporters can call 988 and press 1, or text 838255, for crisis support. Call 911 for immediate danger.", link: "https://www.veteranscrisisline.net/", source: "Veterans Crisis Line", locationLine: "Iowa and nationwide · 24/7 crisis support" }),
  statewide({ id: "ia-samhsa", name: "SAMHSA National Helpline — treatment referral", city: "Des Moines", phone: "800-662-4357", description: "Free, confidential information and referrals for mental-health and substance-use treatment, available 24/7. Ask for Iowa programs and local intake. This is not an emergency response line.", link: "https://www.samhsa.gov/find-help/helplines/national-helpline", source: "SAMHSA National Helpline", locationLine: "Iowa and nationwide · 24/7 referral" }),
];

export const IOWA_DIRECTORY_COUNT = IOWA_TREATMENT.length + IOWA_PEER.length + IOWA_HOUSING.length + IOWA_FOOD.length + IOWA_BENEFITS.length + IOWA_URGENT.length;
