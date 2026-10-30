// Additional source-reviewed contacts. Current operation and availability are not phone-confirmed.
const contact = ({ id, name, state, city, address, phone, description, url, source, serviceArea, coverageScope, type }) => ({
  id, name, state, city, address, phone, description, link: url, source, serviceArea,
  coverageScope: coverageScope || (city ? (serviceArea && serviceArea !== city ? "region" : "city") : "state"),
  resourceType: type, locationLine: city ? city + " · call to confirm current access" : serviceArea + " · call to confirm access",
  verified: true, sourceReviewed: true, phoneConfirmed: false, exhaustiveCoverage: false, checkedAt: "2026-10-30",
});

const mo = (id, name, city, address, phone) => contact({
  id: "mo-treatment-" + id, name: name + " — community behavioral-health access", state: "MO", city, address, phone,
  description: "Missouri Department of Mental Health lists this community provider in its statewide behavioral-health contact directory. Contact the provider to confirm its service area, intake process, age range, insurance or payment options, and current appointment availability. The listing does not confirm an appointment or eligibility.",
  url: "https://dmh.mo.gov/contacts", source: "Missouri Department of Mental Health provider contacts", serviceArea: city, type: "community behavioral-health provider",
});

export const MISSOURI_TREATMENT = [
  mo("adapt-stl", "ADAPT of Missouri", "St. Louis", "2301 Hampton Avenue", "888-657-3201"),
  mo("hopewell-stl", "Amanda Luckett Murphy Hopewell Center", "St. Louis", "1504 S. Grand Boulevard", "314-531-1770"),
  mo("bjc-stl", "BJC Behavioral Health Community Services", "St. Louis", "1430 Olive Street, Suite 500", "314-206-3700"),
  mo("bjc-farmington", "BJC Behavioral Health Community Services", "Farmington", "1085 Maple Street", "573-756-5353"),
  mo("bjc-bridgeton", "BJC Behavioral Health Community Services", "Bridgeton", "3165 McKelvey Road, Suite 200", "314-206-3900"),
  mo("bjc-kirkwood", "BJC Behavioral Health Community Services", "Kirkwood", "343 S. Kirkwood Road, Suite 200", "314-206-3400"),
  mo("bootheel-sikeston", "Bootheel Counseling Services", "Sikeston", "760 Plantation Boulevard", "573-471-0800"),
  mo("burrell-columbia", "Burrell Behavioral Health Central Region", "Columbia", "3401 Berrywood Drive, Suite 204", "573-777-8450"),
  mo("burrell-springfield", "Burrell Behavioral Health", "Springfield", "1300 Bradford Parkway", "417-269-5400"),
  mo("cbm-kc", "Center for Behavioral Medicine", "Kansas City", "1000 E. 24th Street", "816-512-7000"),
  mo("clark-pierce", "Clark Community Mental Health Center", "Pierce City", "104 W. Main Street", "417-476-1000"),
  mo("ccc-cape", "Community Counseling Center", "Cape Girardeau", "402 S. Silver Springs Road", "573-334-1100"),
  mo("comtrea-festus", "Comtrea Community Treatment", "Festus", "227 Main Street", "636-931-2700"),
  mo("crider-wentzville", "Crider Center", "Wentzville", "1032 Crosswinds Court", "636-332-6000"),
  mo("mineral-farmington", "Mineral Area CPRC", "Farmington", "203 S. Washington Street", "573-756-2899"),
  mo("new-horizons-jeffcity", "New Horizons Community Support Services", "Jefferson City", "2013 William Street", "573-636-8108"),
  mo("new-horizons-columbia", "New Horizons Community Support Services", "Columbia", "1408 Hathman Place", "573-443-0405"),
  mo("north-central-trenton", "North Central Missouri Mental Health Center", "Trenton", "1601 E. 28th Street", "660-359-4487"),
  mo("northwest-marshall", "Northwest Community Services", "Marshall", "1547 W. Commerce Drive", "660-831-3057"),
  mo("northwest-psychiatric-stjoseph", "Northwest Missouri Psychiatric Rehabilitation Center", "St. Joseph", "3505 Frederick Avenue", "816-387-2300"),
  mo("ozark-joplin", "Ozark Center", "Joplin", "3006 McClelland Boulevard", "417-347-7600"),
  mo("ozarks-west-plains", "Ozarks Medical Center Behavioral Healthcare", "West Plains", "909 Kentucky Avenue", "417-257-6762"),
  mo("ozarks-mountain-grove", "Ozarks Medical Center Behavioral Healthcare", "Mountain Grove", "1604 N. Main Street", "417-926-6563"),
  mo("pathways-clinton", "Pathways Community Behavioral Healthcare", "Clinton", "1800 Community Drive", "660-885-8131"),
  mo("pathways-warrensburg", "Pathways Community Behavioral Healthcare", "Warrensburg", "520C Burkharth Road", "660-747-7127"),
  mo("pathways-jeffcity", "Pathways Community Behavioral Healthcare", "Jefferson City", "1905 Stadium Boulevard", "573-634-3000"),
  mo("pathways-rolla", "Pathways Community Behavioral Healthcare", "Rolla", "1450 E. 10th Street", "573-364-7551"),
  mo("places-stl", "Places for People", "St. Louis", "4130 Lindell Boulevard", "314-535-5600"),
  mo("rediscover-lees-summit", "ReDiscover", "Lee's Summit", "901 NE Independence Avenue", "816-246-8000"),
  mo("semobhm-park-hills", "Southeast Missouri Behavioral Health", "Park Hills", "512 E. Main Street", "573-431-0554"),
];

