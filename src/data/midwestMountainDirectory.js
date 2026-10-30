// Source-reviewed local access records for the next five-state US directory batch.
// These additions are intentionally category-specific; no state is represented as complete.
// Reviewed 2026-10-30. Phone confirmation and exhaustive coverage are not claimed.
const record = ({ id, name, state, city, description, phone, address, url, source, serviceArea, resourceType, locationLine, coverageScope }) => ({
  id, name, state, city, description, phone, address, link: url, source, serviceArea,
  coverageScope: coverageScope || (serviceArea && serviceArea !== city ? "region" : "city"),
  resourceType, locationLine, verified: true, sourceReviewed: true,
  phoneConfirmed: false, exhaustiveCoverage: false, checkedAt: "2026-10-30",
});

const MO_FOOD_SOURCE = "Missouri Department of Social Services Find an Office map";
const moFood = (id, name, city, address, phone) => record({
  id: `mo-food-${id}`, name, state: "MO", city, address, phone,
  description: `Missouri DSS lists this food pantry in its public Find an Office map. Contact the pantry before traveling to confirm distribution dates, intake requirements, service area, and current availability.`,
  url: "https://dss.mo.gov/dss-map", source: MO_FOOD_SOURCE, serviceArea: city,
  resourceType: "food pantry", locationLine: `${city}, Missouri · call to confirm distribution details`,
});

export const MISSOURI_FOOD = [
  moFood("red-star-cape-girardeau", "Red Star Pantry", "Cape Girardeau", "1302 North Main, Cape Girardeau, MO 63701", "573-200-1565"),
  moFood("mountain-grove-love-center", "Mountain Grove Love Center", "Mountain Grove", "117 East 2nd Street, Mountain Grove, MO 65711", "417-926-5788"),
  moFood("carter-county-food-pantry", "Carter County Food Pantry", "Van Buren", "14 Ball Park Road, Van Buren, MO 63965", "573-323-8377"),
  moFood("st-anthony-food-pantry", "St Anthony Food Pantry", "St. Louis", "3140 Meramec Street, St. Louis, MO 63118", "314-352-1460"),
  moFood("feed-my-people-high-ridge", "Feed My People — High Ridge", "High Ridge", "3295 Ottomeyer, High Ridge, MO 63049", "636-677-9885"),
  moFood("prairie-chapel-umc", "Prairie Chapel United Methodist food pantry", "Urbana", "US Highway 65, Urbana, MO 65767", "417-993-4403"),
  moFood("community-food-pantry-butler", "Community Food Pantry of Butler", "Butler", "709 W Ohio, Butler, MO 64730", "660-679-3951"),
  moFood("central-community-umc-shell-knob", "Central Community United Methodist food pantry", "Shell Knob", "25682 Highway YY, Shell Knob, MO 65747", "417-858-6707"),
  moFood("st-louis-dream-center", "St. Louis Dream Center food pantry", "St. Louis", "4324 Margaretta Avenue, St. Louis, MO 63115", "314-381-0700"),
  moFood("guadalupe-center-kc", "Guadalupe Center food assistance", "Kansas City", "2600 Belleview, Kansas City, MO 64108", "816-561-6885"),
];

const MT_HOUSING_SOURCE = "Montana DPHHS Emergency Solutions Grant service-provider directory";
const mtHousing = (id, name, city, address, phone, counties, url) => record({
  id: `mt-housing-${id}`, name, state: "MT", city, address, phone,
  description: `Montana DPHHS lists this homeless-service organization as an Emergency Solutions Grant access provider serving ${counties}. Contact the organization to ask which shelter, prevention, or rehousing services are currently available, eligibility, and how to enter the local system. A listing does not confirm an open bed or funding.`,
  url, source: MT_HOUSING_SOURCE, serviceArea: counties, resourceType: "homelessness and housing assistance access",
  locationLine: `${city} · serves ${counties} · call to confirm current intake`,
});

