// Additive locality deepening for five U.S. state directories.
// Every entry is a source-reviewed lead; availability, intake and phone
// operation have not been independently confirmed. Existing records remain.
const reviewed = ({ id, name, state, city, address, phone, link, source, serviceArea, resourceType, description, coverageScope = "city", sourceLastUpdated }) => ({
  id, name, state, city, address, phone, link, source, serviceArea, resourceType,
  description, coverageScope, sourceReviewed: true, phoneConfirmed: false,
  exhaustiveCoverage: false, verified: true, checkedAt: "2026-10-30",
  ...(sourceLastUpdated ? { sourceLastUpdated } : {}),
  locationLine: [city, address].filter(Boolean).join(" · ") || `${state} · use source contact to confirm local access`,
});

const mtFoodSource = "Montana DPHHS, Emergency Food Assistance Program (TEFAP) contracted eligible recipient agencies";
const mtFoodNames = [
  ["alberton", "Alberton Food Pantry", "Alberton"], ["arlee-cdc", "Arlee CDC", "Arlee"],
  ["beaverhead", "Beaverhead Food Pantry", "Dillon"], ["big-sky", "Big Sky Community Food Bank", "Big Sky"],
  ["big-timber", "Big Timber Food Pantry", "Big Timber"], ["bigfork", "Bigfork Food Pantry", "Bigfork"],
  ["bitterroot-calvary", "Bitterroot Valley Calvary Chapel food assistance", "Hamilton"],
  ["butte-emergency", "Butte Emergency Food Bank", "Butte"], ["carter-county", "Carter County Food Bank", "Ekalaka"],
  ["center-pole", "Center Pole food assistance", "Garryowen"], ["central-montana-cupboard", "Central Montana Community Cupboard", "Lewistown"],
  ["chinook", "Chinook Food Pantry", "Chinook"], ["columbia-falls", "Columbia Falls Food Bank", "Columbia Falls"],
  ["mineral-county", "Community Food Bank of Mineral County", "Superior"], ["community-harvest", "Community Harvest Food Pantry", "Thompson Falls"],
  ["community-hope", "Community Hope food assistance", "Laurel"], ["community-services-fellowship", "Community Services Fellowship food assistance", "Noxon"],
  ["custer-county", "Custer County Food Bank", "Miles City"], ["darby-breadbasket", "Darby Breadbasket", "Darby"],
  ["dawson-county", "Dawson County Food Bank", "Glendive"], ["fairfield", "Fairfield Food Pantry", "Fairfield"],
  ["family-service-billings", "Family Service food assistance", "Billings"], ["fast-blackfeet", "FAST Blackfeet food assistance", "Browning"],
  ["fish-great-falls", "FISH food assistance", "Great Falls"], ["flathead", "Flathead Food Bank", "Kalispell"],
  ["food-cupboard-yaak", "The Food Cupboard", "Yaak"], ["gallatin-valley", "Gallatin Valley Food Bank", "Bozeman"],
  ["gardiner", "Gardiner Food Pantry", "Gardiner"], ["granite-county", "Granite County Food Bank", "Maxville"],
  ["harvest-cut-bank", "Harvest Food Pantry", "Cut Bank"], ["haven-house-hamilton", "Haven House food assistance", "Hamilton"],
  ["havre", "Havre Food Bank", "Havre"], ["headwaters", "Headwaters Area Food Bank", "Three Forks"],
  ["helena-food-share", "Helena Food Share", "Helena"], ["helping-hands-hardin", "Helping Hands food assistance", "Hardin"],
  ["hot-springs", "Hot Springs Food Pantry", "Hot Springs"], ["libby", "Libby Food Pantry", "Libby"],
  ["livingston", "Livingston Food Pantry", "Livingston"], ["love-missoula", "Love Missoula Food Pantry", "Missoula"],
  ["malta", "Malta Food Bank", "Malta"], ["meagher-nutrition", "Meagher County Nutrition Coalition", "White Sulphur Springs"],
  ["mission-valley", "Mission Valley Food Pantry", "St. Ignatius"], ["missoula-food-bank", "Missoula Food Bank", "Missoula"],
  ["musselshell", "Musselshell County Food Bank", "Roundup"], ["north-valley", "North Valley Food Bank", "Whitefish"],
  ["northern-cheyenne", "Northern Cheyenne Food Pantry", "Lame Deer"], ["pantry-partners", "Pantry Partners", "Stevensville"],
  ["polson-loaves-fishes", "Polson Loaves & Fishes Pantry", "Polson"], ["project-care", "Project CARE food assistance", "Anaconda"],
  ["revive-city", "Revive City Foods", "Missoula"], ["river-of-hope", "River of Hope Food Bank", "Missoula"],
  ["ronan-bread-basket", "Ronan Bread Basket", "Ronan"], ["rural-employment-opportunities", "Rural Employment Opportunities food assistance", "Polson"],
  ["salvation-army-great-falls", "Salvation Army food assistance", "Great Falls"], ["salvation-army-helena", "Salvation Army food assistance", "Helena"],
  ["salvation-army-missoula", "Salvation Army food assistance", "Missoula"], ["seeley-swan", "Seeley-Swan Food Bank", "Seeley Lake"],
  ["sheridan-county", "Sheridan County Food Pantry", "Plentywood"], ["st-labre", "St. Labre Food Pantry", "Ashland"],
  ["st-vincent-great-falls", "St. Vincent de Paul food assistance", "Great Falls"], ["teton-county", "Teton County Food Pantry", "Choteau"],
  ["food-pantry-wolf-point", "The Food Pantry", "Wolf Point"], ["thompson-falls-aog", "Thompson Falls A.O.G. Church Food Pantry", "Thompson Falls"],
  ["tobacco-valley", "Tobacco Valley Food Pantry", "Eureka"], ["troy-baptist", "Troy Community Baptist Food Pantry", "Troy"],
  ["troy-food-pantry", "Troy Food Pantry", "Troy"], ["twin-bridges", "Twin Bridges Farmers Market and Food Pantry", "Twin Bridges"],
  ["valley-community", "Valley Community Food Bank", "Glasgow"], ["vineyard-mercy", "Vineyard Mercy Ministry food assistance", "Great Falls"],
  ["west-yellowstone", "West Yellowstone Food Bank", "West Yellowstone"], ["westshore", "Westshore Food Bank", "Lakeside"],
  ["wibaux", "Wibaux Food Bank", "Wibaux"],
];
export const MONTANA_FOOD_DEEPENING = mtFoodNames.map(([slug, name, city]) => reviewed({
  id: `mt-tefap-${slug}`, name: `${name} — local emergency food access`, state: "MT", city,
  link: "https://prod-dphhs.mt.gov/hcsd/TheEmergencyFoodAssistanceProgram", source: mtFoodSource,
  serviceArea: city, resourceType: "TEFAP contracted local food assistance agency",
  description: `Montana DPHHS lists ${name} in ${city} as an eligible recipient agency contracted through the Montana Food Bank Network for TEFAP food assistance. The public state roster does not provide this partner's direct phone or street address. Use the Montana Food Bank Network partner locator linked from the source to find current contact details, then call to confirm distribution dates, residency and income rules, documents, and current availability before traveling. TEFAP home-food recipients must meet Montana's current income guidelines; meal providers have different access rules.`,
  coverageScope: "local partner; contact details via source locator",
}));

