// Source-reviewed local access routes from state and recovery-network directories.
// These entries document published contacts; they are not phone-confirmed and do
// not promise intake, placement, eligibility, or current availability.
const reviewed = (record) => ({
  ...record,
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const KY_SOURCE = "https://www.chfs.ky.gov/agencies/dbhdid/Pages/crisisnos.aspx";
const MD_SOURCE = "https://dhcd.maryland.gov/housing/homeless-solutions/homeless-services-your-community";
const MI_SOURCE = "https://www.michigan.gov/mshda/homeless/homeless-and-special-housing-needs-programs/hara-contact-list";
const MN_SOURCE = "https://www.minnesotarecovery.org/rcos-in-minnesota/";
const MS_SOURCE = "https://www.dmh.ms.gov/service-options/intensive-community-services/";

const kyCenters = [
  ["four-rivers", "Four Rivers Behavioral Health", "800-592-3980", "http://www.4rbh.org", "Ballard, Calloway, Carlisle, Graves, Hickman, Livingston, Marshall, McCracken counties"],
  ["pennyroyal", "Pennyroyal Center", "877-473-7766", "http://www.pennyroyalcenter.org", "Caldwell, Christian, Crittenden, Hopkins, Lyon, Muhlenberg counties"],
  ["rivervalley", "RiverValley Behavioral Health", "800-433-7291", "http://www.rvbh.com", "Daviess, Hancock, Henderson, McLean, Ohio counties"],
  ["lifeskills", "LifeSkills, Inc.", "800-223-8913", "http://www.lifeskills.com", "Allen, Barren, Butler, Edmonson, Hart, Logan, Metcalfe, Monroe counties"],
  ["communicare", "Communicare, Inc.", "270-765-2605", "http://www.communicare.org", "Breckinridge, Grayson, Hardin, Larue, Marion, Meade, Nelson counties"],
  ["seven-counties", "Seven Counties Services", "502-589-1100", "http://www.sevencounties.org", "Bullitt, Henry, Jefferson counties"],
  ["northkey", "NorthKey Community Care", "859-331-3292", "http://www.northkey.org", "Boone, Campbell, Carroll, Gallatin, Grant, Kenton counties"],
  ["comprehend", "Comprehend, Inc.", "606-407-1086", "http://www.comprehendinc.org", "Bracken, Fleming, Lewis, Mason counties"],
  ["pathways", "Pathways, Inc.", "800-562-8909", "http://www.pathways-ky.org", "Bath, Boyd, Carter, Elliott, Greenup, Lawrence, Menifee, Montgomery, Morgan counties"],
  ["mountain", "Mountain Comprehensive Care Center", "800-422-1060", "https://www.mtcomp.org/", "Floyd, Johnson, Magoffin, Martin counties"],
  ["kentucky-river", "Kentucky River Community Care", "800-262-7491", "http://www.krccnet.com", "Breathitt, Knott, Lee, Leslie, Letcher counties"],
  ["cumberland-river", "Cumberland River Behavioral Health", "606-526-9552", "http://www.crbhky.org/", "Bell, Clay, Harlan, Jackson, Knox, Laurel counties"],
  ["adanta", "Adanta", "800-633-5599", "http://www.adanta.org", "Adair, Casey, Clinton, Cumberland, Green, McCreary counties"],
  ["new-vista", "New Vista", "800-928-8000", "https://www.newvista.org/", "Anderson, Bourbon, Clark, Estill, Fayette, Franklin, Garrard, Harrison, Jessamine, Lincoln, Madison, Mercer, Nicholas counties"],
];

export const KENTUCKY_CMH_CENTERS = kyCenters.map(([id, name, phone, website, serviceArea]) => reviewed({
  id: `ky-cmh-${id}`,
  name: `${name} — community mental-health and crisis access`,
  description: `Kentucky CHFS lists ${name} as the community mental-health center serving ${serviceArea}. The state directory publishes ${phone} as its 24-hour crisis number. Contact the center to ask about local outpatient care, substance-use services, referral steps, eligibility, and the correct local office. For immediate life-threatening danger, call 911 or go to an emergency department.`,
  city: serviceArea.split(",")[0], state: "KY", phone, link: website,
  source: "Kentucky CHFS county CMHC and 24-hour crisis directory",
  serviceArea, coverageScope: "multi-county regional provider",
  resourceType: "community mental-health center and crisis access",
  locationLine: `${serviceArea} · regional community mental-health access · call to confirm`,
}));

const mdHousing = [
  ["allegany", "Allegany County", "Cumberland", "301-784-7000"],
  ["anne-arundel", "Anne Arundel County", "Annapolis", "410-768-5522"],
  ["baltimore-city", "Baltimore City", "Baltimore", "Shelter 443-984-9540; general housing navigation 211"],
  ["baltimore-county", "Baltimore County", "Towson", "410-887-8463 (press 1)"],
  ["carroll", "Carroll County", "Westminster", "410-857-2999"],
  ["cecil", "Cecil County", "Elkton", "Mary Randall Day Center 410-620-4701; after-hours public-health emergency 410-392-2008"],
  ["frederick", "Frederick County", "Frederick", "301-600-1506"],
  ["garrett", "Garrett County", "Oakland", "Crisis housing 301-334-9431 ext. 6114"],
  ["harford", "Harford County", "Bel Air", "410-612-9909 ext. 2240"],
  ["howard", "Howard County", "Columbia", "Homelessness 410-531-6677; eviction prevention 410-313-6440; families with children 443-864-0379"],
  ["lower-shore", "Lower Shore: Somerset, Wicomico, and Worcester counties", "Salisbury", "211 or 443-523-1815"],
  ["mid-shore", "Mid-Shore: Caroline, Dorchester, Kent, Queen Anne’s, and Talbot counties", "Easton", "888-407-8018"],
  ["montgomery", "Montgomery County", "Rockville", "240-907-2688"],
  ["prince-georges", "Prince George’s County", "Largo", "888-731-0999"],
  ["st-marys", "Southern Maryland — St. Mary’s County", "Leonardtown", "240-895-7000"],
  ["charles", "Southern Maryland — Charles County", "La Plata", "301-392-6400"],
  ["calvert", "Southern Maryland — Calvert County", "Prince Frederick", "443-550-6900"],
  ["washington", "Washington County", "Hagerstown", "211 or 301-797-4161"],
];

export const MARYLAND_HOUSING_ACCESS = mdHousing.map(([id, serviceArea, city, phone]) => reviewed({
  id: `md-housing-access-${id}`,
  name: `${serviceArea} — homelessness and housing access`,
  description: `Maryland DHCD directs people who are homeless or at risk of homelessness to this local crisis line or primary service provider. Published contact: ${phone}. Call to explain your housing situation and ask about coordinated entry, shelter referrals, prevention support, eligibility, and current intake. A referral line is not confirmation of a shelter bed.`,
  city, county: serviceArea, state: "MD", phone, link: MD_SOURCE,
  source: "Maryland DHCD Homeless Services in Your Community",
  serviceArea, coverageScope: serviceArea.includes("counties") ? "multi-county regional access" : "county or city access",
  resourceType: "housing crisis and homelessness referral",
  locationLine: `${serviceArea} · housing and shelter referral · call to confirm current intake`,
}));

const miHousing = [
  ["alcona", "Alcona", "Northeast Michigan Community Service Agency", "Alpena", "2375 Gordon Rd., Alpena, MI 49707", "989-358-4678; 866-484-7077 ext. 278"],
  ["alger", "Alger", "Alger-Marquette Community Action Board", "Marquette", "1125 Commerce Dr., Marquette, MI 49855", "800-562-9762 ext. 0"],
  ["allegan", "Allegan", "OnPoint", "Allegan", "540 Jenner Drive, Allegan, MI 49010", "269-686-4703"],
  ["antrim", "Antrim", "Northwest Michigan CAA", "Traverse City", "3963 Three Mile Rd., Traverse City, MI 49686", "844-900-0500"],
  ["arenac", "Arenac", "Mid Michigan CAA", "Farwell", "1574 E Washington Rd., Farwell, MI 48622", "877-213-5955"],
  ["barry", "Barry", "Barry County United Way", "Hastings", "231 S Broadway St., Hastings, MI 49058", "269-945-4010"],
  ["bay", "Bay", "Mid Michigan CAA", "Farwell", "1574 E Washington Rd., Farwell, MI 48622", "877-213-5955"],
  ["berrien", "Berrien", "Emergency Shelter Services", "Benton Harbor", "185 E. Main St. Suite 103, Benton Harbor, MI 49022", "269-925-1131"],
  ["branch", "Branch", "Coldwater Housing Commission", "Coldwater", "60 South Clay Street, Coldwater, MI 49036", "517-278-2660"],
  ["calhoun", "Calhoun", "Neighborhoods Inc. of Battle Creek", "Battle Creek", "47 N Washington Ave., Battle Creek, MI 49037", "269-968-1113"],
  ["cass", "Cass", "Southwest Michigan CAA", "Benton Harbor", "185 E. Main St., Suite 303, Benton Harbor, MI 49022", "269-605-4526"],
  ["charlevoix", "Charlevoix", "Northwest Michigan CAA", "Petoskey", "2240 Mitchell St., Suite A, Petoskey, MI 49770", "844-900-0500"],
  ["cheboygan", "Cheboygan", "Northeast Michigan Community Service Agency", "Alpena", "2375 Gordon Rd., Alpena, MI 49707", "989-358-4678; 866-484-7077 ext. 278"],
  ["chippewa", "Chippewa", "Chippewa-Luce-Mackinac CAA", "Sault Ste. Marie", "524 Ashmun St., Sault Ste. Marie, MI 49783", "906-632-3363"],
  ["clinton", "Clinton", "Housing Services Mid Michigan", "St. Johns", "105 Tolles Rd., St. Johns, MI 48879", "989-224-5538"],
  ["delta", "Delta", "Menominee, Delta, Schoolcraft Community Action Agency", "Escanaba", "507 1st Avenue North, Escanaba, MI 49829", "906-789-0545"],
  ["eaton", "Eaton", "Housing Services Mid Michigan", "Charlotte", "319 S Cochran Ave., Charlotte, MI 48813", "517-541-1180"],
  ["genesee", "Genesee", "Genesee Community Health Center", "Flint", "422 W. Fourth Avenue, Flint, MI 48503", "810-600-4525"],
  ["gratiot", "Gratiot", "EightCAP, Inc.", "Alma", "525 N State St., Ste. 2, Alma, MI 48801", "616-225-5965"],
  ["hillsdale", "Hillsdale", "Community Action Agency", "Hillsdale", "55 Barnard St., Hillsdale, MI 49242", "517-437-3346"],
  ["huron", "Huron", "Human Development Commission", "Caro", "429 Montague Ave., Caro, MI 48723", "989-551-0809"],
  ["ingham", "Ingham", "Advent House Ministries", "Lansing", "743 N. Martin Luther King Jr. Blvd., Lansing, MI 48915", "517-485-4722; hotline 517-897-2454"],
  ["jackson", "Jackson", "Community Action Agency", "Jackson", "1214 Greenwood Ave., Jackson, MI 49203", "517-784-4800"],
  ["kalamazoo", "Kalamazoo", "Housing Resources Inc.", "Kalamazoo", "643 W. Crosstown Parkway, Kalamazoo, MI 49001", "269-382-0287"],
  ["kent", "Kent", "The Salvation Army Community Services", "East Grand Rapids", "1215 Fulton Street, East Grand Rapids, MI 49503", "211 or 616-459-3433"],
  ["macomb", "Macomb", "Macomb Community Action", "Clinton Township", "21885 Dunham Road, Suite 8, Clinton Township, MI 48036", "586-469-5656"],
  ["oakland", "Oakland", "Community Housing Network — Housing Resource Center", "Troy", "5505 Corporate Drive, Suite 300, Troy, MI 48098", "248-269-1335"],
  ["saginaw", "Saginaw", "United Way of Saginaw County", "Saginaw", "1840 N Michigan Ave, Saginaw, MI 48602", "989-758-4357 or 211"],
  ["washtenaw", "Washtenaw", "Washtenaw County Office of Community & Economic Development", "Ann Arbor", "Washtenaw County office; call to confirm the correct intake location", "734-961-1999"],
  ["out-wayne", "Out-Wayne", "Wayne Metropolitan Community Action Agency", "Wyandotte", "2005 Biddle Ave., Wyandotte, MI 48192", "734-284-6999"],
];

export const MICHIGAN_HOUSING_ACCESS = miHousing.map(([id, county, provider, city, address, phone]) => reviewed({
  id: `mi-hara-${id}`,
  name: `${provider} — ${county} County housing assessment and referral`,
  description: `Michigan State Housing Development Authority’s HARA directory lists ${provider} as the Housing Assessment and Resource Agency for ${county} County. The published intake contact is ${phone}; listed address: ${address}. Contact HARA before traveling to ask about coordinated housing assessment, prevention or shelter referrals, intake hours, service eligibility, and current capacity. Some agencies serve multiple counties from one office; this county label identifies the service area, not a separate branch.`,
  city, county: `${county} County`, state: "MI", address, phone, link: MI_SOURCE,
  source: "Michigan State Housing Development Authority HARA Contact List (updated October 23, 2026)",
  serviceArea: `${county} County`, coverageScope: "county housing-referral route; provider may serve multiple counties",
  resourceType: "Housing Assessment and Resource Agency (HARA)",
  locationLine: `${county} County · coordinated housing assessment and referral · call before visiting`,
}));

const mnOrganizations = [
  ["twin-cities-recovery-project", "Twin Cities Recovery Project", "Minneapolis", "serving African American communities, street outreach, opioid overdose prevention, and social events", "https://www.twincitiesrecoveryproject.org"],
  ["niyyah-recovery-initiative", "Niyyah Recovery Initiative", "Minneapolis", "serving East African communities, stigma reduction, public education, and support for Muslim women", "https://www.niyyahrecovery.org"],
  ["will-work-for-recovery", "Will Work for Recovery", "Minneapolis", "criminal-justice reentry support and social events", "https://www.willworkforrecovery.org"],
  ["continuum-care-center", "Continuum Care Center", "Minneapolis and Saint Paul", "street outreach, housing-insecurity support, and African American community support", "https://www.continuumcarecenter.com"],
  ["minnesota-hope-dealerz", "Minnesota Hope Dealerz", "Minneapolis and Saint Paul", "recovery-community social events", "https://www.minnesotahopedealerz.org"],
  ["rise-up-recovery", "Rise Up Recovery", "Hastings", "peer recovery support services, recovery housing, advocacy, and community education", "https://www.riseuprecoverymn.com"],
  ["docs-recovery-house", "Doc’s Recovery House", "Rochester", "pre-treatment transitional housing and peer recovery support", "https://www.docsrecoveryhouse.org"],
  ["recovery-is-happening", "Recovery Is Happening", "Rochester", "public education, policy advocacy, and peer-based recovery support", "https://recoveryishappening.org"],
  ["wecovery", "WEcovery by Beyond Brink", "Mankato", "pre-treatment transitional housing and peer recovery support", "https://beyondbrink.com"],
  ["recovery-community-network", "Recovery Community Network", "Saint Cloud", "veteran-focused and Spanish-language recovery support", "https://www.recoverycommunitynetwork.com"],
  ["just-hope", "Just Hope", "Saint Paul", "peer services, street outreach, and opioid overdose prevention", "https://www.justhopemn.org"],
  ["recovery-alliance-duluth", "Recovery Alliance Duluth", "Duluth and Virginia", "peer recovery support for people and families affected by substance-use disorders", "https://recoveryallianceduluth.org"],
  ["face-it-together-bemidji", "Face It Together Bemidji", "Bemidji", "peer recovery support, education, community outreach, and events", "https://faceittogetherbemidji.org"],
  ["social-services-minnesota", "Social Services of Minnesota", "Bloomington", "peer recovery support and reentry services", "https://socialmn.org"],
  ["mission-restart", "Mission Restart, Inc.", "Grand Rapids", "substance-use support and peer recovery support", "https://www.missionrestart.net"],
  ["thrive-family-recovery", "Thrive Family Recovery Resources", "Eagan and virtual", "family recovery support resources", "https://thrivefamilyrecoveryresources.org"],
  ["mn-prevention-recovery-alliance", "Minnesota Prevention and Recovery Alliance", "Statewide", "youth and young-adult peer support", "https://mnpra.org"],
  ["african-american-survivor-services", "African American Survivor Services", "Minneapolis", "community support and opioid overdose prevention", "https://aasurvivorservices.org"],
  ["against-the-odds", "Against the Odds Recovery and Reentry", "Carver County area", "peer recovery support, recovery housing, advocacy, and reentry", "https://atoministries.org"],
  ["amethyst-recovery-solutions", "Amethyst Recovery Solutions", "Minneapolis and Saint Paul", "peer recovery support, recovery housing, and advocacy", "https://www.amethystrecoverysolutions.org"],
  ["anything-helps", "Anything Helps!", "Minneapolis", "community drop-in support, overdose prevention, and social events", "https://www.anythinghelpsmn.org"],
  ["begin-anew", "Begin Anew", "Ramsey County", "continuing-education classes and reentry support", "https://www.beginanewrecovery.org"],
  ["community-life-services", "Community & Life Services", "Pelican Rapids", "peer recovery support, advocacy, and community education", "https://www.cl.services"],
  ["damascus-way", "Damascus Way", "Minneapolis", "peer recovery support, reentry housing, advocacy, and workforce education", "https://damascusway.com"],
  ["lighthouse-beginnings", "Lighthouse Beginnings", "Baxter", "peer recovery support, recovery housing, advocacy, and community education", "https://lighthousebeginnings.org"],
  ["recovery-in-the-woods", "Recovery in the Woods", "Virtual; Minnesota", "virtual peer recovery support and all-recovery meetings", "https://mnwitw.org"],
];

export const MINNESOTA_PEER_SUPPORT = mnOrganizations.map(([id, name, city, focus, link]) => reviewed({
  id: `mn-rco-${id}`, name: `${name} — peer and community recovery support`,
  description: `Minnesota Recovery Connection’s Recovery Community Organization directory lists ${name} in ${city} and describes its focus as ${focus}. This is non-clinical, community-based recovery support; it is not a substitute for medical or emergency care. Use the organization’s website to ask about current programs, meeting times, accessibility, cost, and eligibility before traveling.`,
  city, state: "MN", link, source: "Minnesota Recovery Connection — Recovery Community Organizations in Minnesota",
  serviceArea: city, coverageScope: city.toLowerCase().includes("statewide") || city.toLowerCase().includes("virtual") ? "statewide or virtual" : "local / regional peer support",
  resourceType: "recovery community organization and peer support",
  locationLine: `${city} · ${focus} · contact organization for current offerings`,
}));

const msPact = [
  ["lee", "Lee County", "Tupelo", "LifeCore", "662-594-2025"],
  ["desoto", "DeSoto County", "Hernando", "Region 4 Mental Health Services", "662-349-1260"],
  ["alcorn-prentiss-tippah-tishomingo", "Alcorn, Prentiss, Tippah, and Tishomingo counties", "Corinth area", "Region 4 Mental Health Services", "662-728-9706"],
  ["leflore-grenada-holmes", "Leflore, Grenada, and Holmes counties", "Greenwood area", "Life Help Mental Health Center", "662-451-5529"],
  ["rankin-madison", "Rankin and Madison counties", "Brandon area", "Region 8 Mental Health Services", "601-825-8800"],
  ["hinds", "Hinds County", "Jackson", "Hinds Behavioral Health Services", "601-586-3873"],
  ["lauderdale", "Lauderdale County", "Meridian", "Weems Community Mental Health Center", "601-484-5779"],
  ["forrest-perry", "Forrest and Perry counties", "Hattiesburg area", "Pine Belt Mental Healthcare Resources", "601-909-6832"],
  ["hancock-harrison", "Hancock and Harrison counties", "Gulfport area", "Pine Belt Mental Healthcare Resources", "228-213-5888"],
  ["warren-yazoo", "Warren and Yazoo counties", "Vicksburg area", "Warren-Yazoo Mental Health Services", "601-638-0024"],
];

export const MISSISSIPPI_PACT = msPact.map(([id, counties, city, provider, phone]) => reviewed({
  id: `ms-pact-${id}`, name: `${provider} — mobile PACT community treatment`,
  description: `Mississippi DMH lists a PACT contact for ${counties}: ${provider}, ${phone}. PACT is an intensive, multidisciplinary community mental-health service for people with serious mental illness who have not benefited from traditional outpatient care; teams deliver support in homes and community settings. Call to confirm referral criteria, catchment, and current intake. This is not an emergency line.`,
  city, state: "MS", phone, link: MS_SOURCE,
  source: "Mississippi Department of Mental Health Intensive Community Services directory",
  serviceArea: counties, coverageScope: "county or multi-county mobile team",
  resourceType: "Program of Assertive Community Treatment (PACT)",
  locationLine: `${counties} · mobile community mental-health treatment · call to confirm referral`,
}));
