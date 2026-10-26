// Alabama resources reviewed against ADMH, ADECA, ADPH, CAAA, and provider
// pages on 2026-10-25. Source review confirms published details only, not
// phone confirmation, current openings, eligibility, or exhaustive coverage.
const reviewed = (record) => ({ ...record, state: "AL", verified: true, checkedAt: "2026-10-25" });
const city = (record) => reviewed({ ...record, coverageScope: "city" });
const region = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state", locationLine: record.locationLine || "Alabama statewide · contact the service to confirm local access" });

const adeca = "https://adeca.alabama.gov/CSBG/";
const caaa = "https://alabamaimpacthub.org/resources/agency-locator";
const peerSource = "https://mh.alabama.gov/mental-health-organizations/peer-support/";
const behavioralSource = "https://alabamacouncil.org/find-a-provider";
const crisisSource = "https://mh.alabama.gov/crisis-centers/";

const communityActionAgencies = [
  ["northwest", "Community Action Agency of Northwest Alabama", "Florence", "Colbert, Franklin, Lauderdale", "256-766-4330", "https://www.caanw.org/", "745 Thompson Street, Florence, AL 35630"],
  ["huntsville", "Community Action Agency Huntsville/Madison and Limestone Counties", "Huntsville", "Madison, Limestone", "256-851-9800", "https://caa-htsval.org/", "3516 Stringfield Road NW, Huntsville, AL 35810"],
  ["walker", "Walker County Community Action Agency", "Jasper", "Walker", "205-221-4010", "https://www.caawalker.org/", "644 19th Street W, Jasper, AL 35501"],
  ["etowah", "Community Action of Etowah County", "Gadsden", "Etowah", "256-546-9271", "https://www.communityaction-etowah.org/", "624 Broad Street, Gadsden, AL 35901"],
  ["talladega", "Community Action Agency of Talladega, Clay, Randolph, Calhoun and Cleburne Counties", "Talladega", "Calhoun, Clay, Cleburne, Randolph, Talladega", "256-362-6611", "https://caatcrcc.org/", "136 North Court Street, Talladega, AL 35160"],
  ["middle-alabama", "Community Action Partnership of Middle Alabama", "Clanton", "Autauga, Chilton, Elmore, Shelby", "205-258-5198", "https://www.capmal.org/", "116 Chilton Place, Clanton, AL 35045"],
  ["chambers", "Chambers-Tallapoosa-Coosa Community Action Committee", "Dadeville", "Chambers, Coosa, Tallapoosa", "256-825-4287", "https://www.cacctc.com/", "170 South Broadnax Street, Dadeville, AL 36853"],
  ["montgomery", "Montgomery Community Action Committee", "Montgomery", "Montgomery", "334-263-3474", "https://mcacinc.org/", "1066 Adams Avenue, Montgomery, AL 36104"],
  ["ocap", "Organized Community Action Program", "Troy", "Bullock, Butler, Covington, Crenshaw, Dale, Lowndes, Pike", "334-566-1712", "https://ocaptroy.org/", "507 North Three Notch Street, Troy, AL 36081"],
  ["northeast", "Community Action Agency of Northeast Alabama", "Rainsville", "Blount, Cherokee, DeKalb, Jackson, Jefferson, Marshall, St. Clair", "256-638-4430", "https://www.caaneal.org/", "1481 McCurdy Avenue South, Rainsville, AL 35986"],
  ["mobile", "Mobile Community Action", "Mobile", "Mobile, Washington", "251-457-5700", "https://www.mcamobile.org/", "461 Donald Street, Mobile, AL 36617"],
  ["macon-russell", "Macon-Russell Community Action Agency", "Tuskegee", "Macon, Russell", "334-727-6100", adeca, "501 South School Street, Tuskegee, AL 36083"],
  ["pickens", "Pickens County Community Action Development Corporation", "Carrollton", "Pickens", "205-367-8166", "https://www.caapickens.org/", "71 Lakeside Street, Carrollton, AL 35447"],
  ["southeast", "Southeast Alabama Community Action Partnership", "Enterprise", "Barbour, Coffee, Geneva, Henry, Houston", "334-347-0881", "https://southeastalabamacommunityactionpartnership.org/", "100 George Wallace Drive, Enterprise, AL 36330"],
  ["south-alabama", "Community Action Agency of South Alabama", "Daphne", "Baldwin, Clarke, Conecuh, Escambia, Marengo, Monroe, Wilcox", "251-626-2646", "https://www.caaofsa.org/", "26640 North Pollard Road, Daphne, AL 36526"],
  ["north-alabama", "Community Action Partnership of North Alabama", "Decatur", "Cullman, Lawrence, Marion, Morgan, Winston", "256-355-7843", "https://capna.org/", "1909 Central Parkway SW, Decatur, AL 35601"],
  ["west-alabama", "Community Service Programs of West Alabama", "Tuscaloosa", "Bibb, Choctaw, Dallas, Fayette, Greene, Hale, Lamar, Perry, Sumter, Tuscaloosa", "205-752-5429", "https://cspwal.com/", "601 Black Bears Way, Tuscaloosa, AL 35401"],
  ["achr", "Alabama Council on Human Relations", "Auburn", "Lee", "334-821-8336", "https://www.achr.com/", "950 Shelton Mill Road, Auburn, AL 36830"],
];

