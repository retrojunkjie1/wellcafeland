// Additive category balancing for KY, LA, ME, MA and MO.
// Sources are public agency or provider directories. Listings are source-reviewed,
// not phone-confirmed; confirm current intake, hours, eligibility and availability.
const checkedAt = "2026-10-30";
const entry = ({ id, name, state, city, address, phone, description, url, source, serviceArea, coverageScope = "city", resourceType }) => ({
  id, name, state, city, address, phone, description, link: url, source, serviceArea,
  coverageScope, resourceType, locationLine: `${city || state} · call or check the linked source to confirm current access`,
  verified: true, sourceReviewed: true, phoneConfirmed: false, exhaustiveCoverage: false, checkedAt,
});

const kyPeerSource = "Kentucky CHFS Recovery Community Centers directory (October 2025 edition)";
const kyRcc = [
  ["shepherds-house", "Shepherd's House Recovery Community Center", "Lexington", "104 N Main St, Nicholasville, KY 40356", "859-241-6035"],
  ["rebound", "The Rebound Center", "Hazard", "480 Main Street, Hazard, KY 41701", "606-373-3510"],
  ["voa-manchester", "VOA Recovery Community Center", "Manchester", "48 Owens Road, Manchester, KY 40962", "606-658-9236"],
  ["voices-hope", "Voices of Hope Recovery Community Center", "Lexington", "644 N Broadway, Lexington, KY 40508", "859-303-7671"],
  ["recovery-cafe", "Recovery Cafe", "Lexington", "1109 Versailles Rd, Suite 200, Lexington, KY 40508", "859-523-0590"],
  ["life-learning", "Life Learning Center", "Covington", "20 W 18th St, Covington, KY 41011", "859-431-0100"],
  ["dry-dock", "The Dry Dock Club", "Richmond", "262 Four Mile Ave, Richmond, KY", "859-575-7260"],
  ["gathering-pointe", "The Gathering Pointe", "Owensboro", "400 E 4th Street, Owensboro, KY 42303", "270-632-0622"],
  ["recovery-center-winchester", "The Recovery Center", "Winchester", "400 Professional Ave, Winchester, KY 40391", "859-385-5017"],
  ["the-hub", "The HUB", "Beattyville", "45 Center St, Beattyville, KY 41311", "606-919-1338"],
  ["ky-recovery-connection", "Kentucky Recovery Connection", "Louisville", "3050 W Broadway, Louisville, KY 40211", "502-541-9051"],
  ["voa-rockcastle", "VOA Recovery Community Center", "Mount Vernon", "920 W Main St, Mount Vernon, KY 40456", "606-392-4001"],
  ["louisville-rcc", "Louisville Recovery Community Connection", "Louisville", "1700 S 5th Street, Louisville, KY 40202", "502-398-5258"],
  ["the-pier", "The Pier — Northern Kentucky", "Newport", "1002 Monmouth St, Newport, KY 41071", "859-547-6539"],
  ["turning-point", "Turning Point Recovery Community Center", "Paducah", "415 Broadway St, Paducah, KY 42001", "270-444-3621"],
];
export const NEXT_KY_PEER = kyRcc.map(([key, name, city, address, phone]) => entry({
  id: `ky-peer-rcc-${key}`, name, state: "KY", city, address, phone,
  description: `${name} appears in the Kentucky Cabinet for Health and Family Services recovery-community-center directory. The state describes these centers as peer-operated community hubs offering mutual-aid and support meetings, recovery coaching, resource connections, and social activities. They are not residential facilities or clinical treatment centers. Contact the center to confirm current schedule and access.`,
  url: "https://www.chfs.ky.gov/agencies/dbhdid/Documents/Recovery%20Community%20Centers%2010.2025%20REVISED.pdf", source: kyPeerSource,
  serviceArea: city, resourceType: "peer recovery community center",
}));