export const MONTANA_HOUSING = [
  mtHousing("opportunities-great-falls", "Opportunities, Inc. — housing assistance access", "Great Falls", "905 1st Ave North, Great Falls, MT 59403", "406-761-0310", "Cascade, Chouteau, Glacier, Pondera, Teton, Toole, Blaine, Hill, and Liberty counties", "https://www.opportunities-inc.com/"),
  mtHousing("hrdc6-lewistown", "District 6 Human Resource Development Council", "Lewistown", "300 First Avenue North, Room 203, Lewistown, MT 59457", "406-535-7488", "Fergus, Golden Valley, Judith Basin, Musselshell, Petroleum, and Wheatland counties", "https://www.hrdc6.org/"),
  mtHousing("hrdc7-billings", "District 7 Human Resource Development Council", "Billings", "7 North 31st Street, Billings, MT 59103", "406-247-4732", "Big Horn, Carbon, Stillwater, Sweet Grass, and Yellowstone counties", "https://www.hrdc7.org/"),
  mtHousing("rmdc-helena", "Rocky Mountain Development Council", "Helena", "201 S. Last Chance Gulch, Helena, MT 59601", "406-447-1680", "Broadwater, Jefferson, and Lewis and Clark counties", "https://www.rmdc.net/"),
  mtHousing("hrdc9-bozeman", "District 9 Human Resource Development Council", "Bozeman", "32 South Tracy, Bozeman, MT 59715", "406-587-4486", "Gallatin, Meagher, and Park counties", "https://www.thehrdc.org/"),
  mtHousing("capnw-kalispell", "Community Action Partnership of Northwest Montana", "Kalispell", "1820 US Hwy 93 S, Kalispell, MT 59901", "406-752-6565", "Flathead, Lake, Lincoln, and Sanders counties", "https://www.capnm.net/"),
  mtHousing("districtxi-missoula", "District XI Human Resource Council", "Missoula", "1801 South Higgins, Missoula, MT 59801", "406-728-3710", "Mineral, Missoula, and Ravalli counties", "https://www.districtxi.org/"),
  mtHousing("action-inc-butte", "Action, Inc.", "Butte", "700 Casey Street, Butte, MT 59702", "406-496-4975", "Beaverhead, Deer Lodge, Granite, Madison, Powell, and Silver Bow counties", "https://www.butteassistanceprograms.org/"),
];

const MT_FOOD_SOURCE = "Montana DPHHS Emergency Food Assistance Program contracted recipient-agency roster";
const mtFood = (id, name, city, address, phone) => record({
  id: `mt-food-${id}`, name, state: "MT", city, address, phone,
  description: `Montana DPHHS lists this organization as a contracted Emergency Food Assistance Program recipient agency. Call to confirm its current distribution schedule, eligibility, and intake before traveling; the agency may not be a walk-in pantry every day.`,
  url: "https://prod-dphhs.mt.gov/hcsd/TheEmergencyFoodAssistanceProgram", source: MT_FOOD_SOURCE,
  serviceArea: city, resourceType: "emergency food assistance agency", locationLine: `${city} · DPHHS-listed food assistance agency · call to confirm access`,
});

export const MONTANA_FOOD = [
  mtFood("community-kitchen-kalispell", "Community Kitchen Kalispell", "Kalispell", "246 2nd Ave E, Kalispell, MT 59901", "406-300-2362"),
  mtFood("gods-love-helena", "God's Love", "Helena", "533 N Last Chance Gulch, Helena, MT 59601", "406-442-7000"),
  mtFood("loaves-fishes-livingston", "Loaves & Fishes", "Livingston", "301 S Main St., Livingston, MT 59047", "406-222-4824"),
  mtFood("medicine-bear-browning", "Medicine Bear Shelter", "Browning", "201 2nd St. NW, Browning, MT 59417", "406-338-7842"),
  mtFood("plains-aog-shekinah", "Plains AOG Shekinah Kitchen", "Plains", "300 Clayton St., Plains, MT 59859", "406-726-3800"),
  mtFood("povarello-center-missoula", "Poverello Center", "Missoula", "1110 W. Broadway St., Missoula, MT 59802", "406-728-1809"),
  mtFood("safe-harbor-ronan", "Safe Harbor", "Ronan", "63506 US Highway 93, Ronan, MT 59864", "406-676-0800"),
  mtFood("salvation-army-kalispell", "Salvation Army — Kalispell", "Kalispell", "110 Bountiful Dr., Kalispell, MT 59901", "406-257-4357"),
  mtFood("montana-food-bank-network", "Montana Food Bank Network — statewide partner referrals", "Missoula", "5780 Alloy North, Missoula, MT 59808", "406-721-3825"),
];