const ALABAMA_BENEFITS_BASE = communityActionAgencies.map(([id, name, town, counties, phone, link, address]) => statewide({
  id: `al-csbg-${id}`, name: `${name} — county assistance and benefit navigation`,
  description: `Alabama ADECA identifies this Community Action Agency as the local CSBG contact for ${counties} County${counties.includes(",") ? "ies" : ""}. Community Action agencies may help eligible households navigate emergency needs such as food, housing, health services, employment, and self-sufficiency resources; programs vary by service area and funding. Call to ask which assistance is open, eligibility, documents, and application steps.`,
  phone, link, source: "Alabama Department of Economic and Community Affairs, Community Services Block Grant directory", city: town, address, serviceAreaCounties: counties.split(", "), locationLine: `${town} · serves ${counties} counties · call about current programs`, coverageScope: "region",
}));

const housingAgencies = ["northwest", "huntsville", "middle-alabama", "northeast", "mobile", "pickens", "southeast", "south-alabama", "north-alabama", "west-alabama"];
const ALABAMA_HOUSING_BASE = communityActionAgencies.filter(([id]) => housingAgencies.includes(id)).map(([id, name, town, counties, phone, link, address]) => region({
  id: `al-housing-${id}`, name: `${name} — housing assistance and referral`,
  description: `The Alabama Community Action Agency directory lists housing among this agency's services for ${counties} counties. Contact the office to learn whether its current program includes rent or utility help, housing stabilization, weatherization, or referrals; funding, eligibility, and intake vary.`,
  phone, link, source: "Community Action Association of Alabama agency directory", city: town, address, serviceAreaCounties: counties.split(", "), locationLine: `${town} · housing services listed for ${counties} counties · confirm current intake`,
}));

const foodAgencies = ["northwest", "huntsville", "mobile", "pickens", "southeast", "south-alabama", "north-alabama", "west-alabama"];
const ALABAMA_FOOD_BASE = communityActionAgencies.filter(([id]) => foodAgencies.includes(id)).map(([id, name, town, counties, phone, link, address]) => region({
  id: `al-food-${id}`, name: `${name} — food and nutrition assistance`,
  description: `The Alabama Community Action Agency directory lists food and nutrition among this agency's services for ${counties} counties. Call before visiting to ask whether food distribution or referrals are currently offered, how intake works, what eligibility applies, and whether an appointment or documents are needed.`,
  phone, link, source: "Community Action Association of Alabama agency directory", city: town, address, serviceAreaCounties: counties.split(", "), locationLine: `${town} · food and nutrition services listed for ${counties} counties · confirm distribution`,
}));