const kyFoodSource = "Feeding Kentucky — Member Food Banks (2026 service-area directory)";
const kyFood = [
  ["dare-to-care", "Dare to Care Food Bank", "Louisville", "Jefferson, Shelby, Oldham, Spencer, Carroll, Trimble and Henry counties; also listed counties in Indiana", "https://daretocare.org/"],
  ["feeding-america-heartland", "Feeding America, Kentucky's Heartland", "Elizabethtown", "42 Kentucky counties through partner agencies", "https://feedingamericaky.org/find-help/"],
  ["freestore-northern-ky", "Freestore Foodbank — Northern Kentucky service area", "Northern Kentucky", "Nine Northern Kentucky counties; hub is based in Cincinnati, Ohio", "https://freestorefoodbank.org/get-help/"],
  ["facing-hunger-eastern-ky", "Facing Hunger Food Bank — Kentucky service area", "Eastern Kentucky", "Three eastern Kentucky counties; hub is based in Huntington, West Virginia", "https://facinghunger.org/need-food/"],
  ["gods-pantry", "God's Pantry Food Bank", "Lexington", "50 counties in Central and Eastern Kentucky through partner pantries and meal programs", "https://godspantry.org/need-food/"],
  ["tri-state-kentucky", "Tri-State Food Bank — Kentucky service area", "Western Kentucky", "Seven Kentucky counties; hub is based in Evansville, Indiana", "https://tristatefoodbank.org/get-help/"],
  ["purchase-area", "Purchase Area Development District Food Bank", "Western Kentucky", "Ballard, Calloway, Carlisle, Fulton, Graves, Hickman, Marshall and McCracken counties", "https://purchaseadd.org/"],
];
export const NEXT_KY_FOOD = kyFood.map(([key, name, city, serviceArea, url]) => entry({
  id: `ky-food-network-${key}`, name, state: "KY", city, serviceArea,
  description: `Feeding Kentucky identifies this food-bank network and its published service region. This is a regional food-access route, not a guarantee of direct grocery pickup. Use the linked organization locator or contact it to find a nearby partner pantry, ask what food is available, and confirm eligibility and distribution times before traveling.`,
  url, source: kyFoodSource, coverageScope: "multi-county network", resourceType: "regional food-bank referral network",
}));

const kyTreatmentSource = "Kentucky Department of Corrections — Treatment Locations and Recovery Kentucky centers";
const kyTreatment = [
  ["healing-place-campbellsville", "The Healing Place of Campbellsville", "Campbellsville", "105 Hiestand Farm Road, Campbellsville, KY 42718", "270-789-0176"],
  ["brighton-women", "Brighton Recovery Center for Women", "Florence", "375 Weaver Road, Florence, KY 41042", "859-491-8303"],
  ["centerpoint-men", "CenterPoint Recovery Center for Men", "Paducah", "530 County Park Road, Paducah, KY 42001", "270-444-3640"],
  ["cumberland-hope", "Cumberland Hope Community Center for Women", "Evarts", "6050 KY 38, Evarts, KY 40828", "606-837-0100"],
  ["genesis-men", "Genesis Recovery Kentucky Center for Men", "Grayson", "400 CW Stevens Blvd, Grayson, KY 41143", "606-898-2111"],
  ["grateful-life", "Grateful Life Center", "Erlanger", "305 Pleasure Isle Drive, Erlanger, KY 41017", "859-359-4500"],
  ["hickory-hills", "Hickory Hills Recovery Center for Men", "Emmalena", "100 Recovery Way, Emmalena, KY 41740", "606-785-0141"],
  ["liberty-place", "Liberty Place Recovery Center for Women", "Richmond", "218 Lake Street, Richmond, KY 40475", "859-625-0104"],
  ["marc-bowling-green", "Men's Addiction Recovery Center (M.A.R.C.)", "Bowling Green", "1791 River Street, Bowling Green, KY 42101", "270-715-0810"],
];
export const NEXT_KY_PROGRAMS = kyTreatment.map(([key, name, city, address, phone]) => entry({
  id: `ky-treatment-${key}`, name, state: "KY", city, address, phone,
  description: `${name} is named in Kentucky's published treatment-location listing for Recovery Kentucky and related programs. Contact the center to ask about current admission status, program model, who it serves, referral requirements, costs, and whether a clinical assessment or other eligibility criteria apply. This listing does not confirm a current opening.`,
  url: "https://corrections.ky.gov/Divisions/ask/Pages/modalities.aspx", source: kyTreatmentSource,
  serviceArea: city, resourceType: "substance-use recovery program and residential access inquiry",
}));

