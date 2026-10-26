// Louisiana contact batch reviewed against Louisiana Department of Health,
// Feeding Louisiana, Louisiana Housing Corporation and state support sources
// on 2026-10-25. Directory review is not phone confirmation or capacity review.
const reviewed = (record) => ({ ...record, state: "LA", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const ldhProviderUrl = "https://ldh.la.gov/health-standards-section/program-provider-directory";
const ldhProviderSource = "Louisiana Department of Health, licensed Behavioral Health Services Provider directory";
const providers = [
  ["center-hope-change-shreveport", "A Center for Hope and Change", "Shreveport", "543 Stoner Avenue, Shreveport, LA 71101", "318-673-9901"],
  ["hand-needed-baton-rouge", "A Hand When Needed", "Baton Rouge", "146 McGehee Drive, Baton Rouge, LA 70815", "225-275-7273"],
  ["journey-therapy-ruston", "A Journey To Therapy", "Ruston", "206 East Reynolds Drive, Suite J3, Ruston, LA 71270", "318-224-9098"],
  ["touch-mercy-shreveport", "A Touch of Mercy", "Shreveport", "4718 Hearne Avenue, Shreveport, LA 71108", "318-828-1521"],
  ["aahsd-clinic-new-iberia", "Acadiana Area Human Services District — New Iberia Behavioral Health Clinic", "New Iberia", "611 W Admiral Doyle Drive, New Iberia, LA 70560", "337-373-0002"],
  ["abundant-health-slidell", "Abundant Health — Slidell", "Slidell", "2053 Gause Boulevard East, Suite 150, Slidell, LA 70461", "985-649-1001"],
  ["acadian-holistic-lake-charles", "Acadian Holistic Services", "Lake Charles", "500 Broad Street, Suite 213, Lake Charles, LA 70601", "337-477-7091"],
  ["acadiana-cares-lafayette", "Acadiana C.A.R.E.S.", "Lafayette", "809 Martin Luther King Jr. Drive, Lafayette, LA 70501", "337-233-2437"],
  ["acadiana-recovery-lafayette", "Acadiana Recovery Center", "Lafayette", "401 E Vermilion Street, Lafayette, LA 70501", "337-425-6120"],
  ["active-recovery-shreveport", "Active Recovery", "Shreveport", "3821 Southern Avenue, Shreveport, LA 71106", "318-946-8157"],
  ["addiction-counseling-metairie", "Addiction Counseling & Educational Resources", "Metairie", "2321 N Hullen Street, Suite B, Metairie, LA 70001", "504-941-7580"],
  ["addiction-recovery-clinic-shreveport", "Addiction Recovery Clinic", "Shreveport", "2000 Fairfield Avenue, Shreveport, LA 71104", "318-222-8511"],
  ["advanced-therapeutic-gretna", "Advanced Therapeutic Services", "Gretna", "1799 Stumpf Boulevard, Building 3, Suite 4B, Gretna, LA 70056", "504-407-0755"],
  ["affinity-behavioral-shreveport", "Affinity Behavioral Health Service", "Shreveport", "1845 Line Avenue, Suite A, Shreveport, LA 71101", "318-861-5927"],
  ["akron-recovery-amite", "Akron Recovery Center", "Amite", "709 E North Place, Amite, LA 70422", "985-289-5264"],
  ["alchemy-addiction-slidell", "Alchemy Addiction Recovery (ACER)", "Slidell", "115 Christian Lane, Slidell, LA 70458", "985-690-6622"],
  ["algiers-behavioral-new-orleans", "Algiers Behavioral Health Center", "New Orleans", "3100 General De Gaulle Drive, Suites A and B, New Orleans, LA 70114", "504-535-2986"],
  ["all-pro-houma", "All Pro Behavioral Health Services", "Houma", "1101 East Street, Houma, LA 70360", "985-851-6510"],
  ["alliance-northeast-monroe", "Alliance Northeast Healthcare", "Monroe", "2116 Justice Street, Monroe, LA 71201", "318-807-2025"],
  ["allstar-community-baton-rouge", "Allstar Community Care", "Baton Rouge", "3060 Valley Creek Drive, Suites A and B, Baton Rouge, LA 70808", "225-923-3133"],
  ["alternative-outpatient-lafayette", "Alternative Outpatient Services", "Lafayette", "341 Doucet Road, Suite A, Lafayette, LA 70503", "337-234-0830"],
  ["americas-best-new-orleans", "America's Best Counseling", "New Orleans", "10001 Lake Forest Boulevard, Suite 600, New Orleans, LA 70127", "504-518-6290"],
  ["apple-gate-bossier", "Apple Gate Recovery — Bossier City", "Bossier City", "1605 Benton Road, Suite D, Bossier City, LA 71111", "318-742-0500"],
  ["applegate-monroe", "AppleGate Recovery — Monroe", "Monroe", "3001 Armand Street, Suites A and B, Monroe, LA 71201", "318-600-3687"],
  ["ark-la-tex-shreveport", "Ark La Tex Counseling and Rehab", "Shreveport", "7505 Pines Road, Suite 1104, Shreveport, LA 71129", "318-670-8313"],
  ["ascension-behavioral-gonzales", "Ascension Behavioral Health", "Gonzales", "1112 S East Ascension Complex Boulevard, Gonzales, LA 70737", "225-621-5770"],
  ["bastrop-behavioral", "Bastrop Behavioral Health Clinic", "Bastrop", "451 E Madison Avenue, Bastrop, LA 71220", "318-283-0868"],
  ["baton-rouge-treatment-center", "Baton Rouge Treatment Center", "Baton Rouge", "11445 Reiger Road, Baton Rouge, LA 70809", "225-932-9867"],
  ["bayou-health-new-orleans", "Bayou Health Services", "New Orleans", "1615 Poydras Street, Suite 900, New Orleans, LA 70112", "504-758-7351"],
  ["behavioral-management-monroe", "Behavioral Management & Addictive Disorders", "Monroe", "2910 Evangeline Street, Monroe, LA 71201", "318-388-5553"],
  ["behavioral-solutions-monroe", "Behavioral Solutions", "Monroe", "1761 N 19th Street, Monroe, LA 71201", "318-509-8073"],
  ["bhg-houma", "BHG Houma Treatment Center", "Houma", "435 Corporate Drive, Building 1, Suite 102, Houma, LA 70360", "985-243-0062"],
  ["bhg-lake-charles", "BHG Lake Charles Treatment Center", "Lake Charles", "2829 4th Avenue, Suite 200, Lake Charles, LA 70605", "337-433-8281"],
  ["breakthrough-lafayette", "Breakthrough Therapeutic Services — Lafayette", "Lafayette", "300 Rue Beauregard, Building F, Lafayette, LA 70508", "337-501-1128"],
  ["bridge-house-new-orleans", "Bridge House Corporation", "New Orleans", "4150 Earhart Boulevard, New Orleans, LA 70125", "504-821-7122"],
  ["bridges-to-hope-new-orleans", "Bridges to Hope", "New Orleans", "200 S Broad Street, Suite 205A, New Orleans, LA 70119", "504-821-7616"],
  ["bridges-recovery-shreveport", "Bridges to Recovery", "Shreveport", "7330 Fern Avenue, Suite 1102, Shreveport, LA 71105", "318-524-9954"],
  ["cada-bossier", "CADA Bossier Treatment Center", "Bossier City", "1525 Fullilove Drive, Bossier City, LA 71112", "318-747-1211"],
  ["capital-area-recovery-baton-rouge", "Capital Area Recovery Program", "Baton Rouge", "2455 Wooddale Boulevard, Baton Rouge, LA 70805", "225-922-3169"],
  ["caring-choices-alexandria", "Caring Choices Clinic", "Alexandria", "5411 Coliseum Boulevard, Alexandria, LA 71303", "318-484-6850"],
  ["cedar-health-metairie", "CEDAR Health", "Metairie", "3941 Houma Boulevard, Suite 2B, Metairie, LA 70006", "504-226-6280"],
  ["center-hope-family-new-orleans", "Center for Hope Children and Family Services", "New Orleans", "5630 Crowder Boulevard, Suite 208, New Orleans, LA 70127", "504-241-6006"],
  ["core-shreveport", "Center of Recovery (CORE)", "Shreveport", "635 Stoner Avenue, Shreveport, LA 71101", "318-424-4357"],
  ["central-city-new-orleans", "Central City Behavioral Health Center", "New Orleans", "2221 Philip Street, New Orleans, LA 70112", "504-568-3130"],
  ["chartres-ponchartrain-new-orleans", "Chartres-Ponchartrain Behavioral Health Center", "New Orleans", "719 Elysian Fields Avenue, New Orleans, LA 70117", "504-568-2178"],
  ["choices-behavioral-new-orleans", "Choices Behavioral Health and Wellness", "New Orleans", "2331 Canal Street, New Orleans, LA 70119", "504-304-3737"],
  ["chosen-behavioral-baton-rouge", "Chosen Behavioral Health", "Baton Rouge", "2285 North Street, Baton Rouge, LA 70802", "225-218-5647"],
  ["claiborne-addiction-homer", "Claiborne Addiction Recovery Center", "Homer", "620 E College, First Floor, Homer, LA 71040", "318-382-3911"],
  ["claire-house-morgan-city", "Claire House for Women and Children", "Morgan City", "1101 Southeast Boulevard, Suite A, Morgan City, LA 70380", "504-821-9211"],
  ["clear-minds-baton-rouge", "Clear Minds Behavioral Health", "Baton Rouge", "11861 Coursey Boulevard, Baton Rouge, LA 70816", "225-612-8656"],
  ["cognitive-development-lafayette", "Cognitive Development Center — Lafayette", "Lafayette", "850 Kaliste Saloom Road, Suite 117, Lafayette, LA 70508", "337-243-7109"],
  ["cognitive-development-tallulah", "Cognitive Development Center — Tallulah", "Tallulah", "1705 Felicia Avenue, Tallulah, LA 71282", "318-574-1232"],
  ["cognitive-development-monroe", "Cognitive Development Center — Monroe", "Monroe", "4951 Central Avenue, Monroe, LA 71203", "318-340-1535"],
  ["columbia-behavioral", "Columbia Behavioral Health Clinic", "Columbia", "5159 Highway 4 East, Columbia, LA 71418", "318-649-2333"],
  ["community-counseling-baton-rouge", "Community Counseling Agency", "Baton Rouge", "1520 Thomas H Delpit Drive, Suite 125, Baton Rouge, LA 70802", "225-636-2395"],
  ["community-counseling-natchitoches", "Community Counseling Center at Cane River", "Natchitoches", "830 Fourth Street, Natchitoches, LA 71457", "318-214-4002"],
  ["community-outreach-baton-rouge", "Community Outreach Services", "Baton Rouge", "4255 East Brookstown, Baton Rouge, LA 70805", "225-250-5677"],
  ["community-rehab-monroe", "Community Rehabilitation Center", "Monroe", "2414 Ferrand Street, Suite 1, Monroe, LA 71201", "318-325-0072"],
  ["community-therapeutic-new-orleans", "Community Therapeutic Services", "New Orleans", "1608 S Salcedo Street, New Orleans, LA 70125", "504-821-0053"],
  ["compass-behavioral-marrero", "Compass Behavioral Health Services", "Marrero", "7606 Westbank Expressway, Suite B, Marrero, LA 70072", "504-236-6948"],
  ["cornerstone-behavioral-monroe", "Cornerstone Behavioral Health", "Monroe", "3100 Kilpatrick Boulevard, Suite 102, Monroe, LA 71201", "318-325-8048"],
  ["council-alcohol-drug-new-orleans", "Council on Alcohol & Drug Abuse of Greater New Orleans", "New Orleans", "2601 Tulane Avenue, Suite 945, New Orleans, LA 70119", "504-821-2232"],
  ["creative-counseling-shreveport", "Creative Counseling", "Shreveport", "2133 E Bert Kouns Industrial Loop, Shreveport, LA 71105", "318-221-2828"],
  ["crescent-care-new-orleans", "CrescentCare", "New Orleans", "1637 Elysian Fields Avenue, 2nd Floor, New Orleans, LA 70117", "504-821-2601"],
  ["gateway-foundation-harvey", "Gateway Foundation", "Harvey", "4103 LAC Couture Drive, Harvey, LA 70058", "504-368-9935"],
  ["grace-house-new-orleans", "Grace House on Stratford", "New Orleans", "6311 Stratford Place, New Orleans, LA 70131", "504-821-7122"],
  ["gulf-coast-social-baton-rouge", "Gulf Coast Social Services — Baton Rouge", "Baton Rouge", "5850 Florida Boulevard, Suite 200, Baton Rouge, LA 70806", "225-201-0696"],
  ["gulf-coast-social-hammond", "Gulf Coast Social Services — Hammond", "Hammond", "906 CM Fagan Drive, Suite 4B, Hammond, LA 70403", "985-542-1191"],
  ["heart-hill-mansfield", "Heart Hill Recovery", "Mansfield", "419 Washington Avenue, Mansfield, LA 71052", "318-603-2972"],
  ["hidden-gems-franklin", "Hidden Gems Social Services", "Franklin", "75 Main Street, Franklin, LA 70538", "337-907-6389"],
  ["iberville-substance-abuse-plaquemine", "Iberville Parish Substance Abuse Clinic", "Plaquemine", "24705 Plaza Drive, Suite B, Plaquemine, LA 70764", "225-687-5889"],
  ["new-beginnings-harvey", "New Beginnings Behavioral Health Services", "Harvey", "2439 Manhattan Boulevard, Suite 304, Harvey, LA 70058", "504-333-6657"],
  ["new-beginnings-hammond", "New Beginnings Behavioral Healthcare", "Hammond", "1000 N Morrison Boulevard, Suite 2, Hammond, LA 70401", "985-542-9949"],
  ["new-day-west-monroe", "New Day Recovery — West Monroe", "West Monroe", "1416 Natchitoches Street, West Monroe, LA 71292", "318-855-8773"],
  ["new-day-shreveport", "New Day Recovery — Shreveport", "Shreveport", "6240 Greenwood Road, Shreveport, LA 71119", "318-562-6320"],
  ["new-hope-monroe", "New Hope Addiction Recovery", "Monroe", "215 North Park Drive, Monroe, LA 71203", "318-977-9100"],
  ["new-horizon-ruston", "New Horizon Counseling Agency", "Ruston", "775 S Bonner Street, Ruston, LA 71270", "318-224-7017"],
  ["new-orleans-east-bh", "New Orleans East Behavioral Health Center", "New Orleans", "5630 Read Boulevard, 2nd Floor, New Orleans, LA 70127", "504-243-7600"],
  ["new-outlook-new-orleans", "New Outlook Behavioral Health Center — New Orleans", "New Orleans", "200 S Broad Street, Suite B, New Orleans, LA 70119", "504-298-0045"],
  ["new-start-houma", "New Start Recovery", "Houma", "600 W Tunnel Boulevard, Houma, LA 70360", "985-223-4009"],
  ["north-baton-rouge-bh", "North Baton Rouge Behavioral Health", "Baton Rouge", "7855 Howell Boulevard, Suites 200 and 220, Baton Rouge, LA 70816", "225-359-9315"],
  ["northeast-counseling-bastrop", "Northeast Counseling", "Bastrop", "343 N Washington Street, Bastrop, LA 71220", "318-598-5040"],
  ["northeast-substance-winnsboro", "Northeast Louisiana Substance Abuse", "Winnsboro", "6564 Main Street, Winnsboro, LA 71295", "318-435-7558"],
  ["nova-vital-shreveport", "Nova Vital Intensive Outpatient Program", "Shreveport", "3007 Knight Street, Suite 300B, Shreveport, LA 71105", "318-268-6101"],
  ["obyke-new-orleans", "Obyke Health Care Services", "New Orleans", "3028 Gentilly Boulevard, New Orleans, LA 70122", "504-948-6080"],
  ["olol-ascension-gonzales", "OLOLPG Ascension Counseling Center", "Gonzales", "1112 S East Ascension Complex Boulevard, Gonzales, LA 70737", "225-450-1016"],
  ["opelousas-behavioral", "Opelousas Behavioral Health", "Opelousas", "220 S Market Street, Opelousas, LA 70570", "337-948-0226"],
  ["options-independence-houma", "Options for Independence", "Houma", "8326 Main Street, Suite 3, Houma, LA 70363", "985-868-2620"],
  ["ouachita-rehab-monroe", "Ouachita Rehabilitation", "Monroe", "1300 Finks Hideaway Road, Monroe, LA 71203", "318-737-7597"],
  ["palmetto-metairie", "Palmetto Addiction Recovery Center — Metairie", "Metairie", "2955 Ridgelake Drive, Suite 105, Metairie, LA 70002", "504-913-5183"],
  ["palmetto-shreveport", "Palmetto Addiction Recovery Center — Shreveport", "Shreveport", "820 Jordan Street, Suite 204, Shreveport, LA 71101", "318-268-0757"],
  ["palmetto-rayville", "Palmetto Addiction Recovery Center — Rayville", "Rayville", "86 Palmetto Road, Rayville, LA 71269", "318-728-2970"],
  ["pathways-recovery-bogalusa", "Pathways to Recovery", "Bogalusa", "400 Memphis Street, Bogalusa, LA 70427", "985-341-9437"],
  ["pecan-haven-monroe", "Pecan Haven Addiction Recovery Center", "Monroe", "2321 Highway 80 East, Monroe, LA 71203", "318-600-3333"],
  ["pelican-bayou-shreveport", "Pelican Bayou Counseling Agency — Shreveport", "Shreveport", "9403 Mansfield Road, Shreveport, LA 71118", "318-861-8938"],
  ["pelican-bayou-springhill", "Pelican Bayou Counseling Agency — Springhill", "Springhill", "115 1st Street, Springhill, LA 71055", "318-382-9700"],
  ["preventive-measures-lake-charles", "Preventive Measures Program — Lake Charles", "Lake Charles", "125 Jamestown, Unit J, Lake Charles, LA 70605", "337-508-2313"],
  ["preventive-measures-tallulah", "Preventive Measures Programs — Tallulah", "Tallulah", "805 N Beech Street, Tallulah, LA 71282", "318-574-0098"],
  ["quans-houma", "Quans Behavioral Health Services", "Houma", "1340 W Tunnel Boulevard, Houma, LA 70360", "985-746-5900"],
  ["rise-ruston", "R.I.S.E. of Ruston", "Ruston", "512 E Texas Avenue, Ruston, LA 71270", "318-224-9088"],
  ["rayville-recovery", "Rayville Recovery", "Rayville", "307 Hayes Street, Rayville, LA 71269", "318-728-5488"],
  ["serenity-house-monroe", "Serenity House — Monroe", "Monroe", "4600 Reddix Lane, Monroe, LA 71202", "318-582-4480"],
  ["serenity-treatment-baton-rouge", "Serenity Treatment Center of Louisiana", "Baton Rouge", "2325 Weymouth Drive, Baton Rouge, LA 70809", "225-389-3325"],
  ["shoulders-strength-baton-rouge", "Shoulders of Strength — Baton Rouge", "Baton Rouge", "11616 Southfork Avenue, Suite 401, Baton Rouge, LA 70816", "225-291-9646"],
  ["shoulders-strength-lafayette", "Shoulders of Strength — Lafayette", "Lafayette", "70 St Landry Street, Lafayette, LA 70506", "225-291-9646"],
  ["shoulders-strength-monroe", "Shoulders of Strength — Monroe", "Monroe", "2807 Evangeline Street, Monroe, LA 71201", "318-654-7667"],
  ["shoulders-strength-shreveport", "Shoulders of Strength — Shreveport", "Shreveport", "2800 Youree Drive, Suite 350-A, Shreveport, LA 71104", "318-654-7667"],
];

export const LOUISIANA_TREATMENT = providers.map(([key, name, city, address, phone]) => local({
  id: `la-bh-${key}`, name, city, address, phone,
  description: `Louisiana Department of Health lists this site as a licensed behavioral-health services provider. The directory covers different kinds of behavioral-health care; call to ask whether the location currently offers the support you need, including substance-use treatment, and confirm eligibility, costs, intake steps, and appointments before traveling.`,
  link: ldhProviderUrl, source: ldhProviderSource,
  locationLine: `${city}, Louisiana · state-listed provider; confirm services and intake`,
}));

const foodBankSource = "Feeding Louisiana member food-bank directory";
export const LOUISIANA_FOOD = [
  ["northwest", "Food Bank of Northwest Louisiana", "Shreveport", "285 Mt Zion Road, Shreveport, LA 71106", "318-675-2400", "Caddo, Bossier, Bienville, Claiborne, DeSoto, Red River, and Webster parishes", "https://www.feedinglouisiana.org/find-food/northwest-louisiana-food-bank"],
  ["northeast", "Food Bank of Northeast Louisiana", "West Monroe", "204 Exchange Street, West Monroe, LA 71292", "318-322-3567", "Caldwell, East Carroll, Franklin, Jackson, Lincoln, Madison, Morehouse, Ouachita, Richland, Tensas, Union, and West Carroll parishes", "https://www.feedinglouisiana.org/find-food/northeast-louisiana-food-bank"],
  ["central", "Food Bank of Central Louisiana", "Alexandria", "3223 Baldwin Avenue, Alexandria, LA 71301", "318-445-2773", "Allen, Avoyelles, Catahoula, Concordia, Grant, LaSalle, Natchitoches, Rapides, Sabine, Vernon, and Winn parishes", "https://www.feedinglouisiana.org/find-food/central-louisiana-food-bank"],
  ["greater-baton-rouge", "Greater Baton Rouge Food Bank", "Baton Rouge", "10600 S Choctaw Drive, Baton Rouge, LA 70815", "225-359-9940", "Ascension, Assumption, East Baton Rouge, East Feliciana, Iberville, Livingston, Pointe Coupee, St. Helena, St. James, West Baton Rouge, and West Feliciana parishes", "https://www.feedinglouisiana.org/find-food/greater-baton-rouge-food-bank"],
  ["second-harvest", "Second Harvest Food Bank of Greater New Orleans and Acadiana", "New Orleans", "700 Edwards Avenue, New Orleans, LA 70123", "504-734-1322", "Food-bank network serving parishes across southeast Louisiana and Acadiana; use its site locator to find the partner nearest you", "https://www.feedinglouisiana.org/find-food/second-harvest-food-bank"],
].map(([key, name, city, address, phone, serviceArea, link]) => statewide({
  id: `la-food-${key}`, name, city, address, phone, link, source: foodBankSource,
  description: `This regional food bank connects households with partner pantries and food distributions. ${serviceArea}. Use its current food finder or call to identify a nearby partner, learn what to bring, and confirm the next distribution; this office is a network hub, not a promise of walk-in groceries.`,
  locationLine: `${city}, Louisiana · ${serviceArea}`,
}));

export const LOUISIANA_PEER = [
  statewide({ id: "la-peer-support-access", name: "Louisiana peer support — connect through a behavioral-health provider", city: "Baton Rouge", description: "Louisiana recognizes peer support specialists with lived experience in mental health, substance use, or co-occurring recovery. Peer services may be offered through treatment providers, recovery centers, nonprofits, and crisis programs. Contact a local LDH-listed provider and ask specifically for a peer recovery specialist, group, or community program; peer support is not clinical care.", link: "https://ldh.la.gov/office-of-behavioral-health/peer-support-specialist", source: "Louisiana Department of Health, Office of Behavioral Health peer support specialist information", locationLine: "Louisiana statewide · ask local providers about current peer groups" }),
  statewide({ id: "la-211-peer-community", name: "Louisiana 211 — local recovery groups and community support", city: "Baton Rouge", phone: "211", description: "Call 211 or search the statewide network for local peer groups, recovery programs, food, housing, and other community support. Tell the specialist your parish and preferred contact method; ask each organization to confirm schedule and eligibility.", link: "https://www.louisiana211.org/", source: "Louisiana 211 Statewide Network", locationLine: "All 64 parishes · referral and resource search" }),
];

export const LOUISIANA_HOUSING = [
  statewide({ id: "la-housing-coordinated-entry", name: "Louisiana Coordinated Entry — find your parish access point", city: "Baton Rouge", phone: "211", description: "Louisiana's parish-based Coordinated Entry directory can point people toward housing assessment and referrals. Its published provider details say they were last updated August 7, 2019, so call 211 to confirm today's access point, intake, and hours before traveling. Assessment does not guarantee a shelter bed or housing placement.", link: "https://laboscoc.lhc.la.gov/housing-services/open-health-care", source: "Louisiana Balance of State Continuum of Care parish access directory", locationLine: "Louisiana parish-based access · call 211 to confirm current details" }),
  local({ id: "la-housing-acadiana-cares", name: "Acadiana C.A.R.E.S. — Lafayette Coordinated Entry access", city: "Lafayette", address: "809 Martin Luther King Jr Drive, Lafayette, LA 70501", phone: "337-233-2437", description: "Acadiana C.A.R.E.S. identifies itself as a Coordinated Entry access point for the Acadiana region. Contact its case-management team to ask about assessment and referrals; the organization states it cannot respond to emergencies. Call 911 for immediate danger or urgent medical need.", link: "https://www.acadianacares.org/services/housing/mainstream-services/", source: "Acadiana C.A.R.E.S., Coordinated Entry access site", locationLine: "Lafayette · regional access; call before visiting" }),
  local({ id: "la-housing-pride-plaza", name: "Pride Plaza Clinic — Lafayette housing and mainstream-services access", city: "Lafayette", address: "850 N Pierce Street, Lafayette, LA 70501", phone: "337-704-0787", description: "Acadiana C.A.R.E.S. lists Pride Plaza as a clinic and support access location. Call to ask whether this site can connect you with Coordinated Entry or other current services and confirm walk-in hours before traveling.", link: "https://www.acadianacares.org/services/housing/mainstream-services/", source: "Acadiana C.A.R.E.S., Coordinated Entry access information", locationLine: "Lafayette · call to confirm the service available at this site" }),
];

export const LOUISIANA_BENEFITS = [
  statewide({ id: "la-snap-lahd", name: "Louisiana SNAP — LAHelpU applications and case questions", city: "Baton Rouge", phone: "888-524-3578", description: "Louisiana Department of Health administers SNAP. Call LAHelpU for application, benefit, or case questions, or use the official online portal. Ask about current documents and application steps; eligibility is determined through the state process.", link: "https://ldh.la.gov/snap", source: "Louisiana Department of Health SNAP guidance (July 2026)", locationLine: "Louisiana statewide · program eligibility applies" }),
  statewide({ id: "la-snap-online", name: "Louisiana benefits portal — apply for SNAP and related assistance", city: "Baton Rouge", phone: "888-524-3578", description: "Start a Louisiana SNAP application online and use LAHelpU for application or case questions. The state says SNAP is administered by LDH; confirm current program requirements through the official portal.", link: "https://dcfs.la.gov/apply", source: "Louisiana Department of Health and Louisiana Department of Children and Family Services", locationLine: "Louisiana statewide · online application and phone assistance" }),
  statewide({ id: "la-food-benefits-feeding-la", name: "Feeding Louisiana — SNAP application and food-bank navigator", city: "Baton Rouge", phone: "225-310-0091", description: "Feeding Louisiana connects residents with a regional food bank and provides SNAP application coordination. Contact the organization for help finding the correct regional food bank or application assistance; benefit eligibility is determined by the state.", link: "https://www.feedinglouisiana.org/find-food", source: "Feeding Louisiana", locationLine: "Louisiana statewide · regional food-bank and SNAP navigation" }),
];

export const LOUISIANA_URGENT = [
  statewide({ id: "la-988", name: "Louisiana 988 — immediate emotional and behavioral-health support", city: "Baton Rouge", phone: "988", description: "Call or text 988, or use Louisiana's 988 chat, for free confidential emotional support, including distress connected to mental health or substance use. Louisiana's service is available 24/7. For immediate physical danger or urgent medical need, call 911.", link: "https://ldh.la.gov/office-of-behavioral-health/about-louisiana-988", source: "Louisiana Department of Health, Louisiana 988", locationLine: "Louisiana statewide · call, text, or chat 24/7" }),
  statewide({ id: "la-211-urgent", name: "Louisiana 211 — urgent local shelter and basic-needs referrals", city: "Baton Rouge", phone: "211", description: "Louisiana 211 connects callers across all 64 parishes with local shelter, food, safety, and community referrals. Ask for immediate options in your parish and confirm current availability directly with the provider.", link: "https://www.louisiana211.org/", source: "Louisiana 211 Statewide Network", locationLine: "All 64 parishes · call for local referrals" }),
  statewide({ id: "la-911", name: "Emergency services — immediate danger", city: "Baton Rouge", phone: "911", description: "Call 911 for immediate danger, serious injury, or urgent medical need. Give the dispatcher the location and immediate safety concern.", link: "https://www.911.gov/calling-911/", source: "U.S. National 911 Program", locationLine: "Louisiana statewide · emergency response" }),
];

export const LOUISIANA_DIRECTORY_COUNT = LOUISIANA_TREATMENT.length + LOUISIANA_FOOD.length + LOUISIANA_PEER.length + LOUISIANA_HOUSING.length + LOUISIANA_BENEFITS.length + LOUISIANA_URGENT.length;