const providers = [
  ["altapointe", "AltaPointe Health Systems", "Mobile", "Mobile, Washington, Baldwin", "251-450-5901", "https://altapointe.org/", "5750A Southland Drive, Mobile, AL 36693"],
  ["the-bridge", "The Bridge", "Gadsden", "Statewide", "256-546-6324", "https://bridgeinc.org/", "3232 Laysprings Road, Gadsden, AL 35904"],
  ["carastar", "Carastar Health", "Montgomery", "Autauga, Elmore, Lowndes, Montgomery", "334-279-7830", "https://carastar.org/", "2140 Upper Wetumpka Road, Montgomery, AL 36107"],
  ["ced", "Cherokee Etowah DeKalb Mental Health Center", "Attalla", "Cherokee, Etowah, DeKalb", "256-492-7800", "https://cedmentalhealth.org/", "425 Fifth Avenue, Attalla, AL 35954"],
  ["central-wellness", "Central Alabama Wellness", "Calera", "Chilton, Shelby", "205-651-0077", "https://centralalabamawellness.org/", "Calera, AL · call for the service location"],
  ["eastside", "Eastside Mental Health Center", "Birmingham", "Eastern Jefferson, Blount, St. Clair", "205-836-7283", "https://eastsidecenter.org/", "129 East Park Circle, Birmingham, AL 35235"],
  ["fellowship-house", "Fellowship House", "Birmingham", "Jefferson, Walker", "205-933-2430", "https://fellowshiphouse.org/", "1625 12th Avenue South, Birmingham, AL 35205"],
  ["indian-rivers", "Indian Rivers Behavioral Health", "Tuscaloosa", "Tuscaloosa, Bibb", "205-391-3131", "https://www.irbh.org/", "2209 9th Street, Tuscaloosa, AL 35401"],
  ["integrea", "Integrea Community Mental Health Systems", "Opelika", "Chambers, Lee, Russell, Tallapoosa", "334-742-2700", "https://integreacmhs.com/", "2506 Lambert Drive, Opelika, AL 36801"],
  ["jefferson-blount", "Jefferson-Blount-St. Clair Mental Health Center", "Birmingham", "Jefferson, Blount, St. Clair", "205-595-4555", "https://jbsmentalhealth.com/", "940 Montclair Road, Suite 200, Birmingham, AL 35213"],
  ["north-central", "Mental Health Center of North Central Alabama", "Decatur", "Lawrence, Limestone, Morgan", "256-355-6105", "https://mhcnca.org/", "1316 Somerville Road, Decatur, AL 35601"],
  ["mountain-lakes", "Mountain Lakes Behavioral Healthcare", "Guntersville", "Marshall, Jackson", "256-582-4240", "https://mountainlakesbehavioralhealthcare.org/", "3200 Willow Beach Road, Guntersville, AL 35976"],
  ["riverbend", "Riverbend Center for Mental Health", "Florence", "Colbert, Franklin, Lauderdale", "256-764-3431", "https://riverbendcenter.org/", "635 West College Street, Florence, AL 35631"],
  ["spectracare", "SpectraCare Health Systems", "Dothan", "Barbour, Dale, Geneva, Henry, Houston", "334-712-2720", "https://spcare.com/", "P.O. Box 1245, Dothan, AL 36302 · call for clinic location"],
  ["sterling", "The Sterling Companies", "Gadsden", "Gadsden, Cherokee", "256-439-1575", "https://www.thesterlingcompanies.org/", "241 South 3rd Street, Suite A, Gadsden, AL 35901"],
  ["uab-cmhealth", "UAB Comprehensive Community Mental Health Center", "Birmingham", "Jefferson", "205-934-4108", "https://www.uab.edu/medicine/psychiatry/", "908 20th Street South, Birmingham, AL 35294"],
  ["uab-beacon", "UAB Beacon Recovery", "Birmingham", "Central Alabama", "205-580-3278", "https://www.uabmedicine.org/locations/beacon-recovery/", "530 Beacon Parkway West, Suite 300, Birmingham, AL 35209"],
  ["voa-alabama", "Volunteers of America Alabama", "Mobile", "South Alabama", "251-338-1252", "https://www.voa.org/locations/alabama/", "1204 Hillcrest Road, Mobile, AL 36695"],
  ["wellstone", "WellStone Behavioral Health", "Huntsville", "Madison, Cullman", "256-705-6300", "https://wellstone.com/", "4040 South Memorial Parkway, Huntsville, AL 35802"],
  ["west-alabama", "West Alabama Mental Health Center", "Demopolis", "Choctaw, Greene, Hale, Marengo, Sumter", "334-289-2410", "https://www.wamhc.org/", "Demopolis, AL · call to confirm clinic and service location"],
];