const laPeerSource = "Easterseals Louisiana locations and programs directory";
const laPeer = [
  ["recovery-hub-baton-rouge", "Regional Recovery Hub — Baton Rouge", "Baton Rouge", "9420 Lindale Avenue, Suites A & B, Baton Rouge, LA 70815", "225-442-3540", "Baton Rouge and surrounding region", "https://www.startcorp.org/baton-rouge"],
  ["recovery-hub-covington", "Regional Recovery Hub — Covington area", "Covington", "1505 N Florida Street, Covington, LA 70433", "985-900-1626", "St. Tammany / Northshore region", "https://www.startcorp.org/covington-mandeville"],
  ["recovery-hub-morgan-city", "Regional Recovery Hub — Morgan City area", "Morgan City", undefined, "985-384-7446", "St. Mary Parish and surrounding area", "https://www.sclhsa.org/mental-health-services"],
  ["recovery-hub-new-orleans", "Regional Recovery Hub — New Orleans", "New Orleans", "701 Loyola Avenue, Suite 106, New Orleans, LA 70113", "504-558-9595", "New Orleans and surrounding region", "https://www.startcorp.org/contact"],
  ["recovery-hub-shreveport", "Regional Recovery Hub — Shreveport", "Shreveport", "2350 Levy Street, Suite 211, Shreveport, LA 71103", "318-317-3782", "North Louisiana", "https://www.startcorp.org/north-louisiana"],
  ["crescentcare", "CrescentCare — HIV peer support", "New Orleans", "1631 Elysian Fields Avenue, New Orleans, LA 70117", "504-821-2601", "New Orleans; peer support for people living with HIV", "https://www.crescentcare.org/service/peer-support/"],
  ["formerly-incarcerated-peer-support", "Formerly Incarcerated Peer Support Group", "New Orleans", "4930 Washington Avenue, Suite A, New Orleans, LA 70125", undefined, "New Orleans; verify meeting dates and contact options on the official page", "https://fippeersupport.org/join-us"],
];
export const NEXT_LA_PEER = laPeer.map(([key, name, city, address, phone, serviceArea, url]) => entry({
  id: `la-peer-${key}`, name, state: "LA", city, address, phone, serviceArea,
  description: `${name} is listed in Louisiana recovery-support or provider resources. The regional hubs offer peer specialists, recovery coaching, groups and treatment referrals; other entries have specific populations or meeting details stated on their provider page. Use the linked source or call to confirm the actual hub location, current schedule, access criteria and whether an appointment is needed.`,
  url, source: "Louisiana Department of Health recovery-hub directory and linked provider locations",
  coverageScope: "city or regional peer-support access", resourceType: "peer recovery and community support",
}));

