// Kansas directory batch reviewed against KDADS/ACMHCK, Kansas DCF, HUD,
// Feeding America, and Kansas Statewide Homeless Coalition sources on
// 2026-10-25. Source review does not mean phone confirmation or current capacity.
const reviewed = (record) => ({ ...record, state: "KS", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });

const directoryUrl = "https://acmhck.org/wp-content/uploads/2026/06/CMHC-List-Current-with-Public-Email-PDF-Version-6-4-2026.pdf";
const centerSource = "Association of Community Mental Health Centers of Kansas, current CMHC directory (June 2026)";
const centers = [
  ["astra", "Astra Mental Health & Recovery", "Topeka", "325 SW Frazier, Topeka, KS 66606", "785-215-8888", "785-234-3300", "Astra CMHC area"],
  ["crosswinds", "CrossWinds Counseling & Wellness", "Emporia", "1519 Merchant St, Emporia, KS 66801", "620-343-2211", "620-343-2211", "CrossWinds CMHC area"],
  ["johnson-county", "Johnson County Mental Health Center", "Mission", "6000 Lamar, Suite 130, Mission, KS 66202", "913-715-5000", "913-268-0156", "Johnson County"],
  ["bert-nash", "Bert Nash Community Mental Health Center", "Lawrence", "200 Maine, Suite A, Lawrence, KS 66044", "785-843-0264", "785-843-9192", "Douglas County"],
  ["elizabeth-layton", "Elizabeth Layton Center", "Ottawa", "2537 Eisenhower Rd, Ottawa, KS 66067", "785-242-3780", "800-241-1266", "Franklin and Miami county area"],
  ["kanza", "Kanza Mental Health & Guidance Center", "Hiawatha", "909 S 2nd St, Hiawatha, KS 66434", "785-742-7113", "785-742-3666", "Northeast Kansas"],
  ["central-kansas", "Central Kansas Mental Health Center", "Salina", "809 Elmhurst Blvd, Salina, KS 67401", "785-823-6322", "785-823-6322", "Central Kansas"],
  ["four-county", "Four County Mental Health Center", "Independence", "3354 Hwy 160, Independence, KS 67301", "620-331-1748", "800-499-1748", "Southeast Kansas"],
  ["labette", "Labette Center for Mental Health Services", "Parsons", "1730 Belmont Ave, Parsons, KS 67357", "620-421-3770", "800-303-3770", "Labette County"],
  ["comcare", "COMCARE of Sedgwick County", "Wichita", "271 W 3rd St N, Suite 600, Wichita, KS 67202", "316-660-7665", "316-660-7500", "Sedgwick County"],
  ["high-plains", "High Plains Mental Health Center", "Hays", "208 E 7th St, Hays, KS 67601", "785-628-2871", "800-432-0333", "Northwest Kansas"],
  ["pawnee", "Pawnee Mental Health Services", "Manhattan", "2001 Claflin Rd, Manhattan, KS 66502", "785-587-4300", "800-609-2002", "North Central Kansas"],
  ["compass", "Compass Behavioral Health", "Garden City", "804 E Fulton St, Garden City, KS 67846", "620-260-6679", "620-276-7689", "Southwest Kansas"],
  ["horizons", "Horizons Mental Health Center", "Hutchinson", "1600 N Lorraine St, Suite 202, Hutchinson, KS 67501", "620-663-7595", "800-794-0163", "South Central Kansas"],
  ["prairie-view", "Prairie View", "Newton", "1901 E 1st St, Newton, KS 67114", "316-284-6310", "800-992-6292", "Central Kansas"],
  ["crawford", "Crawford County Mental Health Center", "Pittsburg", "911 E Centennial Dr, Pittsburg, KS 66762", "620-231-5130", "620-232-7238", "Crawford County"],
  ["iroquois", "Iroquois Center for Human Development", "Greensburg", "610 E Grant Ave, Greensburg, KS 67054", "620-723-2272", "888-877-0375", "Southwest Kansas"],
  ["south-central", "South Central Mental Health Counseling Center", "Augusta", "520 E Augusta Ave, Augusta, KS 67010", "316-775-5491", "866-660-3300", "Butler County"],
  ["southeast", "Southeast Kansas Mental Health Center", "Iola", "304 Jefferson Ave, Iola, KS 66749", "620-365-8641", "866-973-2241", "Southeast Kansas"],
  ["sumner", "Sumner Mental Health Center", "Wellington", "1601 W 16th St, Wellington, KS 67152", "620-326-7448", "800-369-8222", "Sumner County"],
  ["wyandot", "Wyandot Behavioral Health Network", "Kansas City", "757 Armstrong Ave, Kansas City, KS 66117", "913-328-4600", "913-788-4200", "Wyandotte County"],
  ["southwest-guidance", "Southwest Guidance Center", "Liberal", "333 W 15th St, Liberal, KS 67905", "620-624-8171", "620-624-8171", "Southwest Kansas"],
  ["center-counseling-consultation", "The Center for Counseling and Consultation", "Great Bend", "5815 Broadway Ave, Great Bend, KS 67530", "620-792-2544", "800-875-2544", "Central Kansas"],
  ["spring-river", "Spring River Mental Health & Wellness", "Riverton", "6610 SE Quakervale Rd, Riverton, KS 66770", "620-848-2300", "866-634-2301", "Southeast Kansas"],
  ["guidance-center", "The Guidance Center", "Leavenworth", "500 Limit St, Leavenworth, KS 66048", "913-682-5118", "913-416-4497", "Northeast Kansas"],
];