const ALABAMA_TREATMENT_BASE = providers.map(([id, name, town, counties, phone, link, address]) => region({
  id: `al-treatment-${id}`, name: `${name} — behavioral-health and recovery services`,
  description: `Listed by the Alabama Council for Behavioral Healthcare as a member provider serving ${counties}. Contact the provider to identify its current mental-health or substance-use services, age range, assessment and referral steps, insurance or fees, and appointment availability. The directory's service-area listing does not guarantee a particular treatment program or opening.`,
  phone, link, source: "Alabama Council for Behavioral Healthcare member provider directory", city: town, address, serviceAreaCounties: counties.split(", "), locationLine: `${town} · listed service area: ${counties} · confirm program and intake`,
}));

const peerCenters = [
  ["peir-brewton", "People Engaged in Recovery — Brewton Recovery Community Center", "Brewton", "Escambia County", "251-286-8213", "1023 Douglas Avenue, Suite 322, Brewton, AL 36426"],
  ["peir-dothan", "People Engaged in Recovery — Dothan Recovery Community Center", "Dothan", "Houston County", "334-446-1342", "1930 Wise Drive, Dothan, AL 36303"],
  ["peir-mobile", "People Engaged in Recovery — Mobile Recovery Community Center", "Mobile", "Mobile County", "251-219-7811", "3103 Airport Boulevard, Suite 160, Mobile, AL 36606"],
  ["ross-gadsden", "R.O.S.S. — Gadsden Recovery Community Center", "Gadsden", "Etowah County", "256-438-5285", "1024 1st Avenue, Gadsden, AL 35901"],
  ["ross-birmingham", "R.O.S.S. — Birmingham Recovery Community Center", "Birmingham", "Jefferson County", "205-848-2112", "2105 Joyce Street, Birmingham, AL 35222"],
  ["ross-huntsville", "R.O.S.S. — Madison County Community Center", "Huntsville", "Madison County", "256-713-8881", "8211 Stephanie Drive, Unit A, Huntsville, AL 35802"],
  ["ross-albertville", "R.O.S.S. — Marshall County Recovery Community Center", "Albertville", "Marshall County", "256-281-9008", "504 Mitchell Avenue, Albertville, AL 35951"],
  ["ross-montgomery", "R.O.S.S. — Montgomery Recovery Community Center", "Montgomery", "Montgomery County", "334-356-2890", "2100 Mt. Meigs Road, Montgomery, AL 36107"],
  ["ross-tuscaloosa", "R.O.S.S. — Tuscaloosa Community Center", "Tuscaloosa", "Tuscaloosa County", "205-248-7340", "2624 18th Street, Tuscaloosa, AL 35401"],
];