const mt = (id, name, city, address, phone) => contact({
  id: "mt-treatment-" + id, name: name + " — community behavioral-health access", state: "MT", city, address, phone,
  description: "Montana DPHHS lists this certified community behavioral-health clinic location for mental-health and substance-use support. Contact the site to confirm current walk-in or appointment access, eligibility, and service availability; this listing is not an appointment or crisis dispatch.",
  url: "https://www.dphhs.mt.gov/FutureGenerations/CCBHC/Provider-Locator", source: "Montana DPHHS Certified Community Behavioral Health Clinic provider locator", serviceArea: city, type: "community behavioral-health access",
});

export const MONTANA_TREATMENT = [
  mt("aware-missoula", "AWARE, Inc.", "Missoula", "1321 Wyoming Street, Missoula, MT 59801", "406-532-8400"),
  mt("rimrock-billings", "Rimrock Foundation", "Billings", "1231 N. 29th Street, Billings, MT 59101", "406-248-3175"),
  mt("many-rivers-great-falls", "Many Rivers Whole Health", "Great Falls", "915 1st Avenue S., Great Falls, MT 59401", "406-761-2100"),
  mt("many-rivers-great-falls-2", "Many Rivers Whole Health", "Great Falls", "621 1st Avenue S., Great Falls, MT 59401", "406-761-2104"),
  mt("many-rivers-great-falls-3", "Many Rivers Whole Health", "Great Falls", "513 1st Avenue S., Great Falls, MT 59401", "406-727-4315"),
  mt("many-rivers-helena", "Many Rivers Whole Health", "Helena", "900 N. Jackson Street, Helena, MT 59601", "406-443-7151"),
  mt("many-rivers-havre", "Many Rivers Whole Health", "Havre", "312 3rd Street, Havre, MT 59501", "406-265-9639"),
  mt("many-rivers-chester", "Many Rivers Whole Health", "Chester", "110 E. Jefferson Avenue, Chester, MT 59522", "406-265-9639"),
  mt("many-rivers-whitehall", "Many Rivers Whole Health", "Whitehall", "101 W. Legion Avenue, Suite B, Whitehall, MT 59759", "406-443-7151"),
  mt("many-rivers-townsend", "Many Rivers Whole Health", "Townsend", "124 N. Cedar Street, Townsend, MT 59644", "406-443-7151"),
  mt("eastern-miles-city", "Eastern Montana Community Mental Health Center", "Miles City", "2508 Wilson Street, Miles City, MT 59301", "406-234-0234"),
  mt("eastern-sidney", "Eastern Montana Community Mental Health Center", "Sidney", "1201 W. Holly Street, Suite 4, Sidney, MT 59270", "406-433-4635"),
  mt("eastern-glasgow", "Eastern Montana Community Mental Health Center", "Glasgow", "130 3rd Street S., Glasgow, MT 59230", "406-228-9349"),
  mt("eastern-glendive", "Eastern Montana Community Mental Health Center", "Glendive", "2016 N. Merrill Avenue, Glendive, MT 59330", "406-377-6075"),
  mt("eastern-wolf-point", "Eastern Montana Community Mental Health Center", "Wolf Point", "124 Custer Street, Wolf Point, MT 59201", "406-653-1872"),
  mt("eastern-plentywood", "Eastern Montana Community Mental Health Center", "Plentywood", "100 W. Laurel Avenue, Plentywood, MT 59254", "406-765-2550"),
  mt("eastern-forsyth", "Eastern Montana Community Mental Health Center", "Forsyth", "121 N. 11th Street, Forsyth, MT 59327", "406-346-7654"),
  mt("eastern-colstrip", "Eastern Montana Community Mental Health Center", "Colstrip", "6230 Main Street, Colstrip, MT 59323", "406-346-7654"),
  mt("eastern-broadus", "Eastern Montana Community Mental Health Center", "Broadus", "121 W. Wilson Street, Broadus, MT 59317", "406-234-1687"),
  mt("eastern-malta", "Eastern Montana Community Mental Health Center", "Malta", "46 S. 1st Street E., Malta, MT 59538", "406-228-9349"),
];

