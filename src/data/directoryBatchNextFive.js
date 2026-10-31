// Source-reviewed access routes for the next five-state directory batch.
// A state directory entry is a research lead, not phone-confirmed availability.
const reviewed = (record) => ({
  ...record,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const kySource = "https://www.kyhousing.org/programs/recovery-kentucky";
const kentuckyCenters = [
  ["campbellsville", "The Healing Place of Campbellsville", "Campbellsville", "105 Hiestand Farm Road, Campbellsville, KY 42718", "270-789-0176"],
  ["brighton", "Brighton Recovery Center for Women", "Florence", "375 Weaver Road, Florence, KY 41042", "859-282-9390"],
  ["center-point", "Center Point Recovery Center", "Paducah", "530 County Park Road, Paducah, KY 42001", "270-444-3640"],
  ["cumberland-hope", "Cumberland Hope Community", "Evarts", "6050 Highway 38, Evarts, KY 40828", "606-837-0100"],
  ["genesis", "Genesis Recovery Center", "Grayson", "400 CW Stevens Blvd., Grayson, KY 41143", "606-898-2111"],
  ["grateful-life", "Grateful Life Center", "Erlanger", "305 Pleasure Isle Drive, Erlanger, KY 41018", "859-359-4500"],
  ["hickory-hills", "Hickory Hills Recovery Center", "Emmalena", "100 Recovery Way, Emmalena, KY 41740", "606-785-0141"],
  ["liberty-place", "Liberty Place Recovery Center for Women", "Richmond", "218 Lake Street, Richmond, KY 40475", "859-625-0104"],
  ["marc", "Men's Addiction Recovery Center (M.A.R.C.)", "Bowling Green", "1791 River St., Bowling Green, KY 42101", "270-715-0810"],
  ["owensboro-regional", "Owensboro Regional Recovery Center", "Owensboro", "4301 Veech Road, Owensboro, KY 42303", "270-689-0905"],
  ["sky-hope", "SKY Hope Recovery Center", "Somerset", "77 Union St., Somerset, KY 42501", "606-425-4787"],
  ["trilogy", "Trilogy Center for Women", "Hopkinsville", "100 Trilogy Avenue, Hopkinsville, KY 42240", "270-885-2902"],
  ["warm", "Women's Addiction Recovery Manor (W.A.R.M.)", "Henderson", "56 North McKinley Street, Henderson, KY 42420", "270-826-0036"],
];

export const KENTUCKY_RECOVERY_HOUSING = kentuckyCenters.map(([id, name, city, address, phone]) => reviewed({
  id: `ky-recovery-housing-${id}`,
  name: `${name} — recovery housing and structured support`,
  description: `Kentucky Housing Corporation lists this as one of 13 Recovery Kentucky centers. The program provides supportive housing with peer support, daily-living skills, and recovery services for people affected by substance use and housing instability. The state says applicants apply directly to a center. Call to ask about admissions, eligibility, program expectations, costs, and current openings; a listing does not confirm a bed or immediate placement.`,
  city, state: "KY", address, phone, link: kySource,
  source: "Kentucky Housing Corporation — Recovery Kentucky center contacts",
  serviceArea: "Kentucky; applicants apply directly to this center",
  coverageScope: "named recovery housing center; direct application required",
  resourceType: "supportive recovery housing and peer-supported program",
  locationLine: `${city}, KY · recovery housing · contact the center about intake and eligibility`,
}));

const mnSource = "https://mn.gov/dhs/partners-and-providers/policies-procedures/behavioral-health/ccbhc/";
const minnesotaClinics = [
  ["alluma", "Alluma", "Thief River Falls", "Kittson, Mahnomen, Marshall, Norman, Polk, and Red Lake counties", "218-281-3940", "https://www.nwmhc.org/"],
  ["wilder", "Amherst H. Wilder Foundation", "Saint Paul", "Ramsey County", "651-280-2310", "https://www.wilder.org/"],
  ["hiawatha-valley", "Hiawatha Valley Mental Health Center", "Winona", "Fillmore, Goodhue, Houston, Wabasha, and Winona counties", "800-657-6777", "https://www.hvmhc.org/"],
  ["northern-pines", "Northern Pines Mental Health Center", "Little Falls", "Aitkin, Cass, Crow Wing, Morrison, Todd, and Wadena counties", "800-316-0698", "https://www.npmh.org/"],
  ["people-incorporated", "People Incorporated", "Saint Paul", "Anoka, Dakota, Hennepin, and Ramsey counties", "651-774-0011", "https://www.peopleincorporated.org/"],
  ["ramsey-county", "Ramsey County Mental Health Center", "Saint Paul", "Ramsey County", "651-266-7890", "https://www.ramseycounty.us/"],
  ["zumbro-valley", "Zumbro Valley Health Center", "Rochester", "Fillmore and Olmsted counties", "507-289-2089", "https://www.zvhc.org/"],
  ["canvas", "Canvas Health", "Stillwater", "Anoka, Chisago, Hennepin, Scott, and Washington counties", "651-777-5222", "https://www.canvashealth.org/"],
  ["central-mn", "Central Minnesota Mental Health Center", "Saint Cloud", "Benton, Sherburne, Stearns, and Wright counties", "800-635-8008", "https://cmmhc.org/"],
  ["clues", "Comunidades Latinas Unidas En Servicio (CLUES)", "Saint Paul", "Ramsey and Hennepin counties", "651-379-4200", "https://clues.org/"],
  ["elevacare", "ElevaCare", "Worthington", "Nobles, Jackson, and Cottonwood counties", "507-376-4141", "https://www.elevacare.org/"],
  ["fraser", "Fraser Child and Family Center", "Minneapolis", "Anoka, Dakota, Hennepin, Ramsey, and Washington counties", "612-767-7222", "https://www.fraser.org/"],
  ["hennepin-county", "Hennepin County Mental Health Center", "Minneapolis", "Hennepin County", "612-596-9438", "https://www.hennepin.us/"],
  ["human-development-center", "Human Development Center", "Duluth", "Carlton, Lake, and southern St. Louis counties", "218-728-4491; toll-free 888-412-9764", "https://hdcnorth.org/"],
  ["north-homes", "North Homes Children and Family Services", "Bemidji", "Beltrami, Itasca, and St. Louis counties; ask for the site serving your county", "Bemidji 218-751-0282; Grand Rapids 218-999-9908; Duluth 218-733-3000", "https://www.northhomes.org/"],
  ["northland-counseling", "Northland Counseling Center", "Grand Rapids", "Itasca and Koochiching counties", "218-326-1274", "https://northlandcounseling.org/"],
  ["range-mental-health", "Range Mental Health Center", "Virginia", "St. Louis County", "218-749-2881", "https://www.rangementalhealth.org/"],
  ["sanford-northern-mn", "Sanford Health Behavioral Health of Northern Minnesota", "Bemidji", "Beltrami County", "218-333-2035", "https://www.sanfordhealth.org/"],
  ["scott-county", "Scott County Mental Health Center", "Shakopee", "Scott County", "952-496-8481", "https://www.scottcountymn.gov/"],
  ["south-central-human-relations", "South Central Human Relations Center", "Owatonna", "Dodge, Steele, and Waseca counties", "507-451-2630; toll-free 800-722-0590", "https://www.schrc.com/"],
  ["western-mental-health", "Western Mental Health Center", "Marshall", "Lincoln, Lyon, Murray, Redwood, and Yellow Medicine counties", "507-532-3236; toll-free 800-658-2429", "https://wmhcinc.org/"],
  ["woodland-centers", "Woodland Centers", "Willmar", "Big Stone, Chippewa, Kandiyohi, Lac qui Parle, Meeker, Renville, and Swift counties", "320-235-4613", "https://www.woodlandcenters.com/"],
];

export const MINNESOTA_CCBHC_TREATMENT = minnesotaClinics.map(([id, name, city, serviceArea, phone, website]) => reviewed({
  id: `mn-ccbhc-${id}`,
  name: `${name} — certified community behavioral-health care`,
  description: `Minnesota DHS lists ${name} as a Certified Community Behavioral Health Clinic provider. The state describes CCBHC care as coordinated mental-health and substance-use services for adults and children. Listed service area: ${serviceArea}. Contact the provider to ask which clinic serves your location, referral and eligibility requirements, insurance/payment options, and current intake. This is not crisis dispatch or confirmation of an appointment.`,
  city, state: "MN", phone, link: website,
  source: "Minnesota Department of Human Services — CCBHC provider directory",
  serviceArea, coverageScope: "state-listed provider; multi-county service area",
  resourceType: "integrated mental-health and substance-use treatment access",
  locationLine: `${city}, MN · integrated behavioral-health care · confirm local clinic and intake`,
}));

// These Mississippi entries intentionally add no confidential shelter addresses.
// MAMA publishes the provider contact and cautions are carried in each record.
const msSource = "https://www.mama.ms.gov/service-directory?category=6";
const msShelters = [
  ["angies-house", "Angie's House", "Lucedale", "12284 MS-613, Lucedale, MS 39452", "601-673-7626", "https://www.crossingover.qlogictechnologies.com/", "MAMA describes a structured housing and recovery-support program for women. Contact the provider to confirm admission criteria, program expectations, and openings."],
  ["ella-bebe-angels", "Ella Bebe Angels", "Olive Branch", "Mailing address: PO Box 1725, Olive Branch, MS 38654; no walk-in location confirmed", "662-804-6612", "https://www.ellabebeangels.org/", "MAMA lists emergency shelter support, trauma-informed coaching, parenting classes, and essential-needs support for survivors and families. Call to request safe intake instructions; the mailing address is not a shelter location."],
  ["gulf-coast-center-nonviolence", "Gulf Coast Center for Nonviolence", "Biloxi", "213 Porter Avenue, Biloxi, MS 39530", "228-436-3809; 228-762-8267", "https://www.gccfn.org/", "MAMA lists emergency domestic-violence and trafficking shelter services, counseling, advocacy, housing placement, and crisis intervention. Use the phone to ask about confidential intake and safe contact; do not assume a bed is available."],
  ["haven-house-vicksburg", "Haven House Family Shelter", "Vicksburg", "Vicksburg area; contact for safe location details", "601-638-0555; toll-free 800-898-0860", "https://myhavenhouse.org/", "MAMA lists 24-hour crisis lines, shelter, counseling, court advocacy, outreach, and referrals for domestic-violence survivors. Contact the hotline for confidential intake and safety planning; the listing does not confirm capacity."],
  ["house-of-grace", "House of Grace — domestic-violence shelter", "Southaven", "1535 US-51 S, Southaven, MS 38671; call before travel", "662-253-0252; 24-hour crisis line 662-342-1432", "https://www.houseofgracedv.org/", "MAMA describes a confidential shelter and safety resources for survivors and children. Call the crisis line to discuss safe contact, current intake, eligibility, and capacity before sharing sensitive information or traveling."],
  ["janes-house", "Jane's House — Gulf Coast Center for Nonviolence", "Biloxi", "Confidential shelter; contact operator for safe access instructions", "228-435-1968", "https://www.gccfn.org/", "MAMA identifies Jane's House as a 24-hour emergency domestic-violence shelter for survivors and children. Call the operator for confidential intake and access instructions; capacity is not guaranteed."],
  ["choice-rental-assistance", "CHOICE — rental assistance for people with serious mental illness", "Mississippi Gulf Coast", "Referral and service area depend on the referring Community Mental Health Center", "228-604-2048", "https://www.mshomecorp.com/", "MAMA lists CHOICE rental assistance for eligible people with serious mental illness, with services coordinated through Community Mental Health Centers. Ask a local center about referral, eligibility, rent coverage, and current funding; this is not a general cash grant."],
  ["foundation-on-rock", "Foundation on the Rock — family recovery housing", "Satartia", "5602 MS-3, Satartia, MS 39162", "601-672-3982", "https://foundationontherock.com/", "MAMA describes a 12-month residential recovery program for mothers with children. Contact the program to confirm current admissions, eligibility, faith-based program expectations, and availability before relying on this option."],
];

export const MISSISSIPPI_HOUSING_LOCAL = msShelters.map(([id, name, city, address, phone, link, detail]) => reviewed({
  id: `ms-housing-local-${id}`,
  name: `${name} — housing and safety access`,
  description: `${detail} The Mississippi Access to Mental Health directory publishes this contact.`,
  city, state: "MS", address, phone, link,
  source: "Mississippi Access to Mental Health (MAMA) Service Directory — Housing",
  serviceArea: city === "Mississippi Gulf Coast" ? "Mississippi Gulf Coast; provider referral rules apply" : `${city} area; confirm current service area`,
  coverageScope: "named housing or confidential shelter access route",
  resourceType: "housing, shelter, or survivor safety access",
  locationLine: `${city} · call for safe intake instructions and current availability`,
}));

// County-level directories provide a useful next step where the statewide
// partner search does not expose all local listings on a single result page.
const mdFoodLocators = [
  ["anne-arundel", "Anne Arundel County", "https://aafoodbank.org/"],
  ["baltimore-city", "Baltimore City", "https://www.charmcare.org/"],
  ["calvert", "Calvert County", "https://communityharvestnetwork.org/"],
  ["carroll", "Carroll County", "https://www.westminsterrescuemission.org/"],
  ["charles", "Charles County", "https://www.catholiccharitiesdc.org/"],
  ["southern-maryland", "Charles, St. Mary's, and Calvert counties", "https://somdfoodconnection.org/"],
  ["harford", "Harford County", "https://harfordcaa.org/"],
  ["howard", "Howard County", "https://www.hclhic.org/"],
  ["western-maryland", "Western Maryland", "https://www.wmdfoodbank.org/"],
];

export const MARYLAND_FOOD_LOCAL_FINDERS = mdFoodLocators.map(([id, serviceArea, link]) => reviewed({
  id: `md-food-locator-${id}`,
  name: `${serviceArea} — local food pantry and meal finder`,
  description: `Maryland Food Bank directs residents to this local food-resource directory for additional pantries, community kitchens, and meal programs. Open the directory and search the correct county or community; then contact the listed provider to verify location, hours, eligibility, and current food availability. This is a locator, not a food-distribution site or guarantee of service.`,
  city: serviceArea, state: "MD", link,
  source: "Maryland Food Bank — county-level food-resource links",
  sourceUrl: "https://mdfoodbank.org/find-food/",
  serviceArea, coverageScope: "county or regional food-resource locator",
  resourceType: "local food pantry and meal locator",
  locationLine: `${serviceArea} · open the local directory to find a nearby pantry or meal service`,
}));

const miSource = "https://www.michigan.gov/mde/services/food/food-distribution/household-food-distribution/the-emergency-food-assistance-program/where-can-i-get-tefap";
const michiganAgencies = [
  ["allegan", "Community Action of Allegan County", "Allegan County", "269-673-5472", "https://communityactionallegan.org/"],
  ["eastern-michigan-food-bank", "Food Bank of Eastern Michigan", "Alcona, Alpena, Arenac, Bay, Cheboygan, Crawford, Genesee, Gladwin, Huron, Iosco, Lapeer, Midland, Montmorency, Ogemaw, Oscoda, Otsego, Presque Isle, Roscommon, Saginaw, Sanilac, St. Clair, and Tuscola counties", "810-239-4441", "https://www.fbem.org/"],
  ["alger-marquette", "Community Action Alger Marquette", "Alger and Marquette counties", "800-562-9762", "https://www.communityactionam.org/"],
  ["bhkcaa", "Baraga-Houghton-Keweenaw Community Action Agency", "Baraga, Houghton, and Keweenaw counties", "906-482-5528", "https://www.bhkcaa.org/"],
  ["south-central", "Community Action Agency of South-Central Michigan", "Barry, Branch, Calhoun, Hillsdale, Jackson, Lenawee, and St. Joseph counties", "877-422-2726", "https://www.caascm.org/"],
  ["mid-michigan", "Mid Michigan Community Action Agency", "Bay, Clare, Gladwin, Mecosta, Midland, Muskegon, Oceana, and Osceola counties", "877-213-5948", "https://www.mmcaa.org/"],
  ["northwest", "Northwest Michigan Community Action Agency", "Antrim, Benzie, Charlevoix, Emmet, Grand Traverse, Kalkaska, Leelanau, Missaukee, and Wexford counties", "231-947-3780", "https://www.nmcaa.net/"],
  ["chippewa-luce-mackinac", "Chippewa-Luce-Mackinac Community Action Agency", "Chippewa, Luce, and Mackinac counties", "906-632-3363", "https://cms.clmcaa.org/"],
  ["mdscaa", "Menominee-Delta-Schoolcraft Community Action Agency", "Menominee, Delta, and Schoolcraft counties", "906-786-7080", "https://www.mdscaa.org/"],
  ["dicsa", "Dickinson-Iron Community Services Agency", "Dickinson and Iron counties", "906-774-2256", "https://www.dicsami.org/"],
  ["gocaa", "Gogebic-Ontonagon Community Action Agency", "Gogebic and Ontonagon counties", "906-667-0283", "https://www.gocaa.org/"],
  ["fivecap", "FiveCAP, Inc.", "Lake, Manistee, Mason, and Newaygo counties", "231-757-3785", "https://www.fivecap.org/"],
  ["genesee", "Genesee County Community Action Resource Department", "Genesee County", "810-232-2185", "https://www.geneseecountymi.gov/"],
  ["kent", "Kent County Community Action", "Kent County", "616-632-7950", "https://www.kentcountymi.gov/"],
  ["macomb", "Macomb County Community Action", "Macomb County", "586-469-6004", "https://www.macombgov.org/"],
  ["monroe", "Monroe County Opportunity Program", "Monroe County", "734-241-2775", "https://www.monroecountyop.org/"],
  ["ottawa", "Ottawa County Community Action Agency", "Ottawa County", "616-393-4433", "https://miottawa.org/caa/"],
  ["saginaw", "Saginaw County Community Action Center", "Saginaw County", "989-753-7741", "https://www.saginawcac.org/"],
  ["southwest", "Southwest Michigan Community Action Agency", "Berrien, Cass, and Van Buren counties", "269-925-9077", "https://www.smcaa.com/"],
];

export const MICHIGAN_TEFAP_LOCAL = michiganAgencies.map(([id, name, serviceArea, phone, link]) => reviewed({
  id: `mi-tefap-${id}`,
  name: `${name} — county food-assistance contact`,
  description: `Michigan Department of Education lists ${name} as a local TEFAP food-distribution contact for ${serviceArea}. TEFAP provides USDA foods through local agencies, food banks, pantries, and mobile distributions; the listed agency is a contact route, not necessarily a walk-in pantry. Call to find the current distribution site, dates, household eligibility, and what information is requested before traveling.`,
  city: serviceArea, state: "MI", phone, link,
  source: "Michigan Department of Education — Where can I get TEFAP? county directory",
  sourceUrl: miSource,
  serviceArea, coverageScope: "county or multi-county food-distribution referral",
  resourceType: "TEFAP food distribution and local pantry referral",
  locationLine: `${serviceArea} · call to locate the active food distribution and confirm eligibility`,
}));