const laHousingSource = "Louisiana Balance of State Continuum of Care — regional Coordinated Entry access pages";
const laHousing = [
  ["baton-rouge", "Baton Rouge Region Coordinated Entry", "Baton Rouge", "225-389-3002", "Ascension, East Baton Rouge, East Feliciana, Iberville, Pointe Coupee, West Baton Rouge and West Feliciana parishes", "https://laboscoc.org/baton-rouge-region"],
  ["houma", "Houma Region Coordinated Entry and housing referrals", "Houma", "985-853-0045", "Houma-area participating parishes; confirm your parish and current provider at intake", "https://laboscoc.org/houma-region"],
  ["calcasieu", "Calcasieu Region Coordinated Entry", "Lake Charles", "337-439-7436", "Allen, Beauregard, Calcasieu, Cameron and Jefferson Davis parishes", "https://laboscoc.org/lake-charles-region"],
];
export const NEXT_LA_HOUSING = laHousing.map(([key, name, city, phone, serviceArea, url]) => entry({
  id: `la-housing-ce-${key}`, name, state: "LA", city, phone, serviceArea,
  description: `Louisiana Balance of State CoC lists this regional Coordinated Entry route for housing assessment and referral. Call to confirm the correct parish access point, assessment process, and current service hours. Coordinated Entry prioritizes and refers households to limited housing resources; it does not guarantee a shelter bed or placement.`,
  url, source: laHousingSource, coverageScope: "multi-parish coordinated-entry access", resourceType: "homelessness coordinated-entry and housing referral",
}));

const laBenefitSource = "Louisiana Housing Corporation — Energy Assistance Provider Directory";
const laBenefitOffices = [
  ["quad-hammond", "QUAD Area Community Action Agency — LIHEAP", "Hammond", "45300 N Baptist Road, Hammond, LA 70401", "225-567-2350", "Seven listed parishes in the Florida Parishes region"],
  ["caddo-shreveport", "Caddo Community Action Agency — LIHEAP", "Shreveport", "4055 St. Vincent Avenue, Shreveport, LA 71108", "318-861-4808", "Caddo Parish"],
  ["total-community-action", "Total Community Action — LIHEAP", "New Orleans", "1420 S Jefferson Davis Parkway, New Orleans, LA 70125", "504-875-2660", "Orleans Parish"],
  ["smile-lafayette", "SMILE Community Action Agency — LIHEAP", "Lafayette", "501 St. John Street, Lafayette, LA 70502", "337-234-3272", "Acadia, Iberia, Lafayette, St. Martin and Jefferson Davis parishes"],
  ["omcap-monroe", "Ouachita Multi-Purpose Community Action Program — LIHEAP", "Monroe", "1103 Royal Avenue, Monroe, LA 71203", "318-322-7151", "Ouachita Parish"],
  ["bossier-ocs", "Bossier Office of Community Services — LIHEAP", "Bossier City", "700 Benton Road, Bossier City, LA 71171", "318-747-1045", "Bossier Parish"],
];
export const NEXT_LA_BENEFITS = laBenefitOffices.map(([key, name, city, address, phone, serviceArea]) => entry({
  id: `la-benefit-liheap-${key}`, name, state: "LA", city, address, phone, serviceArea,
  description: `${name} is listed by Louisiana Housing Corporation as an intake provider for the Low Income Home Energy Assistance Program. The agency and parish determine intake schedules and eligibility; funding and application windows can vary. Call before traveling to ask about the current application period, required documents, household eligibility and county/parish coverage.`,
  url: "https://www.lhc.la.gov/energy-assistance", source: laBenefitSource,
  coverageScope: "parish or multi-parish benefit intake", resourceType: "energy-bill assistance and LIHEAP application support",
}));