export const KANSAS_TREATMENT = centers.map(([key, name, city, address, phone, crisisPhone, serviceArea]) => statewide({
  id: `ks-treatment-${key}`, name, city, address, phone,
  description: `Kansas designates this Community Mental Health Center as part of its public behavioral-health safety net. Contact it to request a mental-health or substance-use assessment and ask about treatment options, insurance or fees, local access points, and intake. ${serviceArea} service area; confirm the appropriate location before traveling.`,
  link: directoryUrl, source: centerSource, locationLine: `${city}, Kansas · ${serviceArea} service area`,
}));

const sudDirectoryUrl = "https://www.dccca.org/kansas-sud-resources/";
const sudSource = "DCCCA Kansas Substance Use Disorder Resource Toolkit (last updated May 15, 2026)";
const sudSites = [
  ["smoky-hills", "Smoky Hills Foundation for Chemical Dependency", "Hays", "2714 Plaza Avenue, Hays, KS 67601", "785-625-5521", "MAT and non-MAT treatment; Medicaid and SAMHSA funding listed"],
  ["heart-of-kansas", "Heart of Kansas Family Healthcare", "Great Bend", "1905 19th St, Great Bend, KS 67530", "316-792-5700", "Medication treatment including buprenorphine; Medicaid, Medicare, commercial insurance, and self-pay listed"],
  ["saint-francis-great-bend", "Saint Francis Community Services — Great Bend", "Great Bend", "1508 Main Street, Great Bend, KS 67530", "785-825-0541", "Non-MAT treatment; ITU funds, Medicare, Medicaid, and TRICARE listed"],
  ["seventh-direction", "Seventh Direction", "El Dorado", "226 W Central Avenue, Suite 200, El Dorado, KS 67042", "316-558-3066", "Non-MAT treatment; Medicaid and SAMHSA funding listed"],
  ["south-central-andover", "South Central Mental Health Counseling Center — Andover", "Andover", "221 E King St, Andover, KS 67002", "316-775-5491", "MAT and non-MAT treatment; Medicare, Medicaid, and TRICARE listed"],
  ["grit-grace", "Grit and Grace Counseling", "Coldwater", "400 E Walnut, Coldwater, KS 67029", "785-580-8698", "Non-MAT treatment; Medicare and TRICARE listed"],
  ["preferred-family-winfield", "Preferred Family Healthcare — Winfield", "Winfield", "2720 E 12th Ave, Winfield, KS 67156", "620-221-6252", "MAT and non-MAT treatment; Medicare, Medicaid, and TRICARE listed"],
  ["mirror-medicine-lodge", "Mirror — Medicine Lodge Outpatient", "Medicine Lodge", "604 N Walnut St, Medicine Lodge, KS 67104", "620-886-5381", "Non-MAT treatment; Medicaid and federal/SAMHSA funding listed"],
  ["mirror-newton", "Mirror — Newton Residential Recovery Services", "Newton", "710 E 12th Street, Newton, KS 67114", "316-283-7829", "Residential recovery services; MAT and non-MAT options; Medicaid and SAMHSA funding listed"],
  ["health-ministries-newton", "Health Ministries Clinic — Newton", "Newton", "720 Medical Center Dr, Newton, KS 67114", "316-283-6103", "Medication treatment including buprenorphine; private insurance, Medicaid/KanCare, Medicare, and self-pay listed"],
  ["valley-hope-moundridge", "Valley Hope — Moundridge", "Moundridge", "200 South Avenue B, Moundridge, KS 67107", "785-877-5111", "Medically monitored detox and MAT/non-MAT options; ITU funds, Medicaid, and TRICARE listed"],
  ["ckf-mcpherson", "CKF Addiction Treatment — McPherson", "McPherson", "208 S Main, McPherson, KS 67460", "620-241-5550", "Outpatient, peer support, walk-in assessment, MAT, and telehealth listed; Medicare, Medicaid, and SAMHSA funding listed"],
  ["dccca-pratt", "DCCCA — Pratt", "Pratt", "105 W 4th St, Pratt, KS 67124", "620-672-7546", "Non-MAT treatment; Medicaid and SAMHSA funding listed"],
  ["pratt-community-health", "Pratt Community Health Clinic", "Pratt", "206 S Main St, Pratt, KS 67124", "620-388-0462", "Medication treatment including buprenorphine; Medicaid/KanCare, Medicare, commercial insurance, and self-pay listed"],
  ["sack-hutchinson", "Substance Abuse Center of Kansas — Crossover Recovery Center", "Hutchinson", "400 W 2nd Street, Suite A, Hutchinson, KS 67501", "620-669-9024", "Non-MAT treatment; Medicaid and SAMHSA funding listed; toolkit gives extension 4001"],
  ["dccca-first-step", "DCCCA First Step at Lake View", "Lawrence", "3015 W 31st Street, Lawrence, KS 66047", "785-843-9262", "Women's residential program with on-site childcare listed; non-MAT; ITU funds, Medicaid, and TRICARE listed"],
  ["dccca-lawrence-outpatient", "DCCCA Outpatient Service Center", "Lawrence", "1739 E 23rd St, Lawrence, KS 66046", "785-830-8238", "Non-MAT outpatient treatment; ITU funds, Medicaid, and TRICARE listed"],
  ["bhg-lawrence", "Behavioral Health Group — Lawrence", "Lawrence", "1910 Haskell Avenue, Suite 9, Lawrence, KS 66046", "785-856-4357", "MAT and non-MAT treatment; Medicare, Medicaid, and TRICARE listed"],
  ["heartland-lawrence", "Heartland Community Health Center — Lawrence", "Lawrence", "1312 W 6th St, Lawrence, KS 66046", "785-841-7297", "Medication treatment including buprenorphine; Medicaid, Medicare, commercial insurance, and TRICARE listed"],
  ["avalon-lawrence", "Avalon Wellness and Recovery", "Lawrence", "801 Iowa St, Lawrence, KS 66049", "785-340-0300", "MAT and non-MAT treatment; TRICARE listed"],
  ["therapy-services-emporia", "Therapy Services — Emporia", "Emporia", "1200 Graphic Arts Rd, Suite 100, Emporia, KS 66801", "620-208-6480", "MAT and non-MAT treatment; Medicaid and SAMHSA funding listed"],
  ["valley-hope-atchison", "Valley Hope — Atchison", "Atchison", "1816 N 2nd St, Atchison, KS 66002", "913-246-5250", "MAT and non-MAT treatment; TRICARE listed"],
  ["cfcc-atchison", "CFCC & Associates — Atchison", "Atchison", "501 Kansas Ave, Atchison, KS 66002", "785-272-0778", "Non-MAT treatment; employee assistance programs listed"],
  ["mirror-shawnee", "Mirror — Shawnee Residential Facility", "Shawnee", "6221 Richards Drive, Shawnee, KS 66216", "913-248-1943", "Residential treatment with MAT and non-MAT options; Medicaid and SAMHSA funding listed"],
  ["kids-tlc-olathe", "KidsTLC — Olathe", "Olathe", "480 S Rogers Rd, Olathe, KS 66062", "913-764-2887", "Youth-focused non-MAT treatment; Medicaid and TRICARE listed"],
  ["connecting-pointe-olathe", "A Connecting Pointe — Olathe", "Olathe", "302 S Clairborne Road, Suite B, Olathe, KS 66062", "913-397-0300", "Non-MAT intensive outpatient treatment; virtual meetings, Medicaid, and SAMHSA funding listed"],
  ["applecore-olathe", "AppleCore Treatment Center — Olathe", "Olathe", "226 S Kansas Ave, Olathe, KS 66061", "913-706-4132", "MAT and non-MAT treatment; cash or self-payment listed"],
  ["hradac-mission", "Heartland Regional Alcohol and Drug Assessment Center", "Mission", "5500 Buena Vista St, Mission, KS 66205", "913-789-0951", "Non-MAT assessment and treatment; Medicaid and SAMHSA funding listed"],
  ["sims-kemper-topeka", "Sims-Kemper Clinical Counseling & Recovery Services", "Topeka", "1701 SW Medford Ave, Topeka, KS 66604", "785-233-0666", "MAT and non-MAT treatment; ITU funds, Medicaid, SAMHSA funding, and TRICARE listed"],
  ["mirror-topeka", "Mirror — Topeka Outpatient and Residential Facility", "Topeka", "2201 SE 25th Street, Topeka, KS 66605", "785-267-0561", "Outpatient and residential treatment with MAT and non-MAT options; Medicaid and SAMHSA funding listed"],
  ["new-dawn-topeka", "New Dawn Wellness and Recovery Center", "Topeka", "1221 SW 17th Street, Topeka, KS 66604", "785-266-0202", "MAT and non-MAT treatment; Medicare, Medicaid, SAMHSA funding, and TRICARE listed"],
  ["ku-strawberry-hill", "University of Kansas Health System — Strawberry Hill opioid treatment", "Kansas City", "901 N 5th St, Kansas City, KS 66101", "913-942-5100", "Medication treatment listed; Medicaid, Medicare, and TRICARE listed"],
];