export const ALABAMA_PEER = [
  statewide({ id: "al-peer-admh-directory", name: "Alabama ADMH — peer support and recovery community centers", description: "The Alabama Department of Mental Health lists peer support, recovery community centers, and drop-in options for people affected by mental-health or substance-use challenges. Use the official directory to find a local center, then confirm schedule, eligibility, and whether walk-ins are welcome.", phone: "1-800-832-0952", link: "https://mh.alabama.gov/peer-support-drop-in-centers/", source: "Alabama Department of Mental Health", locationLine: "Alabama statewide · local peer center and group schedules vary" }),
  statewide({ id: "al-peer-wings-warmline", name: "Wings Across Alabama — peer groups and 24/7 warmline", description: "ADMH lists Wings Across Alabama for online and in-person peer support groups and a 24/7 warmline. Call to talk with a peer or ask about the current group calendar. A warmline provides peer connection, not emergency dispatch or clinical treatment.", phone: "1-844-999-4647", link: peerSource, source: "Alabama Department of Mental Health peer support directory", locationLine: "Statewide warmline · 24/7 peer support" }),
  statewide({ id: "al-peer-peir-line", name: "People Engaged in Recovery — Coastal Alabama peer recovery network", description: "ADMH lists P.E.I.R. as a recovery-support organization serving Coastal Alabama, with recovery community centers in Brewton, Dothan, and Mobile. Call its statewide number to ask about peer coaching, center activities, current schedules, and a connection near your county.", phone: "888-421-7347", link: peerSource, source: "Alabama Department of Mental Health peer support directory", locationLine: "Coastal Alabama · recovery community centers in Brewton, Dothan, and Mobile" }),
  statewide({ id: "al-peer-ross-line", name: "Recovery Organization of Support Specialists — statewide peer recovery connection", description: "ADMH lists R.O.S.S. as a peer recovery-support organization with community centers across Alabama. Call to ask about current recovery support, center hours, peer specialist services, and which location serves your community.", phone: "844-307-1760", link: peerSource, source: "Alabama Department of Mental Health peer support directory", locationLine: "Multiple Alabama communities · call for a nearby center" }),
  statewide({ id: "al-peer-nami", name: "NAMI Alabama — peer and family mental-health support", description: "NAMI's Alabama affiliate directory lists local affiliates and programs including NAMI Connection and Family Support Groups. Contact the statewide affiliate or use its current event schedule to find a local or virtual group; confirm registration, meeting format, and date.", phone: "334-396-4797", link: "https://namialabama.org/", source: "NAMI Alabama and NAMI affiliate directory", locationLine: "Statewide and local affiliates · check current event and support-group schedules" }),
  statewide({ id: "al-peer-aa-finder", name: "Alcoholics Anonymous — Alabama meeting search", description: "Find A.A. meetings by city or ZIP through the official meeting search. Confirm whether a meeting is open, its current format, venue, and time before traveling. A.A. is peer fellowship and is not medical withdrawal care or clinical treatment.", link: "https://www.aa.org/find-aa", source: "Alcoholics Anonymous World Services", locationLine: "Searchable by Alabama city or ZIP · confirm the current meeting details" }),
  statewide({ id: "al-peer-na-finder", name: "Narcotics Anonymous — Alabama meeting search", description: "The official NA meeting search locates meetings and local service contacts by city or ZIP. Verify current meeting times and location with the local fellowship. Peer meetings do not replace medical care for overdose or withdrawal.", link: "https://usa-na.org/find-na/", source: "Narcotics Anonymous USA", locationLine: "Searchable by Alabama city or ZIP · confirm current meeting details" }),
  ...peerCenters.map(([id, name, town, area, phone, address]) => city({
    id: `al-peer-${id}`, name, description: `The Alabama Department of Mental Health lists this recovery community center as a peer-led support option for ${area}. Call to ask about the current schedule, peer support available, eligibility, and whether the center is open for drop-in visits.`,
    phone, link: peerSource, source: "Alabama Department of Mental Health peer support directory", city: town, address, locationLine: `${town} · ${area} · call for schedule and drop-in access`,
  })),
];