const laCrisisCenters = [
  ["bridge-center", "The Bridge Center for Hope — 24/7 behavioral-health crisis receiving center", "Baton Rouge", "3455 Florida Street, Baton Rouge, LA 70806", "225-256-6604", "Adults 18 and older; East Baton Rouge area", "https://brbridge.org/help/"],
  ["bridges-for-recovery", "Bridges for Recovery Crisis Receiving Center", "Shreveport", "5906 North Market Street, Shreveport, LA 71107", "318-309-5004", "Northwest Louisiana; confirm age eligibility and walk-in process", "https://ldh.la.gov/directory/detail/22310"],
  ["bright-minds", "Bright Minds of LA — crisis receiving center", "New Orleans", "2235 Poydras Street, Suite A, New Orleans, LA 70119", "504-536-2488", "Greater New Orleans; call to confirm eligibility and current capacity", "https://ldh.la.gov/directory/category/444"],
];
export const NEXT_LA_HOTLINES = laCrisisCenters.map(([key, name, city, address, phone, serviceArea, url]) => entry({
  id: `la-crisis-center-${key}`, name, state: "LA", city, address, phone, serviceArea,
  description: `${name} appears in Louisiana's crisis-response or licensed receiving-center resources. Confirm age/service eligibility, current intake conditions and transport options before traveling. For 24/7 emotional crisis counseling, call or text 988; for an immediate medical emergency or physical danger, call 911. This facility listing does not guarantee a bed or immediate acceptance.`,
  url, source: "Louisiana Department of Health crisis-response and receiving-center listings",
  coverageScope: "local behavioral-health crisis facility", resourceType: "crisis receiving and stabilization center",
}));

const mePeerSource = "Maine DHHS Office of Behavioral Health — recovery supports / Recovery Hub network";
const meCenters = [
  ["bangor", "Bangor Area Recovery Network (The BARN)", "Brewer", "142 Center Street, Brewer, ME", "207-561-9444"],
  ["maine-recovery-access", "Maine Recovery Access Center", "Augusta", "47 Water Street, Augusta, ME 04330", "207-593-6251"],
  ["josh-stevens", "Josh Stevens Recovery Community Center", "Lewiston", "465 Main Street, Lewiston, ME", "207-373-8552"],
  ["coastal", "Coastal Recovery Community Center", "Rockland", "11 White Street, Rockland, ME 04841", "207-691-3697"],
  ["rest", "The REST Center", "Lewiston", "Lewiston, ME", "207-783-7378"],
  ["portland", "Portland Recovery Community Center", "Portland", "468 Forest Avenue, Portland, ME", "207-553-2575"],
  ["down-east-calais", "Down East Recovery Support Center", "Calais", "Calais, ME", undefined],
];
export const NEXT_ME_PEER = meCenters.map(([key, name, city, address, phone]) => entry({
  id: `me-peer-recovery-${key}`, name, state: "ME", city, address, phone,
  description: `${name} is listed in Maine's recovery-community network resources as a community recovery or peer-support location. Contact the center or Maine's Office of Behavioral Health to confirm current hours, group schedules, access requirements, and whether the location is operating at the listed address. Peer support complements but does not replace clinical care.`,
  url: "https://www.maine.gov/dhhs/obh/support-services/substance-use-disorder-services/recovery-supports", source: mePeerSource,
  coverageScope: "city or regional peer support", resourceType: "recovery community and peer support center",
}));

const meProviderSource = "Maine DHHS — Mental Health Recovery Support Services and Treatment provider listings";
const meTreatment = [
  ["chcs-bangor", "Community Health and Counseling Services — behavioral-health access", "Bangor", "24 Stone Street, Suite 201, Bangor, ME", undefined, "Penobscot and surrounding service area"],
  ["crisis-counseling-augusta", "Crisis and Counseling Centers — outpatient and recovery access", "Augusta", "10 Caldwell Road, Augusta, ME", undefined, "Central Maine; confirm specific program catchment"],
  ["health-affiliates", "Health Affiliates of Maine — behavioral-health provider access", "Lewiston", "306 Roadman Road, Lewiston, ME", undefined, "Maine provider network; confirm whether in-person services are available locally"],
  ["connect-kids", "Connections for Kids — behavioral-health services", "South Portland", "155 Center Street, South Portland, ME", undefined, "Statewide/children and families; confirm age and regional availability"],
];
export const NEXT_ME_PROGRAMS = meTreatment.map(([key, name, city, address, phone, serviceArea]) => entry({
  id: `me-program-${key}`, name, state: "ME", city, address, phone, serviceArea,
  description: `${name} appears in Maine DHHS provider resources. Contact the organization to verify the service type currently offered at this address, age or program eligibility, payer requirements, referral process, and appointment availability. The state listing is an access lead, not a confirmed appointment or endorsement of a particular level of care.`,
  url: "https://www3.maine.gov/dhhs/obh/support-services/mental-health-services/recovery-support-services-treatment", source: meProviderSource,
  coverageScope: "regional provider access", resourceType: "mental-health and recovery treatment inquiry",
}));

