// Connecticut directory records are based on current state and operator
// directories reviewed 2026-10-25. Inclusion means the source publishes the
// contact or service area; hours, intake, eligibility, and open capacity still
// need confirmation with the provider.
const reviewed = (record) => ({ ...record, state: "CT", verified: true, checkedAt: "2026-10-25" });
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const regional = (record) => reviewed({ ...record, coverageScope: "region" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const dmhas = "https://portal.ct.gov/dmhas/programs-and-services/dmhas-directories/local-mental-health-authorities";
const lmhas = [
  ["bridgeport", "Greater Bridgeport Community Mental Health Center", "Bridgeport", "1635 Central Avenue, Bridgeport, CT 06610", "203-551-7423", "Bridgeport, Easton, Fairfield, Monroe, Stratford, Trumbull"],
  ["stamford", "F.S. DuBois Center", "Stamford", "1351 Washington Boulevard, 5th Floor, Stamford, CT 06905", "203-388-1600", "Stamford, Greenwich, Norwalk, Darien, Westport, Wilton, New Canaan"],
  ["ansonia", "BHcare — Valley Offices", "Ansonia", "435 East Main Street, Ansonia, CT 06401", "203-736-2601", "Ansonia, Derby, Seymour, Shelton"],
  ["branford", "BHcare — Shoreline Offices", "Branford", "14 Sycamore Way, Branford, CT 06405", "203-483-2630", "Branford, East Haven, Guilford, Madison, North Branford, North Haven"],
  ["milford", "Bridges Healthcare", "Milford", "949 Bridgeport Avenue, Milford, CT 06460", "203-878-6365", "Milford, Orange, West Haven"],
  ["new-haven", "Connecticut Mental Health Center", "New Haven", "34 Park Street, New Haven, CT 06510", "203-974-7300", "Bethany, Hamden, New Haven, Woodbridge"],
  ["meriden", "Rushford Center", "Meriden", "883 Paddock Avenue, Meriden, CT 06450", "203-630-5280", "Meriden, Wallingford"],
  ["middletown", "River Valley Services", "Middletown", "Leak Hall, Middletown, CT 06457", "860-262-5200", "Middletown, Old Saybrook, Chester, Clinton, Cromwell, Portland"],
  ["norwich", "Southeastern Mental Health Authority", "Norwich", "401 West Thames Street, Building 301, Norwich, CT 06360", "860-859-4500", "Norwich, New London, Groton, Waterford, Montville, Stonington"],
  ["dayville", "United Services", "Dayville", "1007 North Main Street, Dayville, CT 06241", "860-774-2020", "Dayville, Killingly, Putnam, Windham, Brooklyn, Plainfield"],
  ["windsor", "Community Health Resources", "Windsor", "995 Day Hill Road, Windsor, CT 06095", "860-731-5522", "Windsor, Enfield, Manchester, Vernon, Tolland, South Windsor"],
  ["east-hartford", "InterCommunity", "East Hartford", "281 Main Street, East Hartford, CT 06118", "860-569-5900", "East Hartford, Glastonbury, Newington, Rocky Hill, Wethersfield"],
  ["hartford", "Capitol Region Mental Health Center", "Hartford", "500 Vine Street, Hartford, CT 06112", "860-297-0800", "Hartford, Avon, Farmington, Simsbury, West Hartford"],
  ["new-britain", "Community Mental Health Affiliates", "New Britain", "233 Main Street, New Britain, CT 06051", "860-223-2778", "New Britain, Berlin, Bristol, Plainville, Southington"],
  ["waterbury", "Western CT Mental Health Network — Waterbury Area", "Waterbury", "95 Thomaston Avenue, Waterbury, CT 06702", "203-805-5300", "Waterbury, Naugatuck, Southbury, Watertown, Wolcott"],
  ["danbury", "Western CT Mental Health Network — Danbury Area", "Danbury", "78 Triangle Street, Building I-4, Danbury, CT 06810", "203-448-3200", "Danbury, Bethel, Brookfield, New Milford, Newtown, Ridgefield"],
  ["torrington", "Western CT Mental Health Network — Torrington Area", "Torrington", "249 Winsted Road, 3rd Floor, Torrington, CT 06790", "860-496-3700", "Torrington, Litchfield, Winsted, Salisbury, Sharon, Canaan"],
  ["old-saybrook", "River Valley Services — Old Saybrook Office", "Old Saybrook", "2 Center Road West, Old Saybrook, CT 06475", "860-395-5040", "Old Saybrook, Old Lyme, Lyme, Essex, Clinton"],
];

export const CONNECTICUT_TREATMENT = lmhas.map(([id, name, city, address, phone, towns]) => local({
  id: `ct-treatment-${id}`, name, city, address, phone,
  serviceAreaCities: towns.split(", "),
  description: `Connecticut DMHAS lists this Local Mental Health Authority as a community behavioral-health provider for ${towns}. Contact the office to ask about mental-health or substance-use treatment, the correct intake team, insurance or uninsured access, and current appointments. This is a service-area contact, not confirmation of an open appointment.`,
  link: dmhas, source: "Connecticut DMHAS Local Mental Health Authorities directory",
  locationLine: `${city}, Connecticut · published catchment: ${towns} · call for intake`,
}));

const ceapOffices = [
  ["access-willimantic", "ACCESS — Greater Willimantic Energy Assistance Office", "Willimantic", "1315 Main Street, Willimantic, CT 06226", "860-450-7400", "https://www.accessagency.org/"],
  ["access-danielson", "ACCESS — Greater Danielson Energy Assistance Office", "Danielson", "231 Broad Street, Danielson, CT 06239", "860-412-1600", "https://www.accessagency.org/"],
  ["alliance-bridgeport", "Alliance for Community Empowerment — Bridgeport Energy Office", "Bridgeport", "1070 Park Avenue, Bridgeport, CT 06604", "203-366-8241", "https://alliancect.org/"],
  ["alliance-norwalk", "Alliance for Community Empowerment — Norwalk Energy Office", "Norwalk", "108 Main Street, Norwalk, CT 06854", "203-366-8241", "https://alliancect.org/"],
  ["caanh", "Community Action Agency of New Haven — Energy Assistance", "New Haven", "419 Whalley Avenue, New Haven, CT 06511", "203-387-7700", "https://caanh.net/"],
  ["caawc-danbury", "Community Action Agency of Western CT — Danbury Energy Office", "Danbury", "78 Triangle Street, Danbury, CT 06810", "203-748-5422", "https://caawc.org/"],
  ["caawc-stamford", "Community Action Agency of Western CT — Stamford Energy Office", "Stamford", "34 Woodland Avenue, Stamford, CT 06902", "203-357-0720", "https://caawc.org/"],
  ["crt-hartford", "Community Renewal Team — Greater Hartford Energy Office", "Hartford", "395 Wethersfield Avenue, Hartford, CT 06114", "860-560-2694", "https://www.crtct.org/"],
  ["crt-middletown", "Community Renewal Team — Middletown Energy Office", "Middletown", "32 Washington Street, Middletown, CT 06457", "860-347-4465", "https://www.crtct.org/"],
  ["hra-bristol", "Human Resources Agency of New Britain — Bristol Energy Office", "Bristol", "55 South Street, Bristol, CT 06010", "860-584-2725", "https://www.hranbct.org/"],
  ["hra-new-britain", "Human Resources Agency of New Britain — New Britain Energy Office", "New Britain", "336 Arch Street, New Britain, CT 06051", "860-225-1084", "https://www.hranbct.org/"],
  ["noi-meriden", "New Opportunities — Meriden Energy Office", "Meriden", "22 Church Street, Meriden, CT 06450", "203-639-5060", "https://www.newoppinc.org/"],
  ["noi-waterbury", "New Opportunities — Waterbury Energy Office", "Waterbury", "232 North Street, Waterbury, CT 06702", "203-575-4255", "https://www.newoppinc.org/"],
  ["noi-torrington", "New Opportunities — Torrington Energy Office", "Torrington", "62 Commercial Boulevard, Torrington, CT 06790", "860-496-0622", "https://www.newoppinc.org/"],
  ["team-derby", "TEAM — Derby-Milford Energy Assistance Office", "Derby", "30 Elizabeth Street, Derby, CT 06418", "203-736-5420", "https://teaminc.org/"],
  ["tvcca-new-london", "TVCCA — New London Energy Assistance Office", "New London", "83 Huntington Street, New London, CT 06320", "860-425-6563", "https://www.tvcca.org/"],
  ["tvcca-norwich", "TVCCA — Norwich Energy Assistance Office", "Norwich", "401 West Thames Street, Norwich, CT 06360", "860-425-6563", "https://www.tvcca.org/"],
];
const ceapSource = "Connecticut DSS Heating Help — Community Action Agency Contact Information";
const ceapUrl = "https://portal.ct.gov/heatinghelp/connecticut-energy-assistance-program-ceap";
export const CONNECTICUT_BENEFITS = ceapOffices.map(([id, name, city, address, phone, link]) => local({
  id: `ct-benefits-${id}`, name, city, address, phone, link, source: ceapSource,
  description: `Connecticut DSS lists this Community Action Agency office for Connecticut Energy Assistance Program applications and related utility support. Call before visiting to confirm town eligibility, appointment requirements, the current application window, documents to bring, and whether this office serves your address.`,
  locationLine: `${city}, Connecticut · CEAP office · confirm appointment and town coverage`,
}));

const canContacts = [
  ["fairfield", "Fairfield County Coordinated Access Network", "Bridgeport", "Catholic Charities of Fairfield County", "203-743-4412"],
  ["new-haven", "Greater New Haven Coordinated Access Network", "New Haven", "Columbus House", "203-401-4400"],
  ["middlesex", "Middlesex / Meriden / Wallingford Coordinated Access Network", "Middletown", "Columbus House", "860-343-3145"],
  ["eastern", "Eastern Coordinated Access Network", "Norwich", "Reliance Health", "860-887-6536"],
  ["hartford", "Greater Hartford Coordinated Access Network", "Hartford", "Community Health Resources", "860-646-3888"],
  ["central", "Central Connecticut Coordinated Access Network", "New Britain", "Friendship Service Center", "860-225-0211"],
  ["northwest", "Northwest Coordinated Access Network", "Waterbury", "Center for Human Development", "203-596-9323"],
];
export const CONNECTICUT_HOUSING = [
  ...canContacts.map(([id, name, city, organization, phone]) => regional({
    id: `ct-housing-${id}`, name, city, phone,
    description: `${organization} is named by Connecticut DMHAS as a regional coordinated-access housing partner. This is an entry/referral contact, not a shelter with confirmed beds. For homelessness or imminent housing loss, call 211 and press 3 then 1 for a housing assessment; ask about the CAN for your town and current shelter options.`,
    link: "https://portal.ct.gov/dmhas/programs-and-services/statewide-services/housing-homeless-services/ct-soar",
    source: "Connecticut DMHAS SOAR regional Coordinated Access Network partner list",
    locationLine: `${city} region · housing referral partner · assessment required; placement not guaranteed`,
  })),
  statewide({ id: "ct-housing-211-entry", name: "Connecticut 211 — Coordinated Access housing assessment", phone: "211", alternatePhone: "1-800-203-1234", link: "https://www.211ct.org/topic_pages/housing", source: "Connecticut DMHAS Housing and Homeless Services; 211 Connecticut", description: "For homelessness or imminent housing loss, call 211 and press 3, then 1, to speak with a housing crisis specialist and begin the coordinated-access assessment. If 211 is unavailable from your phone, call 1-800-203-1234. An assessment does not guarantee shelter or housing placement.", locationLine: "Connecticut statewide · call 211, press 3 then 1 · referral and assessment pathway" }),
];

const naAreas = [
  ["central", "Central Connecticut Area", "Hartford", "Bristol, Meriden, New Haven, Southington, Wallingford, Wethersfield"],
  ["danbury", "Greater Danbury Area", "Danbury", "Brookfield, Danbury, Newtown"],
  ["greater-hartford", "Greater Hartford Area", "Hartford", "Bloomfield, East Hartford, Enfield, Glastonbury, Manchester, Vernon, Windsor Locks"],
  ["greater-new-haven", "Greater New Haven Area", "New Haven", "Branford, East Haven, Guilford, Milford, New Haven, West Haven"],
  ["waterbury", "Greater Waterbury Area", "Waterbury", "Litchfield, Naugatuck, Torrington, Waterbury, Watertown"],
  ["mid-state", "Mid-State Unity Area", "Middletown", "East Hampton, Middletown, Portland"],
  ["fairfield", "Southern Fairfield County Area", "Stamford", "Bridgeport, Fairfield, Norwalk, Stamford, Westport"],
  ["tunxis", "Tunxis Valley Area", "New Britain", "Bristol, Coventry, Glastonbury, Manchester, New Britain, Plainville"],
  ["shoreline", "United Shoreline Area", "New London", "Danielson, Mystic, New London, Norwich, Old Lyme, Willimantic"],
];
export const CONNECTICUT_PEER = naAreas.map(([id, name, city, towns]) => regional({
  id: `ct-peer-na-${id}`, name: `Narcotics Anonymous — ${name}`, city,
  description: `Connecticut NA identifies this local service area as serving meetings in ${towns}. Use the area's official meeting search for current in-person and online meetings, then confirm time, format, accessibility, and address before attending. This entry identifies an area service resource, not a single meeting.`,
  link: "https://ctna.org/areas/", source: "Connecticut Region of Narcotics Anonymous — Areas directory",
  locationLine: `${city} area · service-area listing, not a meeting address · search live schedule`,
}));

export const CONNECTICUT_FOOD = [
  ...[
    ["black-rock", "Black Rock Food Pantry", "Bridgeport", "2676 Fairfield Avenue, Bridgeport, CT 06605", "203-610-1222", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["bridgeport-rescue", "Bridgeport Rescue Mission — food pantry and meals", "Bridgeport", "1088 Fairfield Avenue, Bridgeport, CT 06605", "203-333-4087", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["kings-pantry", "King's Pantry", "Bridgeport", "30 Florence Street, Bridgeport, CT 06607", "203-335-9255", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["nourish", "nOURish Bridgeport", "Bridgeport", "2200 North Avenue, Bridgeport, CT 06604", "203-335-3107", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["bishop-jean-williams", "Bishop Jean Williams Food Pantry", "Bridgeport", "3160 Park Avenue, Bridgeport, CT 06604", "203-873-0260", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["merton-house", "Thomas Merton House — food pantry and dining services", "Bridgeport", "1406 State Street, Bridgeport, CT 06605", "203-367-9036", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
    ["bridgeport-mobile", "Bridgeport Hospital — Connecticut Foodshare Mobile Pantry", "Bridgeport", "200 Mill Hill Avenue, Bridgeport, CT 06610", "203-200-3719", "https://www.bridgeportct.gov/government/departments/health-social-services/social-services/food-banks-pantries"],
  ].map(([id, name, city, address, phone, link]) => local({
    id: `ct-food-${id}`, name, city, address, phone, link,
    source: "City of Bridgeport Food Banks & Pantries directory",
    description: `The City of Bridgeport lists this food pantry or meal resource at the published address. Call before traveling to confirm the current distribution schedule, service area, intake steps, and whether food is available that day.`,
    locationLine: `${city}, Connecticut · city-listed food resource · call to confirm current service`,
  })),
  ...[
    ["bethel-ame", "Bethel A.M.E. Food Pantry", "255 Goffe Street, New Haven, CT 06511", "203-865-0514"],
    ["catholic-charities", "Catholic Charities — New Haven food pantry", "290 Grand Avenue, New Haven, CT 06513", "203-777-6771"],
    ["christian-community-action", "Christian Community Action — food pantry", "168 Davenport Avenue, New Haven, CT 06519", "203-777-7848"],
    ["second-star", "Second Star of Jacob Church Food Pantry", "185 Chapel Street, New Haven, CT 06513", "203-776-9603"],
    ["west-river", "West River Community Food Pantry", "154 Derby Avenue, New Haven, CT 06511", "203-752-1644"],
  ].map(([id, name, address, phone]) => local({
    id: `ct-food-${id}`, name, city: "New Haven", address, phone,
    link: "https://inside.southernct.edu/basic-needs-resources/food-security/food-pantries",
    source: "Southern Connecticut State University Basic Needs — New Haven food-pantry resource list",
    description: `Southern Connecticut State University's local food-resource list publishes this pantry's contact and address. Schedules and eligibility may change; call to confirm intake, service area, current hours, and what documents to bring before visiting.`,
    locationLine: "New Haven, Connecticut · locally listed pantry · call to confirm current schedule",
  })),
  statewide({ id: "ct-foodshare-pantry-locator", name: "Connecticut Foodshare — pantry and mobile food locators", phone: "203-469-5000", address: "2 Research Parkway, Wallingford, CT 06492", link: "https://www.ctfoodshare.org/find-food", source: "Connecticut Foodshare Find Food", description: "Connecticut Foodshare directs residents to the 211 Connecticut pantry locator and its separate mobile-food-pantry schedule. Search by town for current nearby programs, then contact the site to confirm distribution date, eligibility, hours, and whether registration is required. This is a live finder, not a pantry at the Wallingford headquarters.", locationLine: "Statewide finder · headquarters: Wallingford · search for current nearby pantry sites" }),
  statewide({ id: "ct-food-211", name: "2-1-1 Connecticut — food pantry and meal search", phone: "211", alternatePhone: "1-800-203-1234", link: "https://www.211ct.org/search?query=Food%20Pantries", source: "Connecticut Foodshare and 211 Connecticut", description: "Search Connecticut's live community-resource directory for food pantries, community meals, grocery delivery, and nutrition support by town or ZIP code. Call the listed program before traveling to confirm current hours, intake, and food availability.", locationLine: "Connecticut statewide · live search by town or ZIP" }),
];

export const CONNECTICUT_URGENT = [
  statewide({ id: "ct-urgent-988", name: "988 Suicide & Crisis Lifeline — Connecticut", phone: "988", link: "https://988lifeline.org/", source: "988 Lifeline", description: "Call or text 988 for immediate emotional crisis support, any time. For immediate physical danger or a medical emergency, call 911.", locationLine: "Connecticut · 24/7 call or text" }),
  statewide({ id: "ct-urgent-dmhas-access", name: "Connecticut DMHAS Addiction Access Line", phone: "1-800-563-4086", link: "https://portal.ct.gov/DMHAS/Programs-and-Services/Finding-Services", source: "Connecticut DMHAS Finding Services", description: "DMHAS's 24/7 Access Line helps Connecticut residents connect with addiction treatment and residential detox and can arrange transportation for some levels of care. Ask about current intake and the appropriate level of support. For overdose, severe withdrawal, or immediate medical danger call 911.", locationLine: "Connecticut statewide · 24/7 addiction-treatment linkage" }),
  statewide({ id: "ct-urgent-211-crisis", name: "2-1-1 Connecticut — crisis and urgent community help", phone: "211", alternatePhone: "1-800-203-1234", link: "https://www.211ct.org/", source: "Connecticut DMHAS Finding Services; 211 Connecticut", description: "Call 211 for Connecticut crisis, shelter, and community-service referrals. For immediate danger call 911; for suicide or emotional crisis support call or text 988.", locationLine: "Connecticut statewide · referral line; not an emergency dispatch service" }),
  ...lmhas.filter(([id]) => ["bridgeport", "new-haven", "hartford", "waterbury", "danbury", "torrington"].includes(id)).map(([id, name, city, address, phone]) => local({
    id: `ct-crisis-${id}`, name: `${name} — crisis intervention`, city, address,
    phone: id === "bridgeport" ? "1-800-586-9903" : id === "hartford" ? "860-297-0999" : id === "waterbury" || id === "torrington" ? "1-888-447-3339" : phone,
    description: `Connecticut DMHAS lists ${name} for its regional behavioral-health catchment. Call to reach the appropriate crisis or walk-in pathway and confirm hours and town eligibility. These are regional services; if there is immediate medical danger call 911, and for 24/7 suicide or emotional crisis counseling call or text 988.`,
    link: dmhas, source: "Connecticut DMHAS Local Mental Health Authorities directory",
    locationLine: `${city}, Connecticut · regional crisis contact · verify hours and eligibility`,
  })),
];
