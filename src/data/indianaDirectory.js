// Indiana services reviewed against state agencies and provider directories on
// 2026-10-25. Source review confirms a published listing, not a phone call,
// current capacity, or exhaustive coverage of Indiana.
const reviewed = (record) => ({ ...record, state: "IN", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const hubUrl = "https://secure.in.gov/fssa/dmha/Recovery/regional-recovery-hubs/";
const hubSource = "Indiana DMHA, Regional Recovery Hubs directory (updated January 5, 2026)";
const hubs = [
  ["three20", "Three 20 Recovery", "Chesterton", "320 S. Calumet Road, Chesterton, IN 46304", "219-238-6840", "Peer recovery hub serving Jasper, Lake, LaPorte, Newton, Porter, Pulaski, and Starke counties. Contact the hub for current peer support, groups, and referral options.", ["Jasper", "Lake", "LaPorte", "Newton", "Porter", "Pulaski", "Starke"], "https://www.three20recovery.com"],
  ["lite", "LITE Recovery Hub", "Milford", "210 W. Catherine St., Milford, IN 46542", "574-306-0006", "Regional recovery hub serving Cass, Elkhart, Fulton, Huntington, Kosciusko, Marshall, Miami, St. Joseph, and Wabash counties. Ask about peer support and services available in your county.", ["Cass", "Elkhart", "Fulton", "Huntington", "Kosciusko", "Marshall", "Miami", "St. Joseph", "Wabash"], "https://www.literecoveryhub.org"],
  ["hive", "The HIVE Recovery Hub", "Lafayette", "2300 Ferry St., Lafayette, IN 47905", "765-609-0826", "Regional peer recovery hub serving Benton, Boone, Carroll, Clinton, Fountain, Hendricks, Montgomery, Tippecanoe, Warren, and White counties. Call to ask what support is available near you.", ["Benton", "Boone", "Carroll", "Clinton", "Fountain", "Hendricks", "Montgomery", "Tippecanoe", "Warren", "White"], "https://www.recovery-cafe-lafayette.org"],
  ["wabash-valley", "Wabash Valley Recovery Center", "Terre Haute", "500 Farrington St., Terre Haute, IN 47807", "812-917-0068", "Peer recovery hub serving Clay, Greene, Knox, Monroe, Owen, Parke, Putnam, Sullivan, Vermillion, and Vigo counties. Contact the center for current meeting and peer-support schedules.", ["Clay", "Greene", "Knox", "Monroe", "Owen", "Parke", "Putnam", "Sullivan", "Vermillion", "Vigo"], "https://www.wabashvalleyrecovery.org"],
  ["safe-haven", "Safe Haven Recovery Engagement Center", "Paoli", "308 S. Oak St., Paoli, IN 47454", "812-203-2230", "Regional recovery hub serving Crawford, Daviess, Dubois, Gibson, Lawrence, Martin, Orange, Perry, Pike, Posey, Spencer, Vanderburgh, and Warrick counties. Call to ask about peer support and local referrals.", ["Crawford", "Daviess", "Dubois", "Gibson", "Lawrence", "Martin", "Orange", "Perry", "Pike", "Posey", "Spencer", "Vanderburgh", "Warrick"], "https://www.safehavenrec.com"],
  ["thrive", "THRIVE Recovery Community", "New Albany", "115 E. Market St., Suite B, New Albany, IN 47150", "502-576-9000", "Regional recovery hub serving Bartholomew, Brown, Clark, Floyd, Hamilton, Harrison, Howard, Jackson, Jefferson, Jennings, Johnson, Madison, Marion, Morgan, Scott, Tipton, and Washington counties. Ask about services for your county.", ["Bartholomew", "Brown", "Clark", "Floyd", "Hamilton", "Harrison", "Howard", "Jackson", "Jefferson", "Jennings", "Johnson", "Madison", "Marion", "Morgan", "Scott", "Tipton", "Washington"], "https://thriverco.org/home"],
  ["one-voice", "1 Voice Recovery", "Aurora", "111 Fifth St., Aurora, IN 47001", "812-954-5154", "Regional recovery hub serving Dearborn, Decatur, Franklin, Ohio, Ripley, and Switzerland counties. Contact the center for current peer support, recovery activities, and referrals.", ["Dearborn", "Decatur", "Franklin", "Ohio", "Ripley", "Switzerland"], "https://1voicerecovery.org"],
  ["connection-cafe", "Connection Café", "Connersville", "635 N. Central Ave., Connersville, IN 47331", "765-309-5094", "Regional recovery and harm-reduction hub serving Blackford, Delaware, Fayette, Grant, Hancock, Henry, Jay, Randolph, Rush, Shelby, Union, and Wayne counties. Call to ask about local services and hours.", ["Blackford", "Delaware", "Fayette", "Grant", "Hancock", "Henry", "Jay", "Randolph", "Rush", "Shelby", "Union", "Wayne"], "https://harmreductioncafe.org"],
  ["project-me", "Project.ME", "Fort Wayne", "2305 Broadway, Fort Wayne, IN 46807", "260-234-0270", "Regional recovery hub serving Adams, Allen, DeKalb, LaGrange, Noble, Steuben, Wells, and Whitley counties. Contact the team for recovery support available in your community.", ["Adams", "Allen", "DeKalb", "LaGrange", "Noble", "Steuben", "Wells", "Whitley"], "https://projectme-fw.org"],
];
export const INDIANA_PEER = hubs.map(([key, name, city, address, phone, description, serviceAreaCounties, link]) => regional({
  id: `in-peer-${key}`, name, city, address, phone, description, serviceAreaCounties, link,
  source: hubSource, locationLine: `${city}, Indiana · call to confirm current hours and county service`,
}));

const foodUrl = "https://feedindiana.org/food-pantries";
const foodSource = "Food Bank of Northern Indiana, partner pantry directory";
// The food bank publishes these names and street addresses. Its directory does
// not publish a direct phone for every partner; do not substitute the food bank
// office number for a pantry's own number. Call 574-232-9986 for navigation.
const foodSites = [
  ["east-goshen-bread-life", "East Goshen Mennonite Church / Bread of Life Food Pantry", "Goshen", "17861 State Road 4, Goshen, IN 46528", "Elkhart"],
  ["bristol-community", "Bristol Community Food Pantry", "Bristol", "101 W. Vistula Street, Bristol, IN 46507", "Elkhart"],
  ["calvary-elkhart", "Calvary Food Pantry", "Elkhart", "1010 E. Mishawaka Road, Elkhart, IN 46517", "Elkhart"],
  ["church-community-services", "Church Community Services", "Elkhart", "907 Oakland Avenue, Elkhart, IN 46516", "Elkhart"],
  ["church-without-walls", "Church Without Walls Food Pantry", "Elkhart", "731 Wagner Avenue, Elkhart, IN 46516", "Elkhart"],
  ["fairfield", "Fairfield Food Pantry", "New Paris", "67493 County Road 23, New Paris, IN 46553", "Elkhart"],
  ["faith-mission-elkhart", "Faith Mission Soup Kitchen", "Elkhart", "801 Benham Avenue, Elkhart, IN 46516", "Elkhart"],
  ["goshen-church-god", "Goshen Church of God food assistance", "Goshen", "1304 E. Lincoln Avenue, Goshen, IN 46528", "Elkhart"],
  ["lifepoint-goshen", "LifePoint Church food assistance", "Goshen", "1006 S. 16th Street, Goshen, IN 46526", "Elkhart"],
  ["nappanee-open-door", "Nappanee Open Door", "Nappanee", "292 S. Main Street, Nappanee, IN 46550", "Elkhart"],
  ["open-gate", "Open Gate Praise & Deliverance food pantry", "Elkhart", "137 Division Street, Elkhart, IN 46517", "Elkhart"],
  ["salvation-army-elkhart", "Salvation Army Elkhart food assistance", "Elkhart", "300 N. Main Street, Elkhart, IN 46516", "Elkhart"],
  ["st-john-elkhart", "St. John the Evangelist Episcopal Church food pantry", "Elkhart", "226 W. Lexington Avenue, Elkhart, IN 46516", "Elkhart"],
  ["church-rise", "That Church on the Rise food pantry", "Elkhart", "28082 County Road 4, Elkhart, IN 46514", "Elkhart"],
  ["center-fcdc", "The Center Food Pantry at FCDC", "Nappanee", "107 E. Marion Street, Nappanee, IN 46550", "Elkhart"],
  ["window-goshen", "The Window food pantry", "Goshen", "223 S. Main Street, Goshen, IN 46526", "Elkhart"],
  ["argos-shepherds", "Argos UMC Shepherd’s Food Pantry", "Argos", "570 N. Michigan Road, Argos, IN 46501", "Marshall"],
  ["bourbon-helping-hands", "Bourbon Helping Hands", "Bourbon", "204 N. Washington Street, Bourbon, IN 46504", "Marshall"],
  ["bread-life-plymouth", "Bread of Life Community Food Pantry", "Plymouth", "6770 N. Michigan Road, Plymouth, IN 46563", "Marshall"],
  ["culver-community", "Culver Community Food Pantry", "Culver", "307 N. Plymouth Street, Culver, IN 46511", "Marshall"],
  ["grace-bremen", "Grace Food Pantry of Bremen", "Bremen", "1237 W. Plymouth Street, Bremen, IN 46506", "Marshall"],
  ["country-church", "The Country Church food assistance", "Bourbon", "2951 9B Road, Bourbon, IN 46504", "Marshall"],
  ["berean-south-bend", "Berean Community Service food pantry", "South Bend", "601 Colfax Avenue, South Bend, IN 46601", "St. Joseph"],
  ["broadway-christian", "Broadway Christian Parish Pantry and Soup Kitchen", "South Bend", "1412 S. Carroll Street, South Bend, IN 46613", "St. Joseph"],
  ["catholic-charities-sb", "Catholic Charities food assistance", "South Bend", "1817 Miami Street, South Bend, IN 46613", "St. Joseph"],
  ["christian-community-walkerton", "Christian Community Food Pantry", "Walkerton", "625 Roosevelt Road, Walkerton, IN 46574", "St. Joseph"],
  ["clay-umc", "Clay United Methodist Church Food Pantry", "South Bend", "17646 Cleveland Road, South Bend, IN 46635", "St. Joseph"],
  ["community-food-pantry-sjc", "Community Food Pantry of St. Joseph County", "South Bend", "702 Chapin Street, South Bend, IN 46601", "St. Joseph"],
  ["downtown-soup-kitchen", "Downtown Soup Kitchen at First United Methodist Church", "South Bend", "333 N. Main Street, South Bend, IN 46601", "St. Joseph"],
  ["emmaus-lutheran", "Emmaus Lutheran Church Food Pantry", "South Bend", "929 E. Milton Street, South Bend, IN 46613", "St. Joseph"],
  ["faith-baptist-sb", "Faith Baptist food pantry", "South Bend", "923 Blaine Avenue, South Bend, IN 46616", "St. Joseph"],
  ["first-brethren", "First Brethren Church food pantry", "South Bend", "4909 S. Ironwood Drive, South Bend, IN 46614", "St. Joseph"],
  ["gods-grace-layman", "God’s Grace Food Pantry at Layman Chapel", "South Bend", "303 S. Kenmore Street, South Bend, IN 46619", "St. Joseph"],
  ["hope-hungry", "Hope for the Hungry Food Pantry", "South Bend", "1007 Portage Avenue, South Bend, IN 46616", "St. Joseph"],
  ["hope-ministries-sb", "Hope Ministries Soup Kitchen", "South Bend", "532 S. Michigan Street, South Bend, IN 46601", "St. Joseph"],
  ["kingdom-life", "Kingdom Life Christian Cathedral food assistance", "South Bend", "707 Sherman Avenue, South Bend, IN 46616", "St. Joseph"],
  ["mac-pantry", "MAC Pantry at Albright United Methodist Church", "Mishawaka", "504 W. Mishawaka Avenue, Mishawaka, IN 46545", "St. Joseph"],
  ["mishawaka-food-pantry", "Mishawaka Food Pantry and Soup Kitchen", "Mishawaka", "315 Lincolnway West, Mishawaka, IN 46544", "St. Joseph"],
  ["monroe-circle", "Monroe Circle Community Center food assistance", "South Bend", "526 Western Avenue, South Bend, IN 46601", "St. Joseph"],
  ["needs-neighbors", "Needs for Neighbors Food Pantry", "South Bend", "54301 Maple Lane, South Bend, IN 46635", "St. Joseph"],
  ["new-carlisle", "New Carlisle Community Food Pantry", "New Carlisle", "300 Compton Street, New Carlisle, IN 46552", "St. Joseph"],
  ["osceola-umc", "Osceola United Methodist food assistance", "Osceola", "431 N. Beech Road, Osceola, IN 46561", "St. Joseph"],
  ["our-lady-road", "Our Lady of the Road Soup Kitchen", "South Bend", "744 S. Main Street, South Bend, IN 46601", "St. Joseph"],
  ["river-park-umc", "River Park United Methodist Church Food Pantry", "South Bend", "920 S. 23rd Street, South Bend, IN 46615", "St. Joseph"],
  ["salvation-army-sb", "Salvation Army Walter A. Meyer Food Pantry", "South Bend", "900 W. Western Avenue, South Bend, IN 46601", "St. Joseph"],
  ["st-augustine-soup", "St. Augustine Soup Kitchen", "South Bend", "1501 W. Washington Street, South Bend, IN 46619", "St. Joseph"],
  ["st-margarets-house", "St. Margaret’s House Soup Kitchen", "South Bend", "117 N. Lafayette Boulevard, South Bend, IN 46601", "St. Joseph"],
  ["st-michael-soup", "St. Michael and All Angels Episcopal Church Soup Kitchen", "South Bend", "53720 N. Ironwood Road, South Bend, IN 46635", "St. Joseph"],
  ["st-pauls-sb", "St. Paul’s Food Pantry", "South Bend", "1001 W. Colfax Avenue, South Bend, IN 46616", "St. Joseph"],
  ["st-vincent-nci", "St. Vincent de Paul Society of North Central Indiana", "South Bend", "520 Crescent Avenue, South Bend, IN 46617", "St. Joseph"],
  ["sunnyside-presbyterian", "Sunnyside Presbyterian Church food assistance", "South Bend", "115 S. Francis Street, South Bend, IN 46617", "St. Joseph"],
  ["west-side-coc", "West Side Church of Christ food assistance", "South Bend", "22987 Edison Road, South Bend, IN 46628", "St. Joseph"],
  ["combined-community-warsaw", "Combined Community Services food assistance", "Warsaw", "1195 Mariners Drive, Warsaw, IN 46582", "Kosciusko"],
  ["gods-highway-warsaw", "God’s Highway to Heaven food pantry", "Warsaw", "555 Weber Street, Warsaw, IN 46580", "Kosciusko"],
  ["gospel-hill", "Gospel Hill Pentecostal food pantry", "Silver Lake", "303 S. Jefferson Street, Silver Lake, IN 46982", "Kosciusko"],
  ["salvation-army-warsaw", "Salvation Army Warsaw food pantry", "Warsaw", "501 E. Arthur Street, Warsaw, IN 46580", "Kosciusko"],
  ["healing-house-warsaw", "The Healing House Food Pantry", "Warsaw", "210 W. Winona Avenue, Warsaw, IN 46581", "Kosciusko"],
  ["victory-rock", "Victory Rock food assistance", "Warsaw", "6134 S. 500 East, Warsaw, IN 46580", "Kosciusko"],
  ["washington-twp-pierceton", "Washington Township Food Pantry", "Pierceton", "124 N. 1st Street, Pierceton, IN 46562", "Kosciusko"],
  ["community-pantry-rolling-prairie", "Community Food Pantry of Galena, Hudson, Kankakee and Wills Township", "Rolling Prairie", "3444 E. U.S. Highway 20, Rolling Prairie, IN", "LaPorte"],
  ["faith-city-michigan-city", "Faith City Assembly Food Pantry", "Michigan City", "1314 S. Woodland Avenue, Michigan City, IN 46360", "LaPorte"],
  ["first-presbyterian-mc", "First Presbyterian Church Soup Kitchen", "Michigan City", "121 W. 9th Street, Michigan City, IN", "LaPorte"],
  ["first-umc-mc", "First United Methodist Church Soup Kitchen", "Michigan City", "121 E. 7th Street, Michigan City, IN 46360", "LaPorte"],
  ["macedonia-mc", "Macedonia Baptist Missionary Church Pantry and Soup Kitchen", "Michigan City", "3007 Ohio Street, Michigan City, IN 46360", "LaPorte"],
  ["new-disciple-mc", "New Disciple Love Fellowship Soup Kitchen", "Michigan City", "1411 Pine Street, Michigan City, IN 46360", "LaPorte"],
  ["salvation-army-laporte", "Salvation Army LaPorte Food Pantry", "LaPorte", "3240 Monroe Street, LaPorte, IN 46350", "LaPorte"],
  ["salvation-army-mc", "Salvation Army Michigan City food assistance", "Michigan City", "1201 S. Franklin Street, Michigan City, IN 46360", "LaPorte"],
  ["pax-center", "The Pax Center Food Pantry and Soup Kitchen", "LaPorte", "605 Washington Street, LaPorte, IN 46350", "LaPorte"],
  ["trinity-episcopal-mc", "Trinity Episcopal Church Food Pantry", "Michigan City", "600 Franklin Square, Michigan City, IN 46360", "LaPorte"],
  ["community-services-knox", "Community Services of Starke County", "Knox", "311 E. Culver Road, Knox, IN 46534", "Starke"],
  ["first-pentecostal-knox", "First Pentecostal Church food pantry", "Knox", "509 S. Roosevelt Road, Knox, IN 46534", "Starke"],
];
export const INDIANA_FOOD = foodSites.map(([key, name, city, address, county]) => local({
  id: `in-food-${key}`, name, city, address, county, serviceAreaCounties: [county],
  description: `Listed by the Food Bank of Northern Indiana as a food pantry or meal resource in ${county} County. The directory does not publish a direct phone for this site. Call the Food Bank at 574-232-9986 to ask about contact details, schedule, eligibility, and whether service is currently available before traveling.`,
  link: foodUrl, source: foodSource,
  locationLine: `${city}, Indiana · call to confirm schedule, eligibility, and current service`,
}));

const cmhcUrl = "https://secure.in.gov/fssa/dmha/certified-community-behavioral-health-clinic/individuals-receiving-services";
const cmhcSource = "Indiana DMHA, Certified Community Behavioral Health Clinic access directory";
const treatmentProviders = [
  ["centerstone", "Centerstone of Indiana — community behavioral-health and addiction services", "Bloomington", "877-HOPE123", "https://centerstone.org/", "Indiana DMHA lists Centerstone as a Certified Community Behavioral Health Clinic. Contact it for an assessment, addiction or mental-health care, and local site selection; confirm current intake and coverage."],
  ["oaklawn", "Oaklawn Psychiatric Center — behavioral-health and recovery services", "South Bend", "800-282-0809", "https://oaklawn.org/", "Indiana DMHA lists Oaklawn as a Certified Community Behavioral Health Clinic serving northern Indiana. Call for assessment and location guidance; confirm current services, eligibility, and appointment access."],
  ["4c-health", "4C Health — community behavioral-health services", "Peru", "800-552-3106", "https://www.4chealthin.org/", "Indiana DMHA lists 4C Health as a Certified Community Behavioral Health Clinic. Its service network includes north-central Indiana communities; call to request screening and confirm the closest access point."],
  ["hamilton-center", "Hamilton Center — mental-health and substance-use care", "Terre Haute", "800-742-0787", "https://www.hamiltoncenter.org/", "Indiana DMHA lists Hamilton Center as a Certified Community Behavioral Health Clinic. Contact the organization for local assessment, addiction services, and referrals; verify intake and payment options."],
  ["southwestern", "Southwestern Behavioral Healthcare — behavioral-health and addiction care", "Evansville", "812-423-7791", "https://www.southwestern.org/", "Indiana DMHA lists Southwestern Behavioral Healthcare as a Certified Community Behavioral Health Clinic in southwest Indiana. Call for a local access point and current intake information."],
  ["radiant", "Radiant Health — community behavioral-health services", "Marion", "765-662-3971", "https://getradiant.org/", "Indiana DMHA lists Radiant Health as a Certified Community Behavioral Health Clinic. Contact the provider for behavioral-health and recovery access and confirm current service locations."],
  ["adult-child", "Adult & Child Health — behavioral-health services", "Indianapolis", "877-882-5122", "https://adultandchild.org/", "Indiana DMHA lists Adult & Child Health as a Certified Community Behavioral Health Clinic. Call for assessment and current local access; ask about eligibility, payment, and appointment availability."],
  ["eskenazi", "Sandra Eskenazi Mental Health Center", "Indianapolis", "317-880-8491", "https://www.eskenazihealth.edu/", "Indiana DMHA lists Eskenazi Mental Health Center as a Certified Community Behavioral Health Clinic. Contact the center to identify the appropriate service and confirm current intake."],
];
export const INDIANA_TREATMENT = treatmentProviders.map(([key, name, city, phone, link, description]) => statewide({
  id: `in-treatment-${key}`, name, city, phone, description, link, source: cmhcSource,
  locationLine: `${city}, Indiana · statewide agency; call for nearest site and intake`,
}));

const housingUrl = "https://www.in.gov/ihcda/impact-journey/Community-Services";
const housingSource = "Indiana Housing and Community Development Authority, Community Services and coordinated-entry information";
const shelterItems = [
  ["center-for-homeless", "Center for the Homeless — emergency shelter and support", "South Bend", "813 S. Michigan Street, South Bend, IN 46601", "574-282-8700", "Call the front desk for current shelter access and bed availability. The center serves people experiencing homelessness; ask about eligibility and intake before traveling.", "https://www.cfh.net/contact", "St. Joseph"],
  ["fort-wayne-rescue", "Fort Wayne Rescue Mission — emergency shelter", "Fort Wayne", "404 E. Washington Boulevard, Fort Wayne, IN 46802", "260-426-7357", "Contact the mission for current shelter intake, meals, and available services. Capacity and eligibility can change; call before traveling.", "https://fwrm.org/contact", "Allen"],
  ["charis-house", "Charis House — shelter and support for women and children", "Fort Wayne", "5920 Decatur Road, Fort Wayne, IN", "260-426-8123", "Fort Wayne Rescue Mission program for women and children. Contact the organization about eligibility, safe intake, and current availability before traveling.", "https://fwrm.org/contact", "Allen"],
  ["wheeler-men", "Wheeler Mission — men’s emergency shelter", "Indianapolis", "520 E. Market Street, Indianapolis, IN 46204", "317-687-6795", "Wheeler Mission lists emergency shelter for men at this location. Contact the shelter to confirm intake timing, requirements, and current capacity.", "https://wheelermission.org/contact/", "Marion"],
  ["wheeler-women", "Wheeler Mission Center for Women & Children", "Indianapolis", "3208 E. Michigan Street, Indianapolis, IN", "317-687-3630", "Shelter and support for women and children. Call for bed availability and confidential intake instructions before traveling.", "https://wheelermission.org/contact/", "Marion"],
  ["ozanam-evansville", "Ozanam Family Shelter", "Evansville", "1100 Read Street, Evansville, IN 47710", "812-422-2214", "Emergency shelter serving families and helping keep households together. Call to ask about intake, eligibility, and current bed availability.", "https://echohousing.org/emergency-shelter/", "Vanderburgh"],
  ["united-caring-evansville", "United Caring Services — shelter and basic needs", "Evansville", "324 NW 6th Street, Evansville, IN 47708", "812-422-0297", "Shelter and basic-needs support in Evansville. Call to confirm current check-in, eligibility, and capacity; meal schedules may change.", "https://resources.swirca.org/en/individual-agency/?resource=60", "Vanderburgh"],
  ["evansville-rescue", "Evansville Rescue Mission — shelter and meals", "Evansville", "500 E. Walnut Street, Evansville, IN 47713", "812-421-3800", "Contact the mission for current shelter intake and meal access. Call to verify schedules and eligibility before traveling.", "https://www.evpl.org/community-resources/", "Vanderburgh"],
  ["house-bread-peace", "House of Bread and Peace — family shelter", "Evansville", null, "812-425-6754", "Evansville shelter resource listed by the local emergency-housing guide. Call for confidential intake instructions, eligibility, and current capacity.", "https://echohousing.org/emergency-shelter/", "Vanderburgh"],
  ["ywca-evansville", "YWCA Evansville — family-violence support and shelter access", "Evansville", null, "812-422-1191", "Local emergency-housing guide lists YWCA Evansville among shelter and safety resources. Call for confidential support and safe intake information; do not travel to an unconfirmed location.", "https://echohousing.org/emergency-shelter/", "Vanderburgh"],
];
export const INDIANA_HOUSING = shelterItems.map(([key, name, city, address, phone, description, link, county]) => local({
  id: `in-housing-${key}`, name, city, address, phone, county, serviceAreaCounties: [county],
  description, link, source: housingSource,
  locationLine: `${city}, Indiana · call to confirm safe intake and current availability`,
}));
export const INDIANA_HOUSING_REFERRALS = [
  statewide({ id: "in-housing-coordinated-entry", name: "Indiana Coordinated Entry — homelessness assessment and referral", city: "Indianapolis", phone: "211", description: "Indiana's housing system uses regional coordinated entry to connect people experiencing homelessness with shelter, prevention, rapid rehousing, and supportive-housing resources. Call 211 and ask for the local coordinated-entry access point. A referral is not a guarantee of placement or funding.", link: housingUrl, source: housingSource, locationLine: "Indiana statewide · ask 211 for your county's access point" }),
  statewide({ id: "in-housing-ihcda", name: "IHCDA Community Services — housing and utility programs", city: "Indianapolis", description: "Indiana Housing and Community Development Authority provides information about community services, energy assistance, renter support, and housing programs. Program openings, local administrators, and eligibility vary; use the agency page to find the route for your county.", link: housingUrl, source: housingSource, locationLine: "Indiana statewide · program and county access information" }),
  statewide({ id: "in-housing-veterans", name: "National Call Center for Homeless Veterans", city: "Indianapolis", phone: "877-424-3838", description: "Veterans who are homeless or at risk of homelessness can call the VA's 24/7 resource line for confidential connection to local support. Ask for Indiana housing and health resources; call 911 for immediate danger.", link: "https://www.va.gov/homeless/nationalcallcenter.asp", source: "U.S. Department of Veterans Affairs, National Call Center for Homeless Veterans", locationLine: "Indiana and nationwide · veterans and their supporters" }),
];

const benefitsUrl = "https://www.in.gov/fssa/dfr/food-assistance-availability-map/";
export const INDIANA_BENEFITS = [
  statewide({ id: "in-benefits-snap", name: "Indiana SNAP — food assistance application", city: "Indianapolis", phone: "800-403-0864", description: "Apply for Indiana SNAP and manage benefits through the official FSSA portal. Call the Division of Family Resources for application help, case questions, or a local office. Eligibility depends on household circumstances.", link: "https://fssabenefits.in.gov/", source: "Indiana FSSA, Division of Family Resources", locationLine: "Indiana statewide · applications and benefits support" }),
  statewide({ id: "in-benefits-medicaid", name: "Indiana Medicaid — enrollment and member support", city: "Indianapolis", phone: "800-457-4584", description: "Use Indiana's official Medicaid resources to apply, check enrollment, or find member support. Ask the plan or state how behavioral-health and substance-use services are covered; coverage and network rules vary.", link: "https://www.in.gov/medicaid/members/", source: "Indiana Medicaid, member information", locationLine: "Indiana statewide · health coverage and member support" }),
  statewide({ id: "in-benefits-tanf", name: "Indiana TANF — temporary cash assistance", city: "Indianapolis", phone: "800-403-0864", description: "Indiana's Temporary Assistance for Needy Families program provides qualifying families with time-limited cash assistance and related support. Apply or ask about eligibility and required documents through FSSA; approval is not guaranteed.", link: "https://www.in.gov/fssa/dfr/temporary-assistance-for-needy-families-tanf/", source: "Indiana FSSA, TANF program", locationLine: "Indiana statewide · family cash-assistance eligibility" }),
  statewide({ id: "in-benefits-energy", name: "Indiana Energy Assistance Program", city: "Indianapolis", phone: "211", description: "Indiana's Energy Assistance Program helps eligible households with energy costs through local community-action agencies. Call 211 or use IHCDA's county finder to locate the local intake provider and ask whether applications are open.", link: "https://www.in.gov/ihcda/energy-assistance/", source: "Indiana Housing and Community Development Authority, Energy Assistance Program", locationLine: "Indiana statewide · local agency intake varies by county" }),
  statewide({ id: "in-benefits-employment", name: "IMPACT Indiana — employment and training support", city: "Indianapolis", description: "Indiana FSSA's IMPACT program connects eligible participants to employment planning, training, and support services. Contact your local Division of Family Resources office to ask about referrals and current participation requirements.", link: "https://www.in.gov/fssa/dfr/impact/", source: "Indiana FSSA, IMPACT program", locationLine: "Indiana statewide · employment and training referrals" }),
  statewide({ id: "in-benefits-211", name: "Indiana 211 — local food, housing, and financial help", city: "Indianapolis", phone: "211", alternatePhone: "866-211-9966", description: "Call 211 or 866-211-9966 to ask for local food, shelter, rent and utility assistance, transportation, and other community referrals. Tell the navigator your city or county and ask for current intake details.", link: "https://in211.communityos.org/", source: "Indiana 211 and Indiana FSSA food assistance availability information", locationLine: "Indiana statewide · local resource navigation" }),
  statewide({ id: "in-benefits-housing-now", name: "IndianaHousingNow.org — affordable housing search", city: "Indianapolis", description: "IHCDA's housing locator helps search affordable rental and housing options in Indiana. Contact property managers directly to verify availability, rent, accessibility, application fees, and eligibility; a listing is not a reservation.", link: "https://indianahousingnow.org/", source: "Indiana Housing and Community Development Authority", locationLine: "Indiana statewide · affordable housing search" }),
  statewide({ id: "in-benefits-legal-aid", name: "Indiana Legal Services — civil legal assistance", city: "Indianapolis", phone: "844-243-8570", description: "Indiana Legal Services offers civil legal help to eligible low-income residents. Contact intake to ask about housing, benefits, family, or debt matters; case acceptance and eligibility depend on current program capacity and the issue.", link: "https://www.indianalegalservices.org/", source: "Indiana Legal Services", locationLine: "Indiana statewide · income and case eligibility apply" }),
];

const urgentUrl = "https://secure.in.gov/issp/";
export const INDIANA_URGENT = [
  statewide({ id: "in-988", name: "988 Suicide & Crisis Lifeline", city: "Indianapolis", phone: "988", description: "Call or text 988 for immediate emotional or behavioral-health crisis support, any time. If a person is in immediate physical danger or needs urgent medical care, call 911.", link: urgentUrl, source: "Indiana Suicide Prevention Partnership and 988 Lifeline", locationLine: "Indiana statewide · call or text 24/7" }),
  statewide({ id: "in-911", name: "Emergency services — immediate danger", city: "Indianapolis", phone: "911", description: "Call 911 for an immediate threat to life, urgent medical emergency, or immediate physical danger. Give the dispatcher the exact location and the safest way to reach the person.", source: "Indiana emergency guidance", locationLine: "Indiana statewide · emergency response" }),
  statewide({ id: "in-crisis-text", name: "Crisis Text Line — Indiana access", city: "Indianapolis", description: "Text IN to 741741 for free, confidential crisis support by text in Indiana. If texting is not safe or there is immediate danger, call 911.", link: urgentUrl, source: "Indiana Suicide Prevention Partnership", locationLine: "Indiana statewide · text support" }),
  statewide({ id: "in-988-spanish", name: "988 en Español", city: "Indianapolis", phone: "988", description: "Call 988 and select the Spanish-language option, or text AYUDA to 988, for crisis support in Spanish. For an immediate medical emergency, call 911.", link: "https://988lifeline.org/es/", source: "988 Lifeline, Spanish-language access", locationLine: "Indiana statewide · call or text 24/7" }),
  statewide({ id: "in-veterans-crisis", name: "Veterans Crisis Line", city: "Indianapolis", phone: "988", description: "Veterans, service members, and their supporters can call 988 and press 1, or text 838-255, for 24/7 crisis support. For immediate danger, call 911.", link: "https://www.veteranscrisisline.net/", source: "Veterans Crisis Line", locationLine: "Indiana statewide · veterans and supporters" }),
  statewide({ id: "in-samhsa", name: "SAMHSA National Helpline — treatment referral", city: "Indianapolis", phone: "800-662-4357", description: "Free, confidential information and referral for mental-health and substance-use treatment, available 24/7. Ask for Indiana programs and local access; this line does not provide emergency response.", link: "https://www.samhsa.gov/find-help/helplines/national-helpline", source: "SAMHSA National Helpline", locationLine: "Indiana and nationwide · 24/7 referral" }),
];

export const INDIANA_DIRECTORY_COUNT = INDIANA_TREATMENT.length + INDIANA_PEER.length + INDIANA_HOUSING.length + INDIANA_HOUSING_REFERRALS.length + INDIANA_FOOD.length + INDIANA_BENEFITS.length + INDIANA_URGENT.length;