export const KANSAS_SUD_TREATMENT = sudSites.map(([key, name, city, address, phone, details]) => local({
  id: `ks-sud-${key}`, name, city, address, phone,
  description: `DCCCA's Kansas county resource toolkit lists this location for substance-use treatment. ${details}. Call before traveling to confirm current intake, service fit, costs or coverage, and appointment availability; the directory was last updated May 15, 2026.`,
  link: sudDirectoryUrl, source: sudSource, locationLine: `${city}, Kansas · contact provider to confirm intake and coverage`,
}));

export const KANSAS_PEER = centers.map(([key, name, city, address, phone, crisisPhone, serviceArea]) => local({
  id: `ks-peer-${key}`, name: `${name} — peer and community support access`, city, address, phone,
  description: `KDADS states that Kansas CMHCs provide recovery rehabilitation that can include peer support, community psychiatric support, and case management. Contact this center to ask which peer-led groups or recovery supports are currently available in ${serviceArea}; schedules and access vary by location.`,
  link: "https://www.kdads.ks.gov/services-programs/behavioral-health/community-mental-health-centers",
  source: "Kansas Department for Aging and Disability Services, Community Mental Health Centers",
  locationLine: `${city}, Kansas · ask for current peer groups and local access`,
}));

const crisisSource = "Kansas KDADS, CMHC 24-hour crisis lines (regional contact list)";
export const KANSAS_CMH_CRISES = centers.map(([key, name, city, address, phone, crisisPhone, serviceArea]) => statewide({
  id: `ks-crisis-${key}`, name: `${name} — regional crisis line`, city, phone: crisisPhone,
  description: `Published crisis contact for this Kansas community mental health center and ${serviceArea}. Call for behavioral-health crisis support and regional mobile-crisis guidance. If there is immediate physical danger or urgent medical need, call 911.`,
  link: "https://www.kdads.ks.gov/services-programs/behavioral-health/crisis-and-disaster-information/cmhc-24-hour-crisis-lines",
  source: crisisSource, locationLine: `${serviceArea} · call for crisis support`,
}));

