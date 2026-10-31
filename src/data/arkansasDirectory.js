// Arkansas sources reviewed 2026-10-25. Listing inclusion means the named
// source publishes this service/contact; it does not mean phone confirmation,
// current openings, eligibility, or exhaustive coverage.
const reviewed = (record) => ({ ...record, state: "AR", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const county = (record) => reviewed({ ...record, coverageScope: "county" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const healthUnitDirectory = "https://healthy.arkansas.gov/wp-content/uploads/LOCAL-HEALTH-UNIT-DIRECTORY.pdf";
const healthUnits = [
  ["arkansas-dewitt", "Arkansas", "DeWitt", "870-659-2056"], ["arkansas-stuttgart", "Arkansas", "Stuttgart", "870-659-2086"],
  ["ashley-crossett", "Ashley", "Crossett", "870-364-2115"], ["ashley-hamburg", "Ashley", "Hamburg", "870-853-5525"],
  ["baxter-mountain-home", "Baxter", "Mountain Home", "870-425-3072"], ["benton-rogers", "Benton", "Rogers", "479-986-1300"],
  ["benton-siloam-springs", "Benton", "Siloam Springs", "479-549-3794"], ["boone-harrison", "Boone", "Harrison", "870-743-5244"],
  ["bradley-warren", "Bradley", "Warren", "870-226-8440"], ["calhoun-hampton", "Calhoun", "Hampton", "870-798-2808"],
  ["carroll-berryville", "Carroll", "Berryville", "870-423-2923"], ["chicot-lake-village", "Chicot", "Lake Village", "870-265-2236"],
  ["clark-arkadelphia", "Clark", "Arkadelphia", "870-246-4471"], ["clay-corning", "Clay", "Corning", "870-857-6281"],
  ["clay-piggott", "Clay", "Piggott", "870-598-3390"], ["cleburne-heber-springs", "Cleburne", "Heber Springs", "501-362-7581"],
  ["cleveland-rison", "Cleveland", "Rison", "870-325-6311"], ["columbia-magnolia", "Columbia", "Magnolia", "870-235-3798"],
  ["conway-morrilton", "Conway", "Morrilton", "501-354-4652"], ["craighead-jonesboro", "Craighead", "Jonesboro", "870-933-4585"],
  ["crawford-van-buren", "Crawford", "Van Buren", "479-474-6391"], ["crittenden-earle", "Crittenden", "Earle", "870-792-7393"],
  ["crittenden-west-memphis", "Crittenden", "West Memphis", "870-735-4334"], ["cross-wynne", "Cross", "Wynne", "870-238-2101"],
  ["dallas-fordyce", "Dallas", "Fordyce", "870-352-7197"], ["desha-dumas", "Desha", "Dumas", "870-382-2377"],
  ["desha-mcgehee", "Desha", "McGehee", "870-222-3910"], ["drew-monticello", "Drew", "Monticello", "870-367-6234"],
  ["faulkner-conway", "Faulkner", "Conway", "501-450-4941"], ["franklin-ozark", "Franklin", "Ozark", "479-667-2555"],
  ["fulton-salem", "Fulton", "Salem", "870-895-3300"], ["garland-hot-springs", "Garland", "Hot Springs", "501-624-3394"],
  ["grant-sheridan", "Grant", "Sheridan", "870-942-3157"], ["greene-paragould", "Greene", "Paragould", "870-236-7782"],
  ["hempstead-hope", "Hempstead", "Hope", "870-777-2191"], ["hot-spring-malvern", "Hot Spring", "Malvern", "501-332-6972"],
  ["howard-nashville", "Howard", "Nashville", "870-845-2208"], ["independence-batesville", "Independence", "Batesville", "870-793-8848"],
  ["izard-melbourne", "Izard", "Melbourne", "870-368-7790"], ["jackson-newport", "Jackson", "Newport", "870-523-8968"],
  ["jefferson-pine-bluff", "Jefferson", "Pine Bluff", "870-535-2142"], ["johnson-clarksville", "Johnson", "Clarksville", "479-754-2949"],
  ["lafayette-lewisville", "Lafayette", "Lewisville", "870-921-5744"], ["lawrence-walnut-ridge", "Lawrence", "Walnut Ridge", "870-886-3201"],
  ["lee-marianna", "Lee", "Marianna", "870-295-2400"], ["lincoln-star-city", "Lincoln", "Star City", "870-628-5121"],
  ["little-river-ashdown", "Little River", "Ashdown", "870-898-3831"], ["logan-booneville", "Logan", "Booneville", "479-675-2593"],
  ["logan-paris", "Logan", "Paris", "479-963-6126"], ["lonoke-cabot", "Lonoke", "Cabot", "501-843-7561"],
  ["lonoke-lonoke", "Lonoke", "Lonoke", "501-676-2268"], ["madison-huntsville", "Madison", "Huntsville", "479-738-2612"],
  ["marion-yellville", "Marion", "Yellville", "870-449-4259"], ["miller-texarkana", "Miller", "Texarkana", "870-773-2108"],
  ["mississippi-blytheville", "Mississippi", "Blytheville", "870-763-7064"], ["mississippi-osceola", "Mississippi", "Osceola", "870-563-2521"],
  ["monroe-brinkley", "Monroe", "Brinkley", "870-734-1461"], ["montgomery-mount-ida", "Montgomery", "Mount Ida", "870-867-2331"],
  ["nevada-prescott", "Nevada", "Prescott", "870-887-2004"], ["newton-jasper", "Newton", "Jasper", "870-446-2216"],
  ["ouachita-camden", "Ouachita", "Camden", "870-836-5033"], ["perry-perryville", "Perry", "Perryville", "501-889-5156"],
  ["phillips-west-helena", "Phillips", "West Helena", "870-572-9028"], ["pike-murfreesboro", "Pike", "Murfreesboro", "870-285-3154"],
  ["poinsett-harrisburg", "Poinsett", "Harrisburg", "870-578-4480"], ["poinsett-marked-tree", "Poinsett", "Marked Tree", "870-358-3615"],
  ["poinsett-trumann", "Poinsett", "Trumann", "870-483-5761"], ["polk-mena", "Polk", "Mena", "479-394-1597"],
  ["pope-russellville", "Pope", "Russellville", "479-968-6004"], ["prairie-des-arc", "Prairie", "Des Arc", "870-256-4430"],
  ["pulaski-north-little-rock", "Pulaski", "North Little Rock", "501-791-8551"], ["pulaski-southwest-little-rock", "Pulaski", "Southwest Little Rock", "501-565-9311"],
  ["pulaski-central-little-rock", "Pulaski", "Central Little Rock", "501-280-3100"], ["pulaski-jacksonville", "Pulaski", "Jacksonville", "501-982-7477"],
  ["randolph-pocahontas", "Randolph", "Pocahontas", "870-892-5239"], ["saline-benton", "Saline", "Benton", "501-303-5650"],
  ["scott-waldron", "Scott", "Waldron", "479-637-2165"], ["searcy-marshall", "Searcy", "Marshall", "870-448-3374"],
  ["sebastian-fort-smith", "Sebastian", "Fort Smith", "479-452-8600"], ["sebastian-fort-smith-wic", "Sebastian", "Fort Smith WIC Unit", "479-478-3062"],
  ["sevier-de-queen", "Sevier", "De Queen", "870-642-2535"], ["sharp-ash-flat", "Sharp", "Ash Flat", "870-994-7364"],
  ["st-francis-forrest-city", "St. Francis", "Forrest City", "870-633-1340"], ["stone-mountain-view", "Stone", "Mountain View", "870-269-3308"],
  ["union-el-dorado", "Union", "El Dorado", "870-863-5101"], ["van-buren-clinton", "Van Buren", "Clinton", "501-745-2485"],
  ["washington-springdale", "Washington", "Springdale", "479-751-3630"], ["washington-fayetteville", "Washington", "Fayetteville", "479-521-8181"],
  ["washington-springdale-wic", "Washington", "Springdale WIC Unit", "479-927-3667"], ["white-beebe", "White", "Beebe", "501-882-5128"],
  ["white-searcy", "White", "Searcy", "501-268-6102"], ["woodruff-augusta", "Woodruff", "Augusta", "870-347-5061"],
  ["yell-danville", "Yell", "Danville", "479-495-2741"], ["yell-dardanelle", "Yell", "Dardanelle", "479-229-3509"],
];

export const ARKANSAS_FOOD = [
  ...healthUnits.slice(0, 72).map(([id, countyName, town, phone]) => local({
    id: `ar-health-${id}`, name: `Arkansas Department of Health — ${town} Local Health Unit`, city: town.replace(/ WIC Unit$/, ""), phone,
    description: `The Arkansas Department of Health lists this local health unit in ${countyName} County. Arkansas WIC is delivered through local clinics, but this directory does not identify every office as a WIC site. Call to ask whether this location handles WIC/nutrition appointments, how to apply, and what documents to bring; you can also request the nearest WIC clinic.`,
    link: "https://www.healthy.arkansas.gov/programs-services/topics/wic", source: "Arkansas Department of Health Local Health Unit Directory; USDA Arkansas WIC", locationLine: `${town.replace(/ WIC Unit$/, "")}, ${countyName} County · call to confirm WIC clinic access`,
  })),
  statewide({ id: "ar-arkansas-foodbank-locator", name: "Arkansas Foodbank — partner pantry locator", phone: "501-565-8121", address: "4301 W. 65th Street, Little Rock, AR 72209", link: "https://arkansasfoodbank.org/locations-2/", source: "Arkansas Foodbank Find Food", description: "Search the current map for Arkansas Foodbank partner agencies near your location. The map covers its service area; call the selected pantry to verify hours, intake, and food availability before travel.", locationLine: "Central and southern Arkansas · use the map to choose a nearby partner" }),
  regional({ id: "ar-northeast-foodbank-locator", name: "Food Bank of Northeast Arkansas — county pantry search", city: "Jonesboro", phone: "870-932-3663", address: "3414 One Place, Jonesboro, AR 72404", link: "https://www.foodbankofnea.org/find-food", source: "Food Bank of Northeast Arkansas Find Food", description: "Search the agency map by location or county. The agency results include service details and operating times; contact a pantry to confirm current hours and availability before going.", locationLine: "Northeast Arkansas · search by county or location" }),
  statewide({ id: "ar-foodbanksofarkansas", name: "Food Banks of Arkansas — choose the regional food bank", link: "https://www.foodbanksofarkansas.org/", source: "Food Banks of Arkansas", description: "Use the statewide map to identify which Feeding America food bank serves your county, then open that regional bank's pantry finder. Regional partner maps and service areas differ.", locationLine: "Arkansas statewide · choose your county to find its regional food bank" }),
];

const arisaClinics = [
  ["cabot", "Cabot", "405 N. 2nd Street, Cabot, AR", "501-843-3503"],
  ["conway", "Conway", "350 Salem Road, Suite 1, Conway, AR", "501-336-8300"],
  ["forrest-city", "Forrest City", "4451 N. Washington, Forrest City, AR", "870-630-3880"],
  ["harrison", "Harrison", "107 E. Crandall Ave., Harrison, AR", "870-204-7488"],
  ["jonesboro", "Jonesboro", "2707 Browns Lane, Jonesboro, AR", "870-972-4000"],
  ["mountain-home", "Mountain Home", "8 Medical Plaza, Mountain Home, AR", "870-232-4385"],
  ["north-little-rock", "North Little Rock", "4354 Stockton Drive, North Little Rock, AR", "501-955-7600"],
  ["pocahontas", "Pocahontas", "2560 Old County Road, Pocahontas, AR", "870-892-7111"],
  ["rogers", "Rogers", "401 S. 40th Street, Rogers, AR", "479-273-9088"],
  ["russellville", "Russellville", "110 Skyline Drive, Russellville, AR", "479-968-1298"],
  ["searcy", "Searcy", "3302 East Moore Avenue, Searcy, AR", "870-919-6320"],
  ["springdale", "Springdale", "2400 S. 48th Street, Springdale, AR", "479-750-2020"],
  ["west-memphis", "West Memphis", "905 North 7th Street, West Memphis, AR", "870-735-5118"],
];

export const ARKANSAS_TREATMENT = [
  ...arisaClinics.map(([id, town, address, phone]) => local({
    id: `ar-treatment-arisa-${id}`, name: `Arisa Health — ${town} outpatient clinic`, city: town, address, phone,
    description: `Arisa Health provides mental-health care and substance-use treatment for children, teens, adults, and families. Contact this clinic to request services and confirm the best program, insurance/payment options, assessment steps, and current appointments.`,
    link: "https://arisahealth.org/request-services", source: "Arisa Health Request Services and clinic directory", locationLine: `${town}, Arkansas · contact for intake and appointment availability`,
  })),
  statewide({ id: "ar-treatment-dhs-access", name: "Arkansas Mental Health & Addiction Support Line", phone: "1-844-763-0198", link: "https://humanservices.arkansas.gov/divisions-shared-services/shared-services/office-of-substance-abuse-and-mental-health/samh-treatment/", source: "Arkansas Department of Human Services", description: "Call Monday–Friday, 8 a.m.–5 p.m. for help locating mental-health or addiction services and state-funded substance-use treatment providers. Ask about uninsured access, catchment area, assessment, and intake. For a medical emergency call 911; for a mental-health crisis call or text 988.", locationLine: "Arkansas statewide provider navigation · weekday business hours" }),
  county({ id: "ar-treatment-sabhs", name: "Southeast Arkansas Behavioral Healthcare System", phone: "870-673-1633", link: "https://sabhs.org/", source: "UAMS AR ConnectNow provider directory", serviceAreaCounties: ["Arkansas", "Cleveland", "Grant", "Jefferson", "Lincoln"], description: "Listed in the Arkansas DHS-contracted provider directory for outpatient therapy and substance-use treatment for people without insurance. Call to confirm the county intake route, service type, insurance status, and current appointments.", locationLine: "Arkansas County service area · call to confirm intake location" }),
  county({ id: "ar-treatment-delta-counseling", name: "Delta Counseling Associates", phone: "870-364-6471", link: "https://deltacounseling.org/", source: "UAMS AR ConnectNow provider directory", serviceAreaCounties: ["Ashley", "Bradley", "Chicot", "Desha", "Drew"], description: "Listed in the Arkansas DHS-contracted provider directory. Contact Delta Counseling Associates to ask about behavioral-health or substance-use services, uninsured access, location, and current intake.", locationLine: "South Arkansas · verify the county office and service before traveling" }),
  county({ id: "ar-treatment-harbor-house", name: "Harbor House", phone: "479-785-4083", link: "https://recoveryhhi.org/", source: "UAMS AR ConnectNow provider directory", serviceAreaCounties: ["Benton", "Crawford", "Faulkner", "Pulaski", "Sebastian", "White"], description: "Listed in the Arkansas DHS-contracted provider directory for outpatient therapy and substance-use treatment for people without insurance. Call to confirm which service is available in your county, how to start, and current openings.", locationLine: "Multiple Arkansas counties · confirm local intake and service availability" }),
  county({ id: "ar-treatment-ozark-guidance", name: "Ozark Guidance Center", phone: "479-750-2020", link: "https://ozarkguidance.org/", source: "UAMS AR ConnectNow provider directory", serviceAreaCounties: ["Baxter", "Benton", "Boone", "Carroll", "Madison", "Marion", "Newton", "Washington"], description: "Listed in the Arkansas DHS-contracted provider directory. Contact Ozark Guidance to identify a nearby office and ask about outpatient mental-health or substance-use services, payment options, and current intake.", locationLine: "Northwest and north-central Arkansas · call for nearest office" }),
];

const communityActionAgencies = [
  ["seacac", "Southeast Arkansas Community Action Corp.", "Warren", "Ashley, Bradley, Chicot, Conway, Desha, Drew, Franklin, Johnson, Logan, Perry, Polk, Pope, Scott, Yell", "1208 N. Myrtle St., Warren, AR 71671"],
  ["brad", "Black River Area Development Corp.", "Pocahontas", "Clay, Lawrence, Randolph", "1403 Hospital Drive, Pocahontas, AR 72455"],
  ["cadc", "Central Arkansas Development Council", "Benton", "Central Arkansas counties; confirm county service area", "P.O. Box 580, Benton, AR 72018"],
  ["cdcaa", "Central Delta Community Action Agency", "Rison", "Arkansas, Cleveland, Grant, Jefferson, Lincoln", "200 Main Street, Rison, AR 71665"],
  ["capca", "Community Action Program for Central Arkansas", "Conway", "Cleburne, Faulkner, White", "707 Robins Street, Suite 118, Conway, AR 72034"],
  ["c-scdc", "Crawford-Sebastian Community Development Council", "Fort Smith", "Crawford, Sebastian", "1617 South Zero Street, Fort Smith, AR 72901"],
  ["crdc", "Crowley's Ridge Development Council", "Jonesboro", "Craighead, Crittenden, Cross, Greene, Jackson, Poinsett, St. Francis, Woodruff", "2401 Fox Meadow Lane, Jonesboro, AR 72403"],
  ["eoawc", "Economic Opportunity Agency of Washington County", "Springdale", "Washington", "614 E. Emma Street, Suite M401, Springdale, AR 72764"],
  ["mdcs", "Mid-Delta Community Services", "Helena", "Lee, Monroe, Phillips, Prairie", "610 South Biscoe Street, Helena, AR 72342"],
  ["mcaeoc", "Mississippi County Arkansas Economic Opportunity Commission", "Blytheville", "Mississippi", "1400 North Division, Blytheville, AR 72315"],
  ["nadc", "Northcentral Arkansas Development Council", "Batesville", "Fulton, Independence, Izard, Sharp, Stone", "1900 Lyon Street, Batesville, AR 72501"],
  ["ooi", "Ozark Opportunities", "Harrison", "Baxter, Boone, Marion, Newton, Searcy, Van Buren", "701 E. Prospect Avenue, Harrison, AR 72602"],
];

export const ARKANSAS_BENEFITS = [
  ...communityActionAgencies.map(([id, name, town, counties, address]) => local({
    id: `ar-benefits-${id}`, name: `${name} — community assistance contact`, city: town, address,
    description: `The Arkansas Community Action Agencies Association lists this agency and service area. Ask the agency which current household-support programs it administers in ${counties}, what eligibility and documents apply, and whether it can connect you with food, housing, utility, or employment assistance. Program availability varies; the association listing does not confirm open funds.`,
    link: "https://www.acaaa.org/local-community-action-agencies/", source: "Arkansas Community Action Agencies Association local agency directory", serviceAreaCounties: counties.split(", "), locationLine: `${town} · listed service counties: ${counties} · confirm current programs`,
  })),
  statewide({ id: "ar-benefits-dhs-provider-search", name: "Arkansas DHS — find services and benefit providers", link: "https://humanservices.arkansas.gov/find-service-providers/", source: "Arkansas Department of Human Services", description: "Use the Arkansas DHS provider search to find services including mental-health and substance-use providers, SNAP employment and training, and other public programs. Contact the listed provider or DHS to confirm eligibility, application steps, and current service availability.", locationLine: "Arkansas statewide · search by service and location" }),
];

const cocContacts = [
  ["hot-springs-balance", "Hot Springs / Southwest Arkansas Continuum of Care — housing referrals", "Hot Springs", "501-418-2208", "Loren Morphew"],
  ["central-catch", "Central Arkansas CATCH — homelessness and housing referrals", "Little Rock", "501-404-4857", "Artina Blackmon"],
  ["northwest-coc", "Fayetteville / Northwest Arkansas Continuum of Care", "Fayetteville", "479-717-7737", "Debbie Martin"],
  ["fort-smith-coc", "Fort Smith Continuum of Care", "Fort Smith", "479-650-3230", "Wendy Brawdy"],
  ["southeast-soar", "Southeast Arkansas SOAR Continuum of Care", "Pine Bluff", "870-543-1820", "Norma Payne"],
];
export const ARKANSAS_HOUSING = [
  ...cocContacts.map(([id, name, town, phone, contact]) => local({
    id: `ar-housing-${id}`, name, city: town, phone, link: "https://adfa.arkansas.gov/wp-content/uploads/2025/11/Need-Housing-Assistance-CoC-Contacts.pdf", source: "Arkansas Development Finance Authority Continuum of Care referral contacts (published 2025-11-07)",
    description: `Arkansas's housing finance agency lists ${contact} as the primary contact for this Continuum of Care area. Call to ask for an individual housing or homelessness referral and confirm which communities are covered. This is a referral contact, not a shelter bed or guaranteed financial assistance.`, locationLine: `${town} · regional housing referral contact · confirm your county's coverage`,
  })),
  regional({ id: "ar-housing-arkansas-211-nwa", name: "Arkansas 211 — Northwest Arkansas local referrals", phone: "211", alternatePhone: "866-489-6983", link: "https://arkansas211.org/", source: "Arkansas 211 current service-area information", description: "Arkansas 211 currently states that its live contact service serves Benton, Madison, and Washington counties. Call for local food, shelter, rent, and community referrals in those counties; if you are elsewhere in Arkansas, use the ADFA regional housing contacts or the HUD Find Shelter tool.", city: "Bentonville", locationLine: "Benton, Madison, and Washington counties only per current operator information" }),
  regional({ id: "ar-housing-hud-finder", name: "HUD Find Shelter — search Arkansas housing and shelter resources", link: "https://www.hud.gov/FindShelter", source: "U.S. Department of Housing and Urban Development", description: "Search by Arkansas location for Continuum of Care and homeless-service providers. Call the provider to confirm eligibility and current intake; HUD is a locator, not a direct service provider.", locationLine: "Search by city or ZIP code" }),
];

export const ARKANSAS_PEER = [
  statewide({ id: "ar-peer-aa", name: "Alcoholics Anonymous — Arkansas meeting finder", link: "https://arkansascentraloffice.org/", source: "Arkansas AA central office", description: "Use the Arkansas AA meeting finder to locate peer-led meetings. Confirm the current time, format, and location with the local group before attending.", locationLine: "Search by Arkansas community · verify current meeting details" }),
  statewide({ id: "ar-peer-na", name: "Narcotics Anonymous — find Arkansas meetings", link: "https://www.na.org/meetingsearch/", source: "Narcotics Anonymous meeting search", description: "Find peer-led recovery meetings by Arkansas city or ZIP code. Confirm schedule and access details before traveling. Peer meetings do not replace medical help for overdose or withdrawal.", locationLine: "Search by Arkansas community · verify current meeting details" }),
  local({ id: "ar-peer-wolfe-street", name: "Wolfe Street Foundation — Recovery Community Center", city: "Little Rock", phone: "501-372-5662", link: "https://www.wolfestreet.org/", source: "Wolfe Street Foundation service and contact pages", description: "Wolfe Street Foundation offers non-clinical peer recovery support, recovery meetings, youth programming, and community events at its Little Rock Recovery Community Center. Call to ask which meetings or peer services fit your needs and confirm the current location and schedule. It does not provide clinical treatment.", locationLine: "Little Rock · peer support and recovery community · call for current schedule" }),
  local({ id: "ar-peer-hot-springs", name: "Hot Springs Peer Recovery Support", city: "Hot Springs", phone: "501-762-4317", alternatePhone: "501-321-6789 ext. 7724", link: "https://www.hotspringsar.gov/1359/Peer-Recovery-Support", source: "City of Hot Springs peer recovery support page", description: "The City of Hot Springs describes certified peer-recovery support, including mentoring, resource connection, recovery groups, and help setting goals. The city page lists weekday office hours. Call the peer specialist to confirm current access, eligibility, and whether an appointment is needed.", locationLine: "Hot Springs · Monday–Friday, 8 a.m.–4 p.m. per city page · call first" }),
  local({ id: "ar-peer-nea-divine-intervention", name: "NEA Divine Intervention — peer recovery community", city: "Jonesboro", phone: "870-206-8406", address: "2222 Spence Circle, Jonesboro, AR 72401", link: "https://www.neadivineintervention.org/", source: "NEA Divine Intervention organization website", description: "NEA Divine Intervention describes a community recovery program grounded in shared lived experience and whole-person wellness. Its website publishes a Jonesboro location and weekday hours. Contact the organization to confirm current peer-support activities, access steps, and schedule before visiting.", locationLine: "Jonesboro · published weekday hours 8 a.m.–4:30 p.m. · confirm before visiting" }),
  local({ id: "ar-peer-pearl", name: "P.E.A.R.L. — peer recovery center", city: "Rogers", address: "115 N. Dixieland Road, Suite 1, Rogers, AR 72756", phone: "479-721-6778", link: "https://arpearl.org/peer-support-services/", source: "Positive Energy Affecting Recovering Lives (P.E.A.R.L.) peer-support and contact pages", description: "P.E.A.R.L. describes a peer recovery center with recovery and support groups, peer navigation, naloxone education, and food, hygiene, diaper, and clothing pantry services for people in recovery. Contact the organization to confirm current eligibility, schedule, and pantry availability before travel.", locationLine: "Rogers · peer recovery center · call to confirm access and hours" }),
];

export const ARKANSAS_URGENT = [
  statewide({ id: "ar-988", name: "988 Suicide & Crisis Lifeline — Arkansas", phone: "988", link: "https://988lifeline.org/", source: "Arkansas DHS and 988 Lifeline", description: "Call or text 988 for free, confidential crisis support, 24 hours a day. For immediate physical danger or emergency medical care, call 911.", locationLine: "Arkansas statewide · 24/7 call or text" }),
  statewide({ id: "ar-treatment-crisis-support-line", name: "Arkansas Mental Health & Addiction Support Line", phone: "1-844-763-0198", link: "https://humanservices.arkansas.gov/divisions-shared-services/shared-services/office-of-substance-abuse-and-mental-health/samh-treatment/", source: "Arkansas Department of Human Services", description: "Call Monday–Friday, 8 a.m.–5 p.m. to locate a mental-health or addiction provider. For immediate emotional crisis support call or text 988; for emergency medical help call 911.", locationLine: "Weekdays 8 a.m.–5 p.m. · not a 24-hour crisis line" }),
  statewide({ id: "ar-211-nwa", name: "Arkansas 211 — Northwest Arkansas referrals", phone: "211", alternatePhone: "866-489-6983", link: "https://arkansas211.org/", source: "Arkansas 211", description: "The current operator says live 211 contact service is available in Benton, Madison, and Washington counties. Call or text your ZIP code to 898211 for local resource referrals in that area; do not rely on this line for immediate danger or as statewide coverage.", locationLine: "Benton, Madison, and Washington counties · current service area" }),
  local({ id: "ar-little-rock-homeless-services", name: "City of Little Rock Homeless Services Division", city: "Little Rock", phone: "501-370-9537", address: "3805 W. 12th St., Little Rock, AR 72204", link: "https://littlerock.gov/government/city-departments/housing-and-neighborhood/homeless-services/", source: "City of Little Rock Homeless Services", description: "City housing advocates work with people at risk of homelessness and people already experiencing homelessness, coordinating with local organizations and public agencies. Call for city service navigation and current contact pathways; the office is not an emergency shelter.", locationLine: "Little Rock · housing navigation · call for current assistance" }),
  regional({ id: "ar-urgent-the-centers-northwest", name: "The Centers — Northwest Arkansas 24/7 psychiatric crisis service", city: "Fayetteville", phone: "479-390-4400", link: "https://www.thecentersar.com/services/crisis-emergency-services", source: "The Centers 24/7 Crisis Services and location pages", description: "The Centers says qualified staff respond around the clock to psychiatric emergency calls and can provide consultation and face-to-face intervention across its Northwest and North Central Arkansas service area. Call for crisis support and the appropriate response; this is not an emergency department. For immediate medical danger call 911.", locationLine: "Northwest and North Central Arkansas · provider lists 24/7 crisis response" }),
];