const crisisCenters = [
  ["altapointe", "AltaPointe Behavioral Health Crisis Center", "Mobile", "251-662-8000", "2401 Gordon Smith Drive, Mobile, AL 36617", "Baldwin, Clarke, Conecuh, Escambia, Mobile, Monroe, Washington"],
  ["carastar", "Carastar Crisis Center", "Montgomery", "800-408-4197", "5915 Carmichael Road, Montgomery, AL 36117", "Autauga, Bullock, Chambers, Elmore, Lee, Lowndes, Macon, Montgomery, Pike, Russell, Tallapoosa"],
  ["jbs-craig", "JBS Craig Crisis Care Center", "Birmingham", "205-263-1701", "401 Beacon Parkway West, Birmingham, AL 35209", "Blount, Calhoun, Chilton, Clay, Cleburne, Coosa, Jefferson, Randolph, St. Clair, Shelby, Talladega"],
  ["hope-pointe", "Indian Rivers Hope Pointe Behavioral Health Crisis Care", "Tuscaloosa", "205-391-4000", "1401 Greensboro Avenue, Tuscaloosa, AL 35401", "Bibb, Choctaw, Dallas, Greene, Hale, Marengo, Perry, Pickens, Sumter, Tuscaloosa, Wilcox"],
  ["spectracare", "SpectraCare Crisis Center", "Dothan", "800-951-4357", "2740 Headland Avenue, Dothan, AL 36303", "Barbour, Dale, Geneva, Henry, Houston"],
  ["wellstone", "WellStone Emergency Services & Pediatric Crisis Care", "Huntsville", "256-705-6444", "4020 Memorial Parkway SW, Huntsville, AL 35802", "Cherokee, Cullman, DeKalb, Etowah, Fayette, Jackson, Lamar, Lawrence, Limestone, Madison, Marion, Marshall, Morgan, Walker, Winston"],
];

export const ALABAMA_URGENT = [
  ...crisisCenters.map(([id, name, town, phone, address, counties]) => city({
    id: `al-crisis-${id}`, name, description: `Alabama ADMH lists this center as a 24/7/365 walk-in behavioral-health crisis service, with clinical evaluation, stabilization, psychiatric care, and community referrals. It serves ${counties} counties. Call before travel if safe to do so; the published service area determines which center to use. For immediate physical danger, call 911.`,
    phone, link: crisisSource, source: "Alabama Department of Mental Health Crisis Centers directory", city: town, address, locationLine: `${town} · 24/7 crisis care · serves ${counties} counties`,
  })),
  statewide({ id: "al-988", name: "988 Suicide & Crisis Lifeline — Alabama", description: "Call or text 988 for free, confidential crisis support, 24 hours a day. If someone is in immediate physical danger or needs emergency medical help, call 911.", phone: "988", link: "https://988lifeline.org/", source: "Alabama Department of Mental Health and 988 Lifeline", locationLine: "Alabama statewide · call or text 988 · 24/7" }),
  statewide({ id: "al-211", name: "211 Connects Alabama — urgent local service referrals", description: "Call 211 or 888-421-1266, or text your ZIP code to 898-211, for free 24/7 referrals to local food, shelter, utilities, health, and other community support. Ask for a provider in your county and confirm current availability directly.", phone: "211", alternatePhone: "888-421-1266", link: "https://www.211connectsalabama.org/", source: "211 Connects Alabama", locationLine: "Alabama statewide · call 211, call toll-free, or text ZIP to 898-211" }),
];