const foodSource = "Kansas DCF TEFAP and Feeding America Kansas food-bank network";
export const KANSAS_FOOD = [
  statewide({ id: "ks-food-kansas-food-bank", name: "Kansas Food Bank — find a local food distribution site", city: "Wichita", address: "1919 E Douglas Ave, Wichita, KS 67211", phone: "316-265-3663", description: "Kansas DCF lists Kansas Food Bank as a TEFAP distribution network partner. Contact the network or use its food finder to identify a pantry serving your county; providers set their own distribution days, eligibility process, and availability.", link: "https://kansasfoodbank.org/find-food/", source: foodSource, locationLine: "Wichita-based network · serves published Kansas counties" }),
  statewide({ id: "ks-food-harvesters", name: "Harvesters — Kansas and Kansas City area food finder", city: "Kansas City", address: "3801 Topping Ave, Kansas City, MO 64129", phone: "816-929-3000", description: "Kansas DCF lists Harvesters among TEFAP networks; its office is in Missouri and its service area includes specified northeast Kansas counties. Use its locator or call to find the partner serving your county. This is a regional network contact, not a Kansas walk-in pantry.", link: "https://www.harvesters.org/food-assistance/get-food", source: foodSource, locationLine: "Regional network · verify Kansas county coverage before relying on this listing" }),
  statewide({ id: "ks-food-second-harvest", name: "Second Harvest Community Food Bank — northeast Kansas county access", city: "St Joseph", address: "915 Douglas St, St Joseph, MO 64505", phone: "816-364-3663", description: "Kansas DCF lists Second Harvest Community Food Bank for Atchison, Doniphan, and Brown counties. Contact the network to locate its currently participating distribution partner; the main office is in Missouri, not a Kansas walk-in pantry.", link: "https://www.shcfb.org/food-assistance/", source: foodSource, locationLine: "Atchison, Doniphan, and Brown counties · call for a local distribution partner" }),
  statewide({ id: "ks-food-tefap", name: "Kansas TEFAP — USDA emergency food distribution", city: "Topeka", phone: "888-369-4777", description: "Kansas DCF's Emergency Food Assistance Program connects eligible Kansas residents to participating local distribution sites. Sites set their own schedule; residents should seek help in their home county and call the listed food bank to confirm the nearest open site and current requirements.", link: "https://www.dcf.ks.gov/services/ees/Pages/USDA-Commodity-Programs/Emergency-Food-Assistance-Program-(TEFAP).aspx", source: "Kansas Department for Children and Families, TEFAP", locationLine: "Kansas statewide · use the official distribution-site list" }),
  statewide({ id: "ks-food-kansas-food-source", name: "Kansas Food Source — county food pantry and meal finder", description: "Search the county map for current food pantries and meal resources. The finder is sponsored by Kansas Food Bank, Harvesters Community Food Network, and Second Harvest Community Food Bank. Open the selected provider record and contact that site directly to confirm hours, eligibility, and whether food is available today.", link: "https://kansasfoodsource.org/", source: "Kansas Food Bank; Kansas DCF identifies Kansas Food Source as the statewide county food finder", locationLine: "Kansas statewide · choose a county to see local food resources" }),
];