const neRegion = (region, phone, website) => contact({
  id: "ne-treatment-" + region.toLowerCase().replaceAll(" ", "-"),
  name: region + " Nebraska Behavioral Health Region — same-day and walk-in access", state: "NE",
  description: "Nebraska DHHS identifies providers in " + region + " that offer same-day scheduling or walk-in behavioral-health access. Call the regional system to locate the provider serving your county and confirm today's hours, eligibility, and availability. This route does not guarantee a same-day appointment.",
  phone, url: website, source: "Nebraska DHHS Same-Day Scheduling and Walk-In Access and Behavioral Health Regions", serviceArea: region, coverageScope: "region", type: "regional behavioral-health access",
});

export const NEBRASKA_TREATMENT = [
  neRegion("Region 1", "308-635-3173", "https://www.region1bhs.net/"),
  neRegion("Region 2", "308-534-0440", "https://www.r2hs.com/"),
  neRegion("Region 3", "308-237-5113", "https://www.region3.net/"),
  neRegion("Region 4", "402-370-3100", "https://www.region4bhs.org/"),
  neRegion("Region 5", "402-441-4343", "https://www.region5systems.net/"),
  neRegion("Region 6", "402-444-6573", "https://www.regionsix.com/"),
];

const nhShelter = (id, name, city, county, phone, population, website) => contact({
  id: "nh-housing-" + id, name, state: "NH", city, phone,
  description: "New Hampshire DHHS's published shelter directory lists " + name + " in " + county + " County for " + population + ". The source document is dated January 2023; call the provider or 211 to confirm it is still operating, eligibility, referral steps, and availability before traveling. No vacancy is implied.",
  url: website, source: "New Hampshire DHHS State-Funded Emergency Shelters directory (source document last updated January 20, 2023)", serviceArea: county + " County", type: "emergency shelter contact",
});

export const NEW_HAMPSHIRE_HOUSING = [
  nhShelter("carey-house", "Salvation Army Carey House", "Laconia", "Belknap", "603-528-8086", "men, women, and families", "https://nne.salvationarmy.org/laconia/"),
  nhShelter("tyler-blain", "Tyler Blain House", "Lancaster", "Coos", "603-788-2344", "men, women, and families", "http://www.tccap.org/services/health/homelessness/"),
  nhShelter("hundred-nights", "Hundred Nights", "Keene", "Cheshire", "603-352-5197", "men and women", "https://hundrednightsinc.org/"),
  nhShelter("scs-keene", "Southwestern Community Services emergency shelter", "Keene", "Cheshire", "603-352-7512", "men, women, and families", "https://www.scshelps.org/"),
  nhShelter("bridge-house", "Bridge House", "Plymouth", "Grafton", "603-536-7631", "men, women, families, and veterans", "https://tbhshelter.org/"),
  nhShelter("burch-house", "Burch House", "Bethlehem", "Grafton", "603-444-0624", "women and families", "http://www.tccap.org/services/health/homeless-shelter/"),
  nhShelter("fit-new-horizons", "Families in Transition — New Horizons", "Manchester", "Hillsborough", "603-641-9441", "adults", "https://www.fitnh.org/"),
  nhShelter("fit-lake-ave", "Families in Transition — 177 Lake Avenue", "Manchester", "Hillsborough", "603-641-9441", "families", "https://www.fitnh.org/"),
  nhShelter("helping-hands", "Helping Hands Outreach", "Manchester", "Hillsborough", "603-623-8778", "men", "https://helpinghandsmanchesternh.com/"),
  nhShelter("nashua-soup-kitchen", "Nashua Soup Kitchen & Shelter", "Nashua", "Hillsborough", "603-889-7770", "men, women, and families", "https://nsks.org/"),
  nhShelter("mckenna-house", "Salvation Army McKenna House", "Concord", "Merrimack", "603-228-3505", "men and women", "https://nne.salvationarmy.org/concord/mckenna-house-shelter"),
  nhShelter("friends-emergency-housing", "Friends Emergency Housing", "Concord", "Merrimack", "603-228-1193", "families", "https://www.friendsprogram.org/"),
  nhShelter("cross-roads-house", "Cross Roads House", "Portsmouth", "Rockingham", "603-436-2218", "men, women, and families", "https://www.crossroadshouse.org/"),
  nhShelter("new-generation", "New Generation", "Greenland", "Rockingham", "603-436-4989", "families and pregnant women", "https://www.newgennh.org/"),
  nhShelter("seacoast-family-promise", "Seacoast Family Promise", "Exeter", "Rockingham", "603-658-8448", "families", "https://www.seacoastfamilypromise.org/"),
  nhShelter("my-friends-place", "My Friend's Place", "Dover", "Strafford", "603-749-3017", "men, women, and families", "https://myfriendsplacenh.org/"),
  nhShelter("scs-claremont", "Southwestern Community Services emergency shelter", "Claremont", "Sullivan", "603-542-9528", "men, women, and families", "https://www.scshelps.org/"),
];