const riFoodSource = "Rhode Island Community Food Bank Food Assistance List (June 2025 edition; consult the current live list before visiting)";
const riFoodRows = [
  ["cumberland-lighthouse", "Cumberland", "Lighthouse Community Outreach", "30 Meeting Street, Cumberland, RI 02864", "401-636-9118", "Mon 3–6 p.m.; listed service area includes Cumberland, Lincoln, Manville, North Smithfield, Woonsocket and Smithfield; twice monthly."],
  ["cumberland-northern-ri", "Cumberland", "Northern Rhode Island Food Pantry", "1 Angell Road, Cumberland, RI 02864", "401-347-5714", "1st and 3rd Saturdays, 7–10 a.m.; listed service area includes Pawtucket, Woonsocket, Central Falls, Cumberland, Lincoln and North Smithfield; drive-through style."],
  ["east-greenwich-interfaith", "East Greenwich", "East Greenwich Interfaith Food Cupboard", "99 Peirce Street, East Greenwich, RI 02818", "401-884-4116", "Listed hours Mon, Wed and Fri 10:30 a.m.–noon; East Greenwich residents; appointment and emergency voicemail details in source."],
  ["east-providence-cap", "East Providence", "East Bay CAP Pantry", "100 Bullocks Point Avenue, East Providence, RI 02915", "401-437-1000", "Listed hours Mon, Wed and Thu 12:30–4:30 p.m.; East Bay residents; twice monthly; Spanish and Portuguese spoken."],
  ["east-providence-good-neighbors", "East Providence", "Good Neighbors Pantry", "55 Turner Avenue, East Providence, RI 02915", "401-433-0045", "Listed weekly Wednesday hours, with additional monthly sessions; East Providence residents; twice monthly. The source notes an alternate rear entrance."],
  ["foster-cap", "Foster", "Comprehensive Community Action Program Foster Food Pantry", "181 Howard Hill Road, Foster, RI 02825", "401-392-9200", "Listed hours Mon and Wed 9 a.m.–3 p.m.; serves Foster and Scituate; call ahead for emergency food."],
  ["foster-st-paul", "Foster", "St. Paul the Apostle Pantry", "116A Danielson Pike, Foster, RI 02825", "401-647-3664", "Listed every other Saturday, typically 2nd and 4th; call for exact schedule; the source says it serves Rhode Island and Connecticut."],
  ["glocester-chepachet", "Glocester", "Chepachet Union Church Pantry", "1138 Putnam Pike, Glocester, RI 02814", "401-568-2518", "Listed 1st and 3rd Saturdays, 10 a.m.–noon; twice monthly; accessible door is described in the source."],
  ["johnston-fountain-life", "Johnston", "Pentecostal Church Jesus Christ Fountain of Life Pantry", "1025 Plainfield Street, Johnston, RI 02919", "401-282-8112", "Listed Saturday hours 9–11 a.m.; weekly service; Spanish and Quiche language support noted in source."],
  ["johnston-st-robert", "Johnston", "St. Robert Food Closet", "1804 Atwood Avenue, Johnston, RI 02919", "401-231-4987", "Listed Thursday hours 9–10:30 a.m.; Johnston residents; source says guests may visit once every four weeks."],
  ["lincoln-lime-rock", "Lincoln", "Lime Rock Baptist Church Pantry", "1075 Great Road, Lincoln, RI 02865", "401-334-2999", "Listed 2nd and 4th Saturdays, 9–10 a.m.; serves several northern Rhode Island communities; twice monthly."],
  ["little-compton-food-bank", "Little Compton", "Little Compton Food Bank", "115 East Main Road, Little Compton, RI 02837", "401-592-0403", "Listed Friday and Saturday sessions; serves Little Compton and Tiverton; call for emergency help and current hours."],
  ["narragansett-st-peter", "Narragansett", "St. Peter by the Sea Community Market Pantry", "72 Central Street, Narragansett, RI 02882", "401-783-4623", "Listed Friday hours 3–5 p.m.; weekly service; call to confirm current schedule and intake."],
  ["newport-east-bay-cap", "Newport", "East Bay Community Action Newport Pantry", "19 Broadway, Newport, RI 02840", "401-847-7821", "Listed Monday noon–4 p.m. and Thursday 9 a.m.–2 p.m.; East Bay residents; twice monthly."],
  ["newport-salvation-army", "Newport", "Salvation Army Newport Corps Food Pantry", "51 Memorial Boulevard, Newport, RI 02840", "401-846-3234", "Listed Wednesday and Friday 9 a.m.–1 p.m.; serves Newport, Middletown, Jamestown, Portsmouth, Tiverton and Little Compton; monthly."],
  ["newport-st-joseph", "Newport", "St. Vincent de Paul — St. Joseph Newport Conference Pantry", "5 Mann Avenue, Newport, RI 02840", "401-258-5773", "Listed weekday morning sessions; serves Newport County including Jamestown; call for delivery arrangements and updated schedule."],
  ["north-kingstown-cap", "North Kingstown", "Tri-County Community Action North Kingstown Pantry", "415 Tower Hill Road, North Kingstown, RI 02852", "401-515-2432", "Listed 1st and 3rd Thursday, 1–3 p.m.; service area spans several Washington County communities; call to confirm fit."],
  ["north-kingstown-food-pantry", "North Kingstown", "North Kingstown Food Pantry", "445 School Street, North Kingstown, RI 02852", "401-885-3663", "Call first for appointment; listed weekday hours and monthly Saturday window; serves North Kingstown, Saunderstown and Exeter."],
  ["north-providence-tricounty", "North Providence", "Tri-County CAP Volturno Street Pantry", "19 Volturno Street, North Providence, RI 02904", "401-330-2209", "Listed weekday hours 8 a.m.–4:30 p.m.; serves northern Rhode Island communities; monthly and emergency food access noted."],
  ["north-providence-embassy", "North Providence", "Embassy of Christ Church Food Pantry", "649 Woonasquatucket Avenue, North Providence, RI 02911", "401-300-9527", "Listed 3rd Saturday, 9:30–11 a.m.; monthly access; Spanish spoken; source describes the entrance."],
  ["north-providence-tricounty-emanuel", "North Providence", "Tri-County CAP North Providence Pantry", "11 Emanuel Street, North Providence, RI 02911", "401-519-1913", "Listed weekday hours 9 a.m.–3 p.m.; serves northern Rhode Island communities; monthly access and interpreting noted."],
  ["north-providence-allendale", "North Providence", "Allendale Baptist Church Pantry", "545 Woonasquatucket Avenue, North Providence, RI 02911", "401-261-4044", "Listed 3rd Saturday and 2nd Wednesday sessions; the Wednesday session is non-perishables only; call for current details."],
  ["pawtucket-blackstone", "Pawtucket", "Blackstone Valley Community Action Program Pantry", "210 West Avenue, Pawtucket, RI 02860", "401-475-5069", "Appointment recommended; listed weekday hours; biweekly access; serves Pawtucket, Central Falls, Lincoln and Cumberland; Spanish spoken."],
];
export const RHODE_ISLAND_FOOD_DEEPENING = riFoodRows.map(([slug, city, name, address, phone, access]) => reviewed({
  id: `ri-food-community-${slug}`, name: `${name} — pantry and grocery assistance`, state: "RI", city, address, phone,
  link: "https://rifoodbank.org/find-food/", source: riFoodSource, sourceLastUpdated: "2025-06",
  serviceArea: city, coverageScope: "local pantry or meal-site contact", resourceType: "food pantry and grocery assistance",
  description: `The Rhode Island Community Food Bank's June 2025 assistance list publishes ${name} at ${address}, phone ${phone}. The source-listed access information is: ${access} The PDF is older than a year and explicitly tells users to consult the live finder; schedules, service areas, eligibility, language access, and intake may have changed. Call the pantry and check the current Food Bank finder before traveling. Food availability is not guaranteed.`,
}));

