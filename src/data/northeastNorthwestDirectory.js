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
export const RHODE_ISLAND_URGENT = [reviewed({
  id: "ri-bh-link-988", name: "BH Link — Rhode Island 24/7 behavioral-health crisis support", state: "RI", city: "Statewide", phone: "988", link: "https://bhddh.ri.gov/mental-health/licensed-treatment-providers", source: "Rhode Island BHDDH, Community Mental Health Centers and crisis information", serviceArea: "Statewide, Rhode Island", coverageScope: "statewide", resourceType: "24/7 call, text, and crisis connection", locationLine: "Call or text 988 · statewide confidential support and connection to care",
  description: "Rhode Island BHDDH identifies BH Link through 988 for confidential crisis support and connection to care. People under 18 can call 855-KIDLINK. Call or text 988 to reach trained crisis counselors; for immediate danger, call 911.",
})];
