// Source-reviewed contacts for South Carolina, South Dakota, Tennessee, Utah,
// and Vermont. Listings document published access routes; availability and
// current intake are not phone-confirmed. See each entry's source and scope.
const checkedAt = "2026-10-30";
const record = ({ id, state, name, city, county, address, phone, link, source, serviceArea, resourceType, description, coverageScope = "local or regional" }) => ({
  id, state, name, city, county, address, phone, link, source, serviceArea,
  resourceType, description, locationLine: [city, county, serviceArea, "contact provider to confirm current intake"].filter(Boolean).join(" · "),
  coverageScope, verified: true, sourceReviewed: true, phoneConfirmed: false,
  exhaustiveCoverage: false, checkedAt,
});

const scTreatmentSource = "https://www.bhdd.sc.gov/mental-health/providers/mental-health-centers";
const scCenters = [
  ["columbia", "Columbia Area Mental Health Center", "Columbia", "Richland and Fairfield counties"],
  ["greenville", "Greater Greenville Mental Health Center", "Greenville", "Greenville County"],
  ["lexington", "Lexington County Community Mental Health Center", "Lexington", "Lexington County"],
  ["orangeburg", "Orangeburg Area Mental Health Center", "Orangeburg", "Bamberg, Orangeburg, and Calhoun counties"],
  ["pee-dee", "Pee Dee Mental Health Center", "Florence", "Florence, Darlington, and Marion counties"],
  ["santee-wateree", "Santee-Wateree Community Mental Health Center", "Sumter", "Sumter, Clarendon, Kershaw, and Lee counties"],
  ["spartanburg", "Spartanburg Area Mental Health Center", "Spartanburg", "Spartanburg, Union, and Cherokee counties"],
  ["tri-county", "Tri-County Community Mental Health Center", "Dillon", "Chesterfield, Marlboro, and Dillon counties"],
  ["waccamaw", "Waccamaw Center for Mental Health", "Conway", "Georgetown, Horry, and Williamsburg counties"],
];
export const SOUTH_CAROLINA_TREATMENT = scCenters.map(([id, name, city, serviceArea]) => record({
  id: `sc-treatment-${id}`, state: "SC", name: `${name} — public community mental-health services`, city,
  link: scTreatmentSource, source: "South Carolina Department of Behavioral Health and Developmental Disabilities, Mental Health Centers",
  serviceArea, resourceType: "community mental-health center",
  description: `${name} is listed by the South Carolina Department of Behavioral Health and Developmental Disabilities and serves ${serviceArea}. The state describes these centers as providing intensive mental-health services for residents, including people experiencing emotional distress or co-occurring needs. Contact the center to ask about age groups, assessment, substance-use services, insurance or fees, eligibility, and current intake. This listing does not confirm an appointment or immediate availability.`,
}));

const scHospitalSource = "https://www.scdhhs.gov/psychiatric-hospitals-directory";
const scHospitals = [
  ["carolina-center", "The Carolina Center for Behavioral Health", "Greer", "2700 East Point Phillip Road, Greer, SC 29650", "864-235-2335"],
  ["bryan", "G. Werber Bryan Psychiatric Hospital", "Columbia", "220 Faison Drive, Columbia, SC 29203", "803-935-7140"],
  ["palmetto-lowcountry", "Palmetto Lowcountry Behavioral Health", "Charleston", "2777 Speissegger Drive, Charleston, SC 29405", "843-747-5830"],
  ["three-rivers", "Three Rivers Behavioral Health", "West Columbia", "2900 Sunset Boulevard, West Columbia, SC 29169", "803-796-9911"],
  ["lighthouse", "Lighthouse Care Center of Conway", "Conway", "152 Waccamaw Medical Park Drive, Conway, SC 29526", "843-347-8871"],
  ["patrick-harris", "Patrick B. Harris Psychiatric Hospital", "Anderson", "130 Highway 252, Anderson, SC 29621", "864-231-2600"],
  ["springbrook", "Springbrook Behavioral Health", "Travelers Rest", "1 Havenwood Lane, Travelers Rest, SC 29690", "864-834-8013"],
  ["mccord", "William J. McCord Adolescent Treatment Facility", "Orangeburg", "910 Cook Road, Orangeburg, SC 29118", "803-536-4900"],
  ["rebound", "Rebound Behavioral Health Hospital", "Lancaster", "134 E. Rebound Road, Lancaster, SC 29720", "803-313-3714"],
];
export const SOUTH_CAROLINA_HOSPITALS = scHospitals.map(([id, name, city, address, phone]) => record({
  id: `sc-hospital-${id}`, state: "SC", name, city, address, phone, link: scHospitalSource,
  source: "South Carolina Department of Health and Human Services, Psychiatric Hospitals Directory",
  serviceArea: `${city} and surrounding areas`, resourceType: "psychiatric hospital contact",
  description: `${name} appears in the state psychiatric-hospital directory at ${address}; published phone: ${phone}. Call the facility or your clinician to determine whether it offers the level of care you need, whether a referral is required, and how assessment, insurance, and admission work. A directory entry does not mean a bed is available. For an immediate emergency, call 911 or use the statewide crisis dispatcher at 1-833-364-2274.`,
}));

const scCoCSource = "https://www.schomeless.org/the-council/local-continuums-of-care/";
export const SOUTH_CAROLINA_HOUSING = [
  ["upstate", "Upstate Continuum of Care — housing-service network", "Greenville", "Abbeville, Anderson, Cherokee, Edgefield, Greenville, Greenwood, Laurens, McCormick, Oconee, Pickens, Saluda, Spartanburg, and Union counties", "https://www.upstatecoc.org/", "United Housing Connections"],
  ["midlands", "Midlands Area Consortium on Homelessness — coordinated housing network", "Columbia", "Aiken, Allendale, Bamberg, Barnwell, Calhoun, Chester, Fairfield, Kershaw, Lancaster, Lexington, Newberry, Orangeburg, Richland, and York counties", "https://www.midlandshomeless.com/", "United Way of the Midlands"],
  ["eastern-carolina", "Total Care for the Homeless Coalition — housing-service network", "Florence", "Chesterfield, Clarendon, Darlington, Dillon, Florence, Georgetown, Horry, Kershaw, Lee, Marion, Marlboro, Sumter, and Williamsburg counties", "https://echomeless.org/", "Eastern Carolina Housing Organization"],
  ["lowcountry", "Lowcountry Continuum of Care — housing-service network", "Charleston", "Berkeley, Beaufort, Charleston, Colleton, Hampton, and Jasper counties", "https://lowcountrycoc.org/", "One80 Place"],
].map(([id, name, city, serviceArea, link, lead]) => record({
  id: `sc-housing-${id}`, state: "SC", name, city, link, source: "South Carolina Interagency Council on Homelessness, Local Continuums of Care",
  serviceArea, resourceType: "regional coordinated-housing network and provider referral",
  description: `The South Carolina Interagency Council on Homelessness identifies ${name} as the regional planning and service network for ${serviceArea}. Lead agency listed by the state council: ${lead}. Use the linked lead agency to locate local coordinated-entry, prevention, shelter, and housing providers; ask about referral steps and current openings before traveling. This regional network is not itself a shelter placement and does not guarantee a bed.`,
}));
SOUTH_CAROLINA_HOUSING.push(record({
  id: "sc-housing-statewide-211", state: "SC", name: "South Carolina 211 — housing and shelter navigation", city: "Statewide", phone: "211",
  link: "https://www.uwasc.org/sc211", source: "United Way Association of South Carolina, SC 211",
  serviceArea: "Statewide South Carolina; connects callers to local shelter and housing programs", coverageScope: "statewide housing navigation",
  resourceType: "24/7 housing, shelter, and human-services information and referral",
  description: "SC 211 provides 24/7 information and referral by phone, text, or online and connects residents to local housing, shelter, utilities, food, and other human services. Dial 211, text 211-211, or search sc211.org. Tell the navigator your county and immediate situation, then ask about eligibility, intake, and whether a shelter has current openings. 211 is a referral service and cannot guarantee shelter placement.",
}));

const scFoodSource = "https://www.harvesthope.org/about/locations";
export const SOUTH_CAROLINA_FOOD = [
  ["harvest-midlands", "Harvest Hope Food Bank — Midlands emergency pantry and partner finder", "Columbia", "2220 Shop Road, Columbia, SC 29201", "803-254-4432", "Calhoun, Chester, Fairfield, Kershaw, Lexington, Newberry, Orangeburg, Richland, and Saluda counties", "Monday–Thursday 9 a.m.–1 p.m.; Friday 9 a.m.–noon"],
  ["harvest-pee-dee", "Harvest Hope Food Bank — Pee Dee regional food assistance finder", "Florence", "2701 Alex Lee Boulevard, Florence, SC 29506", "843-661-0826", "Chesterfield, Clarendon, Darlington, Dillon, Florence, Lee, Marlboro, Marion, and Sumter counties", "The Florence site does not operate an emergency pantry; use the partner-agency search to find a nearby distribution site"],
  ["harvest-upstate", "Harvest Hope Food Bank — Upstate emergency pantry and partner finder", "Greenville", "2818 White Horse Road, Greenville, SC 29611", "864-281-3995", "Greenville and Laurens counties", "Monday–Thursday 9 a.m.–1 p.m."],
].map(([id, name, city, address, phone, serviceArea, hours]) => record({
  id: `sc-food-${id}`, state: "SC", name, city, address, phone, link: scFoodSource,
  source: "Harvest Hope Food Bank, Locations and Food Pantry information", serviceArea, resourceType: "regional food-bank / pantry referral",
  description: `Harvest Hope lists this regional contact at ${address}, phone ${phone}, serving ${serviceArea}. Published access note: ${hours}. Where the site directs people to its partner search, use that tool to identify a pantry serving your home county. Confirm hours, residency rules, documents, and available food before traveling; a distribution-center address is not necessarily a walk-in pantry.`,
}));
const scLowcountrySource = "https://lowcountryfoodbank.org/";
export const SOUTH_CAROLINA_FOOD_CENTERS = [
  ["charleston", "Lowcountry Food Bank — Charleston community food network", "Charleston", "2864 Azalea Drive, Charleston, SC 29405", "843-747-8146", "Berkeley, Charleston, and Dorchester counties"],
  ["early-branch", "Lowcountry Food Bank — Southern Regional Food Center", "Early Branch", "495 Commerce Parkway, Early Branch, SC 29916", "843-589-4118", "Beaufort, Colleton, Hampton, and Jasper counties"],
  ["myrtle-beach", "Lowcountry Food Bank — Northern Regional Food Center", "Myrtle Beach", "4716 Northgate Boulevard, Myrtle Beach, SC 29577", "843-448-0341", "Georgetown and Horry counties"],
].map(([id, name, city, address, phone, serviceArea]) => record({
  id: `sc-food-lowcountry-${id}`, state: "SC", name, city, address, phone, link: scLowcountrySource,
  source: "Lowcountry Food Bank, organizational contact and regional distribution-center directory", serviceArea,
  resourceType: "regional food-bank referral and partner pantry locator",
  description: `Lowcountry Food Bank lists ${name} at ${address}, phone ${phone}. The organization serves South Carolina's coastal counties through distribution centers and partner agencies. Ask for a public pantry or meal site serving ${serviceArea}, and confirm hours, eligibility, and current distribution arrangements before visiting; the listed center is a food-bank facility and is not represented as a walk-in pantry.`,
}));

