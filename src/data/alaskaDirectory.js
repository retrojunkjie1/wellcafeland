// Alaska resources reviewed against state, provider, and Food Bank of Alaska
// sources on 2026-10-25. Source review confirms published information only;
// it does not confirm phone response, current openings, eligibility, or full
// statewide coverage. Food-bank partners are listed as referral contacts, not
// guaranteed walk-in pantries.
const reviewed = (record) => ({ ...record, state: "AK", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const foodBankRoster = "https://foodbankofalaska.org/agency-partners";
const foodHelp = "https://foodbankofalaska.org/help";
const housingPartners = "https://www.ahfc.us/tenants/housing-stabilization/housing-stabilization-program-partners";

// Food Bank of Alaska's published agency roster names these local partners
// and communities. The linked agency site is the best next step when supplied;
// otherwise use Food Bank of Alaska's live food finder / Alaska 211 to confirm
// whether the partner currently serves the public and where intake occurs.
const foodPartners = [
  ["aleut-saint-paul", "Aleut Community of Saint Paul", "Anchorage", "https://aleut.com/"],
  ["anchorage-east-rotary", "Anchorage East Rotary Club Mobile Food Pantry", "Anchorage", "https://portal.clubrunner.ca/4985"],
  ["anchorage-gospel-rescue", "Anchorage Gospel Rescue Mission", "Anchorage", "https://www.anchoragerescue.org/"],
  ["anchorage-native-assembly", "Anchorage Native Assembly", "Anchorage", "https://www.nativeassembly.com/"],
  ["northside-sda", "Anchorage Northside SDA Church", "Anchorage", "https://www.anchoragenorthside.net/"],
  ["senior-activity-center", "Anchorage Senior Activity Center", "Anchorage", "https://www.anchorageseniorcenter.org/"],
  ["armed-services-ymca", "Armed Services YMCA Alaska", "Anchorage", "https://www.asymca.org/anchorage-ak"],
  ["beans-cafe", "Bean's Cafe", "Anchorage", "https://beanscafe.org/"],
  ["bethel-community-services", "Bethel Community Services Foundation", "Bethel", "https://www.bcsfoundation.org/"],
  ["big-lake-community-pantry", "Big Lake Community Food Pantry", "Big Lake", "https://www.biglakefaithbible.org/"],
  ["blood-fire-ministry", "Blood & Fire Ministry of Alaska", "Wasilla", "https://bloodnfireak.org/"],
  ["bristol-bay-food-bank", "Bristol Bay Regional Food Bank", "Dillingham", "https://bbna.com/"],
  ["chuathbaluk-council", "Chuathbaluk Traditional Council", "Aniak", "https://www.curarpaluk.com/"],
  ["chugiak-eagle-river-pantry", "Chugiak Eagle River Food Pantry", "Eagle River", "https://www.facebook.com/ChugiakEagleRiverFoodPantry/"],
  ["chugiak-senior-center", "Chugiak-Eagle River Senior Center", "Chugiak", "https://www.chugiakseniors.com/"],
  ["church-of-nations", "Church of the Nations", "Anchorage", "https://www.tcotnalaska.org/"],
  ["cook-inlet-housing", "Cook Inlet Housing Authority", "Anchorage", "https://www.cookinlethousing.org/"],
  ["copper-river-resource", "Copper River Basin Resource Center", "Glennallen", "https://crnative.org/"],
  ["downtown-hope-center", "Downtown Hope Center", "Anchorage", "https://www.downtownhopecenter.org/"],
  ["fish-charity", "Friends in Serving Humanity (F.I.S.H.)", "Anchorage", "https://www.fishcharity.org/"],
  ["first-cme-mobile-pantry", "First CME Church Mobile Food Pantry", "Anchorage", "https://www.firstcmechurch.com/"],
  ["frontline-mission", "Frontline Mission", "Palmer", "https://www.frontlinemission.org/"],
  ["greater-friendship-pantry", "Greater Friendship Baptist Mobile Food Pantry", "Anchorage", "https://greaterfriendshipbaptist.org/"],
  ["girdwood-chapel", "Girdwood Chapel", "Girdwood", "https://girdwoodchapel.com/"],
  ["harvest-christian", "Harvest Christian Fellowship", "Eagle River", "https://www.hcfak.com/"],
  ["jewel-lake-pantry", "Jewel Lake Church of the Nazarene Mobile Food Pantry", "Anchorage", "https://jlcn.org/"],
  ["kenai-peninsula-food-bank", "Kenai Peninsula Food Bank", "Soldotna", "https://kpfoodbank.org/"],
  ["kings-chapel", "King's Chapel", "Wasilla", "https://www.kingsalaska.com/"],
  ["kotzebue-church-god", "Kotzebue Church of God", "Kotzebue", foodBankRoster],
  ["love-in-action", "Love in Action", "Ketchikan", "https://loveinactionministries.com/"],
  ["lutheran-social-services", "Lutheran Social Services of Alaska", "Anchorage", "https://www.lssalaska.org/"],
  ["matsu-food-bank", "Mat-Su Food Bank", "Wasilla", "https://matsufoodbank.org/"],
  ["mlk-shiloh", "MLK Jr. Foundation — Shiloh Mission", "Anchorage", foodBankRoster],
  ["mountain-coast-vineyard", "Mountain Coast Vineyard", "Anchorage", "https://mountaincoast.org/"],
  ["mountain-view-pantry", "Mountain View Mobile Food Pantry", "Anchorage", "https://www.newhopebaptistchurchak.org/"],
  ["muldoon-pantry", "Muldoon Community Assembly Mobile Food Pantry", "Anchorage", foodBankRoster],
  ["port-heiden-council", "Native Council of Port Heiden", "Port Heiden", "https://www.nativevillageofportheiden.com/"],
  ["village-eklutna", "Native Village of Eklutna", "Eklutna", "https://eklutna-nsn.gov/"],
  ["village-eyak", "Native Village of Eyak", "Cordova", "https://www.eyak-nsn.gov/"],
  ["village-gambell", "Native Village of Gambell", "Gambell", "https://www.narf.org/nill/triballaw/ustribes/alaska/gambell/"],
  ["village-marshall", "Native Village of Marshall", "Marshall", "https://www.narf.org/nill/triballaw/ustribes/alaska/marshall/"],
  ["village-white-mountain", "Native Village of White Mountain", "White Mountain", "https://www.narf.org/nill/triballaw/ustribes/alaska/wmtn/"],
  ["village-unalakleet", "Native Village of Unalakleet", "Unalakleet", "https://www.nativevillageofunalakleet.org/"],
  ["new-hope-compassionate", "New Hope Compassionate Ministries", "Anchorage", "https://www.newhopeak.org/"],
  ["nome-community-center", "Nome Community Center", "Nome", "https://www.nomecc.org/"],
  ["nondalton-tribal-council", "Nondalton Tribal Council", "Nondalton", "https://bbna.com/"],
  ["our-lady-lake-pantry", "Our Lady of the Lake Food Pantry", "Big Lake", foodBankRoster],
  ["palmer-church-god", "Palmer Church of God", "Palmer", "https://www.palmerchurchofgod.org/"],
  ["palmer-food-bank", "Palmer Food Bank", "Palmer", "https://www.palmerfoodbank.org/"],
  ["prince-wales-food-bank", "Prince of Wales Island Food Bank", "Naukati", foodBankRoster],
  ["revive-alaska", "Revive Alaska Community Services", "Anchorage", "https://www.revivealaska.org/"],
  ["ruby-tribal-council", "Ruby Tribal Council", "Ruby", "https://www.tananachiefs.org/"],
  ["salvation-army-angoon", "The Salvation Army — Angoon", "Angoon", "https://angoon.salvationarmy.org/"],
  ["salvation-army-cordova", "The Salvation Army — Cordova", "Cordova", "https://cordova.salvationarmy.org/"],
  ["salvation-army-anchorage", "The Salvation Army Family Emergency Services", "Anchorage", "https://mckinnellhouse.salvationarmy.org/"],
  ["salvation-army-haines", "The Salvation Army — Haines", "Haines", "https://haines.salvationarmy.org/"],
  ["salvation-army-kake", "The Salvation Army — Kake", "Kake", "https://kake.salvationarmy.org/"],
  ["salvation-army-klawock", "The Salvation Army — Klawock", "Klawock", "https://klawock.salvationarmy.org/"],
  ["salvation-army-matsu", "The Salvation Army — Mat-Su Palmer", "Palmer", "https://mat-suvalley.salvationarmy.org/"],
  ["salvation-army-petersburg", "The Salvation Army — Petersburg", "Petersburg", "https://petersburg.salvationarmy.org/"],
  ["salvation-army-saxman", "The Salvation Army — Saxman", "Saxman", "https://gatewayalaska.salvationarmy.org/"],
  ["salvation-army-sitka", "The Salvation Army — Sitka", "Sitka", "https://sitka.salvationarmy.org/"],
  ["salvation-army-wrangell", "The Salvation Army — Wrangell", "Wrangell", "https://wrangell.salvationarmy.org/"],
  ["seward-senior-center", "Seward Senior Center", "Seward", "https://www.sewardsenior.org/"],
  ["sonrise-church", "Sonrise Community Church", "Anchorage", "https://www.sonrisecommunity.church/"],
  ["southeast-food-bank", "Southeast Alaska Food Bank", "Juneau", "https://www.sealaskafoodbank.org/"],
  ["st-francis-house", "St. Francis House Food Pantry", "Anchorage", "https://www.cssalaska.org/"],
  ["sutton-bible-pantry", "Sutton Bible Church Food Pantry", "Sutton-Alpine", "https://www.suttonbible.com/"],
  ["summit-worship", "Summit Worship Center", "Wasilla", "https://www.summitwc.com/"],
  ["upper-susitna-pantry", "Upper Susitna Food Pantry", "Talkeetna", "https://uppersusitnafoodpantry.org/"],
  ["valdez-food-bank", "Valdez Food Bank", "Valdez", "https://www.valdezfoodbank.org/"],
  ["voice-of-christ", "Voice of Christ", "Anchorage", foodBankRoster],
  ["wasilla-area-seniors", "Wasilla Area Seniors Inc.", "Wasilla", "https://www.wasillaseniors.com/"],
  ["willow-community-pantry", "Willow Community Food Pantry", "Willow", foodBankRoster],
  ["wish-ketchikan", "Women in Safe Homes (WISH)", "Ketchikan", "https://www.wishak.org/"],
  ["wrangell-sda", "Wrangell Seventh-Day Adventist Church", "Wrangell", "https://www.wrangellsda.org/"],
  ["yakutat-tribe", "Yakutat Tlingit Tribe", "Yakutat", "https://yakutattlingittribe.org/"],
  ["younglives-alaska", "YoungLives Alaska", "Anchorage", "https://anchorage.younglife.org/"],
];

export const ALASKA_FOOD = [
  ...foodPartners.map(([id, name, town, link]) => local({
    id: `ak-food-${id}`, name: `${name} — food assistance referral`, city: town,
    description: `Food Bank of Alaska lists ${name} as a community partner in ${town}. The roster confirms a food-network relationship, but does not state current public hours, eligibility, or whether this site distributes directly. Open the partner's official page or call Alaska 211 (2-1-1 or 800-478-2221) to confirm today's access, location, and requirements before traveling.`,
    link, source: "Food Bank of Alaska agency partner roster", locationLine: `${town}, Alaska · listed food-network partner · confirm public access before visiting`,
  })),
  statewide({ id: "ak-food-bank-finder", name: "Food Bank of Alaska — find food near you", description: "Connects people statewide with food pantries, mobile pantry distributions, and community meal sites. Schedules and availability change; call before traveling. For Anchorage, use the Anchorage-specific locator; outside Anchorage, the Food Bank directs people to regional food banks in Fairbanks, Juneau, and Kenai/Soldotna.", phone: "907-272-3663", link: foodHelp, source: "Food Bank of Alaska Get Help", locationLine: "Statewide directory and referral pathway · schedules vary by community" }),
  local({ id: "ak-anchorage-food-locator", name: "AnchorageFood.org — Anchorage pantry and meal locator", description: "Food Bank of Alaska directs Anchorage residents to this digital locator for local food assistance. Select a current distribution site and check hours or requirements before going; schedules may change due to weather or supply.", link: "https://anchoragefood.org/", source: "Food Bank of Alaska Get Help", city: "Anchorage", locationLine: "Anchorage · use current locator; confirm hours and requirements" }),
  regional({ id: "ak-fairbanks-food-bank", name: "Fairbanks Community Food Bank", description: "Regional food-bank contact recommended by Food Bank of Alaska for people outside Anchorage. Contact the food bank to locate current Fairbanks-area pantry and meal options and confirm intake details.", link: "https://www.fairbanksfoodbank.org/", source: "Food Bank of Alaska Get Help", city: "Fairbanks", locationLine: "Fairbanks and surrounding area · contact for current distributions" }),
  regional({ id: "ak-kenai-food-bank", name: "Kenai Peninsula Food Bank", description: "Regional food-bank contact recommended by Food Bank of Alaska for Kenai and Soldotna. Contact directly for current food assistance, service area, hours, and eligibility details.", link: "https://kpfoodbank.org/", source: "Food Bank of Alaska Get Help", city: "Soldotna", locationLine: "Kenai Peninsula · contact for current distributions" }),
  statewide({ id: "ak-snap-navigation", name: "Food Bank of Alaska — SNAP application help", description: "Food Bank of Alaska offers SNAP application support. Request help online, call the SNAP support line, or text SNAP. This is application navigation; the State of Alaska decides eligibility and benefit amounts.", phone: "907-222-3119", alternatePhone: "Text SNAP to 907-891-8913", link: "https://foodbankofalaska.org/snap", source: "Food Bank of Alaska SNAP Assistance and Outreach", locationLine: "Alaska statewide · application help by phone, text, or online" }),
];

const housingPartnerRecords = [
  ["anchorage-neighborhood-housing", "Anchorage Neighborhood Housing / NeighborWorks", "Anchorage", "907-677-8490"],
  ["bethel-winter-house", "Bethel Winter House", "Bethel", "907-545-7661"],
  ["catholic-social-services", "Catholic Social Services Alaska", "Anchorage", "907-222-7300"],
  ["choosing-our-roots", "Choosing Our Roots", null, "907-764-6233"],
  ["covenant-house", "Covenant House Alaska", "Anchorage", "907-272-1255"],
  ["fairbanks-rescue-mission", "Fairbanks Rescue Mission", "Fairbanks", "907-331-6292"],
  ["helping-alaska", "Helping Alaska", "Fairbanks", "907-452-3876"],
  ["hope-craig", "Helping Ourselves Prevent Emergencies (HOPE)", "Craig", "907-401-1611"],
  ["glory-hall", "Juneau Housing First Collaborative — The Glory Hall", "Juneau", "907-586-4159"],
  ["kodiak-brother-francis", "Kodiak Brother Francis Shelter", "Kodiak", "907-486-5610"],
  ["my-house", "MY House", "Wasilla", "907-373-4357"],
  ["new-chance-ukraine-relief", "New Chance Ukraine Relief Program", null, "907-330-9916"],
  ["partners-for-progress", "Partners for Progress", "Anchorage", "907-272-1192"],
  ["svdp-juneau", "Saint Vincent de Paul — Juneau", "Juneau", "907-789-5535"],
  ["safv", "Sitkans Against Family Violence", "Sitka", "907-747-3450"],
  ["tcc-housing-first", "Tanana Chiefs Conference Housing First", "Fairbanks", "907-452-8251"],
  ["valley-charities", "Valley Charities", "Wasilla", "907-354-4660"],
  ["wish-housing", "Women in Safe Homes (WISH)", "Ketchikan", "907-225-9474"],
];

export const ALASKA_HOUSING = housingPartnerRecords.map(([id, name, town, phone]) => (town ? local : statewide)({
  id: `ak-housing-${id}`, name: `${name} — housing stabilization contact`, city: town || undefined, phone,
  description: `Alaska Housing Finance Corporation lists ${name} as a housing-stabilization partner${town ? ` serving the ${town} community` : ""}. Contact the organization to ask what housing help or referrals are currently available, who qualifies, and how to apply. Partner status does not guarantee that funding or shelter space is open.`,
  link: housingPartners, source: "Alaska Housing Finance Corporation Program Partners", locationLine: town ? `${town}, Alaska · contact for current housing intake` : "Alaska partner · confirm the service area and current intake",
}));

export const ALASKA_TREATMENT = [
  regional({ id: "ak-treatment-abh-anchorage", name: "Alaska Behavioral Health — Anchorage care and access", city: "Anchorage", phone: "907-563-1000", address: "1231 Gambell Street, Anchorage, AK", link: "https://alaskabehavioralhealth.org/", source: "Alaska Behavioral Health", description: "Alaska Behavioral Health provides mental-health and substance-use services, peer support, outpatient care, and crisis appointments. Call its Client Access Team to ask about assessment, age range, insurance, and current intake. The published address is the Peer Drop-In Center; call before going for clinical appointments." , locationLine: "Anchorage · contact for intake and service location" }),
  regional({ id: "ak-treatment-abh-fairbanks", name: "Alaska Behavioral Health — Fairbanks", city: "Fairbanks", link: "https://alaskabehavioralhealth.org/", phone: "907-563-1000", source: "Alaska Division of Behavioral Health CCBHC announcement and Alaska Behavioral Health", description: "Alaska selected Alaska Behavioral Health's Fairbanks site as a Certified Community Behavioral Health Clinic participant. Contact the provider to identify current mental-health or substance-use services, intake requirements, age range, coverage, and where to attend; the state designation does not confirm a specific appointment is available.", locationLine: "Fairbanks · call for current services and clinic address" }),
  regional({ id: "ak-treatment-jamhi-juneau", name: "JAMHI Health & Wellness — Juneau", city: "Juneau", link: "https://jamhi.org/", source: "Alaska Division of Behavioral Health CCBHC announcement", description: "JAMHI Health & Wellness is identified by the State of Alaska as a CCBHC demonstration participant in Juneau. Contact JAMHI to ask about behavioral-health and substance-use services, eligibility, referral needs, and current intake.", locationLine: "Juneau · call or visit the provider site for current intake details" }),
  statewide({ id: "ak-treatment-find-treatment", name: "Alaska Division of Behavioral Health — treatment provider search", link: "https://findtreatment.gov/", source: "Alaska Division of Behavioral Health", description: "The State of Alaska directs residents to FindTreatment.gov to search mental-health and substance-use treatment facilities. Filter by location and service, then contact a provider to confirm licensing, payment options, assessment steps, and current openings.", locationLine: "Search by Alaska community · provider availability must be confirmed" }),
  regional({ id: "ak-treatment-anthc", name: "ANTHC Behavioral Health Wellness Clinic", city: "Anchorage", phone: "907-729-2492", alternatePhone: "1-833-642-2492", address: "4000 Ambassador Drive, Anchorage, AK 99508", link: "https://anthc.org/patient-care/bhwc/", source: "Alaska Native Tribal Health Consortium", description: "Behavioral-health assessments, individual and group counseling, health behavior coaching, and referral support for Alaska Native and American Indian adults age 18+ physically present in Alaska. Call to discuss intake and group schedules; eligibility is population-specific.", locationLine: "Anchorage and telehealth within Alaska · Alaska Native and American Indian adults 18+" }),
  regional({ id: "ak-treatment-tanana-chiefs", name: "Tanana Chiefs Conference Behavioral Health", city: "Fairbanks", phone: "907-452-8251", link: "https://www.tananachiefs.org/services/health/behavioral-health/", source: "Tanana Chiefs Conference", description: "Tanana Chiefs Conference provides behavioral-health care to primarily Indian Health Service beneficiaries in Interior Alaska, including village communities it serves. Contact the program to confirm service eligibility, location or telehealth options, and current access.", locationLine: "Interior Alaska · primarily IHS beneficiaries; confirm village coverage" }),
  statewide({ id: "ak-treatment-find-medicaid", name: "Find a behavioral-health provider that accepts Alaska Medicaid", link: "https://www.medicaidalaska.com/", source: "Alaska Division of Behavioral Health", description: "The State of Alaska links residents to a provider search for services that accept Alaska Medicaid. Confirm whether the selected provider offers the specific mental-health or substance-use service you need and whether it is accepting patients.", locationLine: "Search by Alaska location and Medicaid coverage" }),
];

export const ALASKA_PEER = [
  local({ id: "ak-peer-drop-in-anchorage", name: "Alaska Behavioral Health Peer Drop-In Center", city: "Anchorage", address: "1231 Gambell Street, 2nd floor, Anchorage, AK", phone: "907-563-1000", link: "https://alaskabehavioralhealth.org/what-we-do/adult-services/peer-lounge/", source: "Alaska Behavioral Health", description: "Peer specialists offer a welcoming drop-in space with peer support, case-management help, groups, showers, laundry, and food. Published hours are Monday–Friday, 8 a.m.–3 p.m.; community members and prospective clients are welcome. Arrive before 1 p.m. for the best access; call to confirm current hours.", locationLine: "Anchorage · weekday drop-in · call to confirm before travel" }),
  statewide({ id: "ak-peer-true-north", name: "True North Recovery — peer recovery support", link: "https://truenorthrecovery.org/", source: "Alaska Commission for Behavioral Health Certification peer support resources", description: "True North Recovery is named by the Alaska Commission for Behavioral Health Certification among its peer-support resources. Contact the organization to confirm current peer services, locations, meeting formats, and eligibility.", locationLine: "Alaska peer-support resource · verify current location and schedule" }),
  statewide({ id: "ak-peer-ionia", name: "IONIA Natural Peer Support", link: "https://www.naturalpeersupport.org/", source: "Alaska Commission for Behavioral Health Certification peer support resources", description: "IONIA Natural Peer Support is listed by the Alaska Commission for Behavioral Health Certification. Contact the organization to confirm current peer services, who can participate, and how to connect.", locationLine: "Alaska peer-support resource · contact for current access" }),
  statewide({ id: "ak-peer-na-meetings", name: "Narcotics Anonymous — find Alaska meetings", link: "https://www.na.org/meetingsearch/", source: "Narcotics Anonymous", description: "Search for peer-led Narcotics Anonymous meetings by Alaska community. Confirm the time, format, and venue with the local group before traveling. Peer meetings are not medical care for overdose or withdrawal.", locationLine: "Search by Alaska city or ZIP · check the meeting listing before attending" }),
  statewide({ id: "ak-peer-aa-meetings", name: "Alcoholics Anonymous — find Alaska meetings", link: "https://alaskaarea.org/", source: "Alaska Area Alcoholics Anonymous", description: "Use the Alaska Area AA meeting resources to find a peer-led recovery meeting. Confirm meeting time, format, and location with the local group before attending.", locationLine: "Alaska meeting finder · verify current details" }),
];

export const ALASKA_BENEFITS = [
  statewide({ id: "ak-benefits-dpa", name: "Alaska Division of Public Assistance — benefit applications", phone: "1-800-478-7778", alternatePhone: "TDD/Alaska Relay 711", link: "https://health.alaska.gov/en/services/division-of-public-assistance-dpa-services/", source: "Alaska Department of Health", description: "Apply for or get help with SNAP, Alaska Temporary Assistance, Medicaid, General Relief Assistance, heating assistance, Senior Benefits, and WIC through Alaska Connect, a Public Assistance office, or the state's Virtual Contact Center. Each program has its own eligibility rules; call for application support.", locationLine: "Statewide application and benefit-navigation access" }),
  statewide({ id: "ak-benefits-heating", name: "Alaska Heating Assistance Program", phone: "1-800-478-7778", link: "https://health.alaska.gov/en/services/division-of-public-assistance-dpa-services/", source: "Alaska Department of Health, Division of Public Assistance", description: "The state lists Heating Assistance among its public benefit programs. Applications are available through Alaska Connect and in person at Public Assistance offices. Call to ask about current application windows, household eligibility, and required documents.", locationLine: "Statewide · current program rules and deadlines apply" }),
  statewide({ id: "ak-benefits-snap", name: "Alaska SNAP — food-purchase benefit", phone: "1-800-478-7778", link: "https://health.alaska.gov/en/services/division-of-public-assistance-dpa-services/", source: "Alaska Department of Health, Division of Public Assistance", description: "Apply for SNAP through Alaska Connect or contact the Division of Public Assistance. Food Bank of Alaska also provides free application help at 907-222-3119 or by texting SNAP to 907-891-8913. The state determines eligibility and benefit amounts.", locationLine: "Statewide · online, phone, or local Public Assistance office" }),
  statewide({ id: "ak-benefits-wic", name: "Alaska WIC — nutrition support for eligible families", link: "https://health.alaska.gov/en/services/division-of-public-assistance-dpa-services/", source: "Alaska Department of Health, Division of Public Assistance", description: "The state lists WIC as a nutrition program for eligible pregnant and postpartum people, infants, and young children. Use the state clinic finder or call Public Assistance to identify a nearby clinic and confirm eligibility and appointment requirements.", phone: "1-800-478-7778", locationLine: "Statewide · locate a WIC clinic and confirm eligibility" }),
  statewide({ id: "ak-benefits-211", name: "Alaska 211 — benefits, housing, food and community referrals", phone: "211", alternatePhone: "800-478-2221", link: "https://alaska211.org/", source: "Alaska 211 / United Way of Anchorage", description: "Free, confidential statewide information and referral service with language interpretation. Call center hours are Monday–Friday, 8:30 a.m.–5 p.m., closed noon–1 p.m. Call or search its database for local benefits, housing, food, and other support; this is a referral service, not an eligibility decision.", locationLine: "Statewide · call center hours are weekday daytime" }),
];

export const ALASKA_URGENT = [
  statewide({ id: "ak-988", name: "988 Suicide & Crisis Lifeline — Alaska", phone: "988", link: "https://988lifeline.org/", source: "Alaska Division of Behavioral Health and 988 Lifeline", description: "Call or text 988 for free, confidential emotional, mental-health, or substance-use crisis support, any time. If there is immediate physical danger or urgent medical need, call 911.", locationLine: "Alaska statewide · 24/7 call or text" }),
  statewide({ id: "ak-211-urgent", name: "Alaska 211 — urgent community support referrals", phone: "211", alternatePhone: "800-478-2221", link: "https://alaska211.org/", source: "Alaska 211", description: "Call for referrals to available shelter, food, domestic-violence, health, and community support in Alaska. The call center operates weekday daytime hours, not 24/7; for a behavioral-health crisis call or text 988, and for immediate danger call 911.", locationLine: "Statewide referrals · Monday–Friday 8:30 a.m.–5 p.m., closed noon–1 p.m." }),
  local({ id: "ak-crisis-fairbanks-23-hour", name: "Fairbanks 23-Hour Behavioral Health Stabilization", city: "Fairbanks", link: "https://www.fairbanks.gov/crisis-now/23-hour-stabilization", source: "City of Fairbanks Crisis Now", description: "The City describes this as a behavioral-health crisis stabilization setting and reports that walk-ins are accepted. Contact 988 or the facility through its official page to confirm current access and directions. Call 911 for immediate physical danger or emergency medical care.", locationLine: "Fairbanks · confirm current access before traveling" }),
  regional({ id: "ak-crisis-abh", name: "Alaska Behavioral Health — same-day and crisis appointments", city: "Anchorage", phone: "907-563-1000", link: "https://alaskabehavioralhealth.org/", source: "Alaska Behavioral Health", description: "Alaska Behavioral Health offers crisis appointments and same-day access when available. Call its Client Access Team and explain the need to ask about the right location and current availability. For immediate danger call 911; for 24/7 emotional crisis support call or text 988.", locationLine: "Anchorage and Fairbanks service pathways · call to confirm location and access" }),
  local({ id: "ak-crisis-brother-francis", name: "Brother Francis Shelter — emergency shelter", city: "Anchorage", address: "1021 E 3rd Ave, Anchorage, AK 99501", phone: "907-277-1731", link: "https://www.cssalaska.org/get-help/", source: "Catholic Social Services Alaska", description: "Voluntary emergency shelter for adults experiencing homelessness. Catholic Social Services lists 24-hour operations year-round; new beds open at 8 a.m. and intake is at the door. Call to ask about today's bed availability and admission requirements before traveling.", locationLine: "Anchorage · adults 18+ · call for current bed availability" }),
  local({ id: "ak-crisis-clare-house", name: "Clare House — emergency shelter for families", city: "Anchorage", address: "4110 Spenard Rd, Anchorage, AK 99517", phone: "907-563-4545", link: "https://www.cssalaska.org/get-help/", source: "Catholic Social Services Alaska", description: "Emergency shelter for women with children and expectant mothers. Catholic Social Services lists 24-hour operations; eligibility criteria apply. Call the front desk to confirm current intake and requirements before travel.", locationLine: "Anchorage · women with children and expectant mothers · call first" }),
];