export const ALABAMA_FOOD = [
  ...ALABAMA_FOOD_BASE,
  region({ id: "al-central-foodbank-finder", name: "Community Food Bank of Central Alabama — live pantry and meal locator", description: "Use the food bank's live map to find partner food distributions and meal programs around Birmingham and Central Alabama. This Birmingham address is the food bank office, not a walk-in pantry; use the locator to choose a distribution site and check its hours, eligibility, and freshness details before traveling. For help finding an active option, call 211 or 888-421-1266.", phone: "205-942-8911", link: "https://feedingal.org/find-food-near-you/", source: "Community Food Bank of Central Alabama food locator and contact information", city: "Birmingham", address: "107 Walter Davis Drive, Birmingham, AL 35209 · food bank office, not a public pantry", locationLine: "Birmingham and Central Alabama · use the live map for public distribution sites" }),
  statewide({ id: "al-wic-directory", name: "Alabama WIC — county clinic directory", description: "The Alabama Department of Public Health lists WIC clinic contacts by county and district. WIC offers nutrition support for eligible pregnant and postpartum people, infants, and children under five. Open your county's clinic page or call the district contact to confirm appointment location, eligibility, and documents.", phone: "1-888-942-4673", link: "https://www.alabamapublichealth.gov/wic/clinic-directory.html", source: "Alabama Department of Public Health WIC Clinic Directory", locationLine: "County clinics across Alabama · call for appointment and eligibility" }),
];

export const ALABAMA_TREATMENT = [
  ...ALABAMA_TREATMENT_BASE,
  statewide({ id: "al-admh-certified-provider-search", name: "Alabama ADMH — searchable behavioral-health and substance-use providers", description: "Search more than 200 ADMH-certified community providers by county, city, service, and provider category. The directory includes behavioral-health, substance-use, and other service types; select the service you need and contact the provider to confirm eligibility, intake, coverage, and current availability.", phone: "1-800-367-0955", link: "https://mh.alabama.gov/providers-search/", source: "Alabama Department of Mental Health provider directory", locationLine: "More than 600 provider locations statewide · filter by service and county" }),
  statewide({ id: "al-find-treatment", name: "Alabama substance-use treatment access — ADMH service directory", description: "Use Alabama ADMH's official treatment and provider pathways to identify assessment, outpatient, residential, and other substance-use services by county. Call the provider to ask about care level, insurance or fees, referral requirements, and current openings; no placement is guaranteed.", phone: "1-800-367-0955", link: "https://mh.alabama.gov/substance-abuse-treatment-services/", source: "Alabama Department of Mental Health", locationLine: "Statewide treatment navigation · confirm a provider and current intake" }),
];

export const ALABAMA_HOUSING = [
  ...ALABAMA_HOUSING_BASE,
  statewide({ id: "al-acadv-domestic-violence-safety", name: "Alabama Coalition Against Domestic Violence — confidential safety planning", description: "Call the statewide domestic-violence hotline for confidential help with safety planning, advocacy, and a connection to a local program. Shelter locations are intentionally kept confidential; call for a safe referral and current availability rather than traveling to an unlisted address.", phone: "1-800-650-6522", link: "https://acadv.org/", source: "Alabama Coalition Against Domestic Violence", locationLine: "Statewide confidential hotline · call for a local safe referral" }),
];

export const ALABAMA_BENEFITS = [
  ...ALABAMA_BENEFITS_BASE,
  statewide({ id: "al-snap-application", name: "Alabama SNAP Food Assistance — apply and manage benefits", description: "Alabama DHR administers SNAP food benefits for eligible households. Use the official application portal or contact the Food Assistance Division for application support, required documents, and status. County online services differ; confirm the correct route for your county.", phone: "1-800-382-0499", link: "https://mydhr.alabama.gov/", source: "Alabama Department of Human Resources Food Assistance Program", locationLine: "Statewide benefit · eligibility and application processed by Alabama DHR" }),
  statewide({ id: "al-medicaid-access", name: "Alabama Medicaid — coverage, applications, and local offices", description: "Use the official Alabama Medicaid pages to apply, check coverage, or find a county office and outstationed eligibility worker. Contact the agency to confirm which program fits your household and what documents are needed.", phone: "1-800-362-1504", link: "https://medicaid.alabama.gov/CONTENT/10.0_Contact/10.1_Medicaid_Contacts/10.1.1_Medicaid_Locations.aspx", source: "Alabama Medicaid Agency", locationLine: "Statewide coverage and county office directory" }),
];