export const KANSAS_HOUSING = [
  statewide({ id: "ks-housing-211", name: "Kansas 211 — local housing, shelter, and basic-needs navigation", city: "Topeka", phone: "211", description: "Call 211 and ask for the local homeless-services or coordinated-entry access point for your county. HUD advises callers to use the local 211 office if the short code does not connect. This is a referral route, not a shelter bed or housing placement guarantee.", link: "https://211kansas.org/", source: "HUD Kansas homelessness guidance and 211 Kansas", locationLine: "Kansas statewide · tell the navigator your current county" }),
  statewide({ id: "ks-housing-kshc-ces", name: "Kansas Statewide Homeless Coalition — coordinated-entry help request", city: "Lawrence", address: "2001 Haskell Ave, Lawrence, KS 66046", phone: "785-764-9950", description: "KSHC coordinates assessment and referral for housing programs across 101 Kansas counties. Submit its help request or contact the coalition to connect with the regional assessment process. It excludes Sedgwick, Shawnee, Johnson, and Wyandotte counties and does not directly house people or guarantee a referral.", link: "https://kshomeless.com/about-ks-bos-coc/ces/ces-access-points/", source: "Kansas Statewide Homeless Coalition, coordinated-entry information", locationLine: "101 Kansas counties; county-specific exclusions apply" }),
  statewide({ id: "ks-housing-wichita-211", name: "Wichita and Sedgwick County — housing and shelter access", city: "Wichita", phone: "211", description: "HUD directs people in Wichita and Sedgwick County to United Way of the Plains or 211 for local homelessness resources. Ask for shelter availability and the county's coordinated-entry contact; placement depends on local capacity.", link: "https://www.unitedwayplains.org/211/", source: "HUD Kansas homelessness guidance", locationLine: "Sedgwick County · contact local access for current openings" }),
  statewide({ id: "ks-housing-topeka", name: "Topeka and Shawnee County — coordinated-entry access", city: "Topeka", phone: "211", description: "Shawnee County is outside the Kansas Statewide Homeless Coalition assessment area. Contact 211 or the Shawnee County Continuum of Care access point for local shelter, prevention, and housing assessment options; current openings and eligibility vary.", link: "https://kshomeless.com/about-ks-bos-coc/ces/ces-access-points/", source: "Kansas Statewide Homeless Coalition, coordinated-entry county boundaries", locationLine: "Shawnee County · use the county's local access point" }),
  statewide({ id: "ks-housing-johnson", name: "Johnson County — coordinated-entry access", city: "Mission", phone: "913-715-5000", description: "Johnson County uses a separate coordinated-entry system. Contact Johnson County Human Services to request the current local homelessness assessment and shelter route; an assessment does not guarantee housing placement.", link: "https://www.jocogov.org/department/human-services/housing-and-homelessness", source: "Kansas Statewide Homeless Coalition and Johnson County Human Services", locationLine: "Johnson County · county-specific access applies" }),
  statewide({ id: "ks-housing-kck", name: "Wyandotte County — homelessness and shelter access", city: "Kansas City", phone: "211", description: "Wyandotte County is outside the statewide coalition's coordinated-entry area. Call 211 or ask for the Wyandotte County access point to connect with current shelter and housing resources. Confirm eligibility and availability with the provider.", link: "https://kshomeless.com/help-request/", source: "Kansas Statewide Homeless Coalition, coordinated-entry county boundaries", locationLine: "Wyandotte County · call for local access" }),
];