const meBenefitSource = "Maine DHHS Office for Family Independence — District Office Locations";
const meOffices = [
  ["augusta", "Augusta DHHS District Office — Office for Family Independence", "Augusta", "35 Anthony Avenue, Augusta, ME 04333", "207-624-8000"],
  ["bangor", "Bangor DHHS District Office — Office for Family Independence", "Bangor", "19 Maine Avenue, Bangor, ME 04401", "207-561-4100"],
  ["lewiston", "Lewiston DHHS District Office — Office for Family Independence", "Lewiston", "200 Main Street, Lewiston, ME 04240", "207-795-4300"],
  ["machias", "Machias DHHS District Office — Office for Family Independence", "Machias", "38 Prescott Drive, Suite 3, Machias, ME 04654", "207-255-2000"],
  ["south-portland", "Portland DHHS District Office — Office for Family Independence", "South Portland", "151 Jetport Boulevard, South Portland, ME 04102", "207-822-2000"],
];
export const NEXT_ME_GRANTS = meOffices.map(([key, name, city, address, phone]) => entry({
  id: `me-benefit-ofi-${key}`, name, state: "ME", city, address, phone,
  description: `Maine DHHS lists this district office for Office for Family Independence eligibility and application assistance, including MaineCare, TANF, and Food Supplement/SNAP. A statewide benefits line is available at 855-797-4357. Contact the office before traveling to verify walk-in service, hours, county coverage, accessible service options, and which documents to bring.`,
  url: "https://www.maine.gov/dhhs/about/contact/offices", source: meBenefitSource,
  serviceArea: city, resourceType: "public benefit eligibility and application office",
}));

const maFoodSource = "Massachusetts Department of Transitional Assistance — Find a local food bank";
const maFood = [
  ["gbfb", "The Greater Boston Food Bank", "Boston", "70 South Bay Avenue, Boston, MA 02118", "617-427-5200", "Eastern Massachusetts through partner agencies", "https://www.gbfb.org/need-food/"],
  ["worcester", "Worcester County Food Bank", "Shrewsbury", "474 Boston Turnpike, Shrewsbury, MA 01545", "508-842-3663", "Worcester County through partner agencies", "https://foodbank.org/find-food/"],
  ["western", "The Food Bank of Western Massachusetts", "Chicopee", "25 Carew Street, Chicopee, MA 01020", "413-247-9738", "Western Massachusetts through partner agencies and mobile distributions", "https://www.foodbankwma.org/get-help/food-finder/"],
  ["merrimack", "Merrimack Valley Food Bank", "Lowell", "1703 Middlesex Street, Lowell, MA 01851", "978-454-7272", "32 communities in Massachusetts and New Hampshire through partner agencies", "https://mvfb.org/contact/"],
];
export const NEXT_MA_FOOD = maFood.map(([key, name, city, address, phone, serviceArea, url]) => entry({
  id: `ma-food-bank-${key}`, name, state: "MA", city, address, phone, serviceArea,
  description: `${name} is listed in Massachusetts food-access guidance as a regional food-bank contact or food-navigation service. Food banks generally work through partner pantries and distributions; use the linked finder or call to locate the closest open site and confirm hours, service area, eligibility, and current distribution before traveling.`,
  url, source: maFoodSource, coverageScope: "regional network", resourceType: "regional food bank and food access navigator",
}));