const nvPantry = (id, name, city, address, service) => contact({
  id: "nv-food-" + id, name, state: "NV", city, address,
  description: "Nevada 211 lists " + name + " as a food-assistance resource. Published service information: " + service + " Contact the organization or use Nevada 211 to confirm current hours, eligibility, intake, and whether food is available before traveling.",
  url: "https://www.nevada211.org/food-assistance/search-food-services/", source: "Nevada 211 Food Services directory", serviceArea: city, type: "food pantry or meal service",
});

export const NEVADA_LOCAL_FOOD = [
  nvPantry("bridge-church-reno", "Bridge Church food pantry", "Reno", "1330 Foster Drive, Reno, NV 89509", "First and third Thursdays; check current distribution times."),
  nvPantry("carson-valley-food-closet", "Carson Valley Community Food Closet", "Gardnerville", "1251 Waterloo Lane, Gardnerville, NV 89410", "Supplemental food for Douglas County residents; listed open Monday, Tuesday, Wednesday, and Friday."),
  nvPantry("city-impact-las-vegas", "City Impact Urban Food Bank", "Las Vegas", "968 E. Sahara Avenue, Las Vegas, NV 89104", "Food assistance listed Tuesday through Thursday."),
  nvPantry("winnemucca-senior-commodities", "Winnemucca Food Bank senior commodities", "Winnemucca", "150 S. Bridge Street, Winnemucca, NV 89445", "Commodity food program for older adults; call for eligibility and schedule."),
  nvPantry("community-food-pantry-sparks", "Community Food Pantry of Reno-Sparks", "Sparks", "1135 12th Street, Sparks, NV 89432", "Listed Wednesday and Saturday for community access; Friday for seniors."),
  nvPantry("dayton-food-pantry", "Dayton Food Pantry", "Dayton", "209 Dayton Valley Road, Dayton, NV 89403", "Emergency food boxes; call to confirm intake."),
  nvPantry("hope-for-city-las-vegas", "Hope for the City drive-through distribution", "Las Vegas", "7220 Paradise Road, Las Vegas, NV 89119", "Drive-through food distributions; confirm event schedule."),
  nvPantry("desert-hills-las-vegas", "Desert Hills Baptist Church emergency food pantry", "Las Vegas", "4401 S. Nellis Boulevard, Las Vegas, NV 89121", "Emergency pantry listed on Fridays; confirm current hours."),
  nvPantry("new-frontier-fallon", "New Frontier Treatment Center emergency food pantry and meals", "Fallon", "1490 Grimes Street, Fallon, NV 89406", "Emergency pantry and hot meals are listed; call ahead to confirm access."),
  nvPantry("fish-carson-city", "Friends in Service Helping emergency food pantry", "Carson City", "138 E. Long Street, Carson City, NV 89701", "Emergency food assistance by assessment; call to ask about current criteria."),
  nvPantry("dream-center-las-vegas", "Dream Center Las Vegas food pantry", "Las Vegas", "6601 W. Twain Avenue, Las Vegas, NV 89103", "Food pantry listed Tuesday and Thursday; confirm schedule."),
  nvPantry("favor-city-henderson", "Favor City Church food pantry", "Henderson", "615 College Drive, Henderson, NV 89002", "Weekly Friday food pantry listed; confirm distribution time."),
  nvPantry("bridging-miracles-las-vegas", "Bridging Miracles food pantry", "Las Vegas", "1010 N. Main Street, Las Vegas, NV 89101", "Monthly distribution listed; registration may be required."),
  nvPantry("mountain-view-hawthorne", "Mountain View Church food pantry", "Hawthorne", "991 D Street, Hawthorne, NV 89415", "Weekly Wednesday distribution listed; confirm current hours."),
  nvPantry("bethel-ame-sparks", "Bethel AME Church food pantry", "Sparks", "2655 N. Rock Boulevard, Sparks, NV 89431", "Second and fourth Tuesday distribution listed; confirm schedule."),
  nvPantry("university-family-sparks", "University Family Fellowship food pantry", "Sparks", "1125 Stanford Way, Sparks, NV 89431", "First and third Saturday distribution listed; confirm hours."),
  nvPantry("deliverance-temple-las-vegas", "Deliverance Temple COGIC food pantry", "Las Vegas", "1249 Miller Avenue, Las Vegas, NV 89106", "First and third Saturday distribution listed; confirm current details."),
  nvPantry("fountain-hope-las-vegas", "Fountain of Hope AME Church food pantry", "Las Vegas", "2955 E. Russell Road, Las Vegas, NV 89120", "Second and fourth Tuesday distribution listed; confirm access."),
  nvPantry("lincoln-county-food-pantry", "Lincoln County Human Services food pantry", "Panaca", "1005 Main Street, Panaca, NV 89042", "Weekly open food shopping listed; call before traveling."),
  nvPantry("sj-north-las-vegas", "SJNC community food pantry", "North Las Vegas", "2575 W. El Campo Grande Avenue, North Las Vegas, NV 89031", "First and third Wednesday distribution listed; confirm eligibility and hours."),
  nvPantry("hopelink-henderson", "HopeLink of Southern Nevada food pantry", "Henderson", "178 Westminster Way, Henderson, NV 89015", "Food pantry resource; contact provider to confirm current intake."),
  nvPantry("share-village-las-vegas", "Share Village community food pantry", "Las Vegas", "2028 E. Fremont Street, Las Vegas, NV 89101", "Thursday distribution listed when supplies are available; verify before traveling."),
  nvPantry("sunrise-mountain-las-vegas", "Sunrise Mountain Ministries food pantry", "Las Vegas", "5670 S. Pecos Road, Las Vegas, NV 89120", "Tuesday food pantry listed; confirm current hours and intake."),
];