const ndSource = "North Dakota HHS Behavioral Health Division, Licensed Addiction Treatment Programs in North Dakota (November 2025 directory)";
const ndRows = [
  ["providence-arnegard", "Providence House", "Arnegard", "2126 Vista Avenue, Arnegard, ND 58853", "701-586-3300", "Adult outpatient and intensive outpatient services; DUI evaluation/seminar listed."],
  ["weishoff-williston", "Weishoff Alcohol & Drug", "Williston", "603 Main Street, Williston, ND 58801", "701-770-0391", "Adult outpatient substance-use services and DUI seminar listed."],
  ["essential-family-bottineau", "Essential Family Solutions", "Bottineau", "104 W 11th Street, Bottineau, ND 58318", "701-228-3326", "Adult and adolescent outpatient services listed; call to ask about assessment and intake."],
  ["goodman-minot", "Goodman Addiction Services", "Minot", "600 22nd Avenue NW, Suite 4, Minot, ND 58701", "701-833-5767", "Adult and adolescent outpatient addiction services listed; call for age-specific intake."],
  ["providence-minot", "Providence House Minot", "Minot", "415 S Main Street, Minot, ND 58701", "701-838-3300", "Adult outpatient, intensive outpatient and day treatment levels are listed; confirm current admission requirements."],
  ["bob-hayes-standley", "Bob Hayes Addiction Services PLLC", "Stanley", "18 2nd Avenue SE, Stanley, ND 58784", "701-628-2925", "Adult outpatient substance-use services and DUI evaluation listed."],
  ["generation-healing-belcourt", "5th Generation Healing Center", "Belcourt", "119 Sheldon Souray Avenue, Belcourt, ND 58316", "701-477-3121", "Adult outpatient and partial-hospitalization services are listed in the state directory; ask about tribal and local access."],
  ["heartview-cando", "Heartview Foundation — Cando", "Cando", "7448 68th Avenue NE, Cando, ND 58324", "701-968-4056", "Adolescent and adult outpatient and intensive outpatient treatment are listed; call to confirm current program fit."],
  ["evolution-devils-lake", "Evolution Counseling", "Devils Lake", "413 4th Street NE, Suite 1, Devils Lake, ND 58301", "701-665-3270", "Adult and adolescent outpatient and intensive outpatient services are listed; call to confirm intake."],
  ["spirit-lake-bh-fort-totten", "Spirit Lake Behavioral Health", "Fort Totten", "3883 74th Avenue NE, Fort Totten, ND 58335", "701-766-1613", "Adult outpatient treatment is listed; state directory also lists an alternate program number. Ask about community eligibility and intake."],
  ["quinn-grafton", "Quinn DUI/MIP Evaluations", "Grafton", "49 W 6th Street, Grafton, ND 58237", "701-352-9622", "State directory lists outpatient services for adolescents and adults, plus DUI/MIP evaluation and seminar."],
  ["soul-solutions-fargo", "Soul Solutions Recovery Center", "Fargo", "1801 38th Street S, Fargo, ND 58103", "701-356-7772", "Adult outpatient, intensive outpatient and day-treatment services are listed; contact the center for current options and payment."],
  ["abuse-resource-lisbon", "Abuse Resource Network & Therapy", "Lisbon", "13 11th Avenue W, Lisbon, ND 58054", "701-683-5061", "Adult outpatient services are listed; call for local intake, eligibility, and appointment details."],
  ["holistic-recovery-eldridge", "Holistic Recovery Services", "Eldridge", "207 2nd Avenue S, Eldridge, ND 58401", "701-680-5207", "Adult outpatient substance-use services and DUI seminar are listed; call to confirm current operations and intake."],
  ["coal-country-beulah", "Coal Country Community Health Center", "Beulah", "1312 Highway 49 N, Beulah, ND 58523", "701-873-4445", "Adult and adolescent outpatient services and DUI evaluation are listed; contact the health center for scheduling."],
  ["prairie-recovery-raleigh", "Prairie Recovery Center", "Raleigh", "7785 St Gertrude Avenue, Raleigh, ND 58564", "701-597-3419", "The state directory lists adult outpatient, intensive outpatient and residential levels; phone for current admission and transport steps."],
  ["blessed-builders-bismarck", "Blessed Builders Ministry", "Bismarck", "2700 State Street, Suite F-6, Bismarck, ND 58503", "701-751-0318", "Adult outpatient and intensive outpatient substance-use services are listed; call for current intake and eligibility."],
  ["south-central-jamestown", "South Central Human Service Center", "Jamestown", "520 3rd Street NW, Jamestown, ND 58402", "701-253-6300", "North Dakota's regional public behavioral-health center lists addiction treatment and local outreach services. Call the center for assessment and intake."],
  ["badlands-dickinson", "Badlands Human Service Center", "Dickinson", "300 13th Avenue W, Suite 1, Dickinson, ND 58601", "701-227-7500", "North Dakota's regional public behavioral-health center lists outpatient treatment and satellite service access; call to confirm local intake."],
  ["nchsc-open-arms-minot", "Open Arms at North Central Human Service Center", "Minot", "18 3rd Street SE, Suite 300, Minot, ND 58701", "701-857-8500", "The state directory lists this location as a satellite for adult and adolescent outpatient addiction treatment. Call the regional center to confirm entry and availability."],
];
export const NORTH_DAKOTA_TREATMENT_DEEPENING = ndRows.map(([slug, name, city, address, phone, services]) => reviewed({
  id: `nd-sud-${slug}`, name: `${name} — licensed substance-use treatment access`, state: "ND", city, address, phone,
  link: "https://www.hhs.nd.gov/behavioral-health/substance-abuse-treatment-programs", source: ndSource,
  serviceArea: city, coverageScope: "local licensed treatment provider", resourceType: "licensed substance-use treatment",
  description: `${name} is listed by North Dakota HHS at ${address}, phone ${phone}. The state directory identifies these service levels or program routes: ${services} The source directory was updated in November 2025; contact the provider to confirm it remains licensed and operating, which services are currently offered at this location, age and referral requirements, insurance/payment, and appointment availability. This is not emergency care or a confirmation of an open treatment bed.`,
}));