const scUrgentSource = "https://www.bhdd.sc.gov/mental-health/providers/mental-health-centers";
export const SOUTH_CAROLINA_URGENT = [record({
  id: "sc-mobile-crisis-dispatch", state: "SC", name: "South Carolina Mobile Crisis — statewide dispatcher", city: "Statewide", phone: "1-833-364-2274", link: scUrgentSource,
  source: "South Carolina Department of Behavioral Health and Developmental Disabilities, Mental Health Centers",
  serviceArea: "Statewide, South Carolina", coverageScope: "statewide crisis access", resourceType: "24/7 mobile-crisis dispatch",
  description: "The state BHDD directory directs people experiencing a mental-health emergency to its statewide mobile-crisis response dispatcher at 1-833-364-2274, or to call/text/chat 988. Call to explain your location and ask what response is available. If there is immediate danger or an urgent medical emergency, call 911.",
})];
const scBenefitsSource = "https://dss.sc.gov/media/hxnn4gwz/snap-outreah-toolkit_01092026_v6.pdf";
const scCountyOffices = [
  ["abbeville", "Abbeville", "Abbeville", "909 West Greenwood Street, Suite 1, Abbeville, SC 29620"],
  ["aiken", "Aiken", "Aiken", "1410 Park Avenue SE, Aiken, SC 29810"],
  ["allendale", "Allendale", "Allendale", "521 Barnwell Highway, Allendale, SC 29625"],
  ["anderson", "Anderson", "Anderson", "224 McGee Road, Anderson, SC"],
  ["bamberg", "Bamberg", "Bamberg", "374 Log Branch Road, Bamberg, SC 29003"],
  ["barnwell", "Barnwell", "Barnwell", "10913 Ellenton Street, Barnwell, SC 29812"],
  ["beaufort", "Beaufort", "Beaufort", "1905 Duke Street, Beaufort, SC 29902"],
  ["berkeley", "Berkeley", "Moncks Corner", "2 Belt Drive, Moncks Corner, SC 29461"],
  ["calhoun", "Calhoun", "St. Matthews", "2831 Old Belleville Road, St. Matthews, SC 29135"],
  ["charleston", "Charleston", "North Charleston", "3685 Rivers Avenue, Suite 101, North Charleston, SC 29405"],
  ["cherokee", "Cherokee", "Gaffney", "113 West Buford Street, Gaffney, SC 29340"],
  ["chester", "Chester", "Chester", "115 Reedy Street, Chester, SC 29706"],
  ["chesterfield", "Chesterfield", "Chesterfield", "203 Perry Wiley Way, Chesterfield, SC 29709"],
  ["clarendon", "Clarendon", "Manning", "236 Commerce Street, Suite 2, Manning, SC 29102"],
  ["colleton", "Colleton", "Walterboro", "215 South Lemacks Street, Walterboro, SC 29488"],
  ["darlington", "Darlington", "Darlington", "Mozingo Building, 300 Russell Street, Darlington, SC 29532"],
  ["dillon", "Dillon", "Dillon", "1211 Highway 34 West, Dillon, SC 29536"],
  ["dorchester", "Dorchester", "Summerville", "1452 Boone Hill Road, Suite C, Summerville, SC 29483"],
  ["edgefield", "Edgefield", "Edgefield", "120 W.A. Reel Drive, Edgefield, SC 29824"],
  ["fairfield", "Fairfield", "Winnsboro", "1136 Kincaid Bridge Road, Winnsboro, SC 29180"],
  ["florence", "Florence", "Florence", "2685 South Irby Street, Florence, SC 29505"],
  ["georgetown", "Georgetown", "Georgetown", "330 Dozier Street, Georgetown, SC 29440"],
  ["greenville", "Greenville", "Greenville", "352 Halton Road, Greenville, SC 29607"],
  ["greenwood", "Greenwood", "Greenwood", "1118 Phoenix Street, Greenwood, SC 29648"],
  ["hampton", "Hampton", "Hampton", "102 Ginn Altman Avenue, Suite A, Hampton, SC 29924"],
  ["horry", "Horry", "Conway", "1951 Industrial Park Road, Conway, SC 29526"],
  ["jasper", "Jasper", "Ridgeland", "10908 North Jacob Smart Boulevard, Ridgeland, SC 29936"],
  ["kershaw", "Kershaw", "Camden", "110 East DeKalb Street, Camden, SC 29020"],
  ["lancaster", "Lancaster", "Lancaster", "1837 Pageland Highway, Lancaster, SC 29720"],
  ["laurens", "Laurens", "Clinton", "211 North Broad Street, Suite B, Clinton, SC 29325"],
  ["lee", "Lee", "Bishopville", "820 Brown Street, Bishopville, SC 29010"],
  ["lexington", "Lexington", "Lexington", "1070 South Lake Drive, Suite A, Lexington, SC 29073"],
  ["mccormick", "McCormick", "McCormick", "215 North Mine Street, Highway 28 North, McCormick, SC 29835"],
  ["marion", "Marion", "Mullins", "137 Airport Court, Suite A, Mullins, SC 29574"],
  ["marlboro", "Marlboro", "Bennettsville", "713 South Parsonage Street Extension, Bennettsville, SC 29512"],
  ["newberry", "Newberry", "Newberry", "2107 Wilson Road, Newberry, SC 29108"],
  ["oconee", "Oconee", "Walhalla", "223A Kenneth Street, Walhalla, SC 29691"],
  ["orangeburg", "Orangeburg", "Orangeburg", "114 Howard Hill Drive, Orangeburg, SC 29118"],
  ["pickens", "Pickens", "Pickens", "212 McDaniel Avenue, Pickens, SC 29671"],
  ["richland", "Richland", "Columbia", "3220 Two Notch Road, Columbia, SC 29204"],
  ["saluda", "Saluda", "Saluda", "3191 Newberry Highway, Saluda, SC 29138"],
  ["spartanburg", "Spartanburg", "Spartanburg", "630 Chesnee Highway, Spartanburg, SC 29303"],
  ["sumter", "Sumter", "Sumter", "115 North Harvin Street, Sumter, SC 29150"],
  ["union", "Union", "Union", "200 South Mountain Street, Union, SC 29379"],
  ["williamsburg", "Williamsburg", "Kingstree", "121 Hampton Avenue, Kingstree, SC 29556"],
  ["york", "York", "Rock Hill", "933 Heckle Boulevard, Rock Hill, SC 29732"],
];
export const SOUTH_CAROLINA_BENEFITS = scCountyOffices.map(([id, county, city, address]) => record({
  id: `sc-benefits-${id}`, state: "SC", name: `${county} County Department of Social Services — SNAP and cash-assistance office`, county, city, address,
  phone: "800-616-1309", link: scBenefitsSource,
  source: "South Carolina Department of Social Services, SNAP Toolkit (January 9, 2026) and SNAP application assistance guide",
  serviceArea: `${county} County`, resourceType: "county benefits application and case-support office",
  description: `South Carolina DSS lists its ${county} County office at ${address}. The January 2026 state SNAP toolkit identifies this as the local county office address; DSS publishes 800-616-1309 for office contact information and SNAP application or case questions. Call before visiting to confirm current public hours, whether appointments are needed, language or disability accommodations, and which benefits can be handled at this site. Eligibility and benefit approval are determined by DSS.`,
}));
const scRecoveryTreatmentSource = "https://embracerecoverysc.com/find-help/";
const scCountyTreatment = [
  ["abbeville", "Cornerstone — Abbeville", "Abbeville", "103 Whitehall Street, Abbeville, SC 29620", "https://www.cornerstonecares.org/"],
  ["anderson", "Anderson Oconee Behavioral Health Services — Anderson", "Anderson", "226 McGee Road, Anderson, SC 29625", "https://www.aobhs.org/"],
  ["cherokee", "Cherokee County Commission on Alcohol and Drug Abuse", "Gaffney", "201 West Montgomery Street, Gaffney, SC 29341", "https://www.cherokeerecovery.com/"],
  ["greenville", "The Phoenix Center", "Greenville", "1400 Cleveland Street, Greenville, SC 29607", "https://www.phoenixcenter.org/"],
  ["greenwood", "Cornerstone — Greenwood", "Greenwood", "1612 Rivers Street, Greenwood, SC 29649", "https://www.cornerstonecares.org/"],
  ["laurens", "GateWay Counseling Center", "Clinton", "219 Human Services Road, Clinton, SC 29325", "https://www.gatewaycounseling.org/"],
  ["mccormick", "Cornerstone — McCormick", "McCormick", "504 North Mine Street, McCormick, SC 29835", "https://www.cornerstonecares.org/"],
  ["oconee", "Anderson Oconee Behavioral Health Services — Seneca", "Seneca", "205 Holleman Street, Seneca, SC 29678", "https://www.aobhs.org/"],
  ["pickens", "Behavioral Health Services of Pickens County", "Easley", "208 East First Avenue, Easley, SC 29640", "https://bhspickens.com/"],
  ["spartanburg", "The Forrester Center for Behavioral Health", "Spartanburg", "129 Dillon Drive, Spartanburg, SC 29307", "https://www.theforrestercenter.org/"],
  ["union", "Healthy U Behavioral Health Services", "Union", "201 South Herndon Street, Union, SC 29379", "https://unionhubhs.org/"],
  ["aiken", "Aiken Center", "Aiken", "1105 Gregg Highway, Aiken, SC 29801", "https://aikencenter.org/"],
  ["allendale", "New Life Center — Allendale", "Allendale", "571 Memorial Avenue, Allendale, SC 29810", "https://newlifecenteradc.org/"],
  ["bamberg", "Tri-County Commission on Alcohol and Drug Abuse — Bamberg", "Bamberg", "2549 Main Highway, Bamberg, SC 29003", "https://www.tccada.com/"],
  ["barnwell", "Axis I Center of Barnwell", "Barnwell", "179 Fuldner Road, Barnwell, SC 29812", "https://axis1.org/"],
  ["beaufort", "Nexus Care of Beaufort County", "Beaufort", "1905 Duke Street, Beaufort, SC 29901", "https://www.beaufortcountysc.gov/"],
  ["berkeley", "Ernest E. Kennedy Center", "Moncks Corner", "306 Airport Drive, Moncks Corner, SC 29461", "https://www.ekcenter.org/"],
  ["calhoun", "Tri-County Commission on Alcohol and Drug Abuse — Calhoun", "Orangeburg", "910 Cook Road, Orangeburg, SC 29118", "https://www.tccada.com/"],
  ["charleston", "Charleston Center", "North Charleston", "3685 Rivers Avenue, Suite 301, North Charleston, SC 29405", "https://cc.charlestoncounty.org/"],
  ["chester", "Hazel Pittman Center", "Chester", "130 Hudson Street, Chester, SC 29706", "https://hazelpittman.org/"],
  ["chesterfield", "ALPHA Behavioral Health Center — Chesterfield", "Chesterfield", "120 Commons Drive, Chesterfield, SC 29709", "https://www.alphabehavioralhealthcenter.org/"],
  ["clarendon", "Clarendon Behavioral Health Services", "Manning", "14 North Church Street, Manning, SC 29102", "https://www.clarendonbhs.com/"],
  ["colleton", "Pillars4Hope", "Walterboro", "1439 Thunderbolt Drive, Walterboro, SC 29488", "https://www.pillars4hope.org/"],
  ["darlington", "Rubicon Family Counseling Services", "Hartsville", "510 East Carolina Avenue, Hartsville, SC 29550", "https://rubiconsc.org/"],
  ["dillon", "Trinity Behavioral Care — Dillon", "Dillon", "1719 Commerce Drive, Dillon, SC 29536", "https://www.trinitybehavioralcare.org/"],
  ["dorchester", "Dorchester Alcohol and Drug Commission", "Summerville", "320 Midland Parkway, Suite C, Summerville, SC 29485", "https://www.dadc.org/"],
  ["edgefield", "Cornerstone — Edgefield", "Edgefield", "603 Augusta Road, Edgefield, SC 29824", "https://www.cornerstonecares.org/"],
  ["fairfield", "Fairfield Behavioral Health Services", "Winnsboro", "178 US-321 Bypass North, Winnsboro, SC 29180", "https://fairfieldbhs.org/"],
  ["florence", "Circle Park Behavioral Health Services", "Florence", "238 South Coit Street, Florence, SC 29501", "https://www.circlepark.com/"],
  ["georgetown", "Georgetown County Alcohol and Drug Abuse Commission", "Georgetown", "1423 Winyah Street, Georgetown, SC 29440", "https://gcadac.net/"],
  ["hampton", "New Life Center — Hampton", "Hampton", "102 Ginn Altman Avenue, Suite C, Hampton, SC 29924", "https://newlifecenteradc.org/"],
  ["horry", "Shoreline Behavioral Health Services", "Conway", "2404 Wise Road, Conway, SC 29526", "https://shorelinebhs.org/"],
  ["jasper", "New Life Center — Jasper", "Ridgeland", "651 Grays Highway, Ridgeland, SC 29936", "https://newlifecenteradc.org/"],
  ["kershaw", "ALPHA Behavioral Health Center — Kershaw", "Camden", "208 King Street, Camden, SC 29020", "https://www.alphabehavioralhealthcenter.org/"],
  ["lancaster", "Counseling Services of Lancaster", "Lancaster", "114 South Main Street, Lancaster, SC 29720", "https://www.counselingserviceslancaster.org/"],
  ["lee", "The Lee Center", "Bishopville", "108 East Church Street, Bishopville, SC 29010", "https://www.alphabehavioralhealthcenter.org/"],
  ["lexington", "LRADAC — Lexington", "Lexington", "1068 South Lake Drive, Lexington, SC 29073", "https://lradac.org/"],
  ["marion", "Trinity Behavioral Care — Marion", "Mullins", "424 Guyton Court, Mullins, SC 29574", "https://www.trinitybehavioralcare.org/"],
  ["marlboro", "Trinity Behavioral Care — Marlboro", "Bennettsville", "515 David's Pond Road, Bennettsville, SC 29512", "https://www.trinitybehavioralcare.org/"],
  ["newberry", "Westview Behavioral Health Services — Newberry", "Newberry", "800 Main Street, Newberry, SC 29108", "https://www.westviewbehavioral.org/"],
  ["orangeburg", "Tri-County Commission on Alcohol and Drug Abuse — Orangeburg", "Orangeburg", "910 Cook Road, Orangeburg, SC 29118", "https://www.tccada.com/"],
  ["richland", "LRADAC — Richland", "Columbia", "2711 Colonial Drive, Columbia, SC 29203", "https://lradac.org/"],
  ["saluda", "Westview Behavioral Health Services — Saluda", "Saluda", "204 Ramage Street, Saluda, SC 29138", "https://www.westviewbehavioral.org/"],
  ["sumter", "Sumter Behavioral Health Services", "Sumter", "755 Electric Drive, Sumter, SC 29153", "https://www.sumterbhs.org/"],
  ["williamsburg", "Williamsburg County Behavioral Health", "Hemingway", "2811 South State Highway 41-51, Hemingway, SC 29554", "https://www.williamsburgcounty.sc.gov/"],
  ["york", "Keystone Behavioral Health", "Rock Hill", "199 South Herlong Avenue, Rock Hill, SC 29732", "https://keystoneyork.org/"],
];
export const SOUTH_CAROLINA_SUBSTANCE_USE = scCountyTreatment.map(([id, name, city, address, link]) => record({
  id: `sc-substance-treatment-${id}`, state: "SC", name: `${name} — county substance-use treatment access`, city, county: `${id} County`, address, link,
  source: "South Carolina Department of Behavioral Health and Developmental Disabilities, Embrace Recovery SC Find Help directory",
  serviceArea: `${id} County and surrounding service area`, resourceType: "community substance-use treatment and recovery referral",
  description: `South Carolina's Embrace Recovery SC locator lists ${name} at ${address} as a county-based substance-use and recovery service contact. Open the provider website or call the organization to confirm current services, age groups, assessment and referral steps, insurance or fees, medication options, and intake. A listing does not confirm an appointment or placement.`,
}));
const scPeerSource = "https://www.couragecentersc.org/locations";
export const SOUTH_CAROLINA_PEER = [
  ["courage-lexington", "The Courage Center — Lexington peer recovery center", "Lexington", "860 Park Road, Lexington, SC 29072", "803-369-3905", "https://www.couragecentersc.org/locations"],
  ["courage-richland", "The Courage Center — Richland peer recovery center", "Columbia", "1535-D Broad River Road, Columbia, SC 29210", "803-369-3905", "https://www.couragecentersc.org/locations"],
  ["courage-orangeburg", "The Courage Center — Orangeburg peer recovery center", "Orangeburg", "950 Holly Street, Orangeburg, SC 29115", "803-987-8700", "https://www.couragecentersc.org/locations"],
  ["courage-aiken", "The Courage Center — Aiken peer recovery center", "Aiken", "154 Pendleton Street NW, Aiken, SC 29801", "803-369-3905", "https://www.couragecentersc.org/locations"],
  ["access-favor", "ACCESS FAVOR — peer recovery and harm-reduction support", "Conway", "1717 Fourth Avenue, Suite D, Conway, SC 29527", "843-488-1011", "https://accessfavor.org/"],
].map(([id, name, city, address, phone, link]) => record({
  id: `sc-peer-${id}`, state: "SC", name, city, address, phone, link, source: "South Carolina recovery organization, official locations and contact pages",
  serviceArea: city, resourceType: "peer recovery, family support, and community connection",
  description: `${name} publishes its contact at ${address}; phone ${phone}. The Courage Center describes no-cost peer-led recovery services; ACCESS FAVOR describes confidential community support, all-recovery meetings, harm-reduction supplies, and appointment-based help. Contact the organization to confirm current schedules, age eligibility, walk-in or appointment requirements, and access needs. Peer support complements but does not replace clinical or crisis care.`,
}));

const sdTreatmentSource = "https://sdbehavioralhealth.gov/mental-health/treatment";
const sdCenters = [
  ["brookings", "Brookings Behavioral Health and Wellness", "Brookings", "211 Fourth Street, Brookings, SD 57006", "605-697-2850", "Brookings"],
  ["capital-area", "Capital Area Counseling Service", "Pierre", "2001 Eastgate Avenue, Pierre, SD 57501", "605-224-5811", "Buffalo, Haakon, Hughes, Hyde, Jones, Lyman, Potter, Stanley, and Sully"],
  ["community-counseling", "Community Counseling Services", "Huron", "357 Kansas Avenue SE, Huron, SD 57350", "605-352-8596", "Beadle, Hand, Jerauld, Kingsbury, Lake, Miner, and Moody"],
  ["dakota-counseling", "Dakota Counseling Institute", "Mitchell", "910 W. Havens Avenue, Mitchell, SD 57301", "605-996-9686", "Aurora, Brule, Davison, Hanson, and Sanborn"],
  ["human-service", "Human Service Agency", "Watertown", "123 19th Street NE, Watertown, SD 57201", "605-886-0123", "Clark, Codington, Deuel, Grant, Hamlin, and Roberts"],
  ["lewis-clark", "Lewis & Clark Behavioral Health Services", "Yankton", "3111 Shirley Bridge Avenue, Yankton, SD 57078", "605-665-4606", "Bon Homme, Charles Mix, Clay, Douglas, Hutchinson, Union, and Yankton"],
  ["northeastern", "Northeastern Mental Health Center", "Aberdeen", "14 S. Main Street, Suite 1E, Aberdeen, SD 57401", "605-225-1010", "Brown, Campbell, Day, Edmunds, Faulk, Marshall, McPherson, Spink, and Walworth"],
  ["southeastern", "Southeastern Behavioral HealthCare", "Sioux Falls", "2000 S. Summit Avenue, Sioux Falls, SD 57105", "605-336-0510", "Lincoln, McCook, Minnehaha, and Turner"],
  ["southern-plains", "Southern Plains Behavioral Health Services", "Winner", "500 E. Ninth Street, Winner, SD 57580", "605-842-1465", "Gregory, Mellette, Todd, and Tripp"],
  ["three-rivers", "Three Rivers Mental Health and Chemical Dependency Center", "Lemmon", "11 E. Fourth Street, Lemmon, SD 57638", "605-374-3862", "Corson, Dewey, Perkins, and Ziebach"],
  ["west-river", "West River Mental Health", "Rapid City", "350 Elk Street, Rapid City, SD 57701", "605-343-7262", "Bennett, Butte, Custer, Fall River, Harding, Jackson, Lawrence, Meade, Oglala Lakota, and Pennington"],
];
export const SOUTH_DAKOTA_TREATMENT = sdCenters.map(([id, name, city, address, phone, serviceArea]) => record({
  id: `sd-treatment-${id}`, state: "SD", name: `${name} — community mental-health treatment`, city, address, phone, link: sdTreatmentSource,
  source: "South Dakota Behavioral Health, Mental Health Treatment Services directory", serviceArea,
  resourceType: "publicly funded community mental-health center",
  description: `South Dakota Behavioral Health identifies ${name} as a publicly funded community mental-health provider serving ${serviceArea}. The state describes services ranging from short-term counseling to outpatient care, case management, psychiatric medication monitoring, and telehealth. Published phone: ${phone}. Call to confirm service eligibility, fees or financial assistance, current intake, and telehealth options.`,
}));