const maHousingSource = "Massachusetts Executive Office of Housing and Livable Communities — Emergency Assistance family shelter offices";
const maEA = [
  ["boston", "Emergency Assistance family shelter intake — Boston", "Roxbury", "2201 Washington Street, Roxbury, MA 02119", "866-584-0653"],
  ["brockton", "Emergency Assistance family shelter intake — Brockton", "Brockton", "60 Main Street, Brockton, MA 02301", "866-584-0653"],
  ["chelsea", "Emergency Assistance family shelter intake — Chelsea", "Chelsea", "80 Everett Avenue, 3rd Floor, Chelsea, MA 02150", "866-584-0653"],
  ["hyannis", "Emergency Assistance family shelter intake — Hyannis", "Hyannis", "181 North Street, Hyannis, MA 02601", "866-584-0653"],
  ["lawrence", "Emergency Assistance family shelter intake — Lawrence", "Lawrence", "280 Merrimack Street, Lawrence, MA 01843", "866-584-0653"],
  ["lowell", "Emergency Assistance family shelter intake — Lowell", "Lowell", "131 Davidson Street, Lowell, MA 01852", "866-584-0653"],
  ["new-bedford", "Emergency Assistance family shelter intake — New Bedford", "New Bedford", "16 Kilburn Street, New Bedford, MA 02744", "866-584-0653"],
  ["salem", "Emergency Assistance family shelter intake — Salem", "Salem", "45 Congress Street, Suite 4120, Salem, MA 01970", "866-584-0653"],
  ["springfield", "Emergency Assistance family shelter intake — Springfield", "Springfield", "243 Cottage Street, Springfield, MA 01104", "866-584-0653"],
  ["worcester", "Emergency Assistance family shelter intake — Worcester", "Worcester", "50 Southwest Cutoff, Worcester, MA 01604", "866-584-0653"],
];
export const NEXT_MA_HOUSING = maEA.map(([key, name, city, address, phone]) => entry({
  id: `ma-ea-intake-${key}`, name, state: "MA", city, address, phone,
  description: `Massachusetts lists this area office as an in-person access route for Emergency Assistance (EA) family shelter applications. EA serves eligible families, not a general adult shelter. The office schedule varies by location; call 866-584-0653, Monday through Friday, 8 a.m.–5 p.m., before traveling to confirm opening days, intake instructions, required documents and alternatives.`,
  url: "https://www.mass.gov/how-to/review-eligibility-apply-for-emergency-assistance-ea-family-shelter", source: maHousingSource,
  coverageScope: "state program regional intake office", resourceType: "family emergency-shelter eligibility and application intake",
}));

const maBenefitSource = "Massachusetts Department of Transitional Assistance — local office directory";
const maOffices = [
  ["lawrence", "DTA Lawrence Transitional Assistance Office", "Lawrence", "https://www.mass.gov/locations/dta-lawrence-transitional-assistance-office"],
  ["worcester", "DTA Worcester Transitional Assistance Office", "Worcester", "https://www.mass.gov/locations/dta-worcester-transitional-assistance-office"],
  ["springfield", "DTA Springfield Center Transitional Assistance Office", "Springfield", "https://www.mass.gov/locations/dta-springfield-center-transitional-assistance-office"],
];
export const NEXT_MA_GRANTS = maOffices.map(([key, name, city, url]) => entry({
  id: `ma-benefits-office-${key}`, name, state: "MA", city,
  description: `${name} is listed by the Massachusetts Department of Transitional Assistance. DTA administers SNAP and cash assistance, and its offices can explain document submission, case questions, and available local support. Use the official locator or call the DTA Assistance Line at 877-382-2363 to confirm the current address, walk-in services, hours, and city catchment before visiting.`,
  url, source: maBenefitSource,
  serviceArea: city, coverageScope: "city and surrounding communities", resourceType: "SNAP and economic assistance office",
}));