const coSource = "Colorado Recovery Friendly Workplace Initiative, 2026 landscape report; Center for Addiction Recovery Support Colorado Recovery Community Organizations directory";
const coPeerRows = [
  ["a-way-forward", "A Way Forward", "Longmont", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Recovery community organization identified in the 2026 Colorado recovery-community landscape; use the directory link to locate its current contact route."],
  ["auraria-recovery-community", "Auraria Recovery Community", "Denver", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Collegiate recovery community identified in the 2026 Colorado landscape; contact the program through the linked directory or Auraria campus channels."],
  ["chow-denver", "Culinary Hospitality Outreach and Wellness (CHOW)", "Denver", "https://chowdenver.org/", "Recovery support and wellness organization serving Colorado's culinary and hospitality workforce; ask about current peer and group offerings."],
  ["colorado-artists-in-recovery", "Colorado Artists in Recovery", "Denver", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Creative peer-recovery community identified in the 2026 Colorado landscape; use the linked recovery-organization directory for current contact details."],
  ["colorado-mental-wellness-network", "Colorado Mental Wellness Network", "Denver", "https://cmwn.org/", "Peer-led mental-wellness support and community education; check the organization's current calendar and contact route before attending."],
  ["cu-collegiate-recovery", "CU Boulder Collegiate Recovery Community", "Boulder", "https://www.colorado.edu/health/collegiate-recovery-center", "University recovery community identified in the state landscape; contact the campus center to confirm current eligibility, meeting format and hours."],
  ["discovery-cafe-rifle", "Discovery Cafe", "Rifle", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Peer recovery community identified in the 2026 Colorado landscape in Rifle; the directory link provides a route to current organization details."],
  ["face-it-together-cos", "Face It TOGETHER — Colorado Springs", "Colorado Springs", "https://www.faceittogether.org/", "Recovery coaching and peer-based support organization listed in the state recovery landscape; contact the provider to confirm Colorado Springs access and current format."],
  ["hardbeauty-castle-rock", "HardBeauty Foundation — Castle Rock", "Castle Rock", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Recovery community organization with a Castle Rock service location identified by the Colorado recovery landscape; use the directory to confirm current contact and program access."],
  ["hazelbrook-aurora", "Hazelbrook Community Recovery Center", "Aurora", "https://www.hazelbrook.org/", "Community recovery center identified in Aurora by the Colorado recovery landscape; contact the provider to confirm current peer services, eligibility and schedule."],
  ["high-rockies-harm-reduction", "High Rockies Harm Reduction", "Basalt", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Harm-reduction and peer-recovery organization listed in Basalt in the statewide landscape; use the linked directory to locate current services and contact information."],
  ["hope-cos", "Hope COS", "Colorado Springs", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Recovery community organization identified in Colorado Springs; verify current activity and contact details through the linked statewide directory."],
  ["in-the-weeds-durango", "In The Weeds", "Durango", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Peer recovery organization identified in Durango by the 2026 state landscape; use the directory to confirm current meetings and participation details."],
  ["peer-180-grand-junction", "Peer 180", "Grand Junction", "https://peer-180.com/", "Peer-led recovery support organization listed in Grand Junction; contact Peer 180 to ask about current groups, coaching, eligibility and schedule."],
  ["purple-mountain-cos", "Purple Mountain Recovery", "Colorado Springs", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Recovery community organization identified in Colorado Springs; use the linked directory to verify current program information and contact route."],
  ["reconnected-avon", "Reconnected Foundation", "Avon", "https://www.carsrecovery.org/directory-of-peer-recovery-organizations/category/Colorado", "Recovery community organization identified in Avon; use the linked statewide directory to check its current contact, program format and service area."],
  ["recovery-cafe-longmont", "Recovery Café Longmont", "Longmont", "https://recoverycafelongmont.org/contact-us/", "Recovery café community offering peer-centered recovery support in Longmont; call the café or check its calendar to confirm current orientation and visit details."],
  ["serenity-recovery-connection", "Serenity Recovery Connection", "Colorado Springs", "https://srchope.org/", "Recovery community organization identified in the 2026 Colorado landscape; contact the organization to confirm current peer support and service access."],
  ["white-bison-cos", "White Bison — Indigenous Wellbriety support", "Colorado Springs", "https://whitebison.org/", "Indigenous Wellbriety recovery support organization identified in Colorado Springs and Cortez; ask about local circles, culturally grounded services and current access."],
];
export const COLORADO_PEER_DEEPENING = coPeerRows.map(([slug, name, city, link, service]) => reviewed({
  id: `co-peer-community-${slug}`, name: `${name} — peer and recovery community`, state: "CO", city,
  link, source: coSource, serviceArea: city, coverageScope: "city recovery-community organization",
  resourceType: "peer recovery and community support",
  description: `${name} is identified in a 2026 statewide Colorado recovery-community landscape as a peer/community recovery resource in ${city}. ${service} Public directories do not establish that a group is currently meeting or accepting new participants. Contact the organization to confirm its present location, access, cost, age/service fit, and meeting schedule before traveling.`,
}));

const ohHousingSource = "U.S. HUD Ohio homelessness assistance contacts (state resource page, accessed October 2026)";
export const OHIO_HOUSING_DEEPENING = [
  ["toledo-lucas-coordinated-entry", "Toledo-Lucas County Homelessness Board — coordinated entry", "Toledo", "211", "https://www.endinghomelessnesstoledo.org/coordinated-entry", "Greater Toledo Coordinated Assessment is the local entry route for emergency shelter, rent/deposit assistance and other homeless services. Call 211 or 1-800-650-HELP to discuss options; shelter availability and referral eligibility change daily."],
  ["dayton-coc-navigation", "Dayton-Kettering-Montgomery County Continuum of Care — housing navigation", "Dayton", "937-225-4695", "https://www.hud.gov/states/ohio", "HUD lists the local Continuum of Care as a contact for people experiencing homelessness in Montgomery County. Call to ask for current coordinated-entry, shelter and housing-assistance pathways; this is a navigation contact, not a shelter placement guarantee."],
  ["miami-valley-housing-opportunities", "Miami Valley Housing Opportunities — homelessness support", "Dayton", "937-263-4449 ext. 410", "https://www.hud.gov/states/ohio", "HUD lists Miami Valley Housing Opportunities as a Dayton-area homelessness resource. Ask about current housing-stability or homelessness programs, eligibility, referral requirements and the correct intake location; do not travel without confirming access."],
  ["stark-homeless-navigation", "Stark County Homeless Navigation Hotline", "Canton", "330-452-4363", "https://www.hud.gov/states/ohio", "HUD lists this hotline for Stark County homelessness assistance. Call to ask about local shelter access, coordinated assessment and housing navigation. Availability and referral procedures can change; a call does not guarantee a bed."],
  ["stark-united-way", "United Way of Stark County — human-services referral", "Canton", "330-491-0445", "https://www.hud.gov/states/ohio", "HUD lists this contact for connection to Stark County health and human-service programs. Ask for the current local shelter or housing referral path and confirm the provider's intake steps."],
  ["cleveland-coordinated-intake-direct", "Cuyahoga County Coordinated Intake — direct shelter access line", "Cleveland", "216-674-6700", "https://www.hud.gov/states/ohio", "HUD lists this number as the Cuyahoga County Coordinated Intake contact for shelter referrals. Call for assessment and the current safest next step; the county may route people through coordinated intake, and placement depends on eligibility and capacity."],
  ["mahoning-homeless-assistance", "Mahoning County homelessness assistance agencies — local referral", "Youngstown", "211", "https://www.hud.gov/states/ohio", "HUD directs Mahoning County residents to local homelessness-assistance agencies and 211 for community-service referrals. Call and request current shelter or housing navigation for Mahoning County; confirm which agency serves your situation before traveling."],
  ["franklin-homeless-hotline-text", "Franklin County Homeless Hotline — shelter access and text referral", "Columbus", "614-274-7000", "https://www.hud.gov/states/ohio", "HUD lists the Community Shelter Board Homeless Hotline for shelter access in Franklin County. Call for screening and current options; HUD also lists texting 898211 for general health and human-services referrals. Shelter placement depends on the hotline's assessment and available capacity."],
];
export const OHIO_HOUSING_DEEPENING_RECORDS = OHIO_HOUSING_DEEPENING.map(([slug, name, city, phone, link, description]) => reviewed({
  id: `oh-housing-local-${slug}`, name, state: "OH", city, phone, link, source: ohHousingSource,
  serviceArea: city === "Canton" ? "Stark County" : city === "Cleveland" ? "Cuyahoga County" : city === "Youngstown" ? "Mahoning County" : city === "Columbus" ? "Franklin County" : "Montgomery County",
  coverageScope: "county or metro housing access route", resourceType: "homelessness and shelter navigation",
  description: `${description} Call before visiting to confirm hours, service area, eligibility and referral requirements.`,
}));

export const OHIO_PEER_DEEPENING = [
  ["ashtabula-aa", "Ashtabula Area Intergroup — A.A. meeting connection", "Ashtabula", "440-992-8383", "https://www.aaigo.net/"],
  ["canton-aa", "Canton Area Intergroup — A.A. meeting connection", "Canton", "330-491-1989", "https://cantonaa.com/"],
  ["lorain-aa", "Lorain County Intergroup — A.A. meeting connection", "Elyria", "440-246-1800", "https://www.aaloraincounty.org/"],
  ["mansfield-aa", "Mansfield Area Intergroup — A.A. meeting connection", "Mansfield", "419-522-4800", "https://www.mansfieldaa.org/contact-us/"],
  ["north-central-ohio-aa", "North Central Ohio A.A. Area — local meeting support", "Sandusky", "419-625-5995", "https://www.ncoaai.com/"],
  ["youngstown-aa", "Youngstown Area Intergroup — A.A. and Al-Anon meeting connection", "Youngstown", "330-270-3000", "https://aayaig.org/meetings"],
];
export const OHIO_PEER_DEEPENING_RECORDS = OHIO_PEER_DEEPENING.map(([slug, name, city, phone, link]) => reviewed({
  id: `oh-peer-${slug}`, name, state: "OH", city, phone, link,
  source: "Northeast Ohio Area 54 Alcoholics Anonymous intergroups and central offices directory",
  serviceArea: `${city} area`, coverageScope: "regional peer fellowship contact", resourceType: "peer recovery meeting directory",
  description: `${name} publishes a local contact for finding A.A. meetings and fellowship support in the ${city} area. Call or use the provider's meeting finder to check current times, format, accessibility, and whether a meeting is open to visitors before traveling. This is peer fellowship support and is not clinical treatment or crisis response.`,
}));