const NE_HOUSING_SOURCE = "Nebraska DHHS Nebraska Homeless Assistance Program regional provider directory";
const neHousing = (id, name, city, phone, serviceArea, url) => record({
  id: `ne-housing-${id}`, name, state: "NE", city, phone,
  description: `Nebraska DHHS lists this provider in its regional homeless-services directory. The published provider table identifies ${serviceArea}; contact the provider to confirm current shelter or prevention intake, eligibility, and capacity. Coordinated-entry referrals may be required, and a listing does not promise a placement.`,
  url, source: NE_HOUSING_SOURCE, serviceArea, resourceType: "regional shelter and housing access",
  locationLine: `${city} · ${serviceArea} · contact for current intake and referral steps`,
});

export const NEBRASKA_HOUSING = [
  neHousing("doves-gering", "The DOVES Program", "Gering", "308-436-4357", "Panhandle region", "https://www.dovesprogram.com/"),
  neHousing("ncap-chadron", "Northwest Community Action Partnership", "Chadron", "308-432-3393", "Panhandle and Cherry County", "https://www.ncap.info/"),
  neHousing("capwn-gering", "Community Action Partnership of Western Nebraska", "Gering", "308-635-3089", "Western Nebraska", "https://capwn.org/"),
  neHousing("center-survivors-columbus", "Center for Survivors", "Columbus", "402-564-2155", "North Central Nebraska", "https://www.centerforsurvivors.org/"),
  neHousing("bright-horizons-oneill", "Bright Horizons", "O'Neill", "402-336-1774", "North Central Nebraska", "https://brighthorizonsne.org/"),
  neHousing("willow-rising-grand-island", "Willow Rising", "Grand Island", "308-382-8250", "North Central Nebraska", "https://www.willowrising.org/"),
  neHousing("central-ne-cap-loup-city", "Central Nebraska Community Action Partnership", "Loup City", "308-745-0780", "North Central Nebraska", "https://centralnebraskacap.com/"),
  neHousing("hope-harbor-grand-island", "Hope Harbor", "Grand Island", "308-385-5190", "North Central Nebraska", "http://www.hopeharborgi.org/"),
  neHousing("raft-kearney", "Residential Assistance to Families in Transition", "Kearney", "308-865-1352", "Southwest Nebraska", "https://raftnebraska.org/"),
  neHousing("parent-child-lexington", "Parent-Child Center", "Lexington", "308-324-2336", "Southwest Nebraska", "https://www.parentchildcenterlex.com/"),
  neHousing("safe-center-kearney", "S.A.F.E. Center", "Kearney", "308-237-2599", "Southwest Nebraska", "https://safecenter.org/"),
  neHousing("connection-north-platte", "The Connection Homeless Shelter", "North Platte", "308-532-5050", "Southwest Nebraska", "https://theconnectionnp.net/"),
  neHousing("cap-midne-kearney", "Community Action Partnership of Mid-Nebraska", "Kearney", "308-865-5680", "Southwest Nebraska", "https://communityactionmidne.com/"),
  neHousing("cap-lancaster-lincoln", "Community Action Partnership of Lancaster & Saunders Counties", "Lincoln", "402-471-4515", "Lancaster and Saunders counties", "https://www.communityactionatwork.org/"),
  neHousing("encourage-hastings", "enCourage Advocacy Center", "Hastings", "402-463-5810", "Southeast Nebraska", "https://www.encouragecenter.org/"),
  neHousing("blue-valley-fairbury", "Blue Valley Community Action Partnership", "Fairbury", "402-729-2278", "Southeast Nebraska", "https://www.bvca.net/"),
  neHousing("senca-humboldt", "Southeast Nebraska Community Action Partnership", "Humboldt", "402-862-2411", "Southeast Nebraska", "https://www.senca.org/"),
  neHousing("hope-crisis-fairbury", "Hope Crisis Center", "Fairbury", "877-388-4673", "Southeast Nebraska", "https://hopecrisiscenter.org/"),
  neHousing("lifehouse-fremont", "Care Corps LifeHouse", "Fremont", "402-721-3125", "Northeast Nebraska", "https://lifehousene.org/"),
  neHousing("bridge-fremont", "The Bridge", "Fremont", "402-721-4340", "Northeast Nebraska", "https://bridgefromviolence.com/"),
  neHousing("bright-horizons-norfolk", "Bright Horizons", "Norfolk", "402-379-2026", "Northeast Nebraska", "https://brighthorizonsne.org/"),
  neHousing("nencap-pender", "Northeast Nebraska Community Action Partnership", "Pender", "402-385-6300", "Northeast Nebraska", "https://nencap.org/"),
  neHousing("haven-house-wayne", "Haven House", "Wayne", "402-375-5433", "Northeast Nebraska", "https://havenhousefsc.com/"),
  neHousing("centerpointe-lincoln", "CenterPointe, Inc.", "Lincoln", "402-475-8717", "Lincoln and Lancaster County", "https://www.centerpointe.org/"),
  neHousing("friendship-home-lincoln", "Friendship Home of Lincoln", "Lincoln", "402-437-9302", "Lincoln and Lancaster County", "https://friendshiphome.org/"),
  neHousing("family-service-lincoln", "Family Service Lincoln", "Lincoln", "402-441-7949", "Lincoln and Lancaster County", "https://familyservicelincoln.org/"),
  neHousing("matt-talbot-lincoln", "Matt Talbot Kitchen & Outreach", "Lincoln", "402-477-4116", "Lincoln and Lancaster County", "https://www.mtko.org/"),
  neHousing("siena-francis-omaha", "Siena Francis House", "Omaha", "402-341-1821", "Douglas and Sarpy counties", "https://sienafrancis.org/"),
  neHousing("stephen-center-omaha", "Stephen Center", "Omaha", "402-731-0238", "Omaha metro", "https://stephencenter.org/"),
  neHousing("salvation-army-omaha", "The Salvation Army of Omaha", "Omaha", "402-898-5900", "Omaha metro", "https://centralusa.salvationarmy.org/omaha/"),
  neHousing("heartland-omaha", "Heartland Family Service", "Omaha", "402-553-3000", "Omaha metro", "https://www.heartlandfamilyservice.org/"),
  neHousing("community-alliance-omaha", "Community Alliance", "Omaha", "402-341-5128", "Omaha metro", "https://community-alliance.org/"),
  neHousing("together-omaha", "Together", "Omaha", "402-345-8047", "Omaha metro", "https://togetheromaha.org/"),
  neHousing("yes-omaha", "Youth Emergency Services", "Omaha", "402-345-5187", "Omaha metro; youth and young adults", "https://www.yesomaha.org/"),
];