const sdHousingSource = "https://sdbehavioralhealth.gov/recovery-housing";
const sdHomes = [
  ["teen-challenge", "Teen Challenge of the Dakotas", "Brookings", "605-693-9753", "https://www.tcdakotas.org/", "adult recovery-oriented housing and services"],
  ["hope-house", "Hope House", "Huron", "605-354-4564", "https://hopehouselc.com/", "recovery-oriented housing"],
  ["passages", "Passages Women's Transitional Living", "Rapid City", "605-791-0273", "https://passagesliving.com/", "women's transitional recovery housing"],
  ["reflections", "Reflections Recovery Home", "Redfield", "605-460-2444", "https://reflectionsrecoverysd.com/", "recovery home"],
  ["glory-house", "Glory House", "Sioux Falls", "605-988-9125", "https://glory-house.org/", "recovery housing and support"],
  ["kingdom-boundaries", "Kingdom Boundaries Prison Aftercare Ministry", "Sioux Falls", "605-201-8493", "https://kingdomboundaries.org/", "reentry and recovery housing support"],
  ["southeastern-bh", "Southeastern Behavioral HealthCare recovery housing", "Sioux Falls", "605-336-0510", "https://southeasternbh.org/", "recovery-oriented housing and behavioral-health support"],
  ["tallgrass", "Tallgrass Recovery and Sober Living Homes", "Sioux Falls", "605-368-5559", "https://tallgrassrecovery.org/", "sober living and recovery support"],
  ["washed-clean", "Washed Clean Ministries", "Sioux Falls", "605-231-3235", "https://washedcleanministries.com/", "recovery housing and support"],
  ["brothers-sisters", "Brothers and Sisters Behind Bars", "Watertown", null, "https://bsbbwatertown.com/", "reentry and recovery support"],
];
export const SOUTH_DAKOTA_HOUSING = sdHomes.map(([id, name, city, phone, link, resourceType]) => record({
  id: `sd-housing-${id}`, state: "SD", name: `${name} — recovery-oriented housing contact`, city, phone, link,
  source: "South Dakota Behavioral Health, Recovery Housing provider directory", serviceArea: city,
  resourceType, description: `South Dakota Behavioral Health lists ${name} in ${city} as a recovery-housing or related support provider. Contact the organization directly to ask about current operation, who it serves, admission steps, fees, accessibility, and openings. The state notes that admission requirements vary and that eligible people may qualify for financial assistance through its behavioral-health process. A listing does not confirm a vacancy.`,
}));
export const SOUTH_DAKOTA_PEER = [
  ["face-it-together", "Face It TOGETHER — peer recovery coaching", "Sioux Falls", "855-539-9375", "https://wefaceittogether.org/", "Statewide and virtual"],
  ["renew-sioux-falls", "ReNew — recovering mothers support", "Sioux Falls", "605-336-6999", "https://bethany.org/service/substance-use-disorder-services", "Sioux Falls area"],
  ["renew-rapid-city", "ReNew — recovering mothers support", "Rapid City", "605-343-7196", "https://bethany.org/service/substance-use-disorder-services", "Rapid City area"],
].map(([id, name, city, phone, link, serviceArea]) => record({
  id: `sd-peer-${id}`, state: "SD", name, city, phone, link, source: "South Dakota Department of Social Services, Recovery Support Services guide (November 2025)",
  serviceArea, resourceType: "peer recovery support", description: `South Dakota's published Recovery Support Services guide identifies ${name} as a peer-support option serving ${serviceArea}. Contact the provider to ask about format, cost, hours, eligibility, and current availability. Peer support is voluntary and does not replace clinical or emergency care.`,
}));
export const SOUTH_DAKOTA_BENEFITS = [record({
  id: "sd-snap-application", state: "SD", name: "South Dakota SNAP and economic assistance — local office or online application", city: "Statewide", phone: "605-773-4678", link: "https://dss.sd.gov/economicassistance/snap.aspx",
  source: "South Dakota Department of Social Services, Supplemental Nutrition Assistance Program", serviceArea: "Statewide; local DSS offices", coverageScope: "statewide benefits navigation", resourceType: "SNAP and economic assistance enrollment",
  description: "South Dakota DSS accepts SNAP applications online, through a local Social Services office, or by submitting a paper application to a local office. The state publishes office locations separately and notes that services vary by site. Call 605-773-4678 or 877-999-5612, or use the application link, to ask about eligibility, documents, interview steps, and the nearest office. Benefits are not guaranteed by this listing.",
})];
export const SOUTH_DAKOTA_URGENT = [record({
  id: "sd-988-behavioral-crisis", state: "SD", name: "South Dakota Behavioral Health Crisis Support — 988", city: "Statewide", phone: "988", link: "https://dss.sd.gov/contactus/",
  source: "South Dakota Department of Social Services, Contact Us", serviceArea: "Statewide", coverageScope: "statewide crisis access", resourceType: "24/7 crisis counseling and connection to care",
  description: "South Dakota DSS directs people in a behavioral-health crisis to call, text, or chat 988. For immediate danger or urgent medical needs, call 911. For local services, treatment, or housing referrals, contact 211 or the published regional provider; this crisis route is not a substitute for emergency response.",
})];