const moHousingSource = "Missouri Department of Mental Health and Missouri Continuum of Care coordinated-entry resources";
const moHousing = [
  ["one-door-springfield", "One Door at New Day — housing coordinated entry", "Springfield", "809 N Campbell Avenue, Springfield, MO 65802", "417-225-7499", "Greene, Christian and Webster counties"],
  ["joplin-housing-connect", "Joplin Housing Connect — coordinated-entry assessment", "Joplin", "302 S Joplin Avenue, Joplin, MO 64802", "417-781-0352", "Jasper and Newton counties"],
  ["hillcrest-liberty", "Hillcrest Transitional Housing — coordinated-entry assessment", "Liberty", "2050 Plumber's Way, Liberty, MO 64068", "816-866-6119", "Kansas City region; call to confirm geographic eligibility"],
  ["metro-lutheran", "Metro Lutheran Ministry — regional coordinated entry", "Kansas City", "3031 Holmes, Kansas City, MO 64109", "816-285-3129", "Northwest Missouri Balance of State region; verify county list on linked page"],
  ["st-joseph-catholic-charities", "Catholic Charities — St. Joseph housing assessment access", "St. Joseph", "1123 S 10th Street, St. Joseph, MO 64503", "816-232-2885", "St. Joseph region; appointment required per the published CoC directory"],
];
export const NEXT_MO_HOUSING = moHousing.map(([key, name, city, address, phone, serviceArea]) => entry({
  id: `mo-housing-ce-${key}`, name, state: "MO", city, address, phone, serviceArea,
  description: `${name} is identified in Missouri's coordinated-entry resources as a housing assessment or central access route. Published service-area and appointment details vary by provider and the statewide directory is dated March 2025; call to confirm the correct current access point, eligibility, intake hours, and county coverage. Assessment or referral does not guarantee a bed or housing placement.`,
  url: "https://www.endhomelessnessmo.org/_files/ugd/86919b_7e290d9ffc7c4054a45aaac95c2a73b6.pdf", source: moHousingSource,
  coverageScope: "regional coordinated-entry access", resourceType: "homelessness assessment and housing referral",
}));

const moBenefitsSource = "Missouri Department of Social Services Find an Office map and Family Support Division";
const moOffices = [
  ["osceola", "Osceola Family Support Division Resource Center", "Osceola", "230 Business Highway 13, Osceola, MO 64776"],
  ["grant-city", "Grant City Family Support Division Resource Center", "Grant City", "9 West 3rd Street, Grant City, MO 64456"],
  ["warrenton", "Warrenton Family Support Division Resource Center", "Warrenton", "513 West Booneslick Road, Warrenton, MO 63383"],
  ["kirksville", "Kirksville Family Support Division Resource Center", "Kirksville", "2814 S Baltimore Street, Suite 1, Kirksville, MO 63501"],
  ["lamar", "Lamar Family Support Division Resource Center", "Lamar", "501 W 13th Street, Suite A, Lamar, MO 64759"],
  ["st-louis-jennings", "Jennings Family Support Division Resource Center", "St. Louis", "8501 Lucas and Hunt Road, St. Louis, MO 63136"],
];
export const NEXT_MO_GRANTS = moOffices.map(([key, name, city, address]) => entry({
  id: `mo-benefits-fsd-${key}`, name, state: "MO", city, address, phone: "855-373-4636",
  description: `Missouri DSS lists this Family Support Division Resource Center. FSD handles public-benefit applications and eligibility, including SNAP, Temporary Assistance, and MO HealthNet. DSS lists 855-373-4636 for FSD assistance and directs visitors to its map for current hours; check before traveling and ask what documents are needed.`,
  url: "https://dss.mo.gov/dss-map", source: moBenefitsSource, serviceArea: city,
  resourceType: "public-benefit eligibility and application office",
}));
