// Delaware listings reviewed against state and operator directories on 2026-10-25.
// Source review verifies that the organization publishes the listing; it does not
// mean a phone call was completed, capacity is open, or the catalog is exhaustive.
const reviewed = (record) => ({ ...record, state: "DE", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const treatmentUrl = "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/publicly-funded-addiction-treatment-programs/";
const treatmentSource = "Delaware DHSS, Publicly Funded Addiction Treatment Programs";
const treatmentSites = [
  ["netc-wilmington", "Northeast Treatment Center — withdrawal management and residential care", "Wilmington", "3315 Kirkwood Highway, Wilmington, DE 19808", "302-691-0140", "Withdrawal management and high-intensity residential treatment; call before visiting to confirm intake and current eligibility."],
  ["aquila-leona", "Aquila of Delaware — Leona Mae House", "Bear", "2960 Red Lion Road, Bear, DE 19701", "302-584-5878", "State-listed residential substance-use treatment for men and women. Contact the program to confirm intake criteria and availability."],
  ["aquila-gary", "Aquila of Delaware — Gary Robinson House", "Bear", "4185 Kirkwood Saint George Road, Bear, DE 19701", "302-834-7806", "State-listed residential substance-use treatment for men. Contact the program to confirm intake criteria and availability."],
  ["coras-residential-wilmington", "Coras Wellness — Wilmington residential treatment", "Wilmington", "1120 Brandywine Street, Wilmington, DE 19802", "302-384-8167", "State-listed residential substance-use treatment. Call before visiting to discuss intake, level of care, and current openings."],
  ["gaudenzia-claymont", "Gaudenzia — Claymont Center", "Claymont", "3901 Philadelphia Pike, Claymont, DE 19703", "302-425-9200", "State-listed residential program for women, including women with children. Call to discuss referral, admission, and current availability."],
  ["limen-residential", "Limen Recovery and Wellness — residential", "Wilmington", "819 N. Washington Street, Wilmington, DE 19801", "302-655-1153", "State-listed residential substance-use treatment for men and women. Call to confirm the right intake route and current availability."],
  ["ars-new-castle", "Addiction Recovery Systems — New Castle", "New Castle", "263 Quigley Blvd., Suite 1A, New Castle, DE 19720", "302-323-9400", "State-listed outpatient substance-use treatment, including medication treatment. Contact the provider about assessment and appointment steps."],
  ["ats-claymont", "ATS of Delaware — Claymont Treatment Center", "Claymont", "2999 Philadelphia Pike, Claymont, DE 19703", "302-792-0700", "State-listed outpatient treatment and medication services. Call to confirm the program fit, insurance/payment options, and intake."],
  ["aquila-outpatient-bear", "Aquila of Delaware — Bear Outpatient Treatment", "Bear", "2950 Red Lion Road, Bear, DE 19701", "302-999-1106", "State-listed outpatient substance-use care, including medication treatment. Contact the provider to request an assessment."],
  ["brandywine-lancaster", "Brandywine Counseling — Lancaster outpatient", "Wilmington", "2713 Lancaster Avenue, Wilmington, DE 19805", "302-656-2348", "State-listed outpatient substance-use treatment and counseling. Call to confirm referral requirements, payment, and appointment access."],
  ["brandywine-newark", "Brandywine Counseling — Newark outpatient", "Newark", "24 Brookhill Drive, Newark, DE 19702", "302-454-3020", "State-listed outpatient substance-use treatment. Call to confirm assessment, medication options, and current intake."],
  ["coras-newark", "Coras Wellness — Newark outpatient", "Newark", "3304 Drummond Plaza, Newark, DE 19711", "302-577-9651", "State-listed outpatient substance-use treatment, including medication services. Contact the provider to confirm next steps."],
  ["essentials-wilmington", "Essentials in Recovery", "Wilmington", "3700 Lancaster Pike, Suite 105, Wilmington, DE 19805", "302-208-8174", "State-listed outpatient substance-use treatment and recovery support. Call to confirm current services and intake."],
  ["impact-newark", "Impact Life — Newark outpatient", "Newark", "90 Blue Hen Drive, Newark, DE 19713", "302-485-0702", "State-listed substance-use treatment and recovery services. Contact the program to confirm which service and intake route fits."],
  ["limen-outpatient", "Limen Recovery and Wellness — outpatient", "Wilmington", "828 Wollaston Street, Wilmington, DE 19801", "302-655-1153", "State-listed outpatient treatment, including medication services. Call for assessment and current appointment access."],
  ["limen-achievement", "Limen Recovery — Achievement Center", "Wilmington", "38 Vandever Avenue, Wilmington, DE 19802", "302-655-1153", "State-listed outpatient treatment and recovery services. Contact the provider to confirm services at this site."],
  ["lotus-prices-corner", "Lotus Recovery Centers — Prices Corner", "Wilmington", "1812 Newport Gap Pike, Wilmington, DE 19808", "302-451-9629", "State-listed outpatient substance-use treatment, including medication services. Call before traveling to ask about intake."],
  ["dover-behavioral", "Dover Behavioral Health — withdrawal management", "Dover", "725 Horsepond Road, Dover, DE 19901", "302-741-0140", "State-listed withdrawal-management program. Call the facility to confirm current admission process and what to bring."],
  ["coras-new-hope-31", "Coras — New Hope residential rehabilitation (ASAM 3.1)", "Harrington", "1 East Street, Harrington, DE 19952", "302-786-7800", "State-listed residential rehabilitation for men and women. Contact Coras to discuss referral and admission."],
  ["coras-new-hope-35", "Coras — New Hope residential rehabilitation (ASAM 3.5)", "Harrington", "9 East Street, Harrington, DE 19952", "302-786-7800", "State-listed higher-intensity residential rehabilitation for men and women. Contact Coras to discuss referral and admission."],
  ["psychotherapeutic-mckee", "Psychotherapeutic Services — men's residential program", "Dover", "1420 McKee Road, Dover, DE 19904", "302-257-5818", "State-listed men's residential rehabilitation. Call to ask about referral, eligibility, and current openings."],
  ["psychotherapeutic-lebanon", "Psychotherapeutic Services — women's residential program", "Dover", "514 W. Lebanon Road, Dover, DE 19901", "302-257-5818", "State-listed women's residential rehabilitation. Call to ask about referral, eligibility, and current openings."],
  ["ats-dover", "ATS of Delaware — Dover Comprehensive Treatment Center", "Dover", "429 S. New Street, Dover, DE 19904", "302-504-8500", "State-listed outpatient treatment and medication services. Call the center to confirm intake and appointment availability."],
  ["brandywine-dover", "Brandywine Counseling — Dover Treatment Center", "Dover", "698 S. Bay Road, Dover, DE 19901", "302-760-5320", "State-listed outpatient substance-use treatment. Contact the center to confirm the services currently offered at this site."],
  ["coras-dover", "Coras Wellness — Dover outpatient", "Dover", "1114 S. DuPont Highway, Suite 102, Dover, DE 19901", "302-672-9360", "State-listed outpatient treatment and medication services. Contact Coras to request an assessment."],
  ["coras-harrington", "Coras Wellness — Harrington outpatient", "Harrington", "5 East Street, Harrington, DE 19952", "302-786-7800", "State-listed outpatient substance-use treatment. Call for assessment, referral requirements, and current access."],
  ["northnode-dover", "NorthNode Group Counseling", "Dover", "1418 S. State Street, Dover, DE 19901", "302-257-3135", "State-listed outpatient substance-use treatment and medication services. Contact the provider to confirm intake details."],
  ["sun-georgetown", "SUN Behavioral Health — Georgetown withdrawal management", "Georgetown", "21655 Biden Avenue, Georgetown, DE 19947", "302-207-9176", "State-listed withdrawal-management program. Call the facility to confirm admission procedures and current availability."],
  ["impact-harbeson", "Impact Life — Harbeson residential program", "Harbeson", "22703 Hurdle Ditch Road, Harbeson, DE 19951", "302-593-7335", "State-listed residential substance-use treatment for men. Call to discuss referral and current admission access."],
  ["ats-georgetown", "ATS of Delaware — Sussex Comprehensive Treatment Center", "Georgetown", "501 W. Market Street, Georgetown, DE 19947", "877-449-4908", "State-listed outpatient treatment and medication services. Call to confirm intake and services at this location."],
  ["brandywine-georgetown", "Brandywine Counseling — Georgetown treatment", "Georgetown", "10 N. Railroad Avenue, Georgetown, DE 19947", "302-217-5168", "State-listed outpatient substance-use treatment. Contact the program to confirm intake and appointment access."],
];
export const DELAWARE_TREATMENT = treatmentSites.map(([id, name, city, address, phone, description]) => local({
  id: `de-treatment-${id}`, name, city, address, phone, description, link: treatmentUrl,
  source: treatmentSource, locationLine: `${city}, Delaware · call before visiting to confirm intake`,
}));

const residenceSites = [
  ["aquila-av", "Aquila of Delaware — AV House Recovery Residence", "Bear", "302-378-9213", "Level 3 sober-living residence for men; street address intentionally private."],
  ["aquila-newark", "Aquila of Delaware — Newark Recovery Residences", "Newark", "302-357-7361", "Level 2 recovery residences for men and women; exact addresses intentionally private."],
  ["aquila-sharons", "Aquila of Delaware — Sharon’s Place", "Middletown", null, "Level 3 sober-living residence for men; street address intentionally private."],
  ["aquila-healing", "Aquila of Delaware — The Healing Place", "Middletown", "302-376-3045", "Level 3 sober-living residence for women; street address intentionally private."],
  ["attack-richardson", "Attack Addiction — Richardson Park Recovery Residence", "Wilmington", "302-593-7335", "Level 3 sober-living residence for men; street address intentionally private."],
  ["attack-gilpin", "Attack Addiction — Gilpin Recovery Residence", "Wilmington", "302-593-7335", "Level 3 sober-living residence for women; street address intentionally private."],
  ["ccd-historic", "Community Collaboration — Historic New Castle Recovery Residence", "New Castle", "302-364-3400", "Level 3 sober-living residence for men; street address intentionally private."],
  ["ccd-concordia", "Community Collaboration — Concordia House", "New Castle", "302-364-3400", "Level 3 sober-living residence for women; street address intentionally private."],
  ["ccd-smallwood", "Community Collaboration — Smallwood Recovery Residence", "New Castle", "302-364-3400", "Level 2 sober-living residence for men; street address intentionally private."],
  ["ccd-aurora", "Community Collaboration — Aurora Recovery Residence", "New Castle", "302-364-3400", "Level 2 sober-living residence for women; street address intentionally private."],
  ["essentials-living", "Essentials Recovery — Essentials Living", "Wilmington", "302-482-2390", "Level 2 sober-living residence for men; street address intentionally private."],
  ["impact-pike-creek", "Impact Life — Pike Creek Recovery Residence", "Wilmington", "302-485-0702", "Level 3 sober-living residence for women; street address intentionally private."],
  ["impact-curtis", "Impact Life — Curtis Recovery Residence", "Wilmington", "302-485-0702", "Level 3 sober-living residence for men; street address intentionally private."],
  ["impact-milltown", "Impact Life — Milltown Recovery Residence", "Wilmington", "302-485-0702", "Level 3 sober-living residence for women; street address intentionally private."],
  ["limen-men", "Limen House Recovery Residences — men's homes", "Wilmington", "302-571-1216", "Level 2 and 3 recovery residences for men; street address intentionally private."],
  ["limen-women", "Limen House Recovery Residences — women's homes", "Wilmington", "302-655-1153", "Level 2 and 3 recovery residences for women; street address intentionally private."],
  ["impact-liberty", "Impact Life — Liberty Recovery Residence", "Harrington", "302-485-0702", "Level 3 sober-living residence for men; street address intentionally private."],
  ["impact-washington", "Impact Life — Washington Recovery Residence", "Milford", "302-485-0702", "Level 3 sober-living residence for women; street address intentionally private."],
  ["impact-church", "Impact Life — Church Street Recovery Residence", "Milford", "302-485-0702", "Level 3 sober-living residence for men; street address intentionally private."],
  ["ps-madre", "Psychotherapeutic Services — Madre House residences", "Milford", "302-538-4600", "Level 2 recovery residences for women with children; street address intentionally private."],
  ["serenity-shalom", "Serenity Place — Shalom House", "Dover", "302-730-0800", "Level 2 sober-living residence for men; street address intentionally private."],
  ["serenity-place", "Serenity Place Recovery Residence", "Dover", "302-730-0800", "Level 2 and 3 sober-living residence for men; street address intentionally private."],
  ["impact-sanctuary", "Impact Life — The Sanctuary", "Seaford", "302-485-0702", "State-listed residential recovery program for women; street address intentionally private."],
];
export const DELAWARE_HOUSING = [
  ...residenceSites.map(([id, name, city, phone, description]) => regional({
    id: `de-housing-${id}`, name, city, phone, description: `${description} Delaware DHSS lists this certified recovery residence. Call the operator to confirm eligibility, referral process, fees, and current openings.`,
    link: treatmentUrl, source: treatmentSource, locationLine: `${city}, Delaware · certified recovery residence · address private; call for referral`,
  })),
  statewide({ id: "de-housing-central-intake", name: "Housing Alliance Delaware — Centralized Intake", phone: "1-833-346-3233", alternatePhone: "Text FIND-BED to 1-833-346-3233", email: "intake@housingalliancede.org", description: "Centralized Intake provides information and referrals about emergency shelter openings and housing assistance for people experiencing homelessness. Phone/text hours are listed as weekdays, 8 a.m.–5 p.m. Ask about current openings and the local assessment pathway; a referral does not guarantee placement.", link: "https://www.housingalliancede.org/centralized-intake", source: "Housing Alliance Delaware — Centralized Intake", locationLine: "Delaware statewide · referral and assessment line · not a guaranteed shelter placement" }),
  statewide({ id: "de-housing-search", name: "DEHousingSearch.com — rental housing locator", phone: "1-877-428-8844", description: "Delaware's housing search service helps locate rental listings and housing resources. Ask about accessible units, affordability, application requirements, and whether each property is currently available; the locator is not an emergency shelter placement service.", link: "https://www.dehousingsearch.com/", source: "Delaware Department of Correction Community Resources flyer", locationLine: "Delaware statewide · housing search and referral" }),
];

const pantryUrl = "https://www.fbd.org/get-help/community-food-pantries/";
const pantrySource = "Food Bank of Delaware — Community Food Pantry partners";
const pantrySites = [
  ["appoquinimink", "Appoquinimink State Service Center Food Pantry", "Middletown", "122 Silver Lake Road, Middletown, DE 19709", "302-696-3120"],
  ["attack-addiction", "Attack Addiction Food Pantry", "Newark", "210 Peoples Plaza, Newark, DE 19702", "302-365-5221"],
  ["be-ready", "Be Ready CDC Food Pantry", "Wilmington", "1411 West 4th Street, Wilmington, DE 19805", "201-772-2031"],
  ["black-mothers", "Black Mothers In Power Food Pantry", "Wilmington", "2215B N. Washington Street, Wilmington, DE 19802", "302-932-6163"],
  ["canaan", "Canaan Baptist Church Food Pantry", "New Castle", "3011 New Castle Avenue, New Castle, DE 19720", "302-654-8818"],
  ["claymont-center", "Claymont Community Center Food Pantry", "Claymont", "3301 Green Street, Claymont, DE 19703", "302-792-2757 ext. 111"],
  ["community-collab", "Community Collaboration of Delaware Food Pantry", "Claymont", "4 Colby Avenue, Claymont, DE 19703", "302-358-4482"],
  ["dream-center", "Dream Center Food Pantry", "Newark", "310 Ruthar Drive, Newark, DE 19711", "302-286-7406"],
  ["garfield-pal", "Garfield Park PAL FLOW Food Pantry", "New Castle", "26 Karlyn Drive, New Castle, DE 19720", "302-450-8844"],
  ["hanover", "Hanover Presbyterian Food Closet", "Wilmington", "1801 North Jefferson Street, Wilmington, DE 19802", "302-658-5114"],
  ["hilltop", "Hilltop Lutheran Food Closet", "Wilmington", "1018 W. 6th Street, Wilmington, DE 19805", "302-656-3224"],
  ["hispanic-association", "Hispanic American Association of Delaware Food Pantry", "Wilmington", "1801 Lancaster Avenue, Wilmington, DE 19805", "302-307-3175"],
  ["holy-rosary", "Holy Rosary Outreach Food Pantry", "Claymont", "3200 Philadelphia Pike, Claymont, DE 19703", "302-798-2904"],
  ["hope-on-deck", "Hope On Deck Food Pantry", "Newark", "54 Albe Drive, Unit F, Newark, DE 19702", "302-283-9594"],
  ["iglesia-roca", "Iglesia de Jesucristo Roca Inconmovible Food Pantry", "Wilmington", "635 W. Newport Pike, Wilmington, DE 19805", "302-287-3565"],
  ["josephs-pantry", "Joseph’s Pantry at Congregation Beth Emeth", "Wilmington", "300 West Lea Boulevard, Wilmington, DE 19802", "302-753-2162"],
  ["kingswood", "Kingswood United Methodist Food Pantry", "Newark", "300 Marrows Road, Newark, DE 19713", "302-738-4478"],
  ["latin-american-center", "Latin American Community Center Food Closet", "Wilmington", "403 North Van Buren Street, Wilmington, DE 19805", "302-655-7338"],
  ["lutheran-choice", "Lutheran Community Services Choice Pantry", "Wilmington", "2809 Baynard Boulevard, Wilmington, DE 19802", "302-654-8886"],
  ["newark-welfare", "Newark Area Welfare Committee Food Pantry", "Newark", "69 East Main Street, Newark, DE 19713", "302-368-8774"],
  ["our-daily-bread", "Our Daily Bread — Middletown meals and food distribution", "Middletown", "214 North Broad Street, Middletown, DE 19709", "302-285-9540"],
  ["plenty", "Plenty Food Pantry", "Wilmington", "1121 Thatcher Street, Wilmington, DE 19802", "302-232-6610"],
  ["project-5000", "Project 5000 — New Covenant Community Fellowship", "New Castle", "294 Churchmans Road, New Castle, DE 19720", "302-276-0725"],
  ["salvation-army-wilmington", "Salvation Army Food Closet — Wilmington", "Wilmington", "400 North Orange Street, Wilmington, DE 19801", "302-472-0700"],
  ["saint-patricks", "Saint Patrick’s Center Food Pantry", "Wilmington", "107 East 14th Street, Wilmington, DE 19801", "302-652-6219"],
  ["blue-hen", "Blue Hen Social Service Center Food Pantry", "Dover", "655 South Bay Road, Suite 21, Dover, DE 19901", "302-672-9500"],
  ["frederica-senior", "Frederica Senior Center Food Pantry", "Frederica", "216 S. Market Street, Frederica, DE 19946", "302-335-4555"],
  ["harvest-hub", "Harvest Hub / Haven of Hope", "Milford", "320 Mullet Run, Milford, DE 19967", "302-217-3106"],
  ["milford-pantry", "Milford Community Pantry", "Milford", "20 North Church Street, Milford, DE 19963", "302-422-8111"],
  ["modern-maturity", "Modern Maturity Center Food Pantry", "Dover", "1121 Forrest Avenue, Dover, DE 19904", "302-734-1200"],
  ["network-connect", "Network Connect — Dover food support", "Dover", "20 East Division Street, Dover, DE 19901", "302-272-3189"],
  ["salvation-army-dover", "Salvation Army — Dover food pantry", "Dover", "611 Forest Street, Dover, DE 19903", "302-678-9551"],
  ["whatcoat", "Whatcoat United Methodist Church Food Pantry", "Dover", "341 Saulsbury Road, Dover, DE 19904", "302-734-9505"],
  ["abundant-life", "Abundant Life Ministries Food Pantry", "Ellendale", "14411 VFW Road, Ellendale, DE 19941", "302-258-3854"],
  ["blessings-unlimited", "Blessings Unlimited Food Pantry", "Millsboro", "36759 Millsboro Highway, Millsboro, DE 19966", "302-238-7370"],
  ["bountiful-blessings", "Bountiful Blessings Food Pantry", "Dagsboro", "31195 Dupont Boulevard, Dagsboro, DE 19966", "302-344-0087"],
  ["cape-henlopen", "Cape Henlopen Food Basket", "Rehoboth Beach", "37510 Oyster House Road, Rehoboth Beach, DE 19971", "302-227-3528"],
  ["casa-san-francisco", "Catholic Charities — Casa San Francisco", "Milton", "127 Broad Street, Milton, DE 19968", "302-684-8694"],
  ["christian-storehouse", "Christian Storehouse", "Millsboro", "149 Mitchell Street, Millsboro, DE 19966", "302-934-8151"],
  ["harvest-delmar", "Harvest Ministries — Delmar", "Delmar", "305 N. Bi-State Boulevard, Delmar, DE 19940", "302-846-3001"],
  ["higher-ground", "Higher Ground Outreach", "Georgetown", "12 East Pine Street, Georgetown, DE 19947", "302-470-7497"],
  ["love-inc", "Love INC of Mid-Delmarva", "Seaford", "703 East King Street, Seaford, DE 19973", "302-629-7050"],
  ["milton-community", "Milton Community Food Pantry", "Milton", "12898 Union Street Extension, Milton, DE 19968", "732-500-6154"],
  ["nanticoke-senior", "Nanticoke Senior Center Food Pantry", "Seaford", "1001 West Locust Street, Seaford, DE 19973", "302-258-3501"],
  ["shepherds-office", "Shepherd’s Office Food Pantry", "Georgetown", "408 North Bedford Street, Georgetown, DE 19947", "302-858-8556"],
  ["life-center", "The Life Center Church Food Pantry", "Bridgeville", "8887 Redden Road, Bridgeville, DE 19933", "302-249-6416"],
  ["good-works", "UFCW Local 27 Good Works Food Pantry", "Selbyville", "3 Mason Drive, Selbyville, DE 19975", "302-934-5389"],
];
export const DELAWARE_FOOD = pantrySites.map(([id, name, city, address, phone]) => local({
  id: `de-food-${id}`, name, city, address, phone,
  description: `Listed by the Food Bank of Delaware as a community pantry or food-support partner. Call before traveling to confirm service hours, eligibility or referral requirements, food availability, and any appointment or documentation needs.`,
  link: pantryUrl, source: pantrySource, locationLine: `${city}, Delaware · food support · call to confirm current hours and availability`,
}));

const serviceCenters = [
  ["adams", "Thurman Adams State Service Center", "Georgetown", "546 S. Bedford Street, Georgetown, DE 19947"],
  ["appoquinimink", "Appoquinimink State Service Center", "Middletown", "122 Silver Lake Road, Middletown, DE 19709"],
  ["belvedere", "Belvedere State Service Center", "Wilmington", "310 Kiamensi Road, Wilmington, DE 19804"],
  ["bridgeville", "Bridgeville State Service Center", "Bridgeville", "400 Mill Street, Bridgeville, DE 19933"],
  ["canby", "Canby Park Office", "Wilmington", "1920 Maryland Avenue, Wilmington, DE 19805"],
  ["churchmans", "Churchman’s Corporate Center", "New Castle", "84 Christiana Road, New Castle, DE 19720"],
  ["claymont", "Claymont State Service Center", "Claymont", "3301 Green Street, Claymont, DE 19703"],
  ["delawarr", "DeLaWarr State Service Center", "New Castle", "500 Rogers Road, New Castle, DE 19720"],
  ["hudson", "Floyd I. Hudson State Service Center", "Newark", "501 Ogletown Road, Newark, DE 19711"],
  ["laurel", "Laurel State Service Center", "Laurel", "31039 North Poplar Street, Laurel, DE 19956"],
  ["milford-annex", "Milford State Service Center — Front Street", "Milford", "13 SW Front Street, Milford, DE 19963"],
  ["milford-riverwalk", "Milford State Service Center — Riverwalk", "Milford", "253 NE Front Street, Milford, DE 19963"],
  ["northeast", "Northeast State Service Center", "Wilmington", "1624 Jessup Street, Wilmington, DE 19802"],
  ["porter", "Winder Laird Porter State Service Center", "Wilmington", "509 W. 8th Street, Wilmington, DE 19801"],
  ["pyle", "Edward W. Pyle State Service Center", "Frankford", "34314 Pyle Center Road, Frankford, DE 19945"],
  ["robscott", "Robscott Building State Service Center", "Newark", "153 East Chestnut Hill Road, Newark, DE 19713"],
  ["shipley", "Anna C. Shipley State Service Center", "Seaford", "350 Virginia Avenue, Seaford, DE 19973"],
  ["smyrna", "Smyrna State Service Center", "Smyrna", "100 Sunnyside Road, Smyrna, DE 19977"],
  ["williams", "James W. Williams State Service Center", "Dover", "805 River Road, Dover, DE 19901"],
];
export const DELAWARE_BENEFITS = serviceCenters.map(([id, name, city, address]) => local({
  id: `de-benefits-${id}`, name, city, address, phone: "302-255-9040",
  description: "Delaware DHSS identifies this State Service Center as a local point to apply for and manage public services. Call the statewide DHSS information line to confirm which benefits are handled at this site, appointment requirements, documents, and the office's direct number before visiting.",
  link: "https://dhss.delaware.gov/dss/division-of-social-services/state-service-centers/", source: "Delaware DHSS — State Service Centers", locationLine: `${city}, Delaware · public benefits and service navigation · confirm direct office details`,
}));

export const DELAWARE_PEER = [
  statewide({ id: "de-peer-na", name: "Delaware Narcotics Anonymous — meeting finder", description: "Use the official NA meeting search to find current in-person and virtual peer meetings across Delaware. Confirm location, time, format, and accessibility with the local service area before traveling.", link: "https://www.na.org/meetingsearch/", source: "Narcotics Anonymous World Services meeting search", locationLine: "Delaware statewide · live meeting search · schedule and address can change" }),
  statewide({ id: "de-peer-aa", name: "Alcoholics Anonymous — Delaware meeting finder", description: "Use the official AA meeting locator to find local and online meetings. Check the meeting's current time, format, accessibility, and address before attending.", link: "https://www.aa.org/find-aa", source: "Alcoholics Anonymous World Services meeting finder", locationLine: "Delaware statewide · live meeting search · schedule and address can change" }),
  regional({ id: "de-peer-northern-aa", name: "Northern Delaware Intergroup — AA meeting support", city: "Wilmington", description: "Northern Delaware Intergroup coordinates AA community support for New Castle County and surrounding areas. Use its current meeting directory or contact information to find a meeting and confirm details.", link: "https://ndiaa.org/", source: "Northern Delaware Intergroup", locationLine: "New Castle County and surrounding area · meeting information" }),
  statewide({ id: "de-peer-smart", name: "SMART Recovery — find a meeting", description: "Find peer-led SMART Recovery meetings, including online options, for practical recovery skills. Confirm meeting format, time, and any registration requirement on the current meeting listing.", link: "https://smartrecovery.org/meeting", source: "SMART Recovery meeting finder", locationLine: "Delaware and online · peer meeting locator" }),
];

export const DELAWARE_URGENT = [
  statewide({ id: "de-urgent-988", name: "988 Suicide & Crisis Lifeline", phone: "988", description: "Call or text 988 for immediate emotional distress or suicide crisis support in the United States. If someone is in immediate physical danger, call 911.", link: "https://988lifeline.org/", source: "988 Suicide & Crisis Lifeline", locationLine: "United States · call or text 988" }),
  statewide({ id: "de-urgent-hope", name: "Delaware Hope Line", phone: "1-833-946-7333", description: "Delaware's 24/7 Hope Line offers support for people experiencing emotional distress. For immediate danger or urgent medical needs, call 911.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/", source: "Delaware DHSS community resources", locationLine: "Delaware statewide · 24/7 emotional support" }),
  statewide({ id: "de-urgent-mobile-north", name: "Adult Behavioral Health Mobile Crisis — Northern Delaware", phone: "1-800-652-2929", description: "Delaware DHSS lists this 24/7 crisis line for New Castle and northern Kent Counties. The service can connect callers with crisis intervention and mobile response. Call 911 for immediate danger or urgent medical needs.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "New Castle and northern Kent Counties · 24/7 crisis contact" }),
  statewide({ id: "de-urgent-mobile-south", name: "Adult Behavioral Health Mobile Crisis — Central and Southern Delaware", phone: "1-800-345-6785", description: "Delaware DHSS lists this 24/7 crisis line for central and southern Kent and Sussex Counties. The service can connect callers with crisis intervention and mobile response. Call 911 for immediate danger or urgent medical needs.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "Central/southern Kent and Sussex Counties · 24/7 crisis contact" }),
  statewide({ id: "de-urgent-211", name: "Delaware 211 — basic-needs referrals", phone: "211", description: "Call 211 or text your ZIP code to 898-211 for local referrals such as food, housing, and community support. Availability varies by provider; ask about current hours and access requirements.", link: "https://delaware211.org/", source: "Delaware 211", locationLine: "Delaware statewide · local service referrals" }),
  regional({ id: "de-urgent-dv-ncc", name: "CHILD, Inc. — New Castle County domestic violence hotline", city: "Wilmington", phone: "302-762-6110", description: "Confidential 24-hour support, safety planning, and referrals for people experiencing domestic violence in New Castle County. Call 911 for immediate danger. If using a device that may be monitored, consider a safer device when possible.", link: "https://dvcc.delaware.gov/24-hour-hotline-numbers/", source: "Delaware Domestic Violence Coordinating Council", locationLine: "New Castle County · confidential 24/7 hotline" }),
  regional({ id: "de-urgent-dv-nkent", name: "Domestic violence hotline — Northern Kent County", city: "Dover", phone: "302-678-3886", description: "Confidential 24-hour domestic violence hotline for Northern Kent County, with safety planning and referral support. Call 911 for immediate danger.", link: "https://dvcc.delaware.gov/24-hour-hotline-numbers/", source: "Delaware Domestic Violence Coordinating Council", locationLine: "Northern Kent County · confidential 24/7 hotline" }),
  regional({ id: "de-urgent-dv-south", name: "People’s Place SAFE Program — Kent and Sussex hotline", city: "Georgetown", phone: "302-422-8058", description: "Confidential 24-hour domestic violence hotline for Kent and Sussex Counties, with safety planning and referrals. Call 911 for immediate danger.", link: "https://dvcc.delaware.gov/24-hour-hotline-numbers/", source: "Delaware Domestic Violence Coordinating Council", locationLine: "Kent and Sussex Counties · confidential 24/7 hotline" }),
  statewide({ id: "de-urgent-child", name: "Delaware Child Abuse Report Line", phone: "1-800-292-9582", description: "Call to report suspected child abuse or neglect in Delaware. If a child is in immediate danger, call 911.", link: "https://attorneygeneral.delaware.gov/criminal/victims_phone/", source: "Delaware Department of Justice victim resources", locationLine: "Delaware statewide · child abuse reporting" }),
  statewide({ id: "de-urgent-youth", name: "24/7 Youth Crisis Support", phone: "1-800-969-4357", description: "Delaware's youth crisis line connects children and young people experiencing a behavioral health or substance-use crisis to 24/7 support. If there is immediate danger or urgent medical need, call 911.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "Delaware statewide · 24/7 youth crisis support" }),
  local({ id: "de-urgent-new-castle-crisis-center", name: "Mobile Crisis Intervention Services — New Castle walk-in and mobile response", city: "New Castle", address: "Fernhook Building, 14 Central Avenue, New Castle, DE 19720", phone: "302-577-2484", alternatePhone: "1-800-652-2929", description: "Delaware DHSS lists this 24/7 crisis service for New Castle County and greater Smyrna in northern Kent County, with hotline support, mobile outreach, and walk-in care for psychiatric or substance-use crises. Call first when safe to confirm the right access point; call 911 for immediate danger.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "New Castle, Delaware · 24/7 crisis support and walk-in access" }),
  local({ id: "de-urgent-newark-response-center", name: "Recovery Response Center — Newark", city: "Newark", address: "659 East Chestnut Hill Road, Newark, DE 19713", phone: "302-318-6070", description: "Delaware DHSS lists this 24/7, year-round facility-based crisis service for adults experiencing mental health or substance-use crises. Call to confirm the best way to access care; call 911 for immediate danger or urgent medical needs.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "Newark, Delaware · 24/7 adult crisis response" }),
  local({ id: "de-urgent-ellendale-response-center", name: "Recovery Response Center — Ellendale", city: "Ellendale", address: "700 Main Street, Ellendale, DE 19941", phone: "302-424-5660", description: "Delaware DHSS lists this 24/7 recovery support and crisis stabilization service as an alternative pathway for people in crisis. Contact the center to confirm access and current services; call 911 for immediate danger or urgent medical needs.", link: "https://dhss.delaware.gov/dsamh/division-of-substance-abuse-and-mental-health/crisis-intervention/crisis-response/", source: "Delaware DHSS — Crisis Hotlines and Mobile Crisis Intervention", locationLine: "Ellendale, Delaware · 24/7 crisis stabilization and recovery support" }),
];