const tnOfficeSource = "https://www.tn.gov/humanservices/for-families/supplemental-nutrition-assistance-program-snap/office-locator-family-assistance.html";
const tnOffices = [
  ["anderson", "Anderson County Family Assistance Office", "Oak Ridge", "119 Union Valley Road, Suite 100, Oak Ridge, TN 37830", "865-483-7464"],
  ["bedford", "Bedford County Family Assistance Office", "Shelbyville", "905 Madison Street, Shelbyville, TN 37160", "931-685-5028"],
  ["benton", "Benton County Family Assistance Office", "Camden", "272 Highway 641 North, Camden, TN 38320", "731-584-3055"],
  ["bledsoe", "Bledsoe County Family Assistance Office", "Pikeville", "323 Rockfort Road, Pikeville, TN 37367", "423-447-6968"],
  ["blount", "Blount County Family Assistance Office", "Maryville", "2010 Chilhowee Medical Park, Maryville, TN 37804", "865-981-5685"],
  ["bradley", "Bradley County Family Assistance Office", "Cleveland", "4625 North Lee Highway, Cleveland, TN 37312", "423-559-4986"],
  ["campbell", "Campbell County Family Assistance Office", "Jacksboro", "1016 Main Street, Jacksboro, TN 37757", "423-563-0220"],
  ["cannon", "Cannon County Family Assistance Office", "Woodbury", "325 Bryant Lane, Woodbury, TN 37190", "615-563-3436"],
  ["carroll", "Carroll County Family Assistance Office", "Huntingdon", "20810 Main Street East, Huntingdon, TN 38344", "731-986-8652"],
  ["carter", "Carter County Family Assistance Office", "Elizabethton", "1745 Highway 19-E Bypass, Elizabethton, TN 37643", "423-543-3672"],
  ["cheatham", "Cheatham County Family Assistance Office", "Ashland City", "286 Frey Street, Suite 101, Ashland City, TN 37015", "615-792-9280"],
].map(([id, name, city, address, fax]) => record({
  id: `tn-benefits-${id}`, state: "TN", name, city, address, phone: "833-772-8347", link: tnOfficeSource,
  source: "Tennessee Department of Human Services, Family Assistance District/County Office Locator",
  serviceArea: `${name.replace(" Family Assistance Office", "")} service area`, resourceType: "county benefits intake office",
  description: `Tennessee DHS lists this county office at ${address}; the state-published office line is 833-772-8347. Programs listed include SNAP (Food Stamps), Families First, child-care assistance, Medicaid, and TennCare; office fax: ${fax}. Confirm walk-in hours, county service boundaries, application status, and document requirements with DHS before visiting. You can also apply online through the state portal.`,
}));
const tnPeerSource = "https://www.tn.gov/behavioral-health/mental-health-services/peers/find-a-center.html";
const tnPeers = [
  ["morristown", "Health Recovery Group — peer support center", "Morristown", "815 W. Fifth North Street, Morristown, TN 37814", "423-586-5032", "Hamblen and Cocke counties"],
  ["newport", "Health Recovery Group — peer support center", "Newport", "215 Hedrick Drive, Newport, TN 37821", "423-623-5301", "Hamblen and Cocke counties"],
  ["harriman", "Friendship Place — peer support center", "Harriman", "221 Devonia Street, Harriman, TN 37748", "865-882-7694", "Roane County"],
  ["lafollette", "Wings Peer Support Center", "LaFollette", "108 S. Fifth Street, LaFollette, TN 37766", "423-562-2022", "Campbell County"],
  ["knoxville-friendship", "Friendship House — peer support center", "Knoxville", "526 Lamar Street, Knoxville, TN 37917", "865-544-3841", "Knox County"],
  ["chattanooga", "Lighthouse Peer Support Center", "Chattanooga", "960 Airport Road, Chattanooga, TN 37421", "423-756-1295", "Hamilton County"],
  ["clarksville", "Peer support center — Centerstone Clarksville", "Clarksville", "611 Eighth Street, Clarksville, TN 37040", "931-920-7208", "Montgomery County"],
].map(([id, name, city, address, phone, serviceArea]) => record({
  id: `tn-peer-${id}`, state: "TN", name, city, address, phone, link: tnPeerSource,
  source: "Tennessee Department of Mental Health and Substance Abuse Services, Peer Support Center Directory (updated August 2025)",
  serviceArea, resourceType: "free peer support center",
  description: `Tennessee's peer-center directory lists ${name} at ${address}, serving ${serviceArea}. Centers are free peer-led places for people affected by mental-health or substance-use conditions; some centers publish a ride option for served counties. The state source's directory was updated August 2025. Call to confirm current hours, location, transportation, eligibility, and whether the center is open before traveling.`,
}));
export const TENNESSEE_PEER = tnPeers;
export const TENNESSEE_BENEFITS = tnOffices;
const tnBhsnSource = "https://www.tn.gov/behavioral-health/bhsn/safety-net-provider-contact-list.html";
const tnBhsnLocations = [
  ["alliance-memphis-winchester", "Alliance Healthcare Services", "Shelby", "Memphis", "3810 Winchester Road, Memphis, TN 38118", "901-369-1410", "Children and adults"],
  ["alliance-memphis-broad", "Alliance Healthcare Services", "Shelby", "Memphis", "3200 Broad Street, Memphis, TN 38112", "901-369-1410", "Adults"],
  ["alliance-memphis-douglass", "Alliance Healthcare Services", "Shelby", "Memphis", "2579 Douglass Avenue, Memphis, TN 38114", "901-369-1410", "Adults"],
  ["alliance-memphis-whitney", "Alliance Healthcare Services", "Shelby", "Memphis", "2150 Whitney Avenue, Memphis, TN 38127", "901-369-1410", "Adults"],
  ["alliance-memphis-whitney-youth", "Alliance Healthcare Services", "Shelby", "Memphis", "2100 Whitney Avenue, Memphis, TN 38127", "901-369-1410", "Children and adults"],
  ["alliance-memphis-peabody", "Alliance Healthcare Services", "Shelby", "Memphis", "1200 Peabody Avenue, Memphis, TN 38104", "901-369-1410", "Adults"],
  ["carey-benton", "Carey Counseling Center", "Benton", "Camden", "300 Highway 641, Camden, TN 38320", "800-611-7757", "Children and adults"],
  ["carey-carroll", "Carey Counseling Center", "Carroll", "Huntingdon", "19410 West Main Street, Huntingdon, TN 38344", "800-611-7757", "Children and adults"],
  ["carey-gibson", "Carey Counseling Center", "Gibson", "Trenton", "1263 North Highway 45 Bypass, Trenton, TN 38382", "800-611-7757", "Children and adults"],
  ["carey-henry", "Carey Counseling Center", "Henry", "Paris", "408 Virginia Street, Paris, TN 38242", "800-611-7757", "Children and adults"],
  ["carey-obion", "Carey Counseling Center", "Obion", "Union City", "1409 North Morgan Street, Union City, TN 38281", "800-611-7757", "Children and adults"],
  ["carey-weakley", "Carey Counseling Center", "Weakley", "Martin", "457 Hannings Lane, Martin, TN 38237", "800-611-7757", "Children and adults"],
  ["centerstone-bedford-wall", "Centerstone of Tennessee", "Bedford", "Shelbyville", "604 South Wall Street, Shelbyville, TN 37160", "877-467-3123", "Children and adults"],
  ["centerstone-bedford-woodbury", "Centerstone of Tennessee", "Bedford", "Shelbyville", "1110 Woodbury Street, Shelbyville, TN 37160", "877-467-3123", "Adults"],
  ["centerstone-bradley", "Centerstone of Tennessee", "Bradley", "Cleveland", "4160 North Ocoee Street, Cleveland, TN 37312", "877-467-3123", "Children and adults"],
  ["centerstone-coffee-davidson", "Centerstone of Tennessee", "Coffee", "Tullahoma", "709 North Davidson Street, Tullahoma, TN 37388", "877-467-3123", "Adults"],
  ["centerstone-coffee-jackson", "Centerstone of Tennessee", "Coffee", "Tullahoma", "1803 North Jackson Street, Tullahoma, TN 37388", "877-467-3123", "Children and adults"],
  ["centerstone-davidson-gallatin", "Centerstone of Tennessee", "Davidson", "Madison", "620 South Gallatin Road, Madison, TN 37115", "877-467-3123", "Children and adults"],
  ["centerstone-davidson-ransom", "Centerstone of Tennessee", "Davidson", "Nashville", "1921 Ransom Place, Nashville, TN 37217", "877-467-3123", "Children and adults"],
  ["centerstone-davidson-venture", "Centerstone of Tennessee", "Davidson", "Nashville", "230 Venture Circle, Nashville, TN 37228", "877-467-3123", "Adults"],
  ["centerstone-davidson-white", "Centerstone of Tennessee", "Davidson", "Nashville", "2400 White Avenue, Nashville, TN 37204", "877-467-3123", "Children and adults"],
  ["centerstone-dickson-ramsey", "Centerstone of Tennessee", "Dickson", "Dickson", "6000 Ramsey Way, Dickson, TN 37055", "877-467-3123", "Children and adults"],
  ["centerstone-dickson-main", "Centerstone of Tennessee", "Dickson", "Dickson", "224 North Main Street, Dickson, TN 37055", "877-467-3123", "Adults"],
  ["centerstone-franklin", "Centerstone of Tennessee", "Franklin", "Estill Springs", "416 South Main Street, Estill Springs, TN 37330", "877-467-3123", "Children and adults"],
  ["centerstone-giles", "Centerstone of Tennessee", "Giles", "Pulaski", "1002 Brindley Drive, Pulaski, TN 38478", "877-467-3123", "Children and adults"],
  ["centerstone-hamilton", "Centerstone of Tennessee", "Hamilton", "Chattanooga", "6110 Shallowford Road, Chattanooga, TN 37421", "877-467-3123", "Children and adults"],
  ["centerstone-lawrence", "Centerstone of Tennessee", "Lawrence", "Lawrenceburg", "1090 Old Florence Road, Lawrenceburg, TN 38464", "877-467-3123", "Children and adults"],
  ["centerstone-lewis", "Centerstone of Tennessee", "Lewis", "Hohenwald", "912 Summertown Highway, Hohenwald, TN 38462", "877-467-3123", "Children and adults"],
  ["centerstone-lincoln", "Centerstone of Tennessee", "Lincoln", "Fayetteville", "2241 Thornton Taylor Parkway, Fayetteville, TN 37334", "877-467-3123", "Children and adults"],
  ["centerstone-marshall", "Centerstone of Tennessee", "Marshall", "Lewisburg", "1601 Nashville Highway, Lewisburg, TN 37091", "877-467-3123", "Children and adults"],
  ["centerstone-maury-westover", "Centerstone of Tennessee", "Maury", "Columbia", "832 Westover Drive, Suite 100, Columbia, TN 38401", "877-467-3123", "Children and adults"],
  ["centerstone-maury-trotwood", "Centerstone of Tennessee", "Maury", "Columbia", "6011 Trotwood Avenue, Columbia, TN 38401", "877-467-3123", "Adults"],
  ["centerstone-montgomery-8th", "Centerstone of Tennessee", "Montgomery", "Clarksville", "511 Eighth Street, Clarksville, TN 37040", "877-467-3123", "Children and adults"],
  ["centerstone-montgomery-clarksville", "Centerstone of Tennessee", "Montgomery", "Clarksville", "611 Eighth Street, Clarksville, TN 37040", "877-467-3123", "Adults"],
  ["centerstone-robertson", "Centerstone of Tennessee", "Robertson", "Springfield", "713 Cheatham Street, Springfield, TN 37172", "877-467-3123", "Children and adults"],
  ["centerstone-sumner", "Centerstone of Tennessee", "Sumner", "Gallatin", "332 Sumner Hall Drive, Gallatin, TN 37066", "877-467-3123", "Children and adults"],
  ["centerstone-wayne", "Centerstone of Tennessee", "Wayne", "Waynesboro", "418 South Main Street, Waynesboro, TN 38485", "877-467-3123", "Children and adults"],
  ["cmi-shelby", "CMI Healthcare Services", "Shelby", "Memphis", "3171 Directors Row, Memphis, TN 38131", "901-821-5600", "Children and adults"],
  ["frontier-carter", "Frontier Health", "Carter", "Elizabethton", "426 East G Street, Elizabethton, TN 37643", "855-336-9327", "Children and adults"],
  ["frontier-greene-church", "Frontier Health", "Greene", "Greeneville", "616 East Church Street, Greeneville, TN 37745", "855-336-9327", "Adults"],
  ["frontier-greene-holston", "Frontier Health", "Greene", "Greeneville", "401 Holston Drive, Greeneville, TN 37744", "855-336-9327", "Children and adults"],
  ["frontier-hancock", "Frontier Health", "Hancock", "Sneedville", "210 River Road, Sneedville, TN 37869", "855-336-9327", "Children and adults"],
  ["frontier-hawkins", "Frontier Health", "Hawkins", "Rogersville", "101 Lena Drive, Rogersville, TN 37857", "855-336-9327", "Children and adults"],
  ["frontier-johnson", "Frontier Health", "Johnson", "Mountain City", "318 Donnelly Street, Mountain City, TN 37683", "855-336-9327", "Children and adults"],
  ["frontier-sullivan-stonebrook", "Frontier Health", "Sullivan", "Kingsport", "2001 Stonebrook Place, Kingsport, TN 37660", "855-336-9327", "Children and adults"],
  ["frontier-sullivan-waverly", "Frontier Health", "Sullivan", "Kingsport", "1570 Waverly Road, Kingsport, TN 37664", "855-336-9327", "Adults"],
  ["frontier-sullivan-north", "Frontier Health", "Sullivan", "Bristol", "266 North Street, Bristol, TN 37620", "855-336-9327", "Adults"],
  ["frontier-sullivan-midway", "Frontier Health", "Sullivan", "Bristol", "26 Midway Street, Bristol, TN 37620", "855-336-9327", "Children and adults"],
  ["frontier-unicoi", "Frontier Health", "Unicoi", "Erwin", "218 North Main Street, Erwin, TN 37650", "855-336-9327", "Children and adults"],
  ["frontier-washington", "Frontier Health", "Washington", "Johnson City", "109 West Watauga Avenue, Johnson City, TN 37604", "855-336-9327", "Children and adults"],
  ["mcnabb-anderson", "McNabb Center", "Anderson", "Oak Ridge", "100 Adams Lane, Oak Ridge, TN 37830", "877-302-1226", "Children and adults"],
  ["mcnabb-blount", "McNabb Center", "Blount", "Maryville", "1704 East Broadway, Maryville, TN 37804", "877-302-1226", "Children and adults"],
  ["mcnabb-cocke", "McNabb Center", "Cocke", "Newport", "990 West Highway 25/70, Newport, TN 37821", "877-302-1226", "Children and adults"],
  ["mcnabb-hamblen", "McNabb Center", "Hamblen", "Morristown", "310 West Third North Street, Building 1, Morristown, TN 37814", "877-302-1226", "Children and adults"],
  ["mcnabb-hamilton-cumberland", "McNabb Center", "Hamilton", "Chattanooga", "601 Cumberland Street, Suite A, Chattanooga, TN 37404", "877-302-1226", "Adults"],
  ["mcnabb-hamilton-shallowford", "McNabb Center", "Hamilton", "Chattanooga", "6055 Shallowford Road, Chattanooga, TN 37421", "877-302-1226", "Children and adults"],
  ["mcnabb-knox-springdale", "McNabb Center", "Knox", "Knoxville", "205 West Springdale Avenue, Knoxville, TN 37917", "877-302-1226", "Adults"],
  ["mcnabb-knox-arthur", "McNabb Center", "Knox", "Knoxville", "600 Arthur Street, Knoxville, TN 37921", "877-302-1226", "Children and adults"],
  ["mcnabb-mcminn", "McNabb Center", "McMinn", "Athens", "2336 South Congress Parkway, Athens, TN 37303", "877-302-1226", "Children and adults"],
  ["mcnabb-sevier", "McNabb Center", "Sevier", "Sevierville", "1105 Oak Cluster Drive, Sevierville, TN 37862", "877-302-1226", "Children and adults"],
  ["mhc-bradley", "Mental Health Cooperative", "Bradley", "Cleveland", "2544 Dalton Pike SE, Cleveland, TN 37311", "615-743-1555", "Children and adults"],
  ["mhc-davidson-bell", "Mental Health Cooperative", "Davidson", "Antioch", "1309 Bell Road, Suite 201, Antioch, TN 37013", "615-743-1555", "Children and adults"],
  ["mhc-davidson-cumberland", "Mental Health Cooperative", "Davidson", "Nashville", "275 Cumberland Bend Drive, Nashville, TN 37228", "615-743-1555", "Children and adults"],
  ["mhc-dickson", "Mental Health Cooperative", "Dickson", "Dickson", "220 Skyline Circle, Dickson, TN 37055", "615-743-1555", "Children and adults"],
  ["mhc-hamilton", "Mental Health Cooperative", "Hamilton", "Chattanooga", "801 North Holtzclaw Avenue, Suite 101, Chattanooga, TN 37404", "615-743-1555", "Children and adults"],
  ["mhc-maury", "Mental Health Cooperative", "Maury", "Columbia", "100 Berrywood Drive, Columbia, TN 38401", "615-743-1555", "Children and adults"],
  ["mhc-montgomery", "Mental Health Cooperative", "Montgomery", "Clarksville", "871 Professional Park Drive, Clarksville, TN 37040", "615-743-1555", "Children and adults"],
  ["mhc-putnam", "Mental Health Cooperative", "Putnam", "Cookeville", "418 North Willow Avenue, Cookeville, TN 38501", "615-743-1555", "Children and adults"],
  ["mhc-rutherford", "Mental Health Cooperative", "Rutherford", "Murfreesboro", "1632 Gateway Boulevard, Murfreesboro, TN 37130", "615-743-1555", "Children and adults"],
  ["mhc-shelby", "Mental Health Cooperative", "Shelby", "Memphis", "3430 Summer Avenue, Memphis, TN 38122", "615-743-1555", "Children and adults"],
  ["mhc-sumner", "Mental Health Cooperative", "Sumner", "Gallatin", "1078 South Water Avenue, Gallatin, TN 37066", "615-743-1555", "Children and adults"],
  ["peninsula-blount", "Peninsula Behavioral Health", "Blount", "Alcoa", "203 Corporate Place, Alcoa, TN 37701", "865-970-9800", "Children and adults"],
  ["peninsula-knox", "Peninsula Behavioral Health", "Knox", "Knoxville", "1451 Dowell Springs Boulevard, Knoxville, TN 37909", "865-970-9800", "Children and adults"],
  ["peninsula-loudon", "Peninsula Behavioral Health", "Loudon", "Lenoir City", "423 Medical Park Drive, Suite 400, Lenoir City, TN 37772", "865-970-9800", "Children and adults"],
  ["peninsula-sevier", "Peninsula Behavioral Health", "Sevier", "Sevierville", "1104 Foxwood Drive, Sevierville, TN 37862", "865-970-9800", "Children and adults"],
  ["pathways-dyer", "Pathways of Tennessee", "Dyer", "Dyersburg", "1720 Woodlawn Avenue, Dyersburg, TN 38024", "800-587-3854", "Children and adults"],
  ["pathways-gibson-highland", "Pathways of Tennessee", "Gibson", "Milan", "4039 Highland Avenue, Suite 2, Milan, TN 38358", "800-587-3854", "Children and adults"],
  ["pathways-gibson-chere", "Pathways of Tennessee", "Gibson", "Humboldt", "3525 Chere Carol Road, Humboldt, TN 38343", "800-587-3854", "Children and adults"],
  ["pathways-haywood", "Pathways of Tennessee", "Haywood", "Brownsville", "1120 Tammbell Street, Brownsville, TN 38012", "800-587-3854", "Children and adults"],
  ["pathways-henderson", "Pathways of Tennessee", "Henderson", "Lexington", "9550 Highway 412 West, Suite B, Lexington, TN 38351", "800-587-3854", "Children and adults"],
  ["pathways-lake", "Pathways of Tennessee", "Lake", "Tiptonville", "223 Court Street, Tiptonville, TN 38079", "800-587-3854", "Children and adults"],
  ["pathways-madison-summar", "Pathways of Tennessee", "Madison", "Jackson", "238 Summar Drive, Jackson, TN 38301", "800-587-3854", "Children and adults"],
  ["pathways-madison-directors", "Pathways of Tennessee", "Madison", "Jackson", "33 Directors Row, Jackson, TN 38301", "800-587-3854", "Children and adults"],
  ["pathways-madison-union", "Pathways of Tennessee", "Madison", "Jackson", "1270 Union University Drive, Suite D, Jackson, TN 38305", "800-587-3854", "Children and adults"],
  ["pathways-obion", "Pathways of Tennessee", "Obion", "Union City", "930 Mount Zion Road, Union City, TN 38261", "800-587-3854", "Children and adults"],
  ["pcs-dyer", "Professional Care Services of West Tennessee", "Dyer", "Dyersburg", "2380 Henry Street, Dyersburg, TN 38024", "844-727-2778", "Children and adults"],
  ["pcs-fayette", "Professional Care Services of West Tennessee", "Fayette", "Somerville", "213 Lakeview Drive, Somerville, TN 38068", "844-727-2778", "Children and adults"],
  ["pcs-haywood", "Professional Care Services of West Tennessee", "Haywood", "Brownsville", "130 West Main Street, Brownsville, TN 38012", "844-727-2778", "Children and adults"],
  ["pcs-lauderdale", "Professional Care Services of West Tennessee", "Lauderdale", "Ripley", "403 Commerce Street, Ripley, TN 38063", "844-727-2778", "Children and adults"],
  ["pcs-shelby-navy", "Professional Care Services of West Tennessee", "Shelby", "Millington", "5281 Navy Road, Millington, TN 38053", "844-727-2778", "Children and adults"],
  ["pcs-shelby-poplar", "Professional Care Services of West Tennessee", "Shelby", "Memphis", "6401 Poplar Avenue, Suite 214, Memphis, TN 38119", "901-677-0431", "Children and adults"],
  ["pcs-tipton", "Professional Care Services of West Tennessee", "Tipton", "Covington", "1997 Highway 51 South, Covington, TN 38019", "844-727-2778", "Children and adults"],
  ["quinco-chester", "Quinco Community Mental Health Center", "Chester", "Henderson", "925 East Main Street, Henderson, TN 38340", "800-532-6339", "Children and adults"],
  ["quinco-decatur", "Quinco Community Mental Health Center", "Decatur", "Decaturville", "259 West Main Street, Decaturville, TN 38329", "800-532-6339", "Children and adults"],
  ["quinco-hardeman", "Quinco Community Mental Health Center", "Hardeman", "Bolivar", "10710 Old Highway 64, Bolivar, TN 38008", "800-532-6339", "Children and adults"],
  ["quinco-hardin", "Quinco Community Mental Health Center", "Hardin", "Savannah", "1410 Pickwick Street, Savannah, TN 38372", "800-532-6339", "Children and adults"],
  ["quinco-henderson", "Quinco Community Mental Health Center", "Henderson", "Lexington", "844 Natchez Trace Drive, Lexington, TN 38351", "800-532-6339", "Children and adults"],
  ["quinco-madison", "Quinco Community Mental Health Center", "Madison", "Jackson", "45 Executive Drive, Suite A, Jackson, TN 38305", "800-532-6339", "Children and adults"],
  ["quinco-mcnairy", "Quinco Community Mental Health Center", "McNairy", "Selmer", "641 East Poplar Avenue, Selmer, TN 38375", "800-532-6339", "Children and adults"],
  ["ridgeview-anderson", "Ridgeview Behavioral Health Services", "Anderson", "Oak Ridge", "240 West Tyrone Road, Oak Ridge, TN 37830", "800-834-4178", "Children and adults"],
  ["ridgeview-campbell", "Ridgeview Behavioral Health Services", "Campbell", "LaFollette", "108 South Fifth Street, LaFollette, TN 37766", "800-834-4178", "Children and adults"],
  ["ridgeview-fentress", "Ridgeview Behavioral Health Services", "Fentress", "Jamestown", "101 A Duncan Street South, Jamestown, TN 38556", "800-834-4178", "Children and adults"],
  ["ridgeview-morgan", "Ridgeview Behavioral Health Services", "Morgan", "Wartburg", "830 Main Street, Suite 2, Wartburg, TN 37887", "800-834-4178", "Children and adults"],
  ["ridgeview-roane", "Ridgeview Behavioral Health Services", "Roane", "Harriman", "307 Devonia Street, Harriman, TN 37748", "800-834-4178", "Children and adults"],
  ["ridgeview-scott", "Ridgeview Behavioral Health Services", "Scott", "Oneida", "133 West Second Avenue, Oneida, TN 37841", "800-834-4178", "Children and adults"],
  ["rivervalley-anderson", "River Valley Health", "Anderson", "Clinton", "165 Frank L. Diggs Drive, Clinton, TN 37718", "866-231-4477", "Children and adults"],
  ["rivervalley-blount", "River Valley Health", "Blount", "Alcoa", "255 East Watt Street, Alcoa, TN 37701", "866-231-4477", "Children and adults"],
  ["rivervalley-claiborne-main", "River Valley Health", "Claiborne", "New Tazewell", "1596 Highway 33 South, New Tazewell, TN 37825", "866-231-4477", "Children and adults"],
  ["rivervalley-claiborne-clairfield", "River Valley Health", "Claiborne", "Clairfield", "5619 Highway 60, Clairfield, TN 37715", "866-231-4477", "Children and adults"],
  ["rivervalley-cocke-8th", "River Valley Health", "Cocke", "Newport", "320 Eighth Street, Newport, TN 37821", "866-231-4477", "Children and adults"],
  ["rivervalley-cocke-hedrick", "River Valley Health", "Cocke", "Newport", "215 Hedrick Drive, Newport, TN 37821", "866-231-4477", "Children and adults"],
  ["rivervalley-grainger", "River Valley Health", "Grainger", "Blaine", "880 Rutledge Pike, Blaine, TN 37709", "866-231-4477", "Children and adults"],
  ["rivervalley-hamblen-5th", "River Valley Health", "Hamblen", "Morristown", "815 West Fifth North Street, Morristown, TN 37814", "866-231-4477", "Children and adults"],
  ["rivervalley-hamblen-andrew", "River Valley Health", "Hamblen", "Talbott", "6350 West Andrew Johnson Highway, Talbott, TN 37877", "866-231-4477", "Children and adults"],
  ["rivervalley-hamilton", "River Valley Health", "Hamilton", "Chattanooga", "5600 Brainerd Road, Suite A-4, Chattanooga, TN 37411", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-western", "River Valley Health", "Knox", "Knoxville", "2018 Western Avenue, Knoxville, TN 37921", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-5th", "River Valley Health", "Knox", "Knoxville", "538 West Fifth Avenue, Knoxville, TN 37917", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-college", "River Valley Health", "Knox", "Knoxville", "601 College Street, Knoxville, TN 37921", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-conner", "River Valley Health", "Knox", "Powell", "7714 Conner Road, Suite 105, Powell, TN 37849", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-texas", "River Valley Health", "Knox", "Knoxville", "1754 Texas Avenue, Knoxville, TN 37921", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-mlk", "River Valley Health", "Knox", "Knoxville", "2202 Martin Luther King Jr. Avenue, Knoxville, TN 37915", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-sutherland", "River Valley Health", "Knox", "Knoxville", "2240 Sutherland Avenue, Suite 103, Knoxville, TN 37919", "866-231-4477", "Children and adults"],
  ["rivervalley-knox-stmarys", "River Valley Health", "Knox", "Knoxville", "1515 St. Mary's Street, Suite B, Knoxville, TN 37917", "866-231-4477", "Children and adults; walk-ins noted by source"],
  ["rivervalley-loudon", "River Valley Health", "Loudon", "Lenoir City", "5500 Creekwood Park Boulevard, Lenoir City, TN 37772", "866-231-4477", "Children and adults"],
  ["rivervalley-mcminn", "River Valley Health", "McMinn", "Englewood", "3360 Highway 411 North, Englewood, TN 37329", "866-231-4477", "Children and adults"],
  ["rivervalley-sevier", "River Valley Health", "Sevier", "Seymour", "10731 Chapman Highway, Seymour, TN 37865", "866-231-4477", "Children and adults"],
  ["rivervalley-union", "River Valley Health", "Union", "Maynardville", "4330 Maynardville Highway, Maynardville, TN 37807", "866-231-4477", "Children and adults"],
  ["tnvoices-meadowlark", "Tennessee Voices", "Davidson", "Goodlettsville", "805 Meadowlark Lane, Goodlettsville, TN 37072", "800-670-9882", "Children and families"],
  ["tnvoices-professional", "Tennessee Voices", "Davidson", "Goodlettsville", "500 Professional Park Drive, Goodlettsville, TN 37072", "800-670-9882", "Children and families"],
  ["tnvoices-madison", "Tennessee Voices", "Madison", "Jackson", "434 East Baltimore Street, Jackson, TN 38301", "800-670-9882", "Children and families"],
  ["volunteer-bradley", "Volunteer Behavioral Health Center", "Bradley", "Cleveland", "940 South Ocoee Street, Cleveland, TN 37311", "877-567-6051", "Children and adults"],
  ["volunteer-cumberland", "Volunteer Behavioral Health Center", "Cumberland", "Crossville", "4325 Highway 127 North, Crossville, TN 38571", "877-567-6051", "Children and adults"],
  ["volunteer-grundy", "Volunteer Behavioral Health Center", "Grundy", "Tracy City", "1490 State Route 56, Tracy City, TN 37387", "877-567-6051", "Children and adults"],
  ["volunteer-hamilton", "Volunteer Behavioral Health Center", "Hamilton", "Chattanooga", "420 Bell Avenue, Chattanooga, TN 37405", "877-567-6051", "Children and adults"],
  ["volunteer-macon", "Volunteer Behavioral Health Center", "Macon", "Lafayette", "101 Bratten Avenue, Lafayette, TN 37083", "877-567-6051", "Children and adults"],
  ["volunteer-marion", "Volunteer Behavioral Health Center", "Marion", "Jasper", "215 Hickman Road, Jasper, TN 37347", "877-567-6051", "Children and adults"],
  ["volunteer-mcminn", "Volunteer Behavioral Health Center", "McMinn", "Athens", "1805 Ingleside Avenue, Athens, TN 37303", "877-567-6051", "Children and adults"],
  ["volunteer-monroe", "Volunteer Behavioral Health Center", "Monroe", "Madisonville", "520 Cook Street, Suite I, Madisonville, TN 37354", "877-567-6051", "Children and adults"],
  ["volunteer-overton", "Volunteer Behavioral Health Center", "Overton", "Livingston", "501 Spruce Street, Livingston, TN 38570", "877-567-6051", "Children and adults"],
  ["volunteer-putnam", "Volunteer Behavioral Health Center", "Putnam", "Cookeville", "1200 South Willow Street, Cookeville, TN 38506", "877-567-6051", "Children and adults"],
  ["volunteer-rhea", "Volunteer Behavioral Health Center", "Rhea", "Dayton", "7200 Rhea County Highway, Dayton, TN 37321", "877-567-6051", "Children and adults"],
  ["volunteer-roane", "Volunteer Behavioral Health Center", "Roane", "Rockwood", "450 South Chamberlain Avenue, Rockwood, TN 37854", "877-567-6051", "Children and adults"],
  ["volunteer-rutherford-mayfield", "Volunteer Behavioral Health Center", "Rutherford", "Smyrna", "131 Mayfield Drive, Smyrna, TN 37167", "877-567-6051", "Children and adults"],
  ["volunteer-rutherford-williams", "Volunteer Behavioral Health Center", "Rutherford", "Murfreesboro", "1504 Williams Drive, Murfreesboro, TN 37129", "877-567-6051", "Children and adults"],
  ["volunteer-sequatchie", "Volunteer Behavioral Health Center", "Sequatchie", "Dunlap", "121 Ferdonia Road, Dunlap, TN 37327", "877-567-6051", "Children and adults"],
  ["volunteer-sumner", "Volunteer Behavioral Health Center", "Sumner", "Gallatin", "510 East Main Street, Gallatin, TN 37066", "877-567-6051", "Children and adults"],
  ["volunteer-trousdale", "Volunteer Behavioral Health Center", "Trousdale", "Hartsville", "213 Broadway, Hartsville, TN 37074", "877-567-6051", "Children and adults"],
  ["volunteer-warren", "Volunteer Behavioral Health Center", "Warren", "McMinnville", "120 Omni Drive, McMinnville, TN 37110", "877-567-6051", "Children and adults"],
  ["volunteer-williamson", "Volunteer Behavioral Health Center", "Williamson", "Franklin", "1915 Columbia Avenue, Franklin, TN 37064", "877-567-6051", "Children and adults"],
  ["volunteer-wilson", "Volunteer Behavioral Health Center", "Wilson", "Lebanon", "1404 Winter Drive, Lebanon, TN 37087", "877-567-6051", "Children and adults"],
];
export const TENNESSEE_BHSN = tnBhsnLocations.map(([id, provider, county, city, address, phone, ageGroups]) => record({
  id: `tn-bhsn-${id}`, state: "TN", name: `${provider} — Behavioral Health Safety Net access`, city, county, address, phone, link: tnBhsnSource,
  source: "Tennessee Department of Mental Health and Substance Abuse Services, Behavioral Health Safety Net Provider Site Locations",
  serviceArea: `${county} County`, resourceType: "outpatient mental-health services for eligible uninsured residents",
  description: `Tennessee's Behavioral Health Safety Net location list names ${provider} at ${address} for ${county} County; published contact ${phone}; service age groups indicated by the state: ${ageGroups}. The statewide program provides outpatient assessment, therapy, medication-management coordination, and related supports to uninsured residents who meet program eligibility rules. Call to confirm eligibility, current site operation, intake, and whether services for your age group are available at this location. This is a treatment access route, not a promise of an appointment.`,
}));
export const TENNESSEE_URGENT = [record({
  id: "tn-mobile-crisis-988", state: "TN", name: "Tennessee Mobile Crisis Services — local provider through 988", city: "Statewide", phone: "988", link: "https://www.tn.gov/content/tn/behavioral-health/crisis/continuum.html",
  source: "Tennessee Department of Mental Health and Substance Abuse Services, Crisis Services Continuum",
  serviceArea: "Statewide; adults, children, and youth", coverageScope: "statewide crisis access", resourceType: "24/7 mobile crisis connection",
  description: "Tennessee says mobile crisis response is available statewide for adults, children, and youth. Call or text 988 and press 0 to reach the crisis counselor who can connect you with the provider for your county; provider-specific lines are listed by the state. Mobile crisis may offer assessment, referral, stabilization, and follow-up. For immediate danger or urgent medical needs, call 911.",
})];
export const TENNESSEE_FOOD = [
  ["second-harvest-east", "Second Harvest Food Bank of East Tennessee", "Maryville", "136 Harvest Lane, Maryville, TN 37801", "https://secondharvestetn.org/find-a-food-pantry/", "East Tennessee regional service area"],
  ["chattanooga", "Chattanooga Area Food Bank — pantry and mobile distribution finder", "Chattanooga", "2009 Curtain Pole Road, Chattanooga, TN", "https://chattfoodbank.org/hungry/", "Southeast Tennessee and northwest Georgia partner network"],
  ["mid-south", "Mid-South Food Bank — local food assistance finder", "Memphis", null, "https://www.midsouthfoodbank.org/", "West Tennessee and Mid-South partner network"],
  ["second-harvest-middle", "Second Harvest Food Bank of Middle Tennessee — partner pantry finder", "Nashville", null, "https://www.secondharvestmidtn.org/find-food/", "Middle Tennessee counties; confirm county service area in locator"],
].map(([id, name, city, address, link, serviceArea]) => record({
  id: `tn-food-${id}`, state: "TN", name, city, address, link,
  source: "Tennessee Department of Human Services Community Resources / named food-bank service finder",
  serviceArea, resourceType: "food-bank and partner-pantry referral",
  description: `Use ${name}'s official food finder to identify the partner pantry, meal site, or mobile distribution serving ${serviceArea}. Tennessee's TEFAP guidance says local agencies set their own distribution days, pickup points, and eligibility, and advises calling ahead because times and stock may change. The food bank office or warehouse is not necessarily a public walk-in distribution site.`,
}));

const utMentalSource = "https://sumh.utah.gov/contact/location-map/";
const utCenters = [
  ["bear-river", "Bear River Mental Health", "Logan", "90 E. 200 North, Logan, UT 84321", "435-752-0750", "Box Elder and Cache counties"],
  ["southwest", "Southwest Behavioral Health Center", "Beaver", "100 S. 100 West, Beaver, UT 84713", "435-387-2671", "Beaver, Garfield, Iron, Kane, and Washington counties"],
  ["four-corners", "Four Corners Community Behavioral Health", "Price", "105 W. 100 North, Price, UT 84501", "435-637-7200", "Carbon, Emery, and Grand counties"],
  ["northeastern", "Northeastern Counseling Center", "Vernal", "1140 W. 500 South, Suite 9, Vernal, UT 84078", "435-789-6300", "Daggett, Duchesne, and Uintah counties"],
  ["davis", "Davis Behavioral Health", "Layton", "934 S. Main Street, Layton, UT 84041", "801-773-7060", "Davis County"],
  ["central-utah", "Central Utah Counseling Center", "Ephraim", "152 N. 400 West, Ephraim, UT 84627", "435-283-8400", "Juab, Millard, Sanpete, Sevier, Piute, and Wayne counties"],
  ["wasatch", "Wasatch Behavioral Health", "Provo", "750 N. Freedom Boulevard, Suite 300, Provo, UT 84601", "801-373-4760", "Utah and Wasatch counties"],
].map(([id, name, city, address, phone, serviceArea]) => record({
  id: `ut-treatment-${id}`, state: "UT", name: `${name} — local mental-health authority`, city, address, phone,
  link: utMentalSource, source: "Utah Department of Health and Human Services, Local Mental Health Authority Location Map",
  serviceArea, resourceType: "county-designated mental-health and substance-use authority",
  description: `Utah DHHS identifies ${name} as the local mental-health authority for ${serviceArea}. The state map publishes this office contact for behavioral-health services and county-level access. Call to ask about outpatient mental-health and substance-use care, crisis or same-day assessment options, Medicaid or sliding-scale access, referral needs, and the nearest operating clinic. This state-published contact does not confirm service availability at the listed office.`,
}));
export const UTAH_TREATMENT = utCenters;
export const UTAH_URGENT = [record({
  id: "ut-wasatch-crisis-center", state: "UT", name: "Wasatch Behavioral Health Receiving & Outreach Center — adult crisis assessment", city: "Provo", address: "1175 E. 300 North, Provo, UT 84606", phone: "801-852-2131",
  link: "https://www.wasatch.org/locations/", source: "Wasatch Behavioral Health, Locations and Crisis Services",
  serviceArea: "Utah and Wasatch counties", resourceType: "adult crisis evaluation and stabilization access",
  description: "Wasatch Behavioral Health says its Receiving & Outreach Center provides round-the-clock crisis mental-health evaluations for adults in Utah and Wasatch counties and can coordinate mobile outreach. Published contact: 801-852-2131; location: 1175 E. 300 North, Provo. Call to confirm access and current response options. For immediate danger or an urgent medical emergency, call 911; call or text 988 for the national crisis line.",
}), record({
  id: "ut-wasatch-youth-crisis", state: "UT", name: "Wasatch CY FAST — child and youth crisis assessment and stabilization", city: "Provo", address: "1185 E. 300 North, Provo, UT 84606", phone: "801-852-2131",
  link: "https://www.wasatch.org/locations/", source: "Wasatch Behavioral Health, Locations and Crisis Services",
  serviceArea: "Utah County youth and families", resourceType: "youth crisis assessment and stabilization",
  description: "Wasatch Behavioral Health describes CY FAST as a Children, Youth and Family Assessment Stabilization Team providing mobile outreach, respite, group therapy, and family support. Published contact: 801-852-2131 at 1185 E. 300 North, Provo. Call to discuss age range, referral, and immediate access. For immediate danger, call 911; call or text 988 for crisis support.",
})];
const utFoodSource = "https://www.utahfoodbank.org/get-help/";
const utFood = [
  ["hurricane", "Hurricane Valley Food Pantry", "Hurricane", "489 600 N, Hurricane, UT 84737", "435-767-0300", "Washington County"],
  ["southeastern", "Utah Food Bank Southeastern Distribution Center", "Blanding", "295 E. 200 North, Blanding, UT 84511", "435-674-5498", "San Juan County and surrounding communities"],
  ["montezuma-creek", "Montezuma Creek Food Pantry", "Montezuma Creek", "400 N. 50th East, Montezuma Creek, UT 84534", "435-216-9117", "San Juan County"],
  ["monument-valley", "Monument Valley Food Pantry", "Monument Valley", "Mile Post 0, U.S. Highway 163, Monument Valley, UT 84536", "435-652-5114", "San Juan County and Navajo Nation community"],
];
export const UTAH_FOOD = utFood.map(([id, name, city, address, phone, serviceArea]) => record({
  id: `ut-food-${id}`, state: "UT", name, city, address, phone, link: utFoodSource,
  source: "Utah Food Bank, Get Help and Pantry Locations", serviceArea, resourceType: "food pantry or regional food distribution contact",
  description: `Utah Food Bank lists ${name} at ${address}, phone ${phone}. Published county/service scope: ${serviceArea}. Contact the pantry or use the state food-finder to confirm current days, hours, residency rules, documents, accessibility, and available food before traveling. Distribution centers may refer callers to partner sites instead of serving walk-ins.`,
}));
export const UTAH_FOOD_REGIONAL = [
  ["carbon", "Carbon County Food Bank", "Price", "75 E. 400 South, Price, UT 84501", "435-637-9232", "Carbon County"],
  ["emery", "Emery County Food Bank", "Castle Dale", "40 S. Center Street, Castle Dale, UT 84513", "435-381-5410", "Emery County"],
  ["grand", "Grand County Food Bank", "Moab", "56 N. 200 East, Moab, UT 84532", "435-259-6456", "Grand County"],
  ["green-river", "Green River Food Bank", "Green River", "140 N. Broadway, Green River, UT 84525", null, "Green River area"],
].map(([id, name, city, address, phone, serviceArea]) => record({
  id: `ut-food-serda-${id}`, state: "UT", name, city, address, phone, link: "https://serda.utah.gov/food-banks",
  source: "Southeastern Utah Association of Local Governments, Food Banks directory",
  serviceArea, resourceType: "county food bank and food-box assistance",
  description: `Southeastern Utah Association of Local Governments lists ${name} at ${address}${phone ? `, phone ${phone}` : ""}. Its directory states this food bank provides emergency food assistance in ${serviceArea}; published service details include food boxes with application requirements. Confirm operating hours, eligibility, required documents, and current pickup arrangements before visiting.`,
}));
export const UTAH_PEER = [
  ["weber", "Utah Recovery Community Center — Weber County", "Ogden", "893 24th Street, Suite 300, Ogden, UT 84401", "385-263-1600", "Weber County and surrounding communities"],
  ["salt-lake", "Utah Recovery Community Center — Salt Lake County", "Salt Lake City", "180 East 2100 South, Suite 100, Salt Lake City, UT 84115", "385-210-0320", "Salt Lake County and surrounding communities"],
  ["utah-county", "Utah Recovery Community Center — Utah County", "Provo", "184 West 400 North, Suite A, Provo, UT 84601", "385-392-2290", "Utah County and surrounding communities"],
  ["carbon", "Utah Recovery Community Center — Carbon County", "Price", "91 East Main Street, Price, UT 84501", "877-590-5965", "Carbon County and surrounding communities"],
  ["grand", "Utah Recovery Community Center — Grand County", "Moab", "125 West 200 South, #113, Moab, UT 84532", "435-612-2300", "Grand County and surrounding communities"],
  ["washington", "Utah Recovery Community Center — Washington County", "St. George", "113 East 200 North, Suite 1, St. George, UT 84770", "435-319-8800", "Washington County and surrounding communities"],
].map(([id, name, city, address, phone, serviceArea]) => record({
  id: `ut-peer-usara-${id}`, state: "UT", name, city, address, phone, link: "https://www.utahrecovers.org/locations/",
  source: "Utah Support Advocates for Recovery Awareness, Utah Recovery Community Center Locations", serviceArea,
  resourceType: "recovery community center and peer support",
  description: `USARA publishes ${name} at ${address}, phone ${phone}. Its recovery community centers connect people affected by substance use with peer support and local recovery resources. Call to ask about current groups, drop-in access, hours, family supports, eligibility, and whether the listed location is open to new participants. Peer services are voluntary and do not replace clinical or emergency care.`,
}));

const vtTreatmentSource = "https://mentalhealth.vermont.gov/community-resources/das-community-mental-health-agencies";
const vtAgencies = [
  ["clara-martin", "Clara Martin Center", "Randolph", "800-639-6360", "Orange County and surrounding areas"],
  ["addison", "Counseling Service of Addison County", "Middlebury", "802-388-7641", "Addison County"],
  ["howard", "Howard Center", "Burlington", "802-488-7777", "Chittenden County"],
  ["hrs", "Healthcare and Rehabilitation Services", "Springfield", "800-622-4235", "Southeastern Vermont"],
  ["lamoille", "Lamoille County Mental Health Services", "Morrisville", "802-888-5026", "Lamoille County"],
  ["northwestern", "Northwestern Counseling and Support Services", "St. Albans", "802-524-6554", "Franklin and Grand Isle counties"],
  ["nekhs", "Northeast Kingdom Human Services", "Derby", "802-334-6744", "Caledonia, Essex, and Orleans counties"],
  ["rutland", "Rutland Mental Health Services", "Rutland", "802-775-1000", "Rutland County"],
  ["ucs", "United Counseling Service", "Bennington", "802-442-5491", "Bennington County"],
  ["washington", "Washington County Mental Health Services", "Barre", "802-229-0591", "Washington County"],
].map(([id, name, city, phone, serviceArea]) => record({
  id: `vt-treatment-${id}`, state: "VT", name: `${name} — designated community mental-health agency`, city, phone, link: vtTreatmentSource,
  source: "Vermont Department of Mental Health, Designated Agencies", serviceArea,
  resourceType: "designated community mental-health and substance-use agency",
  description: `Vermont DMH lists ${name} as a designated community agency for ${serviceArea}; published contact: ${phone}. The state says designated agencies provide regional mental-health care, substance-use treatment, case management, and related supports. Call to ask about age groups, intake, crisis access, insurance, fees, language access, and the closest service location.`,
}));
export const VERMONT_TREATMENT = vtAgencies;
const vtPeerSource = "https://vtrecoverynetwork.org/recovery-organizations/";
const vtPeerRows = [
  ["kingdom", "Kingdom Recovery Center", "St. Johnsbury", "297 Summer Street, St. Johnsbury, VT 05819", "https://www.krcstj.org/"],
  ["north-central", "North Central Vermont Recovery Center", "Morrisville", "275 Brooklyn Street, Suite 2, Morrisville, VT 05661", "https://www.ncvrc.com/"],
  ["journey", "Journey to Recovery Community Center", "Newport", "212 Prouty Drive, Newport, VT 05855", "https://jtr-cc.org/"],
  ["bennington", "Turning Point Center of Bennington", "Bennington", "601 Main Street, Bennington, VT 05201", "https://www.tpcbennington.org/"],
  ["central", "Turning Point Center of Central Vermont", "Barre", "18 South Main Street, Barre, VT 05641", "https://www.tpccv.org/"],
  ["upper-valley", "Upper Valley Turning Point", "White River Junction", "200 Olcott Drive, White River Junction, VT 05001", "https://www.uppervalleyturningpoint.org/"],
  ["springfield", "Turning Point Center of Springfield", "Springfield", "7 Morgan Avenue, Springfield, VT 05156", "https://www.spfldtp.org/"],
  ["rutland", "Turning Point Center of Rutland", "Rutland", "141 State Street, Rutland, VT 05701", "https://turningpointrutland.org/"],
  ["windham", "Turning Point of Windham County", "Brattleboro", "39 Elm Street, Brattleboro, VT 05301", "https://turningpointwc.org/"],
  ["addison", "Peer Recovery Center of Addison County", "Middlebury", "79 Court Street, Middlebury, VT 05753", "https://turningpointaddisonvt.org/"],
  ["chittenden", "Turning Point Center of Chittenden County", "Burlington", "179 South Winooski Avenue, Suite 301, Burlington, VT 05401", "https://turningpointcentervt.org/"],
  ["franklin", "Turning Point of Franklin County", "St. Albans", "182 Lake Street, St. Albans, VT 05478", "https://turningpointfranklincounty.org/"],
];
export const VERMONT_PEER = vtPeerRows.map(([id, name, city, address, link]) => record({
  id: `vt-peer-${id}`, state: "VT", name, city, address, link, source: "Vermont Recovery Network, Member Recovery Organizations",
  serviceArea: city, resourceType: "community peer recovery center",
  description: `${name} appears in the Vermont Recovery Network member directory at ${address}. Contact the center to ask about peer recovery groups, activities, accessibility, hours, and whether any registration or cost applies. Programs and meeting calendars change; confirm directly before traveling. Peer support is voluntary and is not emergency or clinical care.`,
}));

const vtHousingSource = "https://helpingtohousevt.org/vermonts-emergency-shelter-providers/";
const vtShelters = [
  ["anew", "ANEW Place", "Burlington", "802-862-9879", "https://www.anewplacevt.org/", "Adult shelter access"],
  ["bennington-coalition", "Bennington County Coalition for the Homeless", "Bennington", "802-442-2424", "https://www.bcchvt.org/", "Adults; separate family intake number is listed by the provider"],
  ["elmwood", "Champlain Housing Trust — Elmwood Community Shelter", "Burlington", "802-209-5286", "https://www.getahome.org/", "Emergency shelter"],
  ["charter-house", "Charter House Coalition", "Middlebury", "802-989-8621", "https://chcvt.org/", "Emergency shelter and housing support"],
  ["cots-family", "COTS — Main Street Family Center", "Burlington", "802-864-7402", "https://cotsonline.org/", "Family shelter"],
  ["cots-waystation", "COTS — Waystation", "Burlington", "802-862-7776", "https://cotsonline.org/", "Emergency shelter"],
  ["champlain-place", "CVOEO — The Champlain Place", "Burlington", "802-540-1239", "https://www.cvoeo.org/", "Emergency shelter"],
  ["good-samaritan", "Good Samaritan Haven", "Barre", "802-479-2294", "https://www.goodsamaritanhaven.org/", "Emergency shelter"],
  ["groundworks", "Groundworks Collaborative", "Brattleboro", "802-257-5415", "https://groundworksvt.org/", "Emergency shelter and housing support"],
  ["prevention-center", "Homeless Prevention Center", "Rutland", "802-775-9286", "https://www.hpcvt.org/", "Housing and shelter access"],
  ["john-graham", "John Graham Housing & Services", "Vergennes", "802-877-2677", "https://www.johngrahamshelter.org/", "Emergency shelter"],
  ["lamoille-house", "Lamoille Community House", "Hyde Park", "802-521-7943", "https://lamoilleshelter.org/", "Emergency shelter"],
  ["nekca", "NEKCA — The Shelter at Moose River", "St. Johnsbury", "802-624-0949", "https://nekcavt.org/", "Emergency shelter"],
  ["open-door", "Open Door Mission", "Rutland", "802-775-5661", "https://www.opendoormissionvt.org/", "Emergency shelter"],
  ["samaritan-house", "Samaritan House", "St. Albans", "802-527-0847", "https://www.cvoeo.org/", "Emergency shelter"],
  ["spectrum", "Spectrum Youth & Family Services", "Burlington", "802-864-7423", "https://www.spectrumvt.org/", "Youth and family shelter services"],
  ["springfield-supported", "Springfield Supported Housing Program", "Springfield", "802-885-3034", "https://www.sshpvt.org/", "Supported housing"],
  ["upper-valley-haven", "Upper Valley Haven", "White River Junction", "802-295-6500", "https://uppervalleyhaven.org/", "Emergency shelter and basic-needs support"],
  ["elevate-youth", "Elevate Youth Services", "Montpelier", "802-229-9151", "https://www.elevateyouthvt.org/", "Youth shelter"],
  ["windsor-youth", "Windsor County Youth Services", "Proctorsville", "802-228-6880", "https://www.wcysvermont.org/", "Youth and young-adult shelter"],
];
export const VERMONT_HOUSING = vtShelters.map(([id, name, city, phone, link, scope]) => record({
  id: `vt-housing-${id}`, state: "VT", name, city, phone, link, source: "Housing & Homelessness Alliance of Vermont, Emergency Shelter Providers",
  serviceArea: city, resourceType: scope.toLowerCase(),
  description: `${name} is listed by the Housing & Homelessness Alliance of Vermont as a shelter or supported-housing contact in ${city}; published phone: ${phone}. The source page is dated February 2024, so treat this as a lead and verify that the program is still operating, its current referral path, eligibility, hours, and capacity before traveling. The Alliance advises calling 2-1-1 for shelter navigation. No bed or placement is guaranteed.`,
}));
export const VERMONT_BENEFITS = [
  ["broc", "BROC Community Action", "Rutland", "45 Union Street, Rutland, VT 05701", "802-775-0878", "Rutland and Bennington region", "https://broc.org/"],
  ["capstone", "Capstone Community Action", "Barre", "20 Gable Place, Barre, VT 05641", "802-479-1053", "Central Vermont", "https://capstonevt.org/"],
  ["cvoeo", "Champlain Valley Office of Economic Opportunity", "Burlington", "255 South Champlain Street, Burlington, VT 05402", "802-862-2771", "Chittenden, Franklin, and Grand Isle counties", "https://www.cvoeo.org/"],
  ["nekca", "Northeast Kingdom Community Action", "Newport", "10 Main Street, Newport, VT 05855", "802-334-7316", "Caledonia, Essex, and Orleans counties", "https://nekcavt.org/"],
  ["sevca", "Southeastern Vermont Community Action", "Westminster", "91 Buck Drive, Westminster, VT 05158", "802-722-4575", "Southeastern Vermont", "https://www.sevca.org/"],
].map(([id, name, city, address, phone, serviceArea, link]) => record({
  id: `vt-benefits-${id}`, state: "VT", name: `${name} — basic-needs and financial-stability navigation`, city, address, phone, link,
  source: "Vermont Department for Children and Families, Community Action Agencies", serviceArea,
  resourceType: "community action benefits and basic-needs agency",
  description: `Vermont DCF lists ${name} as a local community action agency at ${address}, phone ${phone}, serving ${serviceArea}. Community action agencies help lower-income residents with basic needs; services differ by agency. Call to ask about current food, housing, utility, financial-stability, and benefit-enrollment programs, eligibility, documentation, and intake hours. Assistance and funds are not guaranteed.`,
}));
export const VERMONT_FOOD = [record({
  id: "vt-foodbank-shelf-finder", state: "VT", name: "Vermont Foodbank — statewide food shelf and meal finder", city: "Statewide",
  link: "https://www.vtfoodbank.org/access-food/find-a-food-shelf/",
  source: "Vermont Foodbank, Find a Food Shelf", serviceArea: "Statewide; more than 200 partner food shelves, meal sites, and food-access organizations",
  coverageScope: "statewide food access locator", resourceType: "live local food shelf and meal-site directory",
  description: "Vermont Foodbank's finder connects residents to more than 200 partner food shelves, meal sites, and food-access organizations across Vermont. Search by location to see the local site's current address and contact details. The Foodbank notes schedules and availability can change; contact the selected site before traveling to confirm hours, service area, eligibility, documents, and whether an appointment or referral is needed. This record is a statewide locator, not 200 separately verified listings.",
})];

// Additional active slice: named local sites and regional housing/benefit routes.
const sdFoodSource = "https://dakotaathome.sd.gov/search?query=BD-1800.2000&query_label=Food+Pantries&query_type=taxonomy";
const sdFoodPantries = [
  ["feeding-vermillion", "Senior Food Box Program — Feeding Vermillion", "Vermillion", "9 Court Street, Community Connection Center, Vermillion, SD 57069", "605-658-0118", "Clay County; senior food-box program"],
  ["feeding-brookings", "Feeding Brookings — local food program", "Brookings", "2030 3rd Street, Ascension Lutheran Church distribution site, Brookings, SD 57006", "605-692-6565", "Brookings-area households; call for current distribution access"],
  ["mccook-county", "McCook County Food Pantry", "Salem", "640 S. Nebraska Street, Salem, SD 57058", "605-425-2271", "McCook County"],
  ["charis-mobile", "Charis Ministry Partners — Food To You mobile pantry", "Sioux Falls", "235 N. Prairie Avenue, Augustana Lutheran Church, Sioux Falls, SD 57104", "605-271-2163", "Sioux Falls area; source notes monthly use, valid ID, and no delivery; not an emergency food option"],
  ["sturgis-alliance", "Sturgis Alliance of Churches — food assistance", "Sturgis", "1220 Cedar Street, Sturgis, SD 57785", "605-347-3384", "Sturgis area; case-by-case need assessment"],
  ["hilltop-lower-brule", "Hilltop Food Pantry", "Lower Brule", "32685 Medicine Bull Highway, Lower Brule, SD 57548", "605-295-4741", "Lower Brule community; food and hygiene items as available"],
  ["scotland-area", "Scotland Area Food Pantry", "Scotland", "441 Main Street, Scotland, SD 57059", "605-464-0932", "Scotland area residents; includes a school snack-pack program"],
  ["edmunds-county", "Edmunds County Food Pantry", "Ipswich", "210 2nd Avenue, Edmunds County Courthouse, Ipswich, SD 57451", "605-426-6762", "Edmunds County"],
  ["kateri-marty", "Kateri Center food pantry", "Marty", "102 Church Drive, Marty, SD 57361", "605-384-3234", "Marty area; source notes monthly pantry limit"],
  ["aurora-county", "Aurora County Food Pantry", "Plankinton", "401 N. Main Street, County Courthouse Basement, Plankinton, SD 57368", "605-942-7161", "Aurora County"],
  ["bison-community", "Bison Community Pantry", "Bison", "428 E. Main Street, Presbyterian Church, Bison, SD 57620", null, "Perkins County; use Dakota at Home listing to request current contact route"],
  ["st-marys-aberdeen", "St. Mary's Catholic Church food pantry", "Aberdeen", "409 2nd Avenue N.E., Aberdeen, SD 57401", "605-229-4422", "Aberdeen area; food, diapers, and school supplies"],
  ["daily-bread-dell-rapids", "The Daily Bread Food Pantry", "Dell Rapids", "47381 246th Street, Dell Rapids, SD 57022", "605-428-5111", "Dell Rapids and nearby small towns"],
  ["rocs-chamberlain", "Rural Office of Community Services — Chamberlain food pantry", "Chamberlain", "300 S. Courtland Street, Chamberlain, SD 57325", "605-481-8939", "Chamberlain area; ROCS pantry contact"],
  ["centerville", "Centerville Food Pantry", "Centerville", "548 Broadway, Centerville, SD 57014", "605-563-2302", "Centerville area; hygiene items may be limited"],
  ["good-shepherd-aberdeen", "Good Shepherd Lutheran — food giveaway and community meal", "Aberdeen", "1429 N. Dakota Street, Aberdeen, SD 57401", "605-229-0846", "Aberdeen; source lists a monthly food giveaway with income guidelines and a community meal"],
  ["freeman", "Freeman Food Pantry", "Freeman", "508 S. Cedar Street, Freeman, SD 57029", "605-925-7311", "Freeman area; source notes visits limited to once monthly"],
  ["rocs-wagner", "Rural Office of Community Services — Wagner food pantry", "Wagner", "107 S. Main Avenue, Wagner, SD 57380", "605-384-3050", "Wagner area"],
  ["sacred-heart-aberdeen", "Sacred Heart Catholic Church food pantry", "Aberdeen", "409 3rd Avenue S.E., Aberdeen, SD 57401", "605-225-7065", "Aberdeen area; food, diapers, and school supplies"],
  ["arise-lower-brule", "Arise Native Family Advocacy — food and emergency items", "Lower Brule", "104 Gall Street, Lower Brule, SD 57548", "605-321-2670", "Lower Brule; food and basic emergency items"],
  ["salvation-army-watertown", "Salvation Army Watertown — community food resources", "Watertown", "621 4th Street S.E., Watertown, SD 57201", "605-886-4030", "Watertown; source lists food boxes and a community meal"],
  ["beresford-faith-in-action", "Beresford Faith in Action — emergency food and basic-needs support", "Beresford", "101 S. 5th Street, Emmanuel Lutheran Church, Beresford, SD 57004", "605-763-8019", "Beresford area; food and limited crisis assistance; ask about current funds and eligibility"],
  ["tea-area-cupboard", "Tea Area Cupboard", "Tea", null, null, "Tea residents; source says pantry use is limited to once monthly; contact route is through Dakota at Home"],
  ["feeding-south-dakota-crow-creek", "Feeding South Dakota — Senior Food Box pickup at Crow Creek Food Pantry", "Fort Thompson", "817 SD Highway 47, Crow Creek Food Pantry, Fort Thompson, SD 57339", null, "Fort Thompson; Commodity Supplemental Food Program pickup lead; confirm age, income, and schedule"],
];
export const SOUTH_DAKOTA_FOOD = sdFoodPantries.map(([id, name, city, address, phone, serviceArea]) => record({
  id: `sd-food-${id}`, state: "SD", name, city, address, phone, link: sdFoodSource,
  source: "Dakota at Home, South Dakota food pantry locator",
  serviceArea, resourceType: "named community food pantry, meal, or distribution contact",
  description: `${name} is listed in South Dakota's Dakota at Home food-access directory${address ? ` at ${address}` : ""}${phone ? `; published phone: ${phone}` : ""}. Scope and program limits: ${serviceArea}. Follow the source listing for the provider's own website or contact route and confirm hours, service area, age or income eligibility, referral steps, and current food availability before traveling. A directory record does not confirm that a distribution is open today.`,
}));

const sdCommunityActionSource = "https://dss.sd.gov/economicassistance/communityassistance.aspx";
const sdCommunityAction = [
  ["western", "Western South Dakota Community Action Program", "Rapid City", "605-348-1460", "Bennett, Butte, Corson, Custer, Dewey, Fall River, Haakon, Harding, Jackson, Lawrence, Meade, Oglala Lakota, Pennington, and surrounding western counties"],
  ["grow", "GROW South Dakota Community Action", "Sisseton", "605-698-7654", "Northeastern South Dakota; call to confirm county service area and current programs"],
  ["interlakes", "Inter-Lakes Community Action Partnership", "Madison", "605-256-6518", "Brookings, Clark, Codington, Deuel, Grant, Hamlin, Kingsbury, Lake, Lincoln, McCook, Miner, Minnehaha, Moody, and Turner counties"],
  ["rocs", "Rural Office of Community Services", "Wagner", "605-384-3883", "Twenty-county southeast service area; emergency services, homelessness prevention, housing preservation, food and other programs"],
];
export const SOUTH_DAKOTA_LOCAL_BENEFITS = sdCommunityAction.map(([id, name, city, phone, serviceArea]) => record({
  id: `sd-benefits-community-action-${id}`, state: "SD", name, city, phone,
  link: sdCommunityActionSource, source: "South Dakota Department of Social Services, Community Assistance Program directory",
  serviceArea, resourceType: "community action and economic-stability agency",
  description: `South Dakota DSS identifies ${name} as a community action program in ${city}. The state says agency services may include food pantries, transportation, weatherization, and emergency services; ROCS also lists homelessness prevention and housing preservation. Published contact: ${phone}. Coverage: ${serviceArea}. Call to confirm the county served, specific programs, eligibility, current funding, and intake; a listing does not guarantee financial assistance.`,
}));

const tnHousingSource = "https://thda.org/homelessness-resources/";
const tnHousingRows = [
  ["ethra-anderson", "East Tennessee Human Resource Agency — housing assistance", "Clinton", "Anderson", "125 Leinhart Street, Suite 5, Clinton, TN 37716", "865-457-3352", "Housing assistance; confirm whether its intake covers the caller's location"],
  ["torch-oak-ridge", "Tennessee Outreach Center for the Homeless (TORCH)", "Oak Ridge", "Anderson", null, "865-318-4788", "Emergency-shelter access; call for intake and current capacity"],
  ["tvch-anderson", "Tennessee Valley Coalition for the Homeless", "Regional", "Anderson, Cocke, Grainger, Jefferson, Loudon, Sevier, and Union counties", null, "888-556-0791", "Continuum-of-care referral; not a shelter placement"],
  ["safe-space", "Safe Space — domestic-violence support and shelter intake", "Sevierville", "Cocke, Jefferson, and Sevier counties", null, "865-453-9254", "Confidential domestic-violence support; call rather than visit an unlisted shelter address"],
  ["salvation-army-sevier", "Salvation Army Sevierville — hotel-voucher inquiry", "Sevierville", "Cocke County area", "806 West Main Street, Sevierville, TN 37864", "865-908-4010", "Ask whether assistance is currently offered and what eligibility applies"],
  ["avalon-cumberland", "Avalon Center — domestic-violence shelter access", "Crossville", "Cumberland and nearby counties", null, "931-456-0747", "Confidential shelter and survivor-support intake; confirm current service area"],
  ["bread-of-life", "Bread of Life Rescue Mission", "Crossville", "Cumberland and surrounding area", null, "931-707-0503", "Emergency-shelter contact; ask about intake, eligibility, and openings"],
  ["cookeville-rescue", "Cookeville Rescue Mission", "Cookeville", "Upper Cumberland region", null, "931-528-5819", "Emergency-shelter contact; confirm current intake and capacity"],
  ["hart", "Homeless Advocacy for Rural Tennessee (HART)", "Regional", "Rural Tennessee communities listed by THDA", null, "844-556-7628", "Homelessness-assistance and coordinated referral; not a direct shelter bed"],
  ["independence-again", "Independence Again — domestic-violence shelter access", "Regional", "Tennessee service area; confirm county coverage by phone", null, "888-417-0233", "Confidential survivor support; call for safe intake and referral options"],
  ["whole-way-house", "Reconciliation Whole Way House", "Regional", "Tennessee service area; confirm current location and intake by phone", null, "865-360-8593", "Emergency-shelter contact listed by THDA; verify program location and capacity"],
  ["cf-storehouse", "CF Storehouse — day shelter and homeless outreach", "Cookeville area", "Upper Cumberland region", null, "931-787-1355", "Day shelter and outreach ministry; confirm open hours and services before traveling"],
  ["scott-shelter", "Scott County Shelter Society — survivor shelter access", "Huntsville area", "Scott County and regional service area; confirm by phone", null, "423-569-3355", "Confidential domestic-violence shelter contact; call for safe intake"],
  ["seeds-of-hope", "Seeds of Hope emergency shelter", "Regional", "Tennessee service area; confirm county coverage by phone", null, "931-256-8023", "Emergency-shelter lead listed by THDA; confirm current operation and openings"],
  ["metro-homeless-services", "Metro Nashville Office of Homeless Services", "Nashville", "Davidson County", "800 2nd Avenue North, Nashville, TN 37201", "615-862-6444", "Coordinated homeless-service access; family intake number in source"],
  ["mdha", "Metropolitan Development and Housing Agency", "Nashville", "Davidson County", null, "615-252-8400", "Public-housing authority contact; ask about current program and waitlist status"],
  ["nashville-rescue", "Nashville Rescue Mission", "Nashville", "Davidson County", null, "615-255-2475", "Emergency-shelter contact listed by THDA; call to confirm intake and current capacity"],
  ["ywca-nashville", "YWCA Nashville and Middle Tennessee — survivor support", "Nashville", "Middle Tennessee; confirm county coverage", null, "800-334-4628", "Domestic-violence shelter and support access; call to arrange confidential intake"],
  ["opportunity-house", "Opportunity House", "Greeneville", "Greene County", null, "423-638-4099", "Emergency-shelter contact listed by THDA; verify current intake and capacity"],
  ["mats", "Ministerial Association Temporary Shelter", "Morristown", "Hamblen County", "733 West Main Street, Morristown, TN 37814", "423-587-9215", "Temporary shelter; call before traveling to confirm eligibility and space"],
  ["breath-of-life", "Breath of Life Ministries", "Morristown", "Hamblen County", "4185 East Andrew Johnson Highway, Morristown, TN 37814", "423-289-1163", "Emergency-shelter contact; ask about intake and current capacity"],
  ["samaritan-house-jefferson", "Appalachian Ministries of the Smokies — Samaritan House", "Jefferson City", "Jefferson County", "165 Jericho Way, Jefferson City, TN 37760", "865-475-5032", "Emergency-shelter contact; call to confirm current intake"],
  ["catholic-charities-knox", "Catholic Charities of East Tennessee — housing shelter access", "Knoxville", "Knox County", "3009 Lake Brook Boulevard, Knoxville, TN 37909", "865-684-1880", "Housing and shelter contact; ask about referral steps and current openings"],
  ["family-promise-knox", "Family Promise of Knoxville", "Knoxville", "Knox County", "3545 Middlebrook Pike, Knoxville, TN 37921", "865-584-2822", "Family emergency-shelter access; call for intake, eligibility, and capacity"],
  ["karm-knox", "Knoxville Area Rescue Ministries", "Knoxville", "Knox County", "418 North Broadway, Knoxville, TN 37917", "865-673-6540", "Emergency-shelter contact; confirm current intake and openings"],
  ["salvation-army-knox", "Salvation Army Knoxville — emergency-shelter contact", "Knoxville", "Knox County", "409 North Broadway, Knoxville, TN 37917", "865-525-9401", "Emergency-shelter contact; call first to ask about eligibility and capacity"],
  ["safe-place-mcnabb", "McNabb Center Safe Place", "Knoxville", "Knox County", null, "865-523-2689", "Emergency shelter access; call for a confidential intake and current availability"],
  ["family-promise-kingsport", "Family Promise of Greater Kingsport", "Kingsport", "Sullivan County", null, "423-246-6500", "Family shelter; confirm the intake route and current availability"],
  ["haven-of-rest", "Haven of Rest Ministries", "Kingsport", "Sullivan County", null, "423-968-2011", "Emergency-shelter contact listed by THDA; call to verify current services"],
  ["hope-haven", "Hope Haven Ministries", "Kingsport", "Sullivan County", null, "423-246-6012", "Emergency-shelter contact; call to confirm intake and capacity"],
  ["salvation-army-bristol", "Salvation Army Bristol — emergency shelter", "Bristol", "Sullivan County", null, "423-764-6156", "Emergency-shelter contact listed by THDA; verify current operation and intake"],
  ["family-promise-johnson-city", "Family Promise of Greater Johnson City", "Johnson City", "Washington County", null, "423-929-9967", "Family shelter; call to confirm the referral process and openings"],
  ["manna-house", "Manna House", "Johnson City", "Washington County", null, "423-434-9310", "Emergency-shelter contact; confirm service fit and current capacity"],
  ["salvation-army-johnson-city", "Salvation Army Johnson City — emergency shelter", "Johnson City", "Washington County", null, "423-926-8901", "Emergency-shelter contact; call to verify intake, eligibility, and capacity"],
  ["monroe-homeless-management", "Homeless Management of Monroe County", "Madisonville", "Monroe County", "103 College Street, Madisonville, TN 37354", "423-442-4143", "Emergency-shelter contact; call before traveling to confirm availability"],
  ["shelter-my-sheep", "Shelter My Sheep", "Tellico Plains", "Monroe County", "6265 Highway 360, Tellico Plains, TN 37385", "423-253-2303", "Emergency-shelter contact; verify current intake and eligibility"],
];
export const TENNESSEE_HOUSING = tnHousingRows.map(([id, name, city, serviceArea, address, phone, note]) => record({
  id: `tn-housing-${id}`, state: "TN", name, city, county: serviceArea, address, phone, link: tnHousingSource,
  source: "Tennessee Housing Development Agency, Homelessness Resources by County",
  serviceArea, resourceType: "shelter, housing-access, or survivor-support contact",
  description: `Tennessee Housing Development Agency lists ${name} as a ${note.toLowerCase()} in its county homelessness resource table. ${address ? `Published location: ${address}. ` : "The state directory does not publish a public walk-in address for this contact; call first. "}Published phone: ${phone}. This is a source-reviewed referral lead, not a confirmed bed, safe-house address, or placement. Confirm location, confidentiality-safe contact method, eligibility, referral steps, hours, and current capacity with the provider.`,
}));

const utHousingSource = "https://mihp.utah.gov/maternal-resource-guide-utah/housing-resources";
const utHousingRows = [
  ["bear-river-logan", "Bear River Regional Housing Authority — Logan office", "Logan", "170 N. Main Street, Logan, UT 84321", "435-752-7242", "Box Elder, Cache, and Rich counties", "Housing Choice Voucher and related affordable-housing access; ask about current waitlists"],
  ["bear-river-brigham", "Bear River Regional Housing Authority — Brigham City office", "Brigham City", "35 East 100 South, Brigham City, UT 84302", "435-723-1111", "Box Elder, Cache, and Rich counties", "Housing Choice Voucher and related affordable-housing access; ask about current waitlists"],
  ["davis-authority", "Davis Community Housing Authority", "Farmington", "352 S. 200 W., Suite 1, Farmington, UT 84025", "801-451-2587", "Davis County", "Housing Choice Voucher and public-housing access"],
  ["open-doors-clearfield", "Open Doors — Clearfield office", "Clearfield", "1360 E. 1450 S., Clearfield, UT 84015", "801-773-0712", "Davis and Morgan counties", "Rental and utility assistance and permanent-housing navigation; call to confirm current funding"],
  ["open-doors-layton", "Open Doors — Layton office", "Layton", "875 E. Highway 193, Layton, UT 84041", "801-771-4642", "Davis and Morgan counties", "Rental and utility assistance and permanent-housing navigation; call to confirm current funding"],
  ["cdc-utah", "Community Development Corporation of Utah", "Salt Lake City", "501 E. 1700 South, Salt Lake City, UT 84105", "801-994-7222", "Utah; confirm the specific program's area", "Mortgage, rental, home-start, down-payment, and home-improvement navigation"],
  ["housing-connect", "Housing Connect — Salt Lake County affordable-housing access", "Salt Lake City", "3595 S. Main Street, Salt Lake City, UT 84115", "801-284-4400", "Salt Lake County", "Housing Choice Voucher and affordable-housing navigation; ask about current waitlists"],
  ["slc-housing-stability", "Salt Lake City Housing Stability", "Salt Lake City", "451 S. State Street, Room 445, Salt Lake City, UT", "801-535-7712", "Salt Lake City", "Home-repair and home-buyer programs; call to confirm current eligibility and intake"],
  ["utah-community-action-rent", "Utah Community Action — rent and deposit assistance", "Salt Lake City", null, "801-359-2444", "Salt Lake and Tooele counties", "Rental or deposit assistance for eligible households facing a temporary financial crisis; terms apply"],
  ["utah-nonprofit-housing", "Utah Nonprofit Housing Corporation", "Salt Lake City", null, "801-364-6117", "Salt Lake, Davis, and Box Elder counties", "Affordable rental-housing access and pre-application route"],
  ["san-juan-prevention", "San Juan County Homeless Prevention Assistance", "Monticello", "117 S. Main Street, Monticello, UT 84535", "435-459-3994", "San Juan County", "Time-limited rent, deposit, and utility assistance for qualifying households at risk of housing loss; weekday hours differ by phone line"],
  ["carbon-emery-authority", "Housing Authority of Carbon-Emery County", "Price", "251 S. 1600 E. #2647, Price, UT 84501", "435-637-5170", "Carbon and Emery counties", "Housing Choice Voucher access; confirm current waitlist and documentation"],
  ["southeastern-utah-authority", "Housing Authority of Southeastern Utah", "Moab", "321 East Center Street, Moab, UT 84532", "435-259-5891", "Carbon, Emery, Grand, and San Juan counties", "Housing Choice Voucher and affordable-housing access; confirm current waitlist"],
  ["cedar-city-authority", "Cedar City Housing Authority", "Cedar City", "364 South 100 East, Cedar City, UT 84720", "435-586-8462", "Beaver, Garfield, Iron, Kane, and Washington counties", "Affordable-housing and Housing Choice Voucher intake; application waitlists may change"],
  ["five-county-housing", "Five County Community Action Partnership — housing assistance", "Cedar City", null, "435-673-3548", "Beaver, Garfield, Iron, Kane, and Washington counties", "Housing-related assistance; call to confirm the current program and county intake route"],
  ["st-george-authority", "St. George Housing Authority", "St. George", "975 N. 1725 W., Suite 101, St. George, UT 84770", "435-628-3648", "Washington County", "Housing Choice Voucher and emergency rental-assistance information; ask about current waitlists and eligibility"],
  ["switchpoint", "Switchpoint Community Resource Center", "St. George", "948 N. 1300 W., St. George, UT 84770", "435-628-9310", "Washington County and surrounding area", "State guide lists emergency shelter and housing case management; call to confirm access and current capacity"],
  ["community-action-services", "Community Action Services — housing and basic-needs assistance", "Provo", null, "801-691-5238", "Summit, Wasatch, and Utah counties for housing assistance", "Rental, utility, food, clothing, and transportation support may be available; confirm funding and eligibility"],
  ["mountainlands-trust", "Mountainlands Community Housing Trust", "Park City", "1960 Sidewinder Drive, Suite 107, Park City, UT 84060", "435-647-9719", "Summit and Wasatch counties", "Affordable-housing navigation and local affordable-rental lists"],
  ["wasatch-authority", "Wasatch County Housing Authority", "Heber City", "175 North Main Street, Suite 201, Heber City, UT 84032", "435-654-2053", "Wasatch County", "Low-income rental housing and down-payment assistance; eligibility applies"],
  ["tooele-resource-center", "Tooele Community Resource Center", "Tooele", "251 N. 1st Street, Tooele, UT 84074", "435-228-5151", "Tooele County", "State guide lists a 24/7 emergency shelter and case management; call to confirm intake and current capacity"],
  ["tooele-authority", "Tooele County Housing Authority", "Tooele", "66 W. Vine Street, Tooele, UT 84074", "435-882-7875", "Tooele County", "Rental assistance, affordable housing, and homebuyer programs; current waitlists and eligibility apply"],
  ["uintah-authority", "Housing Authority of Uintah Basin", "Roosevelt", "330 East 100 South, Roosevelt, UT 84066", "435-722-4518", "Daggett, Duchesne, and Uintah counties", "Housing-repair and mutual self-help housing programs for eligible residents"],
  ["uintah-assistance-myton", "Uintah Basin Assistance Council — Myton office", "Myton", "125 East Main Street, Myton, UT 84052", "435-722-3952", "Daggett, Duchesne, and Uintah counties", "Affordable rental-housing access; confirm the program serves the caller's household"],
  ["uintah-assistance-vernal", "Uintah Basin Assistance Council — Vernal office", "Vernal", "992 West Main Street, Vernal, UT 84078", "435-781-4156", "Daggett, Duchesne, and Uintah counties", "Affordable rental-housing access; confirm the program serves the caller's household"],
  ["family-promise-ogden", "Family Promise of Ogden", "Ogden", "256 24th Street, Ogden, UT 84401", "385-298-1081", "Morgan and Weber counties", "Overnight family shelter and housing referrals; call to confirm age/family eligibility and openings"],
  ["lantern-house", "Lantern House", "Ogden", "269 W. 33rd Street, Ogden, UT 84401", "801-621-5036", "Ogden and Weber County area", "Shelter, food, and caseworker resource connections for people experiencing homelessness or financial emergency"],
  ["owcap", "Ogden-Weber Community Action Partnership — housing support", "Ogden", "3159 Grant Avenue, Ogden, UT 84401", "801-399-9281", "Weber, Morgan, and neighboring counties; confirm program-specific scope", "Family housing support, tenant-landlord mediation, and related services"],
  ["weber-authority", "Weber Housing Authority", "Ogden", "2380 Washington Boulevard, Suite 112, Ogden, UT 84401", "801-399-8691", "Weber County", "Housing Choice Voucher rental assistance for eligible residents; call about current waitlist"],
];
export const UTAH_HOUSING = utHousingRows.map(([id, name, city, address, phone, serviceArea, scope]) => record({
  id: `ut-housing-${id}`, state: "UT", name, city, address, phone, link: utHousingSource,
  source: "Utah Department of Health and Human Services, Maternal and Infant Health Program Housing Resource Guide",
  serviceArea, resourceType: "local affordable-housing, rent-assistance, or shelter access",
  description: `${name} is listed by Utah DHHS for ${serviceArea}. The state guide says: ${scope}. Call before traveling to confirm current service area, eligibility, referral steps, office hours, waitlist status, and whether funds or shelter capacity are available. A listing does not guarantee rental assistance, a voucher, or a bed.`,
}));

const utHeatSource = "https://mihp.utah.gov/maternal-resource-guide-utah/housing-resources";
const utHeatRows = [
  ["bear-river-box-elder", "Bear River Association of Governments — HEAT utility assistance", "Brigham City", "Box Elder County", "435-723-1116"],
  ["bear-river-cache", "Bear River Association of Governments — HEAT utility assistance", "Logan", "Cache County", "435-713-1444"],
  ["bear-river-rich", "Bear River Association of Governments — HEAT utility assistance", "Rich County service area", "Rich County", "877-772-7242"],
  ["six-county-juab-millard", "Six County Association of Governments — HEAT assistance", "Juab and Millard counties", "Juab and Millard counties", "435-743-4060"],
  ["six-county-sevier-piute-wayne", "Six County Association of Governments — HEAT assistance", "Sevier, Piute, and Wayne counties", "Sevier, Piute, and Wayne counties", "435-893-0744"],
  ["six-county-sanpete", "Six County Association of Governments — HEAT assistance", "Sanpete County", "Sanpete County", "435-835-2831"],
  ["five-county-beaver-garfield-kane", "Five County Association of Governments — HEAT utility assistance", "Beaver, Garfield, and Kane counties", "Beaver, Garfield, and Kane counties", "435-438-3584"],
  ["five-county-iron", "Five County Association of Governments — HEAT utility assistance", "Iron County", "Iron County", "435-586-0858"],
  ["five-county-washington", "Five County Association of Governments — HEAT utility assistance", "Washington County", "Washington County", "435-652-9643"],
  ["serda-carbon-san-juan", "Southeastern Regional Development Agency — HEAT utility assistance", "Carbon and San Juan counties", "Carbon and San Juan counties", "435-613-0100"],
  ["serda-emery", "Southeastern Regional Development Agency — HEAT utility assistance", "Emery County", "Emery County", "435-381-5783"],
  ["serda-grand", "Southeastern Regional Development Agency — HEAT utility assistance", "Grand County", "Grand County", "435-259-6362"],
];
export const UTAH_BENEFITS = utHeatRows.map(([id, name, city, serviceArea, phone]) => record({
  id: `ut-benefits-${id}`, state: "UT", name, city, phone, link: utHeatSource,
  source: "Utah Department of Health and Human Services, Housing and Utility Assistance by County",
  serviceArea, resourceType: "HEAT home-energy assistance intake",
  description: `Utah DHHS publishes this ${name} contact for ${serviceArea}; phone: ${phone}. HEAT helps eligible households with home energy costs. Call to ask about current application windows, income and household eligibility, required documents, shutoff or crisis priority rules, and whether the office serves your address. Funding and approval are not guaranteed.`,
}));

const vtCsfpSource = "https://www.vtfoodbank.org/wp-content/uploads/2026/05/20260501_CSFP-Pick-Up-Location-List_Updated-April-2026.pdf";
const vtCsfpSites = [
  ["alburgh-amadeaus", "Amadeaus Parish Hall", "Alburgh"],
  ["arlington-food-shelf", "Arlington Food Shelf", "Arlington"],
  ["barre-auditorium", "Barre Auditorium", "Barre"],
  ["barton-fairgrounds", "Barton Fairgrounds", "Barton"],
  ["bellows-falls-waypoint", "Waypoint Center", "Bellows Falls"],
  ["bennington-congregational", "Second Congregational Church", "Bennington"],
  ["bradford-ucc", "United Church of Christ", "Bradford"],
  ["brattleboro-foodworks", "Foodworks", "Brattleboro"],
  ["bristol-legion", "American Legion", "Bristol"],
  ["burlington-north-champlain", "10 North Champlain Street", "Burlington"],
  ["burlington-decker", "Decker Towers Apartments", "Burlington"],
  ["craftsbury-food-share", "Craftsbury Food Share", "Craftsbury Common"],
  ["derby-elks", "Elks Lodge", "Derby"],
  ["enosburg-st-john", "St. John the Baptist", "Enosburg Falls"],
  ["essex-grace", "Grace United Methodist Church", "Essex Junction"],
  ["fair-haven-slate-valley", "Slate Valley Cares", "Fair Haven"],
  ["hardwick-foodshelf", "Hardwick Foodshelf", "Hardwick"],
  ["island-pond-bible", "Green Mountain Bible Church", "Island Pond"],
  ["jay-food-shelf", "Jay Food Shelf", "Jay"],
  ["ludlow-black-river", "Black River Food Shelf", "Ludlow"],
  ["lyndonville-enrichment", "Riverside Enrichment Center", "Lyndonville"],
  ["middlebury-hope", "ACCAG (HOPE)", "Middlebury"],
  ["montpelier-onion-river", "Onion River Food Shelf", "Marshfield"],
  ["montgomery-food-shelf", "Montgomery Food Shelf", "Montgomery"],
  ["newbury-food-shelf", "Newbury Food Shelf", "Newbury"],
  ["northfield-senior-center", "Northfield Senior Center", "Northfield"],
  ["putney-food-shelf", "Putney Food Shelf", "Putney"],
  ["randolph-area-foodshelf", "Randolph Area Foodshelf", "Randolph"],
  ["rochester-food-shelf", "Rochester Food Shelf", "Rochester"],
  ["rutland-broc", "BROC of Rutland", "Rutland"],
  ["st-albans-legion", "American Legion", "Saint Albans City"],
  ["sheffield-food-pantry", "Sheffield Food Pantry", "Sheffield"],
  ["springfield-church", "Church of Christ", "Springfield"],
  ["st-johnsbury-house", "St. Johnsbury House", "St. Johnsbury"],
  ["swanton-food-shelf", "Winooski Food Shelf", "Winooski"],
  ["woodstock-senior-center", "Thompson Senior Center", "Woodstock"],
];
export const VERMONT_LOCAL_FOOD = vtCsfpSites.map(([id, site, city]) => record({
  id: `vt-food-csfp-${id}`, state: "VT", name: `Commodity Supplemental Food Program pickup — ${site}`, city,
  link: vtCsfpSource, source: "Vermont Foodbank, Commodity Supplemental Food Program distribution-site list (updated April 2026)",
  serviceArea: `${city} area; pickup site listed by Vermont Foodbank`, resourceType: "senior food-box distribution pickup lead",
  description: `Vermont Foodbank's April 2026 Commodity Supplemental Food Program site list names ${site} in ${city} as a pickup location. This is a program pickup site, not a general walk-in pantry listing. CSFP is for eligible older adults; call Vermont Foodbank at 800-585-2265 or use its current food-access finder to confirm age/income eligibility, the exact pickup address, schedule, enrollment, and whether this site is still active before traveling.`,
}));