export const NEBRASKA_COMMUNITY_ROUTES = [
  contact({ id: "ne-food-pantry-referrals", name: "Nebraska food-bank pantry referrals", state: "NE", phone: "1-855-444-5556", description: "Nebraska DHHS directs residents to call this food-bank number to locate pantry sites. Ask for nearby locations, current distribution hours, service-area eligibility, and documents required before traveling.", url: "https://dhhs.ne.gov/Pages/Outreach-and-Community-Resources.aspx", source: "Nebraska DHHS Outreach and Community Resources", serviceArea: "Nebraska statewide", coverageScope: "state", type: "food pantry referral" }),
  contact({ id: "ne-family-helpline", name: "Nebraska Family Helpline — 24/7 family support", state: "NE", phone: "1-888-866-8660", description: "Nebraska DHHS describes this helpline as available 24 hours a day for parents and families seeking help. Call for support and referrals; it is not an emergency response service.", url: "https://dhhs.ne.gov/Pages/Outreach-and-Community-Resources.aspx", source: "Nebraska DHHS Outreach and Community Resources", serviceArea: "Nebraska statewide", coverageScope: "state", type: "family support and referral" }),
  contact({ id: "ne-unsheltered-referrals", name: "Nebraska unsheltered outreach and housing referrals", state: "NE", phone: "402-957-1747", description: "Nebraska DHHS points people sleeping in a car or abandoned building to this referral contact for outdoor supplies, housing or shelter, food and water, case management, and mental-health or substance-use care. Call to confirm local availability.", url: "https://dhhs.ne.gov/Pages/Outreach-and-Community-Resources.aspx", source: "Nebraska DHHS Outreach and Community Resources", serviceArea: "Nebraska statewide referral", coverageScope: "state", type: "unsheltered outreach and service referrals" }),
  contact({ id: "ne-iserve-assistance", name: "iServe Nebraska assistance applications", state: "NE", phone: "1-800-383-4278", description: "Nebraska DHHS directs households to iServe Nebraska to apply for food, heat, electricity, healthcare, childcare, and other assistance. Call for application help and confirm eligibility through the official application process.", url: "https://iserve.nebraska.gov/", source: "Nebraska DHHS Financial Assistance and Outreach pages", serviceArea: "Nebraska statewide", coverageScope: "state", type: "benefits application and navigation" }),
];