const NH_TREATMENT_SOURCE = "New Hampshire DHHS Community Mental Health Centers list and map";
const nhCenter = (id, name, city, address, phone, url) => record({
  id: `nh-treatment-${id}`, name: `${name} — community mental-health access`, state: "NH", city, address, phone,
  description: `New Hampshire DHHS identifies ${name} as the regional community mental-health center serving this area. Call its general intake line to ask about services, age eligibility, insurance or payment, referral requirements, and current appointment availability. The published contact is not an emergency response guarantee.`,
  url, source: NH_TREATMENT_SOURCE, serviceArea: city, resourceType: "community mental-health center intake",
  locationLine: `${city} region · general intake ${phone} · call to confirm fit and access`,
});

export const NEW_HAMPSHIRE_TREATMENT = [
  nhCenter("northern-conway", "Northern Human Services", "Conway", "87 Washington Street, Conway, NH 03818", "603-447-3347", "https://www.northernhs.org/"),
  nhCenter("west-central-lebanon", "West Central Behavioral Health", "Lebanon", "9 Hanover Street, Suite 2, Lebanon, NH 03766", "603-448-0126", "https://www.wcbh.org/"),
  nhCenter("lakes-laconia", "Lakes Region Mental Health Center", "Laconia", "40 Beacon Street East, Laconia, NH 03246", "603-524-1100", "https://www.lrmhc.org/"),
  nhCenter("riverbend-concord", "Riverbend Community Mental Health", "Concord", "3 N State Street, Concord, NH 03301", "603-228-1551", "https://www.riverbendcmhc.org/"),
  nhCenter("monadnock-keene", "Monadnock Family Services", "Keene", "64 Main Street, Suite 301, Keene, NH 03431", "603-357-4400", "https://www.mfs.org/"),
  nhCenter("greater-nashua", "Greater Nashua Mental Health", "Nashua", "100 West Pearl Street, Nashua, NH 03060", "603-889-6147", "https://www.gnmhc.org/"),
  nhCenter("greater-manchester", "The Mental Health Center of Greater Manchester", "Manchester", "401 Cypress Street, Manchester, NH 03103", "603-668-4111", "https://www.mhcgm.org/"),
  nhCenter("seacoast-portsmouth", "Seacoast Mental Health Center", "Portsmouth", "1145 Sagamore Avenue, Portsmouth, NH 03801", "603-431-6703", "https://www.smhc.org/"),
  nhCenter("community-partners-dover", "Community Partners of Strafford County", "Dover", "113 Crosby Road, Suite 1, Dover, NH 03820", "603-516-9300", "https://communitypartnersnh.org/"),
  nhCenter("center-life-management-derry", "Center for Life Management", "Derry", "10 Tsienneto Road, Derry, NH 03038", "603-434-1577", "https://www.centerforlifemanagement.org/"),
];