export const KANSAS_BENEFITS = [
  statewide({ id: "ks-benefits-dcf", name: "Kansas DCF — benefits applications and case help", city: "Topeka", phone: "888-369-4777", description: "Kansas DCF's benefits assistance line helps with applications and questions about food, cash, and child-care assistance. Ask which program fits your household and what documents are needed; eligibility is determined through application review.", link: "https://cssp.kees.ks.gov/apspssp/sspNonMed.portal", source: "Kansas Department for Children and Families, apply for services", locationLine: "Kansas statewide · program eligibility applies" }),
  statewide({ id: "ks-benefits-snap", name: "Kansas SNAP — food benefits application", city: "Topeka", phone: "888-369-4777", description: "Apply for food assistance through the Kansas Benefits portal or call DCF for application help and case questions. Benefits depend on household eligibility and verification.", link: "https://www.dcf.ks.gov/services/ees/Pages/Food/FoodAssistance.aspx", source: "Kansas DCF, Food Assistance", locationLine: "Kansas statewide · application and case support" }),
  statewide({ id: "ks-benefits-cash", name: "Kansas cash assistance — Temporary Assistance for Needy Families", city: "Topeka", phone: "888-369-4777", description: "Kansas DCF provides application and case assistance for cash support programs for eligible families. Ask about current program rules, required documents, work-related requirements, and application status.", link: "https://www.dcf.ks.gov/services/ees/Pages/Cash/CashAssistance.aspx", source: "Kansas DCF, cash assistance", locationLine: "Kansas statewide · eligibility and program rules apply" }),
  statewide({ id: "ks-benefits-liheap", name: "Kansas Energy Assistance Program — utility bill support", city: "Topeka", phone: "800-432-0043", description: "Kansas' Low Income Energy Assistance Program helps qualifying households with heating costs. Contact DCF or the local community action agency to check application dates, eligibility, and required documents.", link: "https://www.dcf.ks.gov/services/ees/Pages/Energy/EnergyAssistance.aspx", source: "Kansas DCF and HUD Kansas resource guidance", locationLine: "Kansas statewide · seasonal application rules apply" }),
  statewide({ id: "ks-benefits-kacap", name: "Kansas Association of Community Action Programs — local agency finder", city: "Topeka", description: "Find the community action agency serving your county for housing, utilities, transportation, employment, nutrition, and other basic-needs support. Programs, eligibility, and open applications differ by agency.", link: "https://kacap.org/agency-directory/", source: "HUD Kansas community action agency directory", locationLine: "Kansas statewide · select your local county agency" }),
  statewide({ id: "ks-benefits-211", name: "211 Kansas — benefits, food, housing, and utility referrals", city: "Topeka", phone: "211", description: "Call or search 211 Kansas for local benefits navigators and community programs. Tell the navigator your county and the type of assistance needed; referrals do not guarantee eligibility or funding.", link: "https://211kansas.org/", source: "211 Kansas", locationLine: "Kansas statewide · local referral navigation" }),
];

