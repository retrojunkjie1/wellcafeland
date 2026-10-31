// Primary-source local resource routes added 2026-10-30.
// Listing details are source-reviewed; phone, eligibility, intake, and capacity
// are not independently confirmed. Directory coverage remains in progress.
const reviewed = (record) => ({
  ...record,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const njSource = "https://www.nj.gov/dca/dhcr/offices/dhcrohp.shtml";
const njHousingRoute = (program, id, county, agency, phone, detail) => reviewed({
  id: `nj-${program}-${id}`,
  name: `${agency} — ${detail.label}`,
  state: "NJ",
  city: detail.city || county,
  county,
  phone,
  link: njSource,
  source: "New Jersey Department of Community Affairs, Office of Homelessness Prevention program contact list",
  serviceArea: `${county} County`,
  coverageScope: "county housing access route",
  resourceType: detail.type,
  locationLine: `${county} County · ${detail.short} · call to confirm current intake`,
  description: `${agency} is listed by New Jersey DCA for ${detail.label.toLowerCase()} in ${county} County. Published contact: ${phone}. ${detail.description} Contact the agency before traveling to confirm current intake, eligibility, documentation, hours, and whether funds or a placement are available. A listing does not guarantee assistance or a shelter bed.`,
});

const hppRows = [
  ["atlantic", "Atlantic", "Jewish Family Services of Atlantic and Cape May Counties", "609-822-1108 ext. 269"],
  ["bergen", "Bergen", "Greater Bergen Community Action", "201-968-0200 ext. 7505"],
  ["burlington", "Burlington", "Burlington County Community Action Partnership", "609-386-5800"],
  ["camden", "Camden", "Camden County Council on Economic Opportunity", "856-964-6887"],
  ["cumberland", "Cumberland", "Rural Development Corporation", "856-300-5821"],
  ["essex-family-promise", "Essex", "Family Promise of Essex County", "973-746-1400"],
  ["essex-ucc", "Essex", "United Community Corporation", "973-629-7885"],
  ["gloucester", "Gloucester", "Senior Citizens United Community Services", "856-456-1121"],
  ["hunterdon", "Hunterdon", "Family Promise of Hunterdon County", "908-782-2490"],
  ["mercer-arm-in-arm", "Mercer", "Arm in Arm", "609-396-9355 ext. 11"],
  ["mercer-homefront", "Mercer", "HomeFront", "609-989-9417"],
  ["middlesex", "Middlesex", "Puerto Rican Association for Human Development", "732-638-2814"],
  ["monmouth", "Monmouth", "Interfaith Neighbors", "732-775-0525 ext. 214"],
  ["ocean", "Ocean", "Family Promise of the Jersey Shore", "609-994-3317"],
  ["passaic", "Passaic", "Catholic Family and Community Services", "973-279-7100"],
  ["sussex", "Sussex", "Family Promise of Sussex County", "973-579-1180"],
  ["union-bridges", "Union", "Bridges Outreach", "908-456-8928"],
  ["union-proceed", "Union", "PROCEED", "908-351-7727 ext. 236"],
  ["warren", "Warren", "Family Promise of Warren County", "908-453-2194"],
];
const hprpRows = [
  ["atlantic", "Atlantic", "Jewish Family Services of Atlantic and Cape May Counties", "609-343-2282"],
  ["bergen", "Bergen", "Catholic Family and Community Services", "973-279-7100"],
  ["burlington", "Burlington", "Catholic Charities, Diocese of Trenton", "856-764-6940"],
  ["camden", "Camden", "Center for Family Services", "866-295-7378"],
  ["cape-may", "Cape May", "Jewish Family Services of Atlantic and Cape May Counties", "609-343-2282"],
  ["cumberland", "Cumberland", "Rural Development Corporation", "856-300-5821"],
  ["essex", "Essex", "Family Promise of Essex County", "973-746-1400"],
  ["gloucester", "Gloucester", "Family Promise of Southwest New Jersey", "856-243-5971"],
  ["hudson", "Hudson", "Collaborative Support Programs of New Jersey", "732-618-9694"],
  ["hunterdon", "Hunterdon", "Family Promise of Hunterdon County", "908-782-2490"],
  ["mercer", "Mercer", "HomeFront", "609-989-9417 ext. 141"],
  ["middlesex", "Middlesex", "Catholic Charities, Diocese of Metuchen", "732-826-6278"],
  ["monmouth", "Monmouth", "Affordable Housing Alliance", "732-389-2958"],
  ["morris", "Morris", "Catholic Family and Community Services", "973-361-5555 ext. 3038"],
  ["ocean", "Ocean", "Affordable Housing Alliance", "732-389-2958"],
  ["passaic", "Passaic", "Catholic Family and Community Services", "973-279-7100"],
  ["salem", "Salem", "Family Promise of Southwest New Jersey", "856-243-5971"],
  ["somerset", "Somerset", "Bridges Outreach", "908-273-0176"],
  ["sussex", "Sussex", "Family Promise of Sussex County", "973-579-1180"],
  ["union", "Union", "PROCEED", "908-351-7727"],
  ["warren", "Warren", "Family Promise of Warren County", "908-453-2194"],
];
const diversionRows = [
  ["atlantic", "Atlantic", "Jewish Family Services of Atlantic and Cape May Counties", "609-822-1108"],
  ["burlington", "Burlington", "The Beloved Project of New Jersey", "609-699-6139"],
  ["camden", "Camden", "Volunteers of America Delaware Valley", "856-854-4660"],
  ["cumberland", "Cumberland", "Reformed Church of Highland Park Affordable Housing Corporation", "848-240-8246"],
  ["essex-ucc", "Essex", "United Community Corporation", "973-642-0181"],
  ["essex-csp", "Essex", "Collaborative Support Programs of New Jersey", "732-780-1175"],
  ["essex-bridges", "Essex", "Bridges Outreach", "908-273-0176"],
  ["hudson", "Hudson", "Collaborative Support Programs of New Jersey", "732-780-1175"],
  ["mercer", "Mercer", "The Beloved Project of New Jersey", "609-699-6139"],
  ["middlesex", "Middlesex", "Garden State Home", "732-253-0641"],
  ["monmouth", "Monmouth", "Collaborative Support Programs of New Jersey", "732-780-1175"],
  ["morris", "Morris", "Collaborative Support Programs of New Jersey", "732-780-1175"],
  ["ocean", "Ocean", "Family Promise of the Jersey Shore", "609-994-3317"],
  ["passaic-cfcs", "Passaic", "Catholic Family and Community Services", "973-279-7100"],
  ["passaic-hannah", "Passaic", "Heart of Hannah", "973-955-8062"],
  ["salem", "Salem", "Collaborative Support Programs of New Jersey", "732-780-1175"],
  ["sussex", "Sussex", "Family Promise of Sussex County", "973-579-1180"],
  ["union-fp", "Union", "Family Promise", "908-273-1100"],
  ["union-bridges", "Union", "Bridges Outreach", "908-273-0176"],
  ["warren", "Warren", "Family Promise of Warren County", "908-453-2194"],
];
const hppDetail = { label: "Homelessness Prevention Program (HPP)", short: "past-due rent prevention", type: "homelessness prevention and rent assistance", description: "DCA describes HPP as up to three months of past-due rent assistance for households facing imminent eviction because of temporary financial hardship." };
const hprpDetail = { label: "Homelessness Prevention and Rapid Re-Housing Program (HPRP2)", short: "eviction prevention and rapid rehousing", type: "eviction prevention and rapid rehousing", description: "DCA lists HPRP2 for prevention when a household has an eviction summons or warrant and temporary rapid-rehousing assistance for people leaving unsheltered homelessness or shelter. The agency can explain program screening and documentation." };
const diversionDetail = { label: "Homelessness Diversion Pilot", short: "housing stabilization and diversion", type: "homelessness diversion and stabilization", description: "DCA describes the diversion pilot as housing-stabilization case management paired with flexible funding for eligible households at risk of unsheltered homelessness. Ask whether the pilot is active in your county and what screening applies." };
export const NEW_JERSEY_HOUSING = [
  ...hppRows.map(([id, county, agency, phone]) => njHousingRoute("hpp", id, county, agency, phone, hppDetail)),
  ...hprpRows.map(([id, county, agency, phone]) => njHousingRoute("hprp2", id, county, agency, phone, hprpDetail)),
  ...diversionRows.map(([id, county, agency, phone]) => njHousingRoute("diversion", id, county, agency, phone, diversionDetail)),
];

const njBenefitsSource = "https://www.nj.gov/humanservices/dfd/counties/";
const njCountyOffices = [
  ["atlantic", "Atlantic County Department of Family and Community Development", "Atlantic City", "1333 Atlantic Avenue, Atlantic City, NJ 08401", "609-348-3001"],
  ["bergen", "Bergen County Board of Social Services", "Rochelle Park", "218 Route 17 North, Rochelle Park, NJ 07662", "201-368-4200"],
  ["burlington", "Burlington County Board of Social Services", "Mount Holly", "Human Services Facility, 795 Woodlane Road, Mount Holly, NJ 08060", "609-261-1000"],
  ["camden", "Camden County Board of Social Services", "Cherry Hill", "101 Woodcrest Road, Suite 161, Cherry Hill, NJ 08003", "856-225-8800"],
  ["cape-may", "Cape May County Department of Social Services", "Rio Grande", "Social Services Building, 3801 Route 9 South, Unit 4, Rio Grande, NJ 08242", "609-886-6200"],
  ["cumberland", "Cumberland County Board of Social Services", "Vineland", "275 North Delsea Drive, Vineland, NJ 08360", "856-691-4600"],
  ["essex", "Essex County Department of Citizen Services — Family Assistance and Benefits", "Newark", "320 University Avenue, 2nd Floor, Newark, NJ 07102", "973-395-8000"],
  ["gloucester", "Gloucester County Division of Social Services", "Sewell", "400 Hollydell Drive, Sewell, NJ 08080", "856-582-9200"],
  ["hudson", "Hudson County Department of Family Services — Welfare Division", "Jersey City", "257 Cornelison Avenue, Jersey City, NJ 07302", "201-420-3000"],
  ["hunterdon", "Hunterdon County Division of Social Services", "Flemington", "6 Gauntt Place, Flemington, NJ 08822", "908-788-1300"],
  ["mercer", "Mercer County Board of Social Services", "Trenton", "200 Woolverton Street, Trenton, NJ 08650", "609-989-4320"],
  ["middlesex", "Middlesex County Board of Social Services", "New Brunswick", "181 How Lane, New Brunswick, NJ 08903", "732-745-3500"],
  ["monmouth", "Monmouth County Division of Social Services", "Freehold", "3000 Kozloski Road, Freehold, NJ 07728", "732-431-6000"],
  ["morris", "Morris County Office of Temporary Assistance", "Morristown", "340 West Hanover Avenue, Morristown, NJ 07963", "973-326-7800"],
  ["ocean", "Ocean County Board of Social Services", "Toms River", "Ocean County Resource Center, 1005 Hooper Avenue, Toms River, NJ 08753", "732-349-1500"],
  ["passaic", "Passaic County Board of Social Services", "Paterson", "80 Hamilton Street, Paterson, NJ 07505", "973-881-0100"],
  ["salem", "Salem County Department of Social Services", "Penns Grove", "147 South Virginia Avenue, Penns Grove, NJ 08069", "856-299-7200"],
  ["somerset", "Somerset County Board of Social Services", "Somerville", "73 East High Street, Somerville, NJ 08876", "908-526-8800"],
  ["sussex", "Sussex County Division of Social Services", "Newton", "83 Spring Street, Suite 203, Newton, NJ 07860", "973-383-3600"],
  ["union", "Union County Division of Social Services", "Elizabeth", "342 Westminster Avenue, Elizabeth, NJ 07208", "908-558-2288"],
  ["warren", "Warren County Division of Temporary Assistance and Social Services", "Belvidere", "3 Shotwell Drive, Belvidere, NJ 07823", "908-475-6301"],
];
export const NEW_JERSEY_BENEFITS = njCountyOffices.map(([county, name, city, address, phone]) => {
  const countyName = county.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join(" ");
  return reviewed({
    id: `nj-benefits-${county}`, name: `${name} — county benefits and family assistance`, state: "NJ", city, county: `${countyName} County`, address, phone,
    link: njBenefitsSource, source: "New Jersey Department of Human Services, Division of Family Development County Social Service Agencies directory",
    serviceArea: `${countyName} County`, coverageScope: "county benefits office", resourceType: "county social services and benefits intake",
    locationLine: `${city} · ${countyName} County · call to confirm visiting hours and application route`,
    description: `New Jersey's Division of Family Development lists this county social-service agency at ${address}, phone ${phone}. County agencies are an in-person contact point for New Jersey family assistance and benefit questions, including SNAP and Work First New Jersey cash assistance. Call first to confirm current hours, whether an appointment is required, documents to bring, and the correct application or intake route. This listing does not determine eligibility or guarantee benefits.`,
  });
});

const nmMfaSource = "https://housingnm.org/service-providers/ehap";
const nmShelters = [
  ["dreamtree-youth", "DreamTree Project Youth Shelter", "Taos", "Taos", "575-758-9595", "youth"],
  ["youth-family-services", "Youth Shelters & Family Services", "Santa Fe", "Santa Fe", "505-983-0586 ext. 120", "youth and families"],
  ["barrett", "Barrett Foundation", "Albuquerque", "Bernalillo", "505-246-9244 ext. 107", "adult women"],
  ["dreamtree-nest", "DreamTree Project Nest", "Taos", "Taos", "575-758-9595", "young adults"],
  ["heading-home", "Heading Home", "Albuquerque", "Bernalillo", "505-344-2323", "adults and families"],
  ["st-elizabeth", "St. Elizabeth Shelter", "Santa Fe", "Santa Fe", "505-982-6611", "adults and families"],
  ["spin", "Supporting People in Need (SPIN)", "Silver City", "Grant", "575-494-1128", "adults"],
  ["cope", "Center of Protective Environment (COPE)", "Alamogordo", "Otero", "575-434-3622", "domestic-violence survivor services; call for safe access instructions"],
  ["cav", "Community Against Violence", "Taos", "Taos", "575-758-8082", "domestic-violence survivor services; call for safe access instructions"],
  ["el-refugio", "El Refugio", "Silver City", "Grant", "575-538-2125", "domestic-violence survivor services; call for safe access instructions"],
  ["grammys-house", "Grammy's House", "Artesia", "Eddy", "575-748-1198", "domestic-violence survivor services; call for safe access instructions"],
  ["hartley-house", "Hartley House", "Clovis", "Curry", "575-762-0050", "domestic-violence survivor services; call for safe access instructions"],
  ["haven-house", "Haven House", "Rio Rancho", "Sandoval", "505-404-9365", "domestic-violence survivor services; call for safe access instructions"],
  ["option", "Option, Inc.", "Hobbs", "Lea", "575-397-1576", "domestic-violence survivor services; call for safe access instructions"],
  ["safe-house", "S.A.F.E. House", "Albuquerque", "Bernalillo", "505-247-4219", "domestic-violence survivor services; call for safe access instructions"],
  ["valencia", "Valencia Shelter Services", "Los Lunas", "Valencia", "505-565-3100", "domestic-violence survivor services; call for safe access instructions"],
];
export const NEW_MEXICO_HOUSING = nmShelters.map(([id, name, city, county, phone, population]) => reviewed({
  id: `nm-housing-${id}`, name: `${name} — shelter and housing support`, state: "NM", city, county, phone,
  link: nmMfaSource, source: "New Mexico Mortgage Finance Authority Emergency Homeless Assistance Program shelter list",
  serviceArea: `${county} County`, coverageScope: "county shelter contact", resourceType: "emergency and transitional shelter contact",
  locationLine: `${city}, ${county} County · ${population} · call to confirm intake and safe access`,
  description: `Housing New Mexico MFA lists ${name} as a shelter resource serving ${county} County. Published contact: ${phone}. The source identifies the intended population as ${population}. Call before traveling to confirm current operation, referral requirements, eligibility, hours, and capacity. For domestic-violence services, call first and follow the provider's safety guidance; no confidential shelter location is published here. A listing does not confirm an available bed.`,
}));
export const NEW_MEXICO_URGENT = [reviewed({
  id: "nm-behavioral-health-crisis-access", name: "New Mexico Crisis and Access Line — statewide behavioral-health response", state: "NM", phone: "1-855-662-7474", link: "https://www.nmhealth.org/contact/crisis/", source: "New Mexico Health Care Authority, Crisis Treatment", serviceArea: "Statewide, New Mexico", coverageScope: "statewide", resourceType: "24-hour crisis and treatment referral", locationLine: "Statewide · crisis response and connection to local services",
  description: "New Mexico's state crisis resource page lists the statewide Crisis and Access Line for mental-health crisis response and connection to care. Call for current local options and follow the counselor's safety instructions. For immediate danger requiring emergency response, call 911.",
})];

const nmFoodRows = [
  ["roadrunner", "Roadrunner Food Bank", "Albuquerque", "505-349-5340", "https://www.rrfb.org/", "Bernalillo, Catron, Chaves, Doña Ana, Eddy, Grant, Hidalgo, Lea, Lincoln, Luna, Otero, Sandoval, Sierra, Socorro, Torrance, and Valencia"],
  ["eastern", "Food Bank of Eastern New Mexico", "Clovis", "575-763-6130", "https://www.fbenm.org/", "Curry, De Baca, Guadalupe, Quay, and Roosevelt"],
  ["echo", "ECHO Food Bank", "Farmington", "505-326-3770", "https://echoinc.org/", "San Juan"],
  ["community-pantry", "The Community Pantry", "Gallup", "505-726-8068", "https://thecommunitypantry.org/", "Cibola and McKinley"],
  ["food-depot", "The Food Depot", "Santa Fe", "505-471-1633", "https://thefooddepot.org/", "Colfax, Harding, Los Alamos, Mora, Rio Arriba, San Miguel, Santa Fe, Taos, and Union"],
];
export const NEW_MEXICO_FOOD = nmFoodRows.map(([id, name, city, phone, link, counties]) => reviewed({
  id: `nm-food-${id}`, name: `${name} — regional food bank and pantry locator`, state: "NM", city, phone, link,
  source: "New Mexico Association of Food Banks, Find Food Near You", serviceArea: counties, coverageScope: "regional food bank network",
  resourceType: "regional food bank and local pantry referral", locationLine: `${city} · serving ${counties} · ask for nearest pantry or meal site`,
  description: `The New Mexico Association of Food Banks identifies ${name} as the regional food bank serving ${counties}. Contact the food bank or use its local food finder to locate community pantries, senior centers, Pueblo partners, and other distribution sites. Confirm the nearest location, hours, service area, and current availability before traveling. This regional contact is not itself a promise of food at this address.`,
}));

const nmActionAgencies = [
  ["southern", "Community Action Agency of Southern New Mexico", "Las Cruces", "Doña Ana, Grant, Hidalgo, Luna, Sierra", "https://www.caasnm.org/", "Food assistance, nutrition, case management, income support, and youth services"],
  ["eastern-plains", "Eastern Plains Community Action Agency", "Clovis", "Curry, De Baca, Harding, Guadalupe, Quay, Roosevelt, Union", "https://www.epcaa.org/", "Emergency food assistance, utility support, Head Start, and pre-K"],
  ["echo-action", "Economic Council Helping Others (ECHO)", "Farmington", "San Juan", "https://echoinc.org/", "Food assistance, senior food programs, utility and rent assistance, and family services"],
  ["help-nm", "HELP New Mexico", "Albuquerque", "Bernalillo, Catron, Chaves, Cibola, Colfax, Doña Ana, Grant, Hidalgo, Los Alamos, Luna, McKinley, Mora, Otero, Rio Arriba, San Juan, San Miguel, Sandoval, Santa Fe, Sierra, Socorro, Taos, Torrance", "https://www.helpnm.com/", "Food assistance, supportive housing, rent and utility assistance, employment, and family supports"],
  ["midwest", "Mid West New Mexico Community Action Program", "Grants", "Catron, Cibola, McKinley, Socorro, Valencia", "https://www.ourkidzrock.com/", "Food assistance, supportive housing, income management, and utility or rent assistance"],
  ["southeast", "Southeast New Mexico Community Action Corporation", "Artesia", "Chaves, Eddy, Lea, Lincoln, Otero", "https://www.snmcac.com/", "Senior support, child and family programs, direct care, and utility or rent assistance"],
];
export const NEW_MEXICO_COMMUNITY_ACTION = nmActionAgencies.map(([id, name, city, counties, link, programs]) => reviewed({
  id: `nm-action-${id}`, name: `${name} — community action and family support`, state: "NM", city, link,
  source: "New Mexico Association of Community Partners, Find Help", serviceArea: counties, coverageScope: "multi-county community action agency",
  resourceType: "community action, benefits, and family support agency", locationLine: `${city} · serves ${counties}`,
  description: `New Mexico Association of Community Partners lists ${name} as serving ${counties}. Published program areas include ${programs.toLowerCase()}. Contact the agency to ask which programs are active in your county, current intake routes, eligibility, documentation, and availability. Service lists and county coverage can change; confirm directly.`,
}));

const ndClinicSource = "https://www.hhs.nd.gov/service-locations/behavioral-health-clinics";
const ndClinics = [
  ["west-central", "West Central Behavioral Health Clinic", "Bismarck", "1237 W. Divide Ave., Suite 5, Bismarck, ND 58501", "888-328-2662", "West Central region"],
  ["lake-region", "Lake Region Behavioral Health Clinic", "Devils Lake", "200 Highway 2 W, Devils Lake, ND 58301", "888-607-8610", "Lake Region"],
  ["badlands", "Badlands Behavioral Health Clinic", "Dickinson", "1463 I-94 Business Loop East, Dickinson, ND 58601", "888-227-7525", "Badlands region"],
  ["southeast", "Southeast Behavioral Health Clinic", "Fargo", "2624 9th Ave. S., Fargo, ND 58103", "888-342-4900", "Southeast region"],
  ["northeast", "Northeast Behavioral Health Clinic", "Grand Forks", "151 S. 4th St., Suite 401, Grand Forks, ND 58201", "888-256-6742", "Northeast region"],
  ["south-central", "South Central Behavioral Health Clinic", "Jamestown", "520 3rd St. NW, Jamestown, ND 58401", "800-260-1310", "South Central region"],
  ["north-central", "North Central Behavioral Health Clinic", "Minot", "1015 S. Broadway, Suite 18, Minot, ND 58701", "888-470-6968", "North Central region"],
  ["northwest", "Northwest Behavioral Health Clinic", "Williston", "316 2nd Ave. W, Williston, ND 58802", "800-231-7724", "Northwest region"],
];
export const NORTH_DAKOTA_TREATMENT = ndClinics.map(([id, name, city, address, phone, serviceArea]) => reviewed({
  id: `nd-treatment-${id}`, name: `${name} — walk-in behavioral-health assessment and treatment`, state: "ND", city, address, phone, link: ndClinicSource,
  source: "North Dakota Health and Human Services Regional Behavioral Health Clinics directory", serviceArea, coverageScope: "multi-county regional clinic", resourceType: "regional behavioral-health clinic",
  locationLine: `${city} · serves ${serviceArea} · contact clinic for walk-in access`,
  description: `North Dakota HHS lists ${name} at ${address} as a regional behavioral-health clinic serving ${serviceArea}. The state describes services including walk-in assessment and same-day care, outpatient behavioral-health and substance-use care, medication and withdrawal services, and recovery supports. Published contact: ${phone}. Ask which services operate at this site, current walk-in hours, fees or sliding-scale eligibility, and whether you need to call first.`,
}));

const ndBenefitSource = "https://www.hhs.nd.gov/service-locations/human-service/zones";
const ndZones = [
  ["burleigh", "Burleigh County Human Service Zone", "Bismarck", "415 E. Rosser Ave., Suite 113, Bismarck, ND 58501", "701-222-6670", "Burleigh County"],
  ["cass", "Cass Human Service Zone", "Fargo", "1010 2nd Ave. S., Fargo, ND 58108", "701-241-5765", "Cass County"],
  ["eddy", "Central Prairie Human Service Zone — Eddy County office", "New Rockford", "22 9th St. S., New Rockford, ND 58356", "701-947-5314", "Eddy, Foster, and Wells counties"],
  ["nelson", "Eastern Plains Human Service Zone — Nelson County office", "Lakota", "210 B Ave. W., Suite 104, Lakota, ND 58344", "701-247-2945", "Nelson and Griggs counties"],
  ["grand-forks", "Grand Forks County Human Service Zone", "Grand Forks", "151 S. 4th St., Suite 200, Grand Forks, ND 58201", "701-787-8500", "Grand Forks County"],
  ["benson", "Mountain Lakes Human Service Zone — Benson County office", "Fort Totten", "1314 Dakotah Dr., Fort Totten, ND 58335", "701-766-1806", "Benson, Ramsey, Rolette, and Towner counties"],
  ["ramsey", "Mountain Lakes Human Service Zone — Ramsey County office", "Devils Lake", "524 4th Ave. NE, Devils Lake, ND 58301", "701-662-7050", "Benson, Ramsey, Rolette, and Towner counties"],
  ["mckenzie", "Mountrail-McKenzie Human Service Zone — McKenzie County office", "Watford City", "201 5th St. NW, Unit 790, Watford City, ND 58854", "701-444-3661", "McKenzie and Mountrail counties"],
  ["mountrail", "Mountrail-McKenzie Human Service Zone — Mountrail County office", "Stanley", "18 2nd Ave. SE, Stanley, ND 58784", "701-628-2925", "McKenzie and Mountrail counties"],
  ["burke", "North Star Human Service Zone — Burke County office", "Bowbells", "103 Main St. SE, Bowbells, ND 58721", "701-377-2313", "Burke, Divide, Renville, and Williams counties"],
  ["divide", "North Star Human Service Zone — Divide County office", "Crosby", "200 N. Main St., Crosby, ND 58730", "701-965-6521", "Burke, Divide, Renville, and Williams counties"],
  ["williams", "North Star Human Service Zone — Williams County office", "Williston", "110 W. Broadway, Suite 202, Williston, ND 58801", "701-774-6300", "Burke, Divide, Renville, and Williams counties"],
  ["dunn", "Roughrider North Human Service Zone — Dunn County office", "Manning", "205 Owens St., Suite 210, Manning, ND 58642", "701-573-5385", "Dunn, Golden Valley, Hettinger, and Stark counties"],
  ["stark", "Roughrider North Human Service Zone — Stark County office", "Dickinson", "2680 Empire Rd., Suite A, Dickinson, ND 58601", "701-456-7675", "Dunn, Golden Valley, Hettinger, and Stark counties"],
  ["ransom", "RSR Human Service Zone — Ransom County office", "Lisbon", "205 Fourth Ave. S., Lisbon, ND 58054", "701-683-6133", "Ransom, Richland, and Sargent counties"],
  ["richland", "RSR Human Service Zone — Richland County office", "Wahpeton", "413 Third Ave. N., Wahpeton, ND 58075", "701-642-7751", "Ransom, Richland, and Sargent counties"],
  ["dickey", "South Country Human Service Zone — Dickey County office", "Ellendale", "205 15th St. N., Ellendale, ND 58436", "701-349-3271", "Dickey, Emmons, Kidder, LaMoure, Logan, and McIntosh counties"],
  ["emmons", "South Country Human Service Zone — Emmons County office", "Linton", "100 4th St. NW, Linton, ND 58552", "701-254-4502", "Dickey, Emmons, Kidder, LaMoure, Logan, and McIntosh counties"],
];
export const NORTH_DAKOTA_BENEFITS = ndZones.map(([id, name, city, address, phone, serviceArea]) => reviewed({
  id: `nd-benefits-${id}`, name: `${name} — public benefits and family support`, state: "ND", city, address, phone, link: ndBenefitSource,
  source: "North Dakota Health and Human Services Human Service Zones directory", serviceArea, coverageScope: "county office within multi-county benefits region", resourceType: "county human service office",
  locationLine: `${city} · serves ${serviceArea} · contact for current office hours`,
  description: `North Dakota HHS lists this local Human Service Zone office at ${address}, phone ${phone}. Zone offices are an access point for economic assistance including SNAP, Medicaid, child-care assistance, heating assistance, and TANF, along with other family and supportive services. Service area: ${serviceArea}. Call to confirm the correct local office, application steps, documents, hours, and benefit eligibility; this listing does not determine eligibility.`,
}));
export const NORTH_DAKOTA_URGENT = ndClinics.map(([id, name, city, address, phone, serviceArea]) => reviewed({
  id: `nd-crisis-${id}`, name: `${name} — 24/7 crisis and residential response`, state: "ND", city, address, phone, link: ndClinicSource,
  source: "North Dakota Health and Human Services Regional Behavioral Health Clinics directory", serviceArea, coverageScope: "multi-county regional crisis access", resourceType: "24-hour behavioral-health crisis service",
  locationLine: `${city} · regional crisis access for ${serviceArea} · call before traveling`,
  description: `North Dakota HHS states its eight regional clinics provide 24/7 crisis and residential services. This clinic serves ${serviceArea}; the published contact is ${phone}. Call to connect with the local crisis response and confirm whether an in-person visit is appropriate. Call or text 988 for immediate mental-health crisis support; call 911 for immediate danger.`,
}));

const ndFoodSites = [
  ["bismarck-dream-center", "Dream Center", "Bismarck", "1805 Park Ave, Bismarck, ND", "701-955-2150", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
  ["bismarck-great-plains", "Great Plains Food Bank — Bismarck", "Bismarck", "1315 S 20th St, Bismarck, ND", "701-751-6188", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
  ["fargo-emergency-food-pantry", "Emergency Food Pantry", "Fargo", "1101 4th Ave N, Fargo, ND", "701-237-9337", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
  ["fargo-great-plains", "Great Plains Food Bank — Fargo", "Fargo", "1720 3rd Ave N, Fargo, ND", "701-232-6219", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
  ["grand-forks-salvation-army", "Salvation Army Grand Forks — food assistance", "Grand Forks", "1600 University Ave, Grand Forks, ND", "701-775-2597", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
  ["grand-forks-st-joseph", "St. Joseph's Social Care Food Pantry", "Grand Forks", "620 8th Ave S, Grand Forks, ND", "701-795-8614", "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance"],
];
export const NORTH_DAKOTA_FOOD = ndFoodSites.map(([id, name, city, address, phone, link]) => reviewed({
  id: `nd-food-${id}`, name: `${name} — local food assistance`, state: "ND", city, address, phone, link,
  source: "North Dakota HHS Community Resource Guide, Food and Income Assistance", serviceArea: `${city}, North Dakota`, coverageScope: "city food assistance contact",
  resourceType: "food pantry or food assistance contact", locationLine: `${address} · call to confirm current hours, intake, and food availability`,
  description: `North Dakota HHS lists ${name} at ${address}, phone ${phone}, among local food resources. Contact the organization to confirm hours, eligibility or service area, appointment requirements, and current food availability before traveling. HHS also notes mobile food pantries and other nutrition support for rural communities; use the linked state guide or call 211 if this location is not accessible.`,
}));

// North Dakota peer, housing, and rural food routes from state HHS and NDDPI.
// Community Connect has program eligibility; these are access contacts, not
// open-enrollment promises or confirmed availability.
const ndCommunityConnectSource = "https://www.hhs.nd.gov/behavioral-health/community-connect/providers";
const ndPeerRoutes = [
  ["advocates-minot", "Advocates for Change", "Minot", "North Central Region", "701-289-7676", "https://www.hhs.nd.gov/behavioral-health/community-connect/region2", "Care coordination and peer support through Community Connect and Free Through Recovery; the latter has justice-system eligibility."],
  ["all-of-us-minot", "All Of Us In Recovery", "Minot", "North Central Region", "218-779-6825", "https://www.hhs.nd.gov/behavioral-health/community-connect/region2", "Case management connects participants with behavioral healthcare, peer support, housing, medical care, advocacy, education, employment, and social opportunities."],
  ["community-options-minot", "Community Options", "Minot", "North Central Region", "701-852-0174", "https://www.hhs.nd.gov/behavioral-health/community-connect/region2", "Care coordinators connect participants with peer support and referrals, including housing, employment, and education."],
  ["f5-minot", "F5 Project", "Minot", "North Central Region", "701-412-6866", "https://www.hhs.nd.gov/behavioral-health/community-connect/region2", "Peer mentorship and re-entry support, including employment and housing navigation; some services are for people involved with the justice system."],
  ["independence-minot", "Independence, Inc.", "Minot", "North Central Region", "701-839-4724", "https://www.hhs.nd.gov/behavioral-health/community-connect/region2", "Peer-driven independent-living support for people in recovery; services may include housing, employment, transportation, education, and financial-independence navigation."],
  ["new-creation-devils-lake", "A New Creation", "Devils Lake", "Lake Region", "701-552-0892 / 701-350-2362", "https://www.hhs.nd.gov/behavioral-health/community-connect/region3", "Recovery mentoring and advocacy, individualized care planning, and support groups; the provider also serves justice-involved people."],
  ["all-of-us-devils-lake", "All Of Us In Recovery", "Devils Lake", "Lake Region", "701-330-2006", "https://www.hhs.nd.gov/behavioral-health/community-connect/region3", "Case-management route for behavioral-health, peer-support, housing, medical-care, advocacy, education, employment, and social-service referrals."],
  ["community-options-devils-lake", "Community Options", "Devils Lake", "Lake Region", "701-662-3110", "https://www.hhs.nd.gov/behavioral-health/community-connect/region3", "Care coordinators connect Community Connect participants with peer support and housing, employment, and education referrals."],
  ["f5-devils-lake", "F5 Project", "Devils Lake", "Lake Region", "701-960-9648", "https://www.hhs.nd.gov/behavioral-health/community-connect/region3", "Re-entry peer mentorship and transitional support, including housing and employment navigation; ask about justice-system program eligibility."],
  ["libertas-northeast", "Libertas", "Cavalier, Pembina, and Walsh counties", "Northeast Region", "701-521-5122", "https://www.hhs.nd.gov/behavioral-health/community-connect/region3", "Community-based care coordination and peer support for residents navigating behavioral health, housing, employment, sobriety, and post-incarceration needs."],
  ["ability-consulting-grand-forks", "Ability Consulting", "Grand Forks", "Grand Forks region", "701-770-3525", "https://www.hhs.nd.gov/behavioral-health/community-connect/region4", "Community Connect case management with educational, employment, housing, and community-connection goals."],
  ["community-options-grand-forks", "Community Options", "Grand Forks", "Grand Forks region", "701-772-1715", "https://www.hhs.nd.gov/behavioral-health/community-connect/region4", "Care coordinators connect participants with peer support and referrals for housing, employment, and education."],
  ["f5-grand-forks", "F5 Project", "Grand Forks", "Grand Forks region", "701-960-9648", "https://www.hhs.nd.gov/behavioral-health/community-connect/region4", "Re-entry peer mentorship and transition support with housing, employment, and community-connection referrals."],
  ["better-together-grand-forks", "Better Together ND", "Grand Forks", "Grand Forks region", "701-404-9180", "https://www.hhs.nd.gov/behavioral-health/community-connect/region4", "Community Connect care coordination, peer support, and recovery services based on an individualized care plan."],
  ["cass-clay-integration-fargo", "Cass Clay Integration Center", "Fargo", "Cass, Ransom, Richland, Sargent, Steele, and Traill counties", "701-730-9236", "https://www.hhs.nd.gov/behavioral-health/community-connect/region5", "Community Connect care coordination, peer support, recovery, housing, employment, education, and resource navigation."],
  ["f5-fargo", "F5 Project", "Fargo", "Southeast Region", "701-210-2491", "https://www.hhs.nd.gov/behavioral-health/community-connect/region5", "Fargo re-entry and peer-mentorship route; ask about Community Connect or Free Through Recovery eligibility and the appropriate local service."],
  ["recovery-talk-statewide", "Recovery Talk — confidential peer support", "Statewide", "North Dakota statewide", "701-291-7901 (call or text)", "https://www.hhs.nd.gov/behavioral-health/recovery-talk", "Free, confidential 24/7 peer support from trained specialists with lived experience. Anonymous support and optional scheduled outreach are available; it is not emergency dispatch."],
];
export const NORTH_DAKOTA_PEER = ndPeerRoutes.map(([id, name, city, serviceArea, phone, link, scope]) => reviewed({
  id: `nd-peer-${id}`, name: `${name} — peer and community recovery support`, state: "ND", city, phone, link,
  source: "North Dakota HHS Community Connect provider guide and Recovery Talk directory", serviceArea, coverageScope: "regional peer-support access route", resourceType: "peer recovery and community support",
  locationLine: `${city} · ${serviceArea} · call to confirm fit and intake`,
  description: `North Dakota HHS lists ${name} as a Community Connect or peer-support contact. ${scope} Ask about program eligibility, current intake, hours, costs, and whether services are available in your community before traveling. Provider listings are source-reviewed, not phone-confirmed.`,
}));

const ndHousingSource = "https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/shelter-and-housing-assistance";
const ndHousingRoutes = [
  ["ywca-cass-clay", "YWCA Cass Clay", "Fargo", "3000 S University Dr, Fargo, ND 58103", "701-232-3449", "Emergency shelter and housing referral; call for confidential intake and safe access instructions."],
  ["new-life-center", "New Life Center", "Fargo", "1902 3rd Ave N, Fargo, ND 58102", "701-235-4453", "Emergency shelter and housing support route; call to confirm eligibility, referral steps, and current availability."],
  ["united-way-center-opportunity", "United Way Center for Opportunity", "Bismarck", "1140 S 12th St, Bismarck, ND 58501", "701-401-5606", "Housing and homelessness-prevention contact; ask about current intake and referral options."],
  ["fargo-hra", "Fargo Housing & Redevelopment Authority", "Fargo", "25 Broadway, Fargo, ND 58102", "701-293-6262", "Public-housing and rental-assistance contact. Ask about current application windows, waitlists, and program eligibility."],
  ["village-family-service", "The Village Family Service Center", "Fargo", "2701 12th Ave S, Fargo, ND 58103", "701-451-4900 / 800-627-8220", "Housing-support and case-management route; call to confirm current programs and intake."],
  ["grand-forks-hra", "Grand Forks Housing Authority", "Grand Forks", "1405 1st Ave N, Grand Forks, ND 58203", "701-456-2545", "Public-housing and rental-assistance contact; ask about current application periods, eligibility, and waitlists."],
  ["salvation-army-grand-forks", "Salvation Army Grand Forks", "Grand Forks", "1600 University Ave, Grand Forks, ND 58203", "701-775-2597", "Housing-support referral contact; call to ask what housing or emergency-support services are currently active."],
  ["burleigh-housing-authority", "Burleigh County Housing Authority", "Bismarck", "410 S 2nd St, Bismarck, ND 58504", "701-225-2540", "Public-housing and rental-assistance contact; confirm current programs, eligibility, and waitlist status."],
  ["cap-region-vii", "Community Action Program Region VII", "Bismarck", "2105 Lee Ave, Bismarck, ND 58504", "701-258-2240", "Housing and homelessness-prevention referral route; call to ask about current rent support, screening, and documentation."],
  ["southeast-care-fargo", "Southeast Care LLC", "Fargo", "1323 23rd St S, Suite D, Fargo, ND 58103", "218-443-0088", "Listed by North Dakota HHS under housing-support case management. Contact to confirm current service area, referral pathway, and eligibility."],
  ["community-options-fargo", "Community Options", "Fargo", "2701 9th Ave S, Fargo, ND 58103", "701-223-2417", "Housing-support case-management contact listed by North Dakota HHS. Call to confirm intake, eligibility, and current services."],
  ["prairie-harvest-grand-forks", "Prairie Harvest Medical Health", "Grand Forks", "930 N 3rd St, Grand Forks, ND 58203", "701-795-9143", "Housing-support case-management contact listed by North Dakota HHS. Call to identify current social-work and referral access."],
  ["altru-social-work-grand-forks", "Altru Health System Social Work", "Grand Forks", "1200 S Columbia Rd, Grand Forks, ND 58206", "701-780-5000", "Hospital social-work contact listed by North Dakota HHS for housing-support case management; ask to be connected to the appropriate team."],
  ["community-options-bismarck", "Community Options", "Bismarck", "4909 Shelburne St, Bismarck, ND 58501", "701-223-2417", "Housing-support case-management contact listed by North Dakota HHS. Call to confirm service eligibility and referral steps."],
  ["beyond-housing-valley-city", "Beyond Housing", "Valley City", "915 2nd St SW, Valley City, ND 58072", "701-399-9863", "North Dakota Community Connect lists housing support serving Barnes County and neighboring counties. Call to confirm coverage and intake."],
  ["blessed-builders-bismarck", "Blessed Builders", "Bismarck", "2700 State St, Suite F-6, Bismarck, ND 58503", "701-751-0318", "Community Connect directory lists sober housing and outpatient treatment for men and women. Ask about admission criteria, fees, and current space."],
  ["ministry-margins-bismarck", "Ministry on the Margins", "Bismarck", "201 N 24th St, Bismarck, ND", "701-223-6315", "Community Connect directory lists emergency-shelter and housing support alongside food assistance. Call first for intake, hours, eligibility, and safe access details."],
  ["hopes-landing-dickinson", "Hope’s Landing Sober Living", "Dickinson", "PO Box 3645, Dickinson, ND 58602", "701-225-7132", "Community Connect directory lists sober living for men and women. Call to ask about admission requirements, costs, current space, and the confidential intake process."],
];
export const NORTH_DAKOTA_HOUSING = ndHousingRoutes.map(([id, name, city, address, phone, scope]) => reviewed({
  id: `nd-housing-${id}`, name: `${name} — housing and safe-place access`, state: "ND", city, address, phone,
  link: id.includes("beyond-housing") ? "https://www.hhs.nd.gov/behavioral-health/community-connect/region6" : id.includes("blessed-builders") || id.includes("ministry-margins") ? "https://www.hhs.nd.gov/behavioral-health/community-connect/region7" : id.includes("hopes-landing") ? "https://www.hhs.nd.gov/behavioral-health/community-connect/region8" : ndHousingSource,
  source: id.includes("beyond-housing") || id.includes("blessed-builders") || id.includes("ministry-margins") || id.includes("hopes-landing") ? "North Dakota HHS Community Connect regional provider directory" : "North Dakota HHS Community Resource Guide, Shelter and Housing Assistance",
  serviceArea: city === "Fargo" ? "Fargo and Cass County; ask provider about wider referral coverage" : city === "Grand Forks" ? "Grand Forks area; ask provider about wider referral coverage" : `${city} area`,
  coverageScope: "local housing access or referral contact", resourceType: "housing, shelter, rental assistance, or housing case-management contact",
  locationLine: `${address} · call to confirm intake, eligibility, and availability`,
  description: `North Dakota HHS lists ${name} as a housing or housing-support contact. ${scope} Call before traveling to confirm the correct referral path, eligibility, hours, fees, safety instructions, and current availability. A listing does not guarantee rental assistance, placement, or an available bed.`,
}));

const ndFoodNetworkSource = "https://www.nd.gov/dpi/familiescommunity/community/food-programs";
const ndFoodNetworkRoutes = [
  ["community-action-dickinson", "Community Action Partnership in Dickinson", "Dickinson", "202 East Villard, Dickinson, ND 58601", "701-227-0131 / 800-359-2243", "Dunn, Billings, Golden Valley, Stark, Hettinger, Slope, Bowman, and Adams counties", "Regional CSFP food-program contact; CSFP eligibility is for qualifying adults age 60 and older. Ask about application and local distribution site."],
  ["community-action-williston", "Community Action Partnership — Williston region", "Williston", "120 Washington Ave, Williston, ND 58801", "701-572-8191 / 877-572-8191", "Williams, Divide, and McKenzie counties", "Regional CSFP food-program contact; CSFP eligibility is for qualifying adults age 60 and older. Ask about application and local distribution site."],
  ["southeastern-cap-fargo", "Southeastern North Dakota Community Action Agency", "Fargo", "3233 South University Drive, Fargo, ND 58104-6221", "701-232-2452 / 800-726-7960", "Cass, Ransom, Sargent, Richland, Steele, Traill, and Nelson counties", "State-listed local CSFP administering agency. Ask about the age-60-plus eligibility rules, application, and the distribution partner serving your county."],
  ["hope-center-devils-lake", "Hope Center", "Devils Lake", "313 3rd Street NE, Devils Lake, ND 58301", "701-665-4673", "Ramsey, Eddy, Towner, Benson, and Cavalier counties", "State-listed CSFP food distribution contact. Ask about the age-60-plus eligibility rules, application, distribution schedule, and current availability."],
];
export const NORTH_DAKOTA_FOOD_REGIONAL = ndFoodNetworkRoutes.map(([id, name, city, address, phone, serviceArea, scope]) => reviewed({
  id: `nd-food-${id}`, name: `${name} — regional food and CSFP access`, state: "ND", city, address, phone, link: ndFoodNetworkSource,
  source: "North Dakota Department of Public Instruction Food Programs, CSFP agency contact directory", serviceArea, coverageScope: "regional food-program access contact", resourceType: "senior food program and regional food distribution route",
  locationLine: `${city} · serves ${serviceArea} · call for local distribution details`,
  description: `North Dakota’s state food-program directory lists ${name} for ${serviceArea}. ${scope} Contact the agency to confirm current county coverage, enrollment, distribution location and dates before traveling; this program route is not a general walk-in pantry listing and does not guarantee food availability.`,
}));

const orFoodNetworks = [
  ["access", "ACCESS Food Share", "Medford", "Jackson County", "https://www.accesshelps.org/"],
  ["capeco", "CAPECO Food Share", "Pendleton", "Umatilla and Morrow counties", "https://www.capeco-works.org/"],
  ["clatsop", "Clatsop Community Action Regional Food Bank", "Astoria", "Clatsop County", "https://ccaservices.org/"],
  ["columbia-pacific", "Columbia Pacific Food Bank", "St. Helens", "Columbia County", "https://www.cpfoodbank.org/"],
  ["community-connection", "Community Connection of Northeast Oregon", "La Grande", "Union, Baker, and Wallowa region", "https://ccno.org/"],
  ["food-for-lane", "FOOD for Lane County", "Eugene", "Lane County", "https://www.foodforlanecounty.org/"],
  ["food-share-lincoln", "Food Share of Lincoln County", "Newport", "Lincoln County", "https://foodsharelc.org/"],
  ["josephine", "Josephine County Food Bank", "Grants Pass", "Josephine County", "https://www.jocofoodbank.org/"],
  ["klamath-lake", "Klamath-Lake Counties Food Bank", "Klamath Falls", "Klamath and Lake counties", "https://klamathfoodbank.org/"],
  ["linn-benton", "Linn Benton Food Share", "Corvallis", "Linn and Benton counties", "https://communityservices.us/"],
  ["marion-polk", "Marion Polk Food Share", "Salem", "Marion and Polk counties", "https://www.marionpolkfoodshare.org/"],
  ["neighborimpact", "NeighborImpact Food Program", "Redmond", "Central Oregon region", "https://www.neighborimpact.org/"],
  ["south-coast", "South Coast Food Share", "Coos Bay", "Coos and Curry counties", "https://www.orcca.us/"],
  ["ucan", "United Community Action Network Food Bank", "Roseburg", "Douglas and Josephine counties", "https://www.ucancap.org/"],
  ["ycap", "YCAP Regional Food Bank", "McMinnville", "Yamhill County", "https://www.yamhillcap.org/"],
  ["portland-metro", "Oregon Food Bank — Portland Metro Services", "Portland", "Portland Metro", "https://www.oregonfoodbank.org/find-support/food-support-network"],
  ["washington-county", "Oregon Food Bank — Washington County Services", "Beaverton", "Washington County", "https://www.oregonfoodbank.org/find-support/food-support-network"],
  ["southeast", "Oregon Food Bank — Southeast Oregon Services", "Ontario", "Southeast Oregon", "https://www.oregonfoodbank.org/find-support/food-support-network"],
  ["tillamook", "Tillamook County Food Bank", "Tillamook", "Tillamook County", "https://www.oregonfoodbank.org/find-support/food-support-network"],
  ["columbia-gorge", "Columbia Gorge Food Bank", "The Dalles", "Wasco, Hood River, and Sherman counties", "https://www.oregonfoodbank.org/find-support/food-support-network"],
];
export const OREGON_FOOD = orFoodNetworks.map(([id, name, city, serviceArea, link]) => reviewed({
  id: `or-food-${id}`, name: `${name} — regional food assistance network`, state: "OR", city, link,
  source: "Oregon Food Bank, Food Support Network directory", serviceArea, coverageScope: "regional food bank network",
  resourceType: "regional food bank and pantry locator", locationLine: `${city} · serving ${serviceArea} · contact or use food finder for a nearby site`,
  description: `Oregon Food Bank lists ${name} as a regional network organization serving ${serviceArea}. Regional food banks coordinate local partner agencies and food sites; this listing is a route to the network, not a claim that food is distributed at this address. Use the [Oregon Food Bank Food Finder](https://foodfinder.oregonfoodbank.org/) or contact the organization to locate a nearby site and confirm its hours, eligibility, and current availability.`,
}));

const orSource = "https://www.oregon.gov/oya/Pages/OregonResourcesbyCounty.aspx";
const orRows = [
  ["Baker", "New Directions NW, Inc.", "541-523-7400", "541-519-7126", "Baker"],
  ["Benton", "Benton County Behavioral Health", "541-766-6835", "888-232-7192", "Corvallis"],
  ["Clackamas", "Clackamas County Mental Health", "503-742-5300", "503-655-8585", "Oregon City"],
  ["Clatsop", "Clatsop Behavioral Healthcare", "503-325-5722", "503-325-5724", "Astoria"],
  ["Columbia", "Columbia Community Mental Health", "503-397-5211", "503-782-4499", "St. Helens"],
  ["Coos", "Coos Health and Wellness", "541-266-6700", "541-266-6800", "Coos Bay"],
  ["Crook", "Coos Health and Wellness regional access", "541-266-6700", "541-266-6800", "Prineville"],
  ["Curry", "Adapt Integrated Health Care", "877-519-9322", "877-408-8941", "Brookings"],
  ["Deschutes", "Deschutes County Behavioral Health", "541-322-7500", "541-322-7500 ext. 9", "Bend"],
  ["Douglas", "Adapt Integrated Health Care", "541-440-3532", "541-440-3532", "Roseburg"],
  ["Gilliam", "Community Counseling Solutions", "541-676-9161", "911; ask dispatch for the on-call crisis worker", "Condon"],
  ["Grant", "Community Counseling Solutions", "541-575-1466", "911; ask dispatch for the on-call crisis worker", "John Day"],
  ["Harney", "Symmetry Care", "541-573-8376", "800-273-8255", "Burns"],
  ["Hood River", "Mid-Columbia Center for Living", "541-386-2620", "800-877-9147", "Hood River"],
  ["Jackson", "Jackson County Mental Health", "541-774-3333", "541-774-8201", "Medford"],
  ["Jefferson", "BestCare Treatment", "541-475-6575", "541-475-6575 after hours", "Madras"],
  ["Josephine", "Options for Southern Oregon", "541-476-2373", "541-474-5360", "Grants Pass"],
  ["Klamath", "Klamath Basin Behavioral Health", "541-883-1030", "541-883-1030", "Klamath Falls"],
  ["Lake", "Lake District Wellness Center", "541-947-6021 ext. 1", "541-947-6021", "Lakeview"],
  ["Lane", "Lane County Behavioral Health", "541-682-3608", "541-682-1001", "Eugene"],
  ["Lincoln", "Lincoln County Health and Human Services", "541-265-4196", "866-266-0288", "Newport"],
  ["Linn", "Linn County Mental Health", "541-967-3866", "541-967-3866 press 1", "Albany"],
  ["Malheur", "Lifeways", "541-889-9167", "541-889-9167", "Ontario"],
  ["Marion", "Marion County Behavioral Health", "503-588-5351", "503-576-4673", "Salem"],
  ["Morrow", "Community Counseling Solutions", "541-676-9161", "541-276-6207", "Heppner"],
  ["Multnomah", "Multnomah County Behavioral Health", "503-988-4888", "503-988-4888", "Portland"],
  ["Polk", "Polk County Behavioral Health Services", "503-623-9289", "503-581-5535 after hours", "Dallas"],
  ["Sherman", "Mid-Columbia Center for Living", "541-565-3149", "888-877-9147", "Moro"],
  ["Tillamook", "Tillamook Family Counseling Center", "503-842-8201", "503-842-8201", "Tillamook"],
  ["Umatilla", "Community Counseling Solutions", "541-676-9161", "541-276-6207", "Pendleton"],
  ["Union", "Center for Human Development", "541-962-8800", "541-962-8800 option 6", "La Grande"],
  ["Wallowa", "Wallowa Valley Center for Wellness", "541-426-4524", "541-398-1175", "Enterprise"],
  ["Wasco", "Mid-Columbia Center for Living", "541-296-5452 ext. 3236", "888-877-9147", "The Dalles"],
  ["Washington", "Washington County Health and Human Services Behavioral Health", "503-846-4528", "503-291-9111", "Hillsboro"],
  ["Wheeler", "Community Counseling Solutions", "541-763-2746", "911", "Fossil"],
  ["Yamhill", "Yamhill County Mental Health", "503-434-7462", "844-842-8200", "McMinnville"],
];
const orContact = (county, provider, phone, crisisPhone, city, kind) => reviewed({
  id: `or-${kind}-${county.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: `${provider} — ${kind === "crisis" ? "county crisis contact" : "community behavioral-health access"}`,
  state: "OR", city, county: `${county} County`, phone: kind === "crisis" ? crisisPhone : phone,
  emergencyPhone: kind === "crisis" ? undefined : crisisPhone,
  link: orSource, source: "Oregon Youth Authority, Oregon Crisis Resources by County (state-published county contacts)",
  serviceArea: `${county} County`, coverageScope: "county behavioral-health access", resourceType: kind === "crisis" ? "county behavioral-health crisis contact" : "county community mental-health program",
  locationLine: `${city} · ${county} County · call to confirm hours and access`,
  description: kind === "crisis"
    ? `Oregon's county resource page publishes ${crisisPhone} as the crisis contact associated with ${provider} for ${county} County. Contact details and response arrangements can change; if this number is unavailable, call or text 988. For immediate danger, call 911. Confirm the correct service area and local response before traveling.`
    : `Oregon lists ${provider} as a Community Mental Health Program contact for ${county} County and publishes ${phone} for general access. Contact the program to connect with local mental-health, substance-use, and related community supports, and ask about age range, insurance, referral steps, and availability. County service area is not a guarantee of a same-day appointment. Published crisis contact: ${crisisPhone}.`,
});
export const OREGON_TREATMENT = orRows.map((row) => orContact(...row, "treatment"));
export const OREGON_URGENT = orRows.filter(([, , , crisis]) => !crisis.startsWith("911")).map((row) => orContact(...row, "crisis"));

const riSource = "https://bhddh.ri.gov/mental-health/licensed-treatment-providers";
const riCatchments = [
  ["community-care", "Community Care Alliance", "Woonsocket", "401-235-7000", "Burrillville, Cumberland, Lincoln, North Smithfield, and Woonsocket"],
  ["east-bay", "East Bay Community Action Program", "East Providence", "401-437-1008", "East Providence, Barrington, Warren, and Bristol"],
  ["elwyn", "Elwyn", "Cranston", "401-333-3980", "Statewide"],
  ["gateway-north", "Gateway Healthcare", "Johnston", "401-273-8100", "Cranston, Foster, Glocester, Johnston, North Providence, Scituate, and Smithfield"],
  ["gateway-south", "Gateway Healthcare", "Charlestown", "401-364-7705", "Block Island, Charlestown, Exeter, Hopkinton, Narragansett, North Kingstown, South Kingstown, Richmond, and Westerly"],
  ["gateway-blackstone", "Gateway Healthcare", "Pawtucket", "401-722-3560", "Pawtucket and Central Falls"],
  ["newport", "Newport Mental Health", "Middletown", "401-846-1213", "Jamestown, Little Compton, Middletown, Newport, Portsmouth, and Tiverton"],
  ["providence", "The Providence Center", "Providence", "401-276-4020", "Providence"],
  ["thrive", "Thrive Behavioral Health", "Warwick", "401-732-5656", "Coventry, East Greenwich, West Greenwich, Warwick, and West Warwick"],
];
export const RHODE_ISLAND_TREATMENT = riCatchments.map(([id, provider, city, phone, serviceArea]) => reviewed({
  id: `ri-treatment-${id}`, name: `${provider} — community mental-health and recovery access`, state: "RI", city, phone,
  link: riSource, source: "Rhode Island BHDDH Community Mental Health Centers directory", serviceArea, coverageScope: serviceArea === "Statewide" ? "statewide" : "multi-city regional provider",
  resourceType: "licensed community mental-health center", locationLine: `${city} · serves ${serviceArea} · contact for intake options`,
  description: `Rhode Island BHDDH lists ${provider} as a licensed community mental-health provider for ${serviceArea}. Published contact: ${phone}. Residents may contact a community mental-health center to ask about mental-health services and local recovery support. Confirm intake, age range, insurance or payment, accessibility, and current appointments directly. The service-area listing does not confirm that a walk-in visit is available.`,
}));
export const RHODE_ISLAND_PEER = [
  ["parent-support-network", "Parent Support Network of Rhode Island", "401-467-6855", "https://psnri.org/", "Family and peer support for youth and adults experiencing behavioral-health challenges; call for current groups, formats, and referral options."],
  ["ripin", "Rhode Island Parent Information Network", "800-464-3399", "https://ripin.org/", "Information, training, family support, and advocacy for person- and family-centered health and education services."],
  ["samaritans", "Samaritans of Rhode Island", "401-272-4044", "https://samaritansri.org/", "Emotional support and suicide-prevention listening service; call to confirm current hours and access."],
].map(([id, name, phone, link, description]) => reviewed({
  id: `ri-peer-${id}`, name: `${name} — peer, family, and community support`, state: "RI", city: "Statewide", phone, link, source: riSource,
  serviceArea: "Statewide, Rhode Island", coverageScope: "statewide", resourceType: "peer and family support", locationLine: "Rhode Island statewide · contact provider to confirm current format",
  description: `Rhode Island BHDDH lists ${name} as a community support resource. ${description} Ask about language access, cost, age range, and whether support is available by phone or in person.`,
}));
export const RHODE_ISLAND_FOOD = [reviewed({
  id: "ri-food-bank-food-finder", name: "Rhode Island Community Food Bank — pantry and meal-site finder", state: "RI", city: "Providence", phone: "401-942-6325",
  link: "https://rifoodbank.org/find-food/", source: "Rhode Island BHDDH and Community Food Bank local food-access directory", serviceArea: "Statewide, Rhode Island", coverageScope: "statewide", resourceType: "food pantry and meal-site directory",
  locationLine: "Statewide · search local pantry and meal sites · confirm hours before travel",
  description: "Rhode Island BHDDH directs residents to the Community Food Bank's statewide member-agency directory for food pantries and meal sites. Use the finder to locate a nearby provider or call 401-942-6325 for guidance. Call the selected site to confirm hours, service area, eligibility, and current food availability before traveling.",
})];

const riAccessPoints = [
  ["community-care", "Community Care Alliance Regional Access Point", "Woonsocket", "245 Main Street, Woonsocket, RI", "401-445-4237", "Monday–Friday, 9 a.m.–3 p.m.", "Housing problem solving and assessment; mental-health, substance-use, healthcare and street-outreach referrals; documents, transportation and family support"],
  ["crossroads", "Crossroads Regional Access Point", "Providence", "160 Broad Street, Providence, RI", "401-865-6215", "Monday–Friday, 8:30 a.m.–4:30 p.m.", "Housing problem solving and assessment; mental-health, substance-use, healthcare and street-outreach referrals; documents, transportation, education, employment, SOAR and SNAP referrals"],
  ["newport", "Newport Mental Health Regional Access Point", "Middletown", "42 Valley Road, Middletown, RI", "401-846-1213 ext. 9105", "Monday and Friday, 8 a.m.–4:30 p.m.; Tuesday and Thursday, 8 a.m.–7 p.m.", "Housing problem solving and assessment; referrals for mental health, substance use, healthcare and street outreach; connection to outreach and emergency services"],
  ["opendoors-pawtucket", "OpenDoors Pawtucket Regional Access Point", "Pawtucket", "1139 Main Street, Pawtucket, RI", "401-214-5542", "Monday–Friday, 9 a.m.–3 p.m.", "Housing assessment and referrals for mental health, substance use, healthcare, and street outreach; documentation services"],
  ["shower-to-empower", "Shower to Empower Regional Access Point", "Mobile, Providence / Pawtucket / Woonsocket / West Warwick", "Multiple scheduled community locations; check state page before visiting", "", "Monday, Tuesday, and Friday, 8:30–11 a.m.; Wednesday and Thursday, 9 a.m.–noon", "Mobile housing problem-solving and assessments; referrals for mental health, substance use, healthcare and documentation; check the state page or email the listed contact to confirm the day’s site"],
  ["warm-center", "WARM Center Regional Access Point", "Westerly", "16 High Street, Westerly, RI", "401-596-9276", "Monday–Friday, 7 a.m.–10 p.m.", "Housing problem solving and assessment; referrals for mental health, substance use, healthcare and street outreach; documentation and transportation support"],
  ["sojourner", "Sojourner House Victim Service Provider Regional Access Point", "Providence", "1570 Westminster Street, Providence, RI", "401-765-3232", "Monday–Friday, 9 a.m.–5 p.m.", "Housing problem solving and assessment; referrals for mental health, substance use and street outreach; services for survivors of domestic violence, sexual assault, and trafficking; SOAR and workforce support"],
];
export const RHODE_ISLAND_HOUSING = riAccessPoints.map(([id, name, city, address, phone, hours, services]) => reviewed({
  id: `ri-housing-access-${id}`, name: `${name} — housing navigation and homelessness prevention`, state: "RI", city, address, phone,
  link: "https://housing.ri.gov/resources/individuals-experiencing-homelessness", source: "Rhode Island Executive Office of Housing, Regional Access Points (page updated October 15, 2026)",
  serviceArea: "Rhode Island homelessness response system", coverageScope: "regional access point", resourceType: "regional homelessness access and housing navigation",
  locationLine: `${address} · ${hours} · call before visiting to confirm access`,
  description: `Rhode Island EOH lists ${name} at ${address}, phone ${phone}. Published hours: ${hours}. Services include ${services.toLowerCase()}. The state says Regional Access Points can connect people to housing-related supports across Rhode Island; service offerings differ by site. Call ahead for current intake, walk-in availability, and access instructions. If reaching a location is difficult, call a Regional Access Point for phone-based connection and ask about street outreach.`,
}));

const riProvidencePantries = [
  ["your-neighborhood", "Your Neighborhood Food Pantry", "533 Branch Avenue", "Tuesday 11 a.m.–1 p.m.; Thursday 4–7 p.m.; Saturday 11 a.m.–1 p.m.", "Serves ZIP codes 02903, 02904, and 02908; weekly visits; accessible; Spanish spoken"],
  ["womens-refugee-care", "Women's Refugee Care", "570 Broad Street", "Saturday 10 a.m.–2 p.m.", "Fish and produce; serves 02907 and refugees from the Great Lakes region of Africa; Swahili, Kirundi, Kinyarwanda, Lingala, and French spoken; use rear parking-lot entrance on Howard Avenue"],
  ["west-end", "West End Community Center Pantry", "109 Bucklin Street", "Monday–Wednesday and Friday 9 a.m.–3 p.m.; last Thursday 9 a.m.–3 p.m.", "Monthly visits; accessible entrance; Spanish spoken"],
  ["washington-park", "Washington Park Community Center Pantry", "42 Jillson Street", "Monday–Thursday 10 a.m.–1 p.m.", "Washington Park neighborhood; monthly visits; accessible; Spanish interpreters available"],
  ["st-thomas", "St. Thomas Church Food Pantry", "65 Fruit Hill Avenue", "Tuesday 9–11:30 a.m.", "Monthly visits; enter on the left side of the rectory"],
  ["st-peter-andrew", "St. Peter & St. Andrew Food Pantry", "70 Pemberton Street", "Saturday 10–11:30 a.m.", "Up to twice monthly; accessible front ramp; Spanish spoken"],
  ["mary-house", "St. Patrick Church Mary House Food Pantry", "244 Smith Street", "Tuesday 4–6 p.m. and Thursday 9–11 a.m. during the second and third weeks of the month", "Smith Hill area; monthly visits; accessible; Spanish-speaking volunteers"],
  ["martin-de-porres", "St. Martin de Porres Senior Center Food Pantry", "160 Cranston Street", "Friday 9 a.m.–noon", "Providence residents and senior-center members; weekly; accessible"],
  ["st-edward", "St. Edward Food & Wellness Center", "1001 Branch Avenue", "Wednesday 10 a.m.–noon and 5–6 p.m.", "Providence North End ZIP codes 02904 and 02908; weekly; Spanish-speaking volunteers"],
  ["st-charles", "St. Charles of Borromeo Pantry", "178 Dexter Street", "Tuesday 10 a.m.–noon", "Serves ZIP codes 02907 and 02909; weekly; accessible; English and Spanish"],
  ["st-anthony", "St. Anthony Mission Church Pantry of Assumption BVM", "549 Plainfield Street", "Tuesday, Wednesday, and Friday 10–11 a.m.", "Annex and Silver Lake areas, ZIP 02909; monthly; Spanish spoken"],
  ["st-raymond", "Society of St. Vincent de Paul — St. Raymond", "1240 North Main Street", "Saturday 9–11 a.m.", "Serves ZIP codes 02904, 02906, and 02860; weekly; Portuguese and Spanish translators on first and third Saturdays"],
  ["silver-lake", "Silver Lake Community Center Pantry", "529 Plainfield Street", "Monday–Thursday 9 a.m.–noon", "Silver Lake residents; monthly; accessible; Spanish spoken"],
  ["scalabrini", "Scalabrini Dukcevich Center", "300 Laurel Hill Avenue", "Wednesday 4–6 p.m.", "Serves ZIP codes 02903, 02907, 02909, 02910, and 02920; weekly; Spanish, Portuguese, Italian, and French; accessible"],
  ["salvation-army", "Salvation Army Providence Corps Food Pantry", "386 Broad Street", "Wednesday 9–11:30 a.m.; new guests Thursday 9 a.m.–noon", "Providence, Johnston, and Cranston residents; monthly; accessible; Spanish spoken"],
  ["olneyville", "Olneyville Food Center", "261 Manton Avenue", "Tuesday and Thursday 9 a.m.–2 p.m.; Wednesday 9 a.m.–1 p.m.; Friday 9 a.m.–noon", "Providence ZIP codes 02908 and 02909; twice monthly; accessible; Spanish spoken"],
  ["refugee-dream", "Refugee Dream Center Food Pantry", "747 Broad Street", "Wednesday 1–4 p.m.", "Primarily serves immigrants and refugees; confirm current intake before travel"],
  ["spanish-sda", "Providence Spanish SDA Pantry", "131 Elmwood Avenue", "Second and fourth Thursday 2:30–5:30 p.m.", "Accessible; Spanish spoken"],
  ["project-outreach", "Project Outreach Food Pantry", "1520 Broad Street", "Wednesday and Thursday 8–11 a.m.", "Serves ZIP codes 02905 and 02907; weekly; Spanish spoken; short prayer is optional"],
  ["our-lady-rosary", "Our Lady of the Rosary Pantry", "17 Traverse Street", "Last Wednesday 6–8 p.m. and last Saturday 9–11 a.m.; closed holidays", "Providence residents; monthly; Saturday includes registered TEFAP distribution; Portuguese spoken"],
  ["meals-on-wheels", "Meals on Wheels of Rhode Island Food Pantry", "70 Bath Street", "Tuesday 10 a.m.–2 p.m. or by appointment", "Rhode Island residents age 60 and older; home-delivered meals also available; Spanish, Kurdish, and Polish; accessible"],
  ["mcauley-house", "McAuley House Food Pantry", "622 Elmwood Avenue", "Monday and Wednesday 11 a.m.–1 p.m.", "McAuley Village residents and registered McAuley House guests; registration required; Spanish, Creole, French, and Portuguese; accessible"],
  ["maranatha", "Maranatha Food Pantry of Church of God", "1040 Atwells Avenue", "Friday 9 a.m.–noon", "Residents of ZIP codes 02908 and 02909; weekly; accessible front ramp"],
  ["love-divine", "Love Divine Pantry", "28 Candace Street", "Third Saturday noon–2 p.m.; emergency delivery may be available in Smith Hill", "Call the organization to ask about delivery and current access"],
  ["lighthouse-cdc", "Lighthouse Community Development Corporation Pantry", "11 Hawthorne Street", "Second and fourth Saturday 9 a.m.–noon", "Serves all Rhode Island residents; twice monthly; accessible; French and Spanish"],
  ["chester-kosher", "JCS-Louis and Goldie Chester Kosher Pantry", "1165 North Main Street", "By appointment; first and third Wednesday, Thursday, and Friday of each month", "Kosher and Halal food; emergency food bags by appointment; up to twice monthly; accessible"],
  ["interfaith-food", "Interfaith Food Ministry", "95 Hathaway Center #61", "Saturday; call to confirm current schedule", "ZIP 02910 and South Elmwood residents; monthly; Spanish interpreters available"],
  ["higher-ground", "Higher Ground International Food Pantry", "21 Peace Street", "Third Thursday 9 a.m.–2 p.m.", "West African community focus; all are welcome; monthly; accessible; Spanish spoken"],
  ["gateway-capital-city", "Gateway Healthcare Capital City Community Center Pantry", "285A Chad Brown Street", "Monday 9 a.m.–1:30 p.m.; Wednesday 9:30 a.m.–12:30 p.m.", "Providence ZIP codes 02904 and 02908; monthly groceries and weekly Wednesday produce; bring reusable bags; accessible; Spanish spoken"],
  ["federal-hill", "Federal Hill House Pantry", "35 Swiss Street", "Tuesday–Friday 9 a.m.–1 p.m.", "Providence ZIP codes 02903, 02905, 02907, 02908, and 02909; twice monthly; accessible ramp"],
  ["first-unitarian", "Community Food Share — First Unitarian Church", "1 Benevolent Street", "Third Monday 2:30–5 p.m.", "All Rhode Island cities and towns welcome; accessible; Spanish-speaking volunteers"],
  ["community-action", "Community Action Partnership of Providence Pantry", "550 Hartford Avenue", "By appointment Wednesday or Thursday", "Providence residents; up to twice monthly; accessible; Spanish and French Creole interpreters"],
  ["camp-street", "Camp Street Ministries Food Distribution", "190 1/2 Camp Street", "Wednesday 11 a.m.–2 p.m. and Friday noon–2 p.m.", "Weekly curbside food distribution"],
  ["better-lives", "Better Lives RI Food Cupboard", "12 Abbott Park Place", "Monday 3–6 p.m.; Tuesday and Wednesday 9 a.m.–1 p.m.", "Providence residents; twice monthly; R-Line stop one block away; accessible parking details on city listing; Spanish spoken"],
  ["assembly-shalom", "Assembly Pentecostal Church of God Shalom Pantry", "145 Chad Brown Street", "Saturday 11 a.m.–12:30 p.m.", "Weekly; accessible; Spanish spoken"],
];
export const RHODE_ISLAND_LOCAL_FOOD = riProvidencePantries.map(([id, name, address, hours, accessNotes]) => reviewed({
  id: `ri-food-providence-${id}`, name: `${name} — Providence food pantry`, state: "RI", city: "Providence", address: `${address}, Providence, RI`,
  link: "https://www.providenceri.gov/food-pantries/", source: "City of Providence Food Pantries directory (current public listing)",
  serviceArea: "Providence and the neighborhood or ZIP-code limits described by the city", coverageScope: "local food pantry",
  resourceType: "food pantry and grocery support", locationLine: `${address} · ${hours}`,
  description: `The City of Providence lists ${name} at ${address}. Published hours: ${hours}. Access details: ${accessNotes}. Pantry schedules and eligibility can change; confirm directly with the pantry or use the city’s linked live spreadsheet before traveling. No phone number is published in the city listing text for this provider.`,
}));
export const RHODE_ISLAND_URGENT = [reviewed({
  id: "ri-bh-link-988", name: "BH Link — Rhode Island 24/7 behavioral-health crisis support", state: "RI", city: "Statewide", phone: "988", link: "https://bhddh.ri.gov/mental-health/licensed-treatment-providers", source: "Rhode Island BHDDH, Community Mental Health Centers and crisis information", serviceArea: "Statewide, Rhode Island", coverageScope: "statewide", resourceType: "24/7 call, text, and crisis connection", locationLine: "Call or text 988 · statewide confidential support and connection to care",
  description: "Rhode Island BHDDH identifies BH Link through 988 for confidential crisis support and connection to care. People under 18 can call 855-KIDLINK. Call or text 988 to reach trained crisis counselors; for immediate danger, call 911.",
})];

// Additional city and county contacts for the active five-state directory
// batch. Locations and program scopes come from the source named on each row;
// verify current intake, access, and capacity with the organization.
const NJ_DMHA = "https://www.nj.gov/humanservices/dmhas/documents/pdf/MH_Dir_COMPLETE.pdf";
const njBehavioralRows = [
  ["atlantic-outpatient", "Atlanticare Behavioral Health", "Atlantic City", "Atlantic", "13 North Hartford Avenue, Atlantic City, NJ 08401", "609-348-1116", "Outpatient mental-health services"],
  ["atlantic-absecon", "Center for Family Services", "Absecon", "Atlantic", "312 East White Horse Pike, Absecon Highlands, NJ 08201", "609-652-1600", "Outpatient mental-health services"],
  ["bergen-newbridge", "Care Plus NJ", "Paramus", "Bergen", "610 Valley Health Plaza, Paramus, NJ 07652", "201-265-8200", "Community behavioral-health clinic and outpatient services"],
  ["bergen-westbergen", "West Bergen Mental Healthcare", "Ridgewood", "Bergen", "120 Chestnut Street, Ridgewood, NJ 07450", "201-444-3550", "Outpatient and community mental-health services"],
  ["bergen-vantage-englewood", "Vantage Health System", "Englewood", "Bergen", "93 West Palisade Avenue, Englewood, NJ 07631", "201-567-0059", "Outpatient mental-health services"],
  ["bergen-cbh-hackensack", "CBH Care", "Hackensack", "Bergen", "25 East Salem Street, 2nd Floor, Hackensack, NJ 07601", "201-935-3322", "Outpatient and community mental-health services"],
  ["cape-acenda", "Acenda Integrated Health", "Cape May Court House", "Cape May", "128 Crest Haven Road, Cape May Court House, NJ 08210", "609-465-4100", "Outpatient, intensive outpatient, and community mental-health services"],
  ["cape-learning-center", "Learning Recovery Center", "Rio Grande", "Cape May", "1304 Route 47 South, Units AH & AJ, Rio Grande, NJ 08242", "609-600-3502", "Community wellness and recovery support"],
  ["cumberland-guidance", "Cumberland County Guidance Center", "Vineland", "Cumberland", "814 Elmer Street, Vineland, NJ 08360", "856-825-6810", "County community mental-health services"],
  ["newark-beth-israel", "Newark Beth Israel Medical Center Behavioral Health", "Newark", "Essex", "210 Lyons Avenue, Newark, NJ 07112", "973-926-7026", "Outpatient behavioral-health services"],
  ["essex-clara-maass", "Clara Maass Medical Center Behavioral Health", "Belleville", "Essex", "1 Clara Maass Drive, Belleville, NJ 07109", "973-844-4357", "Behavioral-health emergency screening and assessment"],
  ["hudson-jcmc", "Jersey City Medical Center Behavioral Health", "Jersey City", "Hudson", "355 Grand Street, Jersey City, NJ 07302", "201-915-2210", "Behavioral-health emergency assessment and referral"],
  ["hunterdon-behavioral", "Hunterdon Behavioral Health Emergency Services", "Flemington", "Hunterdon", "2100 Wescott Drive, Flemington, NJ 08822", "908-788-6400", "Behavioral-health emergency assessment and referral"],
  ["camden-oaks", "Oaks Integrated Care", "Cherry Hill", "Camden", "2201 West Chapel Avenue, Cherry Hill, NJ 08002", "856-428-4357", "Behavioral-health emergency screening and community services"],
  ["burlington-legacy", "Legacy Treatment Services", "Hainesport", "Burlington", "1289 Route 38 West, Hainesport, NJ 08046", "609-835-6180", "Behavioral-health emergency screening and community services"],
  ["passaic-stmarys", "St. Mary's General Hospital Behavioral Health", "Passaic", "Passaic", "211 Pennington Avenue, Passaic, NJ 07055", "973-470-3086", "Short-term behavioral-health care"],
  ["essex-rutgers", "Rutgers University Behavioral Health Care", "Newark", "Essex", "150 Bergen Street, Newark, NJ 07101", "973-623-2323", "Psychiatric emergency screening and behavioral-health assessment"],
  ["essex-nbi", "Newark Beth Israel Medical Center Psychiatric Screening", "Newark", "Essex", "201 Lyons Avenue, Newark, NJ 07112", "973-926-7444", "Psychiatric emergency screening and referral"],
];
export const NEW_JERSEY_TREATMENT = njBehavioralRows.map(([id, name, city, county, address, phone, scope]) => reviewed({
  id: `nj-treatment-${id}`, name: `${name} — ${scope.toLowerCase()}`, state: "NJ", city, county: `${county} County`, address, phone,
  link: NJ_DMHA, source: "New Jersey DMHAS Directory of Mental Health Services (updated October 2026)", serviceArea: `${county} County`, coverageScope: "county behavioral-health program",
  resourceType: scope, locationLine: `${city} · ${address} · call before visiting for intake and current services`,
  description: `New Jersey DMHAS lists ${name} at ${address} for ${scope.toLowerCase()} in ${county} County. Published contact: ${phone}. Ask about intake, age range, insurance or payment, referral requirements, accessibility, and current availability. Emergency screening services assess and refer; they do not guarantee admission or a particular treatment.`,
}));

const njPeerRows = [
  ["capital", "Capital Recovery Center", "Bridgeton", "Cumberland", "72 North Pearl Street, Bridgeton, NJ 08302", "856-391-7449"],
  ["cape-regional", "Cape Regional Recovery Center", "Rio Grande", "Cape May", "1304 Route 47, Unit WL, Rio Grande, NJ 08242", "609-435-6272"],
  ["living-proof-sewell", "Living Proof Recovery Center at RCSJ", "Sewell", "Gloucester", "1492 Tanyard Road, Sewell, NJ 08080", "856-394-3386"],
  ["living-proof-camden", "Living Proof Recovery Center", "Camden", "Camden", "500 Pine Street, Camden, NJ 08104", "609-435-6272"],
  ["living-proof-salem", "Living Proof Recovery Center of Salem County", "Mannington", "Salem", "5 Route 45, Mannington, NJ 08079", "609-682-1204"],
  ["mercer", "Mercer Community Peer Recovery Center", "Hamilton", "Mercer", "3525 Quakerbridge Road, Suite 903, Hamilton, NJ 08619", "609-582-1489"],
  ["community-in-crisis", "Community in Connection Peer Recovery Services", "Bernardsville", "Somerset", "9 Church Street, Bernardsville, NJ 07924", "973-434-0911"],
  ["warren", "Living Proof Recovery Center of Warren County", "Phillipsburg", "Warren", "370 Memorial Parkway, First Floor, Suite 4, Phillipsburg, NJ 08865", "908-454-4470"],
  ["hope-sheds-light", "Hope Recovery Center", "Toms River", "Ocean", "253 Chestnut Street, Toms River, NJ 08753", "732-244-0783"],
  ["burlington-resource", "Burlington Recovery Resource Center", "Westampton", "Burlington", "795 Woodlane Road, Third Floor, Westampton, NJ 08060", "609-726-7087"],
  ["burlington-cprc", "Burlington Community Peer Recovery Center", "Burlington", "Burlington", "525 High Street, Burlington, NJ 08016", "609-265-5383"],
  ["all-roads-atlantic", "All Roads Recovery Center", "Atlantic City", "Atlantic", "1931 Bacharach Boulevard, Atlantic City, NJ 08401", "609-345-2020"],
  ["all-roads-pleasantville", "All Roads Recovery Center", "Pleasantville", "Atlantic", "610 Blackhorse Pike, Suite F15B, Pleasantville, NJ 08232", "609-345-2020"],
  ["living-proof-voorhees", "Living Proof Recovery Center", "Voorhees", "Camden", "108 Somerdale Road, Voorhees, NJ 08043", "856-216-7134"],
  ["cares-dover", "CARES Recovery Center", "Dover", "Morris", "60 North Sussex Street, Dover, NJ 07801", "973-625-1143"],
  ["newbridge", "Recovery Center at Bergen New Bridge Medical Center", "Paramus", "Bergen", "230 East Ridgewood Avenue, Paramus, NJ 07652", "201-967-4000 ext. 22453"],
  ["rise-up", "Rise UP Community Peer Recovery Center", "Roselle", "Union", "121–125 Chestnut Street, Roselle, NJ 07203", "908-454-4470 ext. 306"],
  ["recovery-junction", "Recovery Junction Recovery Center", "Jersey City", "Hudson", "35 Journal Square Plaza, Suite 500, Jersey City, NJ 07306", "551-220-1150"],
  ["hunterdon-open-door", "Open Door Recovery Center of Hunterdon County", "Flemington", "Hunterdon", "5 East Main Street, Flemington, NJ 08822", "908-520-6812"],
  ["middlesex", "Middlesex Community Peer Recovery Center", "New Brunswick", "Middlesex", "97–99 Bayard Street, Suite 201, New Brunswick, NJ 08901", "732-381-4100"],
  ["monmouth-open-door", "Open Door Recovery Center of Monmouth County", "Asbury Park", "Monmouth", "1004 Comstock Street, First Floor, Asbury Park, NJ 07712", "908-315-3221"],
  ["sussex", "Sussex County Recovery Community Center", "Newton", "Sussex", "65 Newton Sparta Road, Newton, NJ 07860", "973-940-2966"],
  ["evas-village", "Recovery Center at Eva's Village", "Paterson", "Passaic", "16 Spring Street, Paterson, NJ 07501", "973-381-0425"],
];
export const NEW_JERSEY_PEER = njPeerRows.map(([id, name, city, county, address, phone]) => reviewed({
  id: `nj-peer-${id}`, name: `${name} — community peer recovery support`, state: "NJ", city, county: `${county} County`, address, phone,
  link: "https://www.nj.gov/humanservices/reachnj/help/centers/", source: "New Jersey Human Services ReachNJ Community Peer Recovery Centers directory",
  serviceArea: `${county} County and participating neighboring counties`, coverageScope: "community peer recovery center", resourceType: "peer recovery center",
  locationLine: `${address} · contact for current opening times and groups`,
  description: `New Jersey Human Services lists ${name} at ${address} as a Community Peer Recovery Center. The state describes these centers as community peer supports that may offer recovery coaching, support groups, community activities, naloxone education, and connections to treatment and other services. Call to confirm current hours, age range, walk-in access, and services; peer support is not clinical treatment or emergency response.`,
}));

const njFoodRows = [
  ["cfbnj-north", "Community FoodBank of New Jersey", "Hillside", "North and central counties: Bergen, Essex, Hudson, Middlesex, Morris, Passaic, Somerset, and Union", "908-355-3663", "https://cfbnj.org/find-foods-services/"],
  ["cfbnj-south", "Community FoodBank of New Jersey Southern Branch", "Egg Harbor Township", "Atlantic, Cape May, and Cumberland counties", "609-383-8843", "https://cfbnj.org/find-foods-services/"],
  ["food-bank-south-jersey", "Food Bank of South Jersey", "Pennsauken", "Burlington, Camden, Gloucester, and Salem counties", "856-662-4884", "https://foodbanksj.org/"],
  ["mercer-street-friends", "Mercer Street Friends Food Bank", "Trenton", "Mercer County", "609-406-0503", "https://www.mercerstreetfriends.org/"],
  ["fulfill", "Fulfill Food Bank", "Neptune", "Monmouth and Ocean counties", "732-918-2600", "https://fulfillnj.org/"],
  ["norwescap", "NORWESCAP Food Bank", "Phillipsburg", "Hunterdon, Sussex, and Warren counties", "908-454-4322", "https://www.norwescap.org/"],
];
export const NEW_JERSEY_FOOD = njFoodRows.map(([id, name, city, serviceArea, phone, link]) => reviewed({
  id: `nj-food-${id}`, name: `${name} — regional food assistance network`, state: "NJ", city, phone, link,
  source: "New Jersey Human Services 2026–2027 resource guide, Emergency Food Assistance Program food-bank network", serviceArea, coverageScope: "regional food-bank network", resourceType: "regional food bank and pantry locator",
  locationLine: `${city} · serves ${serviceArea} · call or use its locator to find a nearby pantry`,
  description: `New Jersey Human Services identifies ${name} as an Emergency Food Assistance Program regional food organization serving ${serviceArea}. Published contact: ${phone}. Food banks coordinate with community pantries, meal sites, and shelters; this is a regional contact, not a guarantee of walk-in food at the listed office. Use the organization's locator or call to find a local site and confirm hours, eligibility, appointment requirements, and current availability.`,
}));
const njScreeningRows = [
  ["atlantic", "Atlanticare Regional Medical Center Psychiatric Intervention Program", "Atlantic City", "Atlantic", "1925 Pacific Avenue, Atlantic City, NJ 08401", "609-344-1118"],
  ["bergen", "Care Plus NJ at Bergen New Bridge Medical Center", "Paramus", "Bergen", "230 East Ridgewood Avenue, Paramus, NJ 07652", "201-262-4357"],
  ["camden", "Oaks Integrated Care Psychiatric Screening", "Cherry Hill", "Camden", "2201 West Chapel Avenue, Cherry Hill, NJ 08002", "856-428-4357"],
  ["burlington", "Legacy Treatment Services Psychiatric Screening", "Hainesport", "Burlington", "1289 Route 38 West, Hainesport, NJ 08046", "609-835-6180"],
  ["cape-may", "Acenda Integrated Health Psychiatric Screening", "Cape May Court House", "Cape May", "2 Stone Harbor Boulevard, Cape May Court House, NJ 08210", "609-465-5999"],
  ["cumberland", "Cumberland County Guidance Center Psychiatric Screening", "Bridgeton", "Cumberland", "425 Bank Street, Bridgeton, NJ 08302", "856-455-5555"],
  ["essex-clara-maass", "Clara Maass Medical Center Psychiatric Screening", "Belleville", "Essex", "1 Clara Maass Drive, Belleville, NJ 07109", "973-844-4357"],
  ["hudson", "Jersey City Medical Center Psychiatric Screening", "Jersey City", "Hudson", "355 Grand Street, Jersey City, NJ 07302", "201-915-2210"],
  ["hunterdon", "Hunterdon Medical Center Behavioral Health Emergency Services", "Flemington", "Hunterdon", "2100 Wescott Drive, Flemington, NJ 08822", "908-788-6400"],
];
export const NEW_JERSEY_URGENT = njScreeningRows.map(([id, name, city, county, address, phone]) => reviewed({
  id: `nj-urgent-${id}`, name, state: "NJ", city, county: `${county} County`, address, phone, link: NJ_DMHA,
  source: "New Jersey DMHAS Directory of Mental Health Services, Designated Screening Centers (updated October 2026)",
  serviceArea: `${county} County screening area`, coverageScope: "county psychiatric screening center", resourceType: "psychiatric emergency assessment and referral",
  locationLine: `${address} · call the published hotline for county-specific access instructions`,
  description: `New Jersey DMHAS designates ${name} as the psychiatric screening contact for ${county} County and publishes ${phone}. The center evaluates and refers people under the state's psychiatric screening system; it is not a general walk-in clinic and does not guarantee admission. Call first for county eligibility, transport, and current procedure. For immediate danger, call 911.`,
}));

const nmBHSource = "https://www.lascumbres-nm.org/behavioral-health-providers";
const nmBHRows = [
  ["el-centro-espanola", "El Centro Family Health Services", "Española", "Rio Arriba", "505-753-7218", "https://ecfh.org/", "Behavioral-health services for children and adults; listed ages 3+"],
  ["espanola-family-wellness", "Española Family Wellness Center", "Española", "Rio Arriba", "505-443-2800", "https://www.pmsnm.org/", "Behavioral-health services; listed ages 3+"],
  ["las-clinicas-ojo", "Las Clinicas del Norte", "Ojo Caliente", "Rio Arriba", "505-384-2777", "https://lcdn.org/", "Behavioral-health services; listed ages 6+"],
  ["las-clinicas-pojoaque", "Las Clinicas del Norte", "Pojoaque", "Santa Fe", "505-384-2777", "https://lcdn.org/", "Behavioral-health services; listed ages 6+"],
  ["mesa-vista-santa-fe", "Mesa Vista Wellness", "Santa Fe", "Santa Fe", "505-983-8225", "https://mesavistawellness.com/", "Behavioral-health services; listed ages 3+"],
  ["serna-albuquerque", "Serna Solutions", "Albuquerque", "Bernalillo", "505-207-8929", "https://sernasolutionsllc.com/", "Behavioral-health services; age range varies by location"],
  ["christus-santa-fe", "Christus St. Vincent Behavioral Health", "Santa Fe", "Santa Fe", "505-913-3056", "https://christushealth.org/locations/st-vincent-behavioral-health-specialist", "Adult behavioral-health services"],
  ["new-mexico-solutions-sf", "New Mexico Solutions", "Santa Fe", "Santa Fe", "877-499-1354", "https://treatmentsolutions.org/", "Behavioral-health services for adults"],
  ["new-mexico-solutions-abq", "New Mexico Solutions", "Albuquerque", "Bernalillo", "877-499-1354", "https://treatmentsolutions.org/", "Behavioral-health services for adults"],
  ["southwest-family-abq", "Southwest Family Guidance Center", "Albuquerque", "Bernalillo", "505-310-4764", "https://swfamily.com/", "Behavioral-health services for children and families"],
  ["small-steps-abq", "Small Steps Counseling", "Albuquerque", "Bernalillo", "505-933-4639", "https://smallstepschildcounseling.com/", "Child and adolescent counseling; listed ages 0–18"],
  ["sky-center-sf", "SKY Center", "Santa Fe", "Santa Fe", "505-473-6191", "https://skycenter.nmsip.org/", "Family therapy; listed ages 5+"],
  ["grief-center", "The Grief Center", "Albuquerque", "Bernalillo", "505-323-0478", "https://www.griefnm.org/", "Grief counseling and support groups for adults and children"],
  ["team-builders-taos", "TeamBuilders Behavioral Health", "Taos", "Taos", "505-216-2727", "https://teambuilders.org/", "Community behavioral-health services; listed ages 5+"],
  ["taos-behavioral", "Taos Behavioral Health", "Taos", "Taos", "575-758-4297", "https://taosbehavioralhealth.org/", "Behavioral-health services; listed ages 5+"],
  ["pinwheel-taos", "Pinwheel Healing Center", "Taos", "Taos", "505-636-6100", "https://pinwheelhealing.com/", "Behavioral-health services; listed ages 14+"],
  ["belong-taos", "Belong Counseling and Consulting", "Taos", "Taos", "575-305-7393", "https://belongcounseling.com/", "Counseling services; contact to confirm current age and insurance options"],
  ["esperanza-estancia", "Esperanza Family Health Center", "Estancia", "Torrance", "505-384-2777", "https://www.pmsnm.org/locations/esperanza-family-health-center", "Behavioral-health services; listed ages 7+"],
  ["life-link-santa-fe", "Life Link", "Santa Fe", "Santa Fe", "505-438-0010", "https://thelifelink.org/", "Behavioral-health and community support services"],
  ["mountain-center-sf", "The Mountain Center", "Santa Fe", "Santa Fe", "505-670-2861", "https://themountaincenter.org/", "Counseling and wellness services; listed ages 11+"],
];
export const NEW_MEXICO_TREATMENT = nmBHRows.map(([id, name, city, county, phone, link, scope]) => reviewed({
  id: `nm-treatment-${id}`, name: `${name} — ${scope.toLowerCase()}`, state: "NM", city, county: `${county} County`, phone, link,
  source: "Las Cumbres Community Services behavioral-health referral directory and provider-published service pages", serviceArea: `${city} and nearby communities`, coverageScope: "local behavioral-health referral provider", resourceType: "behavioral-health counseling and treatment access",
  locationLine: `${city}, ${county} County · contact provider for its exact current clinic address and intake route`,
  description: `Las Cumbres Community Services lists ${name} for ${city} and describes ${scope.toLowerCase()}. Published contact: ${phone}. The referral guide was last reviewed in 2025 and provider availability can change. Call to confirm current location, age range, accepted insurance or fees, referral requirements, and appointment openings before traveling.`,
}));

const nmPeerRows = [
  ["nm-peer-warmline", "New Mexico Peer-to-Peer Warmline", "Statewide", "1-855-466-7100", "https://nmcrisisline.com/", "Daily non-crisis peer support by phone and text; the current provider page posts separate call and text hours."],
  ["nm-peer-nami", "NAMI New Mexico", "Albuquerque and statewide", "505-260-0154", "https://naminewmexico.org/", "Education, support, and recovery resources; ask about local NAMI Connection groups and online options."],
  ["nm-peer-friendship", "Friendship Club peer community", "Santa Fe", "", "https://friendshipclubsantafe.org/", "Peer-led community and wellness activities; contact the organization for its current schedule and access details."],
  ["nm-peer-heights", "Heights Community Center peer-support activities", "Albuquerque", "", "https://heightsclub.com/", "Peer and community activities; call or check the organization site for current programming and entry requirements."],
  ["nm-peer-bernco", "Bernalillo County Recovery Support Center", "Albuquerque", "", "https://www.bernco.gov/community-services/behavioral-health-initiative/", "Community recovery-support and peer meeting access; confirm hours, eligibility, and current location before visiting."],
  ["nm-peer-recovery-communities", "Recovery Communities of New Mexico", "Statewide", "", "https://nmrecovery.org/", "Peer-led recovery community and advocacy connections; contact for current local and online support options."],
  ["nm-peer-peers-helping-peers", "Peers Helping Peers — New Mexico Recovery Coalition", "Southwest New Mexico", "", "https://www.sharenm.org/organization/print/new-mexico-recovery-coalition/peers-helping-peers", "Certified peer workers provide community-based lived-experience support in the Southwest New Mexico service area; request an intake connection."],
  ["nm-peer-cocaine-anonymous", "Cocaine Anonymous New Mexico meetings", "Albuquerque and Santa Fe", "", "https://canminfo.com/", "The fellowship publishes current peer mutual-aid meeting locations and schedules; check the live list before attending."],
];
export const NEW_MEXICO_PEER = nmPeerRows.map(([id, name, city, phone, link, detail]) => reviewed({
  id, name, state: "NM", city, phone: phone || undefined, link, source: "New Mexico Health Care Authority Office of Peer Recovery and Engagement, NM Crisis Line, New Mexico recovery organizations, and published peer-community listings",
  serviceArea: city === "Statewide" ? "Statewide, New Mexico" : city, coverageScope: "peer and community recovery support", resourceType: "peer, family, or mutual-aid community support",
  locationLine: `${city} · contact the organization to confirm current group format, schedule, and location`,
  description: `${detail} Peer and mutual-aid supports complement professional treatment; they are not clinical care or emergency response.`,
}));

const nmCrisisRows = [
  ["nm-crisis-warmline", "New Mexico Peer-to-Peer Warmline", "Statewide", "1-855-466-7100", "https://nmcrisisline.com/", "Non-crisis emotional support from peer specialists by phone; published daily call hours are 3 p.m.–11:30 p.m. Mountain Time."],
  ["nm-crisis-988", "988 New Mexico — call or text crisis support", "Statewide", "988", "https://nmcrisisline.com/", "Free, confidential crisis support by phone or text, 24 hours a day. For immediate physical danger, call 911."],
  ["nm-crisis-unm-ctc", "UNM Health Crisis Triage Center", "Albuquerque", "505-272-7270", "https://unmhealth.org/services/behavioral-health/crisis-triage-center.html", "Voluntary 24/7 stabilization for adults; assessment and admission are coordinated through UNM Psychiatric Emergency Services. Call first to confirm access."],
  ["nm-crisis-dona-ana", "Doña Ana County Crisis Triage Center", "Las Cruces", "575-216-4150", "https://sharenm.org/dona-ana-crisis-triage-center", "Published as 24/7 crisis stabilization for referred guests; call to confirm referral and admission process."],
  ["nm-crisis-solace", "Solace Sexual Assault Services — 24/7 hotline", "Santa Fe and statewide", "505-988-1951", "https://findsolace.org/", "Confidential crisis support for survivors of sexual violence; the local directory also lists 1-800-721-7273 as a toll-free hotline. Call first for safe access and advocate response."],
  ["nm-crisis-domestic-violence", "New Mexico Domestic Violence Hotline", "Statewide", "1-800-473-5220", "https://www.nmcadv.org/", "Confidential safety planning and connection to domestic-violence services; call before traveling to any shelter and follow the advocate's safety instructions."],
  ["nm-crisis-youth", "New Mexico Children, Youth and Families — child safety report line", "Statewide", "1-855-333-7233", "https://www.cyfd.nm.gov/", "Statewide route for reporting suspected child abuse or neglect; this is a protective-services report line rather than a therapy or youth crisis counseling service."],
];
export const NEW_MEXICO_URGENT_LOCAL = nmCrisisRows.map(([id, name, city, phone, link, detail]) => reviewed({
  id, name, state: "NM", city, phone, link, source: "New Mexico Crisis and Access Line; UNM Health Crisis Triage Center; Share New Mexico; Santa Fe County resource directory",
  serviceArea: city === "Statewide" ? "Statewide, New Mexico" : city, coverageScope: "specialized or local urgent support", resourceType: "behavioral-health, survivor, or protective-service urgent contact",
  locationLine: `${city} · call or text as described · confirm eligibility and response scope`,
  description: `${detail} This number serves the specific crisis or protection purpose described; use 988 for behavioral-health crisis support and 911 for immediate danger when emergency response is needed.`,
}));

const riPeerCenterRows = [
  ["anchor-providence", "Anchor Recovery Community Center", "Providence", "310 Reservoir Avenue, Providence, RI", "401-889-5770", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["anchor-warwick", "Anchor Recovery Community Center", "Warwick", "1229 Main Street, West Warwick, RI", "401-889-5770", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["east-bay-warren", "East Bay Recovery Community Center", "Warren", "31 Railroad Avenue, Warren, RI 02885", "401-289-2055", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["east-bay-newport", "East Bay Recovery Community Center", "Newport", "23 Marlborough Street, Newport, RI", "401-302-6231", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["serenity-woonsocket", "Serenity Community Center", "Woonsocket", "66 Social Street, Woonsocket, RI", "401-488-4426", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["oasis-providence", "Oasis Wellness & Recovery Community Center", "Providence", "530 North Main Street, Providence, RI", "401-831-6937", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
  ["teen-anchor", "Jim Gillen Teen Center", "Providence", "1280 North Main Street, Providence, RI", "401-632-4077", "https://recoveryfriendly.ri.gov/recovery-resources/recovery-community-centers"],
];
export const RHODE_ISLAND_PEER_LOCAL = riPeerCenterRows.map(([id, name, city, address, phone, link]) => reviewed({
  id: `ri-peer-center-${id}`, name: `${name} — peer recovery community`, state: "RI", city, address, phone, link,
  source: "Rhode Island Recovery Friendly initiative, Recovery Community Centers directory (state task-force/BHDDH partnership)",
  serviceArea: city === "Woonsocket" ? "Northern Rhode Island" : city === "Warren" || city === "Newport" ? "East Bay and Newport County" : "Rhode Island regional recovery community",
  coverageScope: "community recovery center", resourceType: "peer-led recovery community and support center", locationLine: `${address} · call to confirm current schedule and drop-in access`,
  description: `Rhode Island's Recovery Friendly initiative lists ${name} at ${address}, phone ${phone}. State-published service descriptions include peer connection and recovery activities; offerings and hours differ by center. Contact the center to confirm current groups, age range, walk-in access, and whether any referral is needed. Peer support complements, but does not replace, clinical treatment or crisis response.`,
}));

const riBenefitRows = [
  ["dhs-providence", "Rhode Island DHS Providence Walk-In Office", "Providence", "125 Holden Street, Providence, RI", "State DHS walk-in services; outside drop box is available 24/7; office visits may require an appointment."],
  ["dhs-pawtucket", "Rhode Island DHS Pawtucket Walk-In Office", "Pawtucket", "249 Roosevelt Avenue, Pawtucket, RI", "State DHS document scanning center and walk-in office; confirm service hours and appointment requirements."],
  ["dhs-woonsocket", "Rhode Island DHS Woonsocket Walk-In Office", "Woonsocket", "219 Pond Street, Woonsocket, RI", "State DHS walk-in services; outside drop box is available 24/7; confirm current hours before visiting."],
  ["dhs-south-county", "Rhode Island DHS South County Walk-In Office", "Wakefield", "4808 Tower Hill Road, Suite G1, Wakefield, RI", "Regional DHS walk-in benefits access; confirm office hours and appointment requirements."],
  ["dhs-newport", "Newport Regional Family Center — DHS walk-in services", "Middletown", "31 John Clarke Road, Middletown, RI", "DHS walk-in and document drop-off access; confirm which services are offered at this site before visiting."],
];
export const RHODE_ISLAND_BENEFITS = riBenefitRows.map(([id, name, city, address, detail]) => reviewed({
  id: `ri-benefits-${id}`, name: `${name} — SNAP, medical and cash-benefit access`, state: "RI", city, address, phone: "1-855-697-4347",
  link: "https://dhs.ri.gov/about-us/dhs-offices", source: "Rhode Island DHS office locations and current walk-in service notice",
  serviceArea: city === "Providence" ? "Providence region" : city === "Pawtucket" ? "Blackstone Valley region" : city === "Woonsocket" ? "Northern Rhode Island" : city === "Wakefield" ? "South County" : "Newport County",
  coverageScope: "regional state benefits office", resourceType: "SNAP, Medicaid, and cash-assistance service access", locationLine: `${address} · call DHS before visiting`,
  description: `Rhode Island DHS lists ${name} at ${address}; the statewide DHS customer-service contact is 1-855-697-4347. ${detail} Use the RI DHS portal for applications and document submission where available. Call to confirm the benefit service, hours, required appointment, and documents; this directory cannot determine eligibility or approve benefits.`,
}));

const riCommunityActionRows = [
  ["bvcap-pawtucket", "Blackstone Valley Community Action Program", "Pawtucket", "32 Goff Avenue, Pawtucket, RI 02860", "401-723-4520", "Pawtucket, Central Falls, Lincoln, Cumberland, and Woonsocket", "https://www.bvcap.org/"],
  ["cap-providence", "Community Action Partnership of Providence", "Providence", "518 Hartford Avenue, Providence, RI 02909", "401-273-2000", "Providence", "https://www.cappri.org/"],
  ["ccap-cranston", "Comprehensive Community Action", "Cranston", "311 Doric Avenue, Cranston, RI 02910", "401-467-9610", "Cranston, Foster, Scituate, and Coventry", "https://www.comcap.org/"],
  ["ebcap-newport", "East Bay Community Action Program", "Newport", "19 Broadway, Newport, RI 02840", "401-847-7821", "Newport, Portsmouth, Tiverton, Middletown, Jamestown, and Little Compton", "https://www.ebcap.org/"],
  ["westbay-warwick", "Westbay Community Action", "Warwick", "487 Jefferson Boulevard, Warwick, RI 02886", "401-732-4660", "Coventry, East Greenwich, Warwick, and West Warwick", "https://www.westbaycap.org/"],
];
export const RHODE_ISLAND_BENEFIT_PARTNERS = riCommunityActionRows.map(([id, name, city, address, phone, serviceArea, link]) => reviewed({
  id: `ri-benefit-partner-${id}`, name: `${name} — local household-benefit navigation`, state: "RI", city, address, phone, link,
  source: "Rhode Island Executive Office of Housing local Community Action Program directory and agency contact pages",
  serviceArea, coverageScope: "local community-action benefits access", resourceType: "utility, housing, food, and household-stability assistance navigation",
  locationLine: `${address} · serves ${serviceArea} · call for current intake`,
  description: `Rhode Island's Community Action Program directory identifies ${name} at ${address}, phone ${phone}, serving ${serviceArea}. The agency may help residents navigate programs such as utility assistance, housing stability, emergency food, and other household supports; services and funding vary by household and season. Contact the agency to confirm which programs are open, eligibility, documents, and appointment or walk-in rules. This referral listing does not imply benefit approval or available funds.`,
}));

const riUrgentAdditional = [
  ["bh-link", "BH Link — behavioral-health crisis triage and connection", "Statewide", "988", "https://bhlink.org/", "Call or text 988 for confidential behavioral-health crisis support and connection to BH Link services; call ahead for the local walk-in address and access."],
  ["kidlink", "KID LINK — Rhode Island youth behavioral-health support", "Statewide", "1-855-KID-LINK (543-5465)", "https://bhddh.ri.gov/mental-health", "Youth and caregiver behavioral-health crisis navigation; confirm age scope and response options with the counselor."],
  ["dv-hotline", "Day One Rhode Island — sexual and domestic violence support", "Statewide", "1-800-494-8100", "https://dayoneri.org/", "Confidential crisis support, safety planning, and survivor services; call before travel and follow advocate safety instructions."],
  ["dv-coalition", "Rhode Island Coalition Against Domestic Violence hotline", "Statewide", "1-800-494-8100", "https://ricadv.org/", "Statewide connection to domestic-violence programs and safety planning. This shares a published statewide intake number with member services; do not count as a separate call line if deduplicating by number."],
  ["sexual-assault", "Rhode Island sexual assault hotline and advocacy", "Statewide", "1-800-494-8100", "https://www.ricadv.org/", "Call to request confidential survivor advocacy and referral; ask for sexual-assault services and current local response options."],
];
export const RHODE_ISLAND_URGENT_LOCAL = riUrgentAdditional.slice(0, 3).map(([id, name, city, phone, link, detail]) => reviewed({
  id: `ri-urgent-${id}`, name, state: "RI", city, phone, link, source: "Rhode Island BHDDH crisis pathway and Rhode Island survivor-support organization public contact pages",
  serviceArea: "Statewide, Rhode Island", coverageScope: "statewide specialized urgent support", resourceType: "behavioral-health or survivor crisis navigation", locationLine: `${phone} · statewide crisis access`,
  description: `${detail} If there is immediate danger, call 911.`,
}));

// Community-action outreach partners offer local application navigation;
// they do not decide eligibility or issue benefits.
const nmBenefitPartners = [
  ["nmacp-north", "New Mexico Association of Community Partners — northern region", "Las Vegas", "San Miguel, Mora, Colfax, and Harding counties", "https://nmacp.org/help/"],
  ["nmacp-southwest", "New Mexico Association of Community Partners — southwest region", "Silver City", "Grant, Hidalgo, Luna, and Catron counties", "https://nmacp.org/help/"],
  ["nmacp-southeast", "New Mexico Association of Community Partners — southeast region", "Roswell", "Chaves, Eddy, Lea, and Otero counties", "https://nmacp.org/help/"],
  ["nmacp-central", "New Mexico Association of Community Partners — central region", "Albuquerque", "Bernalillo, Sandoval, Valencia, and Torrance counties", "https://nmacp.org/help/"],
  ["nmacp-northwest", "New Mexico Association of Community Partners — northwest region", "Farmington", "San Juan, McKinley, and Cibola counties", "https://nmacp.org/help/"],
];
export const NEW_MEXICO_BENEFIT_PARTNERS = nmBenefitPartners.map(([id, name, city, counties, link]) => reviewed({
  id: `nm-benefit-${id}`, name, state: "NM", city, link, source: "New Mexico Association of Community Partners (NMACP) service-area map and help directory",
  serviceArea: counties, coverageScope: "regional community-action benefits navigation", resourceType: "community action, benefits, and household-stability referral",
  locationLine: `${city} · serves ${counties} · use partner directory to find nearest local agency`,
  description: `The New Mexico Association of Community Partners coordinates regional Community Action Agency access for ${counties}. Use its current partner list to identify the agency serving your county and ask about LIHEAP, emergency household assistance, weatherization, and benefit application help. Program funding and eligibility vary; contact the named local agency to confirm intake, documentation, and availability.`,
}));

const nmLocalFoodRows = [
  ["salvation-army-abq", "Salvation Army Albuquerque Food Box Program", "Albuquerque", "4301 Bryn Mawr Drive NE, Albuquerque, NM", "505-872-1171", "Monday, Wednesday, and Friday, 9 a.m.–noon and 1–4 p.m.", "Walk-in food boxes; confirm same-day hours and eligibility."],
  ["st-felix", "St. Felix Pantry", "Rio Rancho", "4020 Barbara Loop SE, Rio Rancho, NM", "505-891-8075", "Thursday–Saturday, 9 a.m.–noon", "The 2025 state food list says any New Mexico resident may request food; confirm current hours before travel."],
  ["storehouse", "The Storehouse New Mexico", "Albuquerque", "106 Broadway SE, Albuquerque, NM", "505-842-6491", "Wednesday, Friday, and Saturday, 9 a.m.–noon", "Food boxes, diapers, and limited pet-food distribution; call to confirm current intake."],
  ["rio-grande-food-project", "Rio Grande Food Project", "Albuquerque", "600 Coors Boulevard NW, Albuquerque, NM", "505-831-3778", "Wednesday, Friday, and Saturday, 9–11 a.m.", "Published schedule serves low-income households; call to confirm current requirements and availability."],
  ["vic-veterans", "Veterans Integration Center Food Pantry", "Albuquerque", "2701 Mulberry Street SE, Albuquerque, NM", "505-296-0800", "Friday, 10 a.m.–1 p.m.", "Food pantry is limited to veterans, spouses/widows/widowers, National Guard, and Reserves; confirm eligibility and current site."],
  ["echo-senior", "ECHO Food Bank Senior Food Program", "Albuquerque", "300 Menaul Boulevard NW, Suite 226, Albuquerque, NM", "505-242-6777", "Monday–Thursday, 7:30 a.m.–4 p.m.; closed 12:00–12:30 p.m.", "Food program is for adults age 60 and older; contact ECHO to confirm current drive-through and eligibility."],
  ["silver-horizons", "Silver Horizons Food and Household Support", "Albuquerque", "Albuquerque, NM; call for current service location", "505-884-3881", "Call for current appointment and distribution times.", "Food and household-bill help is described for low-income adults age 50+ and low-income veterans of any age, including household members."],
  ["abq-senior-meals", "City of Albuquerque Senior Affairs Home-Delivered Meals", "Albuquerque", "Albuquerque service area; call to request screening", "505-764-6400", "Call for intake and meal-delivery schedule.", "Home-delivered meals are for eligible homebound Albuquerque seniors age 60+; call for screening and service-area confirmation."],
];
export const NEW_MEXICO_LOCAL_FOOD = nmLocalFoodRows.map(([id, name, city, address, phone, hours, scope]) => reviewed({
  id: `nm-food-local-${id}`, name, state: "NM", city, address, phone,
  link: "https://www.ofra.nm.gov/wp-content/uploads/2025/11/List-of-food-box-resources.pdf",
  source: "New Mexico Office of the Food Repositories Administrator, One-page Food Resource List (November 2025)",
  serviceArea: city === "Albuquerque" ? "Albuquerque and Bernalillo County, subject to program eligibility" : "Rio Rancho and New Mexico statewide access as stated by provider",
  coverageScope: "named local food site or meal-support program", resourceType: "food pantry, food box, senior meal, or household food support",
  locationLine: `${address} · ${hours}`,
  description: `New Mexico's Office of the Food Repositories Administrator lists ${name}. Published details: ${scope} Hours and eligibility above come from its November 2025 state resource sheet and may change; contact the provider before traveling to confirm the address, requirements, and current food availability.`,
}));

const orPeerHousingRows = [
  ["coos-first-step", "Bay Area First Step", "Coos Bay", "Coos", "155 South Empire Boulevard, Coos Bay, OR 97420", "541-756-3111", "Peer support and housing navigation"],
  ["crook-bestcare", "BestCare Treatment Services", "Prineville", "Crook", "1059 NW Madras Highway, Prineville, OR 97754", "541-323-5330", "Peer support and housing navigation"],
  ["douglas-adapt", "Adapt Integrated Health Care", "Roseburg", "Douglas", "621 West Madrone Street, Roseburg, OR 97470", "541-708-9581", "Peer support and housing access"],
  ["hood-river-mccfl", "Mid-Columbia Center for Living", "Hood River", "Hood River", "1610 Woods Court, Hood River, OR 97031", "541-386-2620", "Peer support and housing navigation"],
  ["jackson-family-nurturing", "Family Nurturing Center", "Medford", "Jackson", "825 East Main Street, Suite A, Medford, OR 97504", "541-779-5242", "Peer and family support and housing access"],
  ["lane-white-bird", "White Bird Clinic", "Eugene", "Lane", "647 Polk Street, Eugene, OR 97402", "541-246-1353", "Peer support and harm-reduction connection"],
  ["linn-csc", "Community Services Consortium", "Albany", "Linn", "250 SW Broadalbin Street, Suite 2A, Albany, OR 97321", "541-928-6335", "Peer support and housing navigation"],
  ["marion-irontribe", "IronTribe Network", "Salem", "Marion", "1915 Commercial Street SE, Salem, OR", "503-344-6710", "Housing-focused behavioral-health resource navigation"],
  ["tillamook-helping-hands", "Helping Hands Reentry Outreach Centers", "Tillamook", "Tillamook", "6505 Headquarters Street, Tillamook, OR 97141", "503-354-8014", "Peer support and housing assistance"],
  ["wasco-yes", "Youth Empowerment Shelter", "The Dalles", "Wasco", "610 Court Street, The Dalles, OR 97058", "541-705-4777", "Youth peer support and housing services"],
  ["wallowa-center", "Wallowa Valley Center for Wellness", "Enterprise", "Wallowa", "606 Medical Parkway, Enterprise, OR 97828", "541-426-4524", "Peer support and housing navigation"],
  ["morrow-ccs", "Community Counseling Solutions", "Heppner", "Morrow", "550 West Sperry Street, Heppner, OR 97836", "541-947-6021", "Peer support and housing navigation"],
];
const makeORPeerHousing = (row, kind) => {
  const [id, provider, city, county, address, phone, scope] = row;
  const isPeer = kind === "peer";
  return reviewed({
    id: `or-${kind}-bhrn-${id}`, name: `${provider} — ${isPeer ? "peer recovery support" : "housing and stabilization access"}`, state: "OR", city, county: `${county} County`, address, phone,
    link: "https://www.oregon.gov/oha/HSD/AMH/docs/BHRN-Directory.pdf", source: "Oregon Health Authority 2025–2029 Behavioral Health Resource Networks directory",
    serviceArea: `${county} County`, coverageScope: "county Behavioral Health Resource Network provider", resourceType: isPeer ? "peer recovery service" : "behavioral-health-linked housing navigation",
    locationLine: `${address} · contact for current program intake and schedule`,
    description: `Oregon Health Authority lists ${provider} in its ${county} County Behavioral Health Resource Network and marks ${scope.toLowerCase()} among its service areas. Contact the organization to confirm which listed service is available at this location, current eligibility, referral or intake steps, and hours. The directory does not confirm a bed, rental payment, or same-day appointment.`,
  });
};
export const OREGON_PEER_LOCAL = orPeerHousingRows.filter((row) => !["marion-irontribe"].includes(row[0])).map((row) => makeORPeerHousing(row, "peer"));
export const OREGON_HOUSING_LOCAL = orPeerHousingRows.filter((row) => row[0] !== "lane-white-bird").map((row) => makeORPeerHousing(row, "housing"));

const orBenefitsRows = [
  ["albany", "Albany Self-Sufficiency Office", "Albany", "118 2nd Avenue SE, Albany, OR 97321", "541-967-2078"],
  ["alberta", "Alberta Self-Sufficiency Office", "Portland", "30 North Webster Street, Suite A, Portland, OR 97217", "971-673-6900"],
  ["ashland", "Ashland Self-Sufficiency Office", "Ashland", "1658 Ashland Street, Ashland, OR 97520", "541-482-2041"],
  ["astoria", "Astoria Self-Sufficiency Office", "Astoria", "422 Gateway Avenue, Suite 260, Astoria, OR 97103", "503-325-2021"],
  ["baker-city", "Baker City Self-Sufficiency Office", "Baker City", "3165 10th Street, Suite 100, Baker City, OR 97814", "541-523-3648"],
  ["beaverton", "Beaverton Self-Sufficiency Office", "Beaverton", "15425 NW Greenbrier Parkway, Beaverton, OR 97006", "503-646-9952"],
  ["bend", "Bend Self-Sufficiency Office", "Bend", "1300 NW Wall Street, Suite 101, Bend, OR 97703", "541-388-6010"],
  ["brookings", "Brookings Self-Sufficiency Office", "Brookings", "1210 Chetco Avenue, Brookings, OR 97415", "541-469-9299"],
  ["burns", "Burns Self-Sufficiency Office", "Burns", "809 W Jackson Street, Suite 100, Burns, OR 97720", "541-573-5227"],
  ["cave-junction", "Cave Junction Self-Sufficiency Office", "Cave Junction", "535 E River Street, Cave Junction, OR 97523", "541-592-4149"],
];
export const OREGON_BENEFITS_LOCAL = orBenefitsRows.map(([id, name, city, address, phone]) => reviewed({
  id: `or-benefits-${id}`, name: `${name} — food, cash, medical, and child-care benefit access`, state: "OR", city, address, phone,
  link: "https://www.oregon.gov/odhs/Pages/office-finder.aspx?serviceid=26", source: "Oregon ODHS Office Finder, Self-Sufficiency Programs listing",
  serviceArea: `${city} and nearby communities`, coverageScope: "local ODHS benefits office", resourceType: "SNAP, cash, medical, and child-care benefits access",
  locationLine: `${address} · call ahead to confirm services and walk-in hours`,
  description: `Oregon ODHS lists ${name} at ${address}, phone ${phone}. The Self-Sufficiency program supports access to food, cash, medical, and child-care benefits. The statewide ONE Customer Service Center is 800-699-9075, Monday–Friday, 7 a.m.–6 p.m. Call the local office before visiting to confirm which services are available, appointment rules, documents, interpretation, and current hours. The office cannot guarantee eligibility or benefit approval.`,
}));

const riUrgentSafetyRows = [
  ["adult-protective", "Rhode Island Adult Protective Services reporting and safety line", "Statewide", "401-462-0555", "https://dhs.ri.gov/programs-and-services/adults/adult-protective-services", "For concerns about abuse, neglect, or exploitation of a vulnerable adult; use 911 for immediate danger."],
  ["child-protective", "Rhode Island Child Abuse and Neglect Hotline", "Statewide", "1-800-RI-CHILD (1-800-742-4453)", "https://dcyf.ri.gov/", "Statewide route to report child abuse or neglect and request protective-services response; this is not a counseling line."],
];
export const RHODE_ISLAND_URGENT_SAFETY = riUrgentSafetyRows.map(([id, name, city, phone, link, detail]) => reviewed({
  id: `ri-urgent-${id}`, name, state: "RI", city, phone, link, source: "Rhode Island DHS Adult Protective Services and Department of Children, Youth & Families public reporting contacts",
  serviceArea: "Statewide, Rhode Island", coverageScope: "statewide protective-service reporting", resourceType: "urgent safety and protective-service contact",
  locationLine: `${phone} · statewide contact; call 911 for immediate danger`, description: `${detail} Call to clarify whether the situation meets reporting criteria and what happens next.`,
}));