export const NEVADA_FOOD = [
  record({ id: "nv-food-northern-food-bank-sparks", name: "Food Bank of Northern Nevada — find nearby food assistance", state: "NV", city: "Sparks", address: "550 Italy Drive, Sparks, NV 89437", phone: "775-331-3663", description: "The Food Bank of Northern Nevada distributes food through partner pantries and publishes a locator and distribution calendar. Its warehouse is not open for walk-in food pickup. Use its Get Help locator or call for nearby sites and schedules; confirm eligibility and current distribution details before traveling.", url: "https://www.fbnn.org/gethelp/", source: "Food Bank of Northern Nevada Get Help and Contact pages", serviceArea: "Northern Nevada and eastern California Sierra", resourceType: "regional food assistance locator and referral", locationLine: "Northern Nevada · warehouse is not a public pantry · use locator or call" }),
  record({ id: "nv-food-three-square-las-vegas", name: "Three Square Center — Southern Nevada food assistance", state: "NV", city: "Las Vegas", address: "4190 N. Pecos Road, Las Vegas, NV 89115", phone: "702-765-4030", description: "Three Square's call center connects Southern Nevada residents to food assistance and its current Food Finder map. Call to ask for a pantry, meal site, or distribution serving your ZIP code; the listed campus is not itself guaranteed to provide walk-in groceries.", url: "https://www.threesquare.org/contact-us", source: "Three Square Contact Us and Food Finder pages", serviceArea: "Southern Nevada", resourceType: "food assistance navigation", locationLine: "Southern Nevada · call center weekdays; ask for a current local site" }),
];

export const NEVADA_URGENT = [
  record({ id: "nv-988-crisis-support", name: "Nevada 988 — crisis counseling and local connection", state: "NV", city: undefined, coverageScope: "state", phone: "988", description: "Nevada's 24/7 crisis line offers call, text, and chat with trained counselors and can connect people to local support when wanted. This is a crisis contact, not a substitute for emergency medical response; for immediate danger call 911.", url: "https://www.dpbh.nv.gov/programs/bh-wellness-and-prevention-bbhwp/crisis-response/", source: "Nevada Division of Public and Behavioral Health Crisis Response", serviceArea: "Nevada statewide", resourceType: "24/7 behavioral-health crisis support", locationLine: "Call or text 988 · available 24/7 across Nevada" }),
];