export const KANSAS_URGENT = [
  statewide({ id: "ks-988", name: "988 Suicide & Crisis Lifeline", city: "Topeka", phone: "988", description: "Call or text 988 for immediate mental-health or substance-use crisis support. If there is immediate physical danger or urgent medical need, call 911.", link: "https://www.kdads.ks.gov/services-programs/behavioral-health/988-suicide-crisis-lifeline", source: "Kansas KDADS and 988 Lifeline", locationLine: "Kansas statewide · call or text 24/7" }),
  statewide({ id: "ks-911", name: "Emergency services — immediate danger", city: "Topeka", phone: "911", description: "Call 911 for immediate danger, serious injury, or urgent medical need. Share the exact location and immediate safety concern with the dispatcher.", link: "https://www.911.gov/calling-911/", source: "U.S. National 911 Program", locationLine: "Kansas statewide · emergency response" }),
  statewide({ id: "ks-family-mobile-crisis", name: "Kansas Family Mobile Crisis Helpline — children and youth", city: "Topeka", phone: "833-441-2240", description: "Kansas DCF lists this helpline for a mental-health crisis involving a Kansas child or young person age 20 or younger. Call for crisis support and next steps; use 911 for immediate danger.", link: "https://www.dcf.ks.gov/services/Pages/Family-Mobile-Crisis-Helpline.aspx", source: "Kansas DCF, Family Mobile Crisis Helpline", locationLine: "Kansas statewide · youth through age 20" }),
];

export const KANSAS_DIRECTORY_COUNT = KANSAS_TREATMENT.length + KANSAS_SUD_TREATMENT.length + KANSAS_PEER.length + KANSAS_CMH_CRISES.length + KANSAS_FOOD.length + KANSAS_HOUSING.length + KANSAS_BENEFITS.length + KANSAS_URGENT.length;
