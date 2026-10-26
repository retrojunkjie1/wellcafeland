// Maine resource records reviewed against DHHS, DACF and MaineHousing sources
// on 2026-10-25. Source review does not confirm by phone, capacity or eligibility.
const reviewed = (record) => ({
  ...record,
  state: "ME",
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-25",
});
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const foodSource = "Maine Department of Agriculture, Conservation and Forestry — TEFAP food assistance listings by town";
const pantries = [
  ["acton", "Acton Food Pantry", "Acton", "59 H Road, Acton, ME", "207-977-0228", "First Monday monthly, 10–11 a.m. and 4–6 p.m."],
  ["albion", "Loaves and Fishes", "Albion", "123 Benton Road, Albion, ME", "207-680-0254", "First and third Thursdays monthly, 9–11 a.m."],
  ["alfred", "First County Food Pantry", "Alfred", "5 Swetts Bridge Road, Alfred, ME", "207-459-2232", "Tuesday and Friday, 11 a.m.–3 p.m."],
  ["andover", "Andover Food Pantry", "Andover", "23 Elm Street, Andover, ME", "207-392-4678", "Tuesdays, 8:30–10 a.m."],
  ["anson", "CenterPoint Community Church Food Pantry", "Anson", "15 Church Street, Anson, ME", "207-431-0458", "Tuesdays, 10 a.m.–noon."],
  ["ashland", "Ashland Food Pantry", "Ashland", "31-A Station Street, Ashland, ME", "207-551-6996", "Monthly schedule varies; call to confirm the next distribution."],
  ["belgrade", "Belgrade-Rome Special Needs Food Pantry", "Belgrade", "508 Smithfield Road, Belgrade, ME", "207-495-2258", "Tuesdays, 9–11 a.m."],
  ["bethel", "Bethel Area District Exchange and Food Pantry", "Bethel", "279 Walkers Mills Road, Bethel, ME", "207-824-0369", "Mondays, Wednesdays and Saturdays, 9–11 a.m.; client-choice model."],
  ["biddeford-meal", "Bon Appetit Community Meal Program", "Biddeford", "19 Crescent Street, Biddeford, ME", "207-569-4726", "Weekdays, meals served 4:30–5:30 p.m."],
  ["bingham", "St. Peter Thrift Shop and Food Pantry", "Bingham", "272 Main Street, Bingham, ME", "207-717-3236", "First Wednesday monthly; call to confirm hours."],
  ["blue-hill", "Tree of Life Food Pantry", "Blue Hill", "23 South Street, Blue Hill, ME", "207-374-2900", "Thursdays, 9 a.m.–1 p.m."],
  ["buckfield", "Buckfield Food Pantry", "Buckfield", "56 Turner Street, Buckfield, ME", "207-336-2776", "Second Wednesday monthly; call to confirm hours."],
  ["bucksport", "Bucksport Community Concerns Food Pantry", "Bucksport", "181 Franklin Street, Bucksport, ME", "207-217-1173", "Wednesdays 9:30–11:30 a.m. and Mondays 5–7 p.m."],
  ["burlington", "Burlington Food Pantry", "Burlington", "1510 Long Ridge Road, Burlington, ME", "207-794-4181", "Every other Friday, 9 a.m.–noon."],
  ["buxton", "Buxton Community Cupboard", "Buxton", "938 Long Plains Road, Buxton, ME", "207-929-6764", "Fridays 9:30–10:30 a.m.; first Saturdays 9–10 a.m."],
  ["calais", "Irene Chadbourne Ecumenical Food Pantry", "Calais", "513 Main Street, Calais, ME", "207-659-1512", "Monday and Thursday hours; call to confirm the current schedule."],
  ["cumberland", "Community Food Pantry", "Cumberland", "290 Tuttle Road, Cumberland, ME", "207-558-9121", "Every other Friday, 3–6 p.m."],
  ["danforth", "Town of Danforth Food Pantry", "Danforth", "85 Bancroft Road, Danforth, ME", "207-538-6954", "Multiple monthly distributions; call to confirm the next date."],
  ["deer-isle", "Island Food Pantry", "Stonington", "6 Memorial Lane, Stonington, ME (Deer Isle area)", "207-460-1776", "Thursdays, 5–6:30 p.m.; schedule excludes fifth Thursdays."],
  ["dixfield", "Dixfield Food Pantry", "Dixfield", "2 Chapel Road, Dixfield, ME", "207-491-9829", "Monday and Thursday; call to confirm current hours."],
  ["dover-foxcroft", "Dover-Foxcroft Area Food Center", "Dover-Foxcroft", "76 North Street, Dover-Foxcroft, ME", "207-802-8230", "By appointment; ask for the food-center appointment line."],
  ["fort-fairfield", "Basket of Blessings", "Fort Fairfield", "298 Main Street, Fort Fairfield, ME", "207-325-1635", "Monthly distribution dates vary; call to confirm."],
  ["fort-kent", "Greater Fort Kent Ecumenical Food Pantry", "Fort Kent", "229 West Main Street, Suite 103, Fort Kent, ME", "207-834-4126", "First, third and fifth Wednesdays 5–6 p.m.; second and fourth Wednesdays 9–10 a.m."],
  ["freeport", "Freeport Community Services Food Pantry", "Freeport", "53 Depot Street, Freeport, ME", "207-865-3985", "Ask for extension 214; weekday pantry hours and meal schedule are listed by DACF."],
  ["frenchville", "St. Luce Food Pantry", "Frenchville", "441 U.S. Route 1, Frenchville, ME", "207-728-4635", "Last Saturday monthly, 9 a.m.–noon."],
  ["friendship", "Friendship / Cushing Food Pantry", "Friendship", "8 Kaler Lane, Friendship, ME", "207-832-7644", "Saturdays, 9 a.m.–noon."],
  ["fryeburg-chapel", "North Fryeburg Community Chapel Food Pantry", "Fryeburg", "3 North Fryeburg Road, Fryeburg, ME", "207-697-8020", "Tuesdays, 4–5:30 p.m."],
  ["fryeburg-dinner", "Dinner Bell North community meal", "Fryeburg", "857 Main Street, Fryeburg, ME", "603-662-8386", "Wednesdays, 4:45–6:30 p.m. while MSAD 72 is in session."],
  ["fryeburg-harvest", "Harvest of Hope", "Fryeburg", "8 Drift Road, Fryeburg, ME", "207-935-3129", "By appointment; call before traveling."],
  ["gardiner", "Faith Food Pantry", "Gardiner", "280 Brunswick Avenue, Gardiner, ME", "207-203-0002", "Monthly schedule varies; call to confirm the next distribution."],
  ["gorham", "The Orchard Community Church Food Pantry", "Gorham", "1 North Street, Gorham, ME", "207-730-1810", "Second, third and fourth Saturdays, 9:30 a.m.–noon."],
  ["hallowell", "Hallowell Food Pantry", "Hallowell", "124 Second Street, Hallowell, ME", "207-992-6899", "Fridays, 10–11 a.m. and 1–2 p.m.; DACF listing says Hallowell residents only."],
  ["hampden", "Hampden Neighborhood Food Cupboard", "Hampden", "101 Main Road North, Hampden, ME", "207-944-6944", "Wednesday and Friday hours are listed by DACF; call to confirm."],
  ["harmony", "Harmony Cares Food Pantry", "Harmony", "20 Main Street, Harmony, ME", "207-249-1676", "First and third Saturdays; call to confirm service-area and schedule details."],
  ["harrison", "Harrison Food Bank", "Harrison", "176 Waterford Road, Harrison, ME", "207-647-3384", "Tuesdays, noon–6 p.m."],
  ["hartland", "Tri-Town Food Cupboard", "Hartland", "9A Hubbard Avenue, Hartland, ME", "207-938-2698", "Wednesdays, 9:30–11:30 a.m.; last Wednesday, 4–5 p.m."],
  ["holden", "CHEFS food pantry", "Holden", "202 Kidder Hill Road, Holden, ME", "207-356-7241", "Thursdays and second/fourth Sundays; call to confirm hours."],
  ["hollis", "Hollis Center Church Food Pantry", "Hollis Center", "388 Hollis Road, Hollis Center, ME", "207-929-4711", "Thursdays, 10–11 a.m."],
  ["houlton", "Mildred's Food Pantry", "Houlton", "112 Military Street, Houlton, ME", "207-694-1006", "Tuesdays and Thursdays, 8:30–10:30 a.m."],
  ["lubec", "Lubec Community Outreach Center", "Lubec", "44 South Street, Lubec, ME", "207-733-5262", "Second Saturday monthly, 9:30 a.m.–noon."],
  ["machias", "Machias Area Food Pantry", "Machias", "43 Kennebec Road, Machias, ME", "207-259-6044", "Monday distribution; call the pantry line to confirm current hours."],
  ["madison", "People Who Care Food Cupboard", "Madison", "376 Lakewood Road, Madison, ME", "207-399-0452", "Wednesday and Saturday mornings; call to confirm service-area eligibility."],
  ["mars-hill", "Mars Hill Community Cupboard", "Mars Hill", "10 ACI Street, Mars Hill, ME", "207-429-9041", "Second and fourth Tuesdays; call to confirm the current schedule."],
  ["milbridge", "Hand in Hand / Mano en Mano", "Milbridge", "4 Maple Street, Milbridge, ME", "207-546-3006", "Weekday access listed by DACF; call to confirm current food services."],
  ["norridgewock", "People Who Care — Norridgewock", "Norridgewock", "22 Main Street, Norridgewock, ME", "207-399-0452", "First and third Thursdays, 9–11 a.m."],
  ["north-berwick", "North Berwick Food Pantry", "North Berwick", "77 High Street, North Berwick, ME", "207-606-4581", "Mondays, 3:15–5:45 p.m."],
  ["north-monmouth", "North Monmouth Food Pantry", "North Monmouth", "151 North Main Street, North Monmouth, ME", "207-933-2400", "Tuesdays, 11:30 a.m.–12:30 p.m. and 4:30–5:30 p.m."],
  ["north-vassalboro", "Vassalboro Food Station Pantry", "North Vassalboro", "679 Main Street, North Vassalboro, ME", "207-873-7375", "Thursdays, 11 a.m.–noon."],
  ["orland", "H.O.M.E. Co-Op Food Pantry", "Orland", "90 School House Road, Orland, ME", "207-469-7961", "Ask for extension 3; weekday hours are listed by DACF."],
  ["otis", "What's for Suppa? Food Pantry", "Otis", "638 Otis Road, Otis, ME", "207-537-3412", "Third Wednesday monthly, noon–2 p.m."],
  ["patten", "Patten Community Food Cupboard", "Patten", "7 Houlton Street, Patten, ME", "207-731-4055", "Tuesday and Thursday; call to confirm current hours."],
  ["perry", "Passamaquoddy Food Pantry", "Perry", "22 Bayview Drive, Perry, ME", "207-853-5139", "Weekday hours are listed by DACF; call to confirm current schedule."],
  ["phillips", "Phillips Area Food Pantry", "Phillips", "31 Main Street, Phillips, ME", "207-491-0118", "Monday and Thursday service; call to confirm current hours."],
  ["poland", "Poland Community Food Bank", "Poland", "1208 Maine Street, Poland, ME", "207-998-4069", "Wednesdays and Saturdays; call to confirm hours."],
  ["saco-pantry", "Saco Food Pantry, Inc.", "Saco", "67 Ocean Park Road, Saco, ME", "207-468-1305", "Weekday pantry hours are listed by DACF; call before traveling."],
  ["saco-meals", "Saco Community Meals Program", "Saco", "271 Main Street, Saco, ME", "207-298-5812", "Mondays and Thursdays, 4:15–6 p.m."],
  ["sanford-salvation-army", "The Salvation Army — Sanford food pantry", "Sanford", "871 Main Street, Sanford, ME", "603-534-4877", "Mondays, 10 a.m.–noon; call to confirm Maine service and current intake."],
  ["south-berwick", "South Berwick Community Food Pantry", "South Berwick", "47 Ross Street, South Berwick, ME", "207-384-4324", "Thursday evenings and first/third Friday mornings; call to confirm."],
  ["south-portland", "South Portland Food Cupboard", "South Portland", "445 Western Avenue, South Portland, ME", "585-478-0666", "Tuesday, Thursday and first Wednesday schedules are listed by DACF; confirm before traveling."],
  ["southwest-harbor", "Common Good Soup Kitchen and Pantry", "Southwest Harbor", "19 Clark Point Road, Southwest Harbor, ME", "207-244-3007", "Pantry and community meal schedules are listed by DACF; call to confirm."],
  ["unity", "The Open Door food pantry", "Unity", "180 Depot Street, Unity, ME", "207-722-3645", "Thursdays, 10:30 a.m.–noon."],
  ["van-buren", "St. Peter Chanel Parish Food Pantry", "Van Buren", "52 Main Street, Van Buren, ME", "207-694-9199", "Monthly Thursday distribution; call to confirm date and hours."],
  ["vinalhaven", "Vinalhaven Food Pantry", "Vinalhaven", "25 East Main Street, Vinalhaven, ME", "207-863-2001", "Monthly Friday distribution; call to confirm date and hours."],
  ["waldoboro", "Waldoboro Food Pantry", "Waldoboro", "124 Friendship Street, Waldoboro, ME", "207-542-3855", "First and third Tuesdays monthly; DACF says it serves Waldoboro, Bremen and Nobleboro."],
  ["warren", "Bread for the Journey — Warren Food Pantry", "Warren", "44 School Street, Warren, ME", "207-273-0051", "Thursdays, 9–11 a.m."],
  ["washington", "Washington Food Pantry", "Washington", "33 Liberty Road, Washington, ME", "207-845-2101", "Monthly Wednesday distribution; call to confirm date and hours."],
];

export const MAINE_FOOD = pantries.map(([key, name, city, address, phone, schedule]) => local({
  id: `me-food-${key}`, name, city, address, phone,
  description: `Maine DACF lists this local food-access program. Published schedule: ${schedule} Call before traveling to confirm today's hours, service area, eligibility, and food availability.`,
  link: "https://www.maine.gov/dacf/ard/food-assistance/tefap/bytown.shtml",
  source: foodSource, locationLine: `${city}, Maine · call to confirm schedule and access`,
}));

const shelterSource = "MaineHousing Emergency Shelter and Homelessness Resources List";
const shelters = [
  ["hope-haven-lewiston", "Hope Haven Gospel Mission", "Lewiston", "207-783-6086", "General emergency shelter"],
  ["new-beginnings-lewiston", "New Beginnings", "Lewiston", "207-795-4070", "Youth shelter"],
  ["rgh-leeds", "Rumford Group Homes — Leeds Family Center", "Leeds", "207-357-5561", "Family shelter"],
  ["rcam-leeds", "Rural Community Action Ministries", "Leeds", "207-524-5095", "Family shelter"],
  ["safe-voices-auburn", "Safe Voices", "Auburn", "800-559-2927", "Domestic-violence shelter and support"],
  ["st-martin-lewiston", "St. Martin de Porres Residence", "Lewiston", "207-786-4690", "Adult shelter"],
  ["hsa-presque-isle", "Homeless Services of Aroostook — Sr. Mary O'Donnell Shelter", "Presque Isle", "207-764-4125", "General shelter"],
  ["hope-justice-aroostook", "Hope and Justice Project", "Caribou", "800-439-2323", "Domestic-violence services; locations include Caribou, Houlton and Fort Kent"],
  ["maliseet-houlton", "Maliseet Domestic Violence & Sexual Assault Program", "Houlton", "207-532-6401", "Domestic-violence support"],
  ["portland-hsc", "City of Portland Homeless Services Center", "Portland", "207-761-2072", "Adult shelter"],
  ["portland-family", "City of Portland Family Shelter", "Portland", "207-772-8339", "Family shelter"],
  ["milestone-portland", "Milestone Recovery", "Portland", "207-775-4790", "Substance-use recovery shelter for men"],
  ["preble-elenas-way", "Preble Street — Elena's Way", "Portland", "207-775-0026", "Adult shelter"],
  ["preble-florence", "Preble Street — Florence House", "Portland", "207-699-4392", "Shelter for women"],
  ["preble-teen", "Preble Street — Joe Kreisler Teen Shelter", "Portland", "207-775-0026", "Youth shelter"],
  ["tedford-family", "Tedford Housing — Family Shelter", "Brunswick", "207-729-1161", "Family shelter; ask for extension 113"],
  ["tedford-individual", "Tedford Housing — Individual Shelter", "Brunswick", "207-729-1161", "Adult shelter; ask for extension 104"],
  ["gathering-brunswick", "The Gathering Place", "Brunswick", "207-729-0288", "Housing navigation"],
  ["through-doors-portland", "Through These Doors", "Portland", "800-537-6066", "Domestic-violence support"],
  ["wmca-wilton", "Western Maine Community Action", "East Wilton", "207-645-3764", "Housing navigation"],
  ["home-dorr", "H.O.M.E. Inc. — Dorr House", "Orland", "207-469-7961", "General shelter"],
  ["home-emmaus", "H.O.M.E. Inc. — Emmaus", "Ellsworth", "207-667-3962", "General shelter"],
  ["home-ahern", "H.O.M.E. Inc. — Sister Mary Ahern House", "Orland", "207-469-7961", "Family shelter"],
  ["home-francis", "H.O.M.E. Inc. — St. Francis Inn", "East Orland", "207-469-7961", "General shelter"],
  ["next-step-ellsworth", "The Next Step — Ellsworth", "Ellsworth", "800-315-5579", "Domestic-violence support"],
  ["bread-life-augusta", "Bread of Life Ministries", "Augusta", "207-626-3434", "General shelter"],
  ["family-violence-augusta", "Family Violence Project", "Augusta", "877-890-7788", "Domestic-violence shelter and support"],
  ["midmaine-waterville", "Mid-Maine Homeless Shelter", "Waterville", "207-872-8082", "General shelter"],
  ["sisters-arms-augusta", "Sisters in Arms Center", "Augusta", "207-530-0466", "Women veterans housing support"],
  ["homeworthy-rockport", "Homeworthy", "Rockport", "207-593-8151", "General shelter"],
  ["new-hope-midcoast", "New Hope Midcoast", "Rockland", "800-522-3304", "Domestic-violence support"],
  ["rgh-monier", "Rumford Group Homes — Monier Family Center", "Rumford", "207-357-5561", "General shelter"],
  ["rgh-norway", "Rumford Group Homes — Norway Family Center", "Norway", "207-357-5561", "Shelter for women and children"],
  ["rgh-rumford", "Rumford Group Homes — Rumford Family Center", "Rumford", "207-357-5561", "General shelter"],
  ["bangor-shelter", "Bangor Area Homeless Shelter", "Bangor", "207-947-0092", "General shelter"],
  ["community-care-bangor", "Community Care", "Bangor", "207-945-4240", "Youth shelter"],
  ["partners-peace", "Partners for Peace", "Bangor", "800-863-9909", "Domestic-violence support"],
  ["preble-hope-house", "Preble Street — Hope House", "Bangor", "207-217-6713", "Adult shelter"],
  ["shepherd-bangor", "The Shepherd's Godparent Home", "Bangor", "207-949-2273", "Housing support for pregnant women"],
  ["family-violence-somerset", "Family Violence Project — Somerset County", "Somerset County", "877-890-7788", "Domestic-violence support"],
  ["new-hope-solon", "New Hope Shelter", "Solon", "207-643-6015", "Shelter for women and children"],
  ["passamaquoddy", "Passamaquoddy Peaceful Relations", "Pleasant Point", "877-853-2613", "Domestic-violence support"],
  ["next-step-machias", "The Next Step — Machias", "Machias", "800-315-5579", "Domestic-violence support"],
  ["caring-unlimited-sanford", "Caring Unlimited", "Sanford", "800-239-7298", "Domestic-violence support"],
  ["seeds-hope-sanford", "Seeds of Hope Family Center", "Sanford", "207-636-5527", "Family shelter"],
];

export const MAINE_HOUSING = shelters.map(([key, name, city, phone, service]) => local({
  id: `me-housing-${key}`, name, city, phone,
  description: `MaineHousing lists this ${service.toLowerCase()} resource in ${city}. The state listing provides town and phone but no street address. Call to ask about today's intake process, eligibility, address, and available capacity before traveling.`,
  link: "https://mainehousing.org/programs-services/homeless/emergency-shelters",
  source: shelterSource, locationLine: `${city}, Maine · ${service} · call for current intake and address`,
}));

export const MAINE_TREATMENT = [statewide({
  id: "me-dhhs-treatment-connection", name: "Maine DHHS Treatment Connection — licensed substance-use and mental-health providers",
  city: "Augusta", description: "Maine DHHS partners with Treatment Connection to help locate licensed providers by ZIP code, distance, treatment type, and substance treated. DHHS says it reviews providers before listing them. Use the locator to identify a local provider, then confirm its current services, intake, cost, and availability directly.",
  link: "https://www1.maine.gov/dhhs/treatment-connection", source: "Maine Department of Health and Human Services", locationLine: "Maine statewide · search by ZIP code and service need",
})];

export const MAINE_PEER = [
  statewide({ id: "me-peer-warmline", name: "Intentional Peer Support Warm Line", city: "Augusta", phone: "866-771-9276", description: "Free 24/7 peer-to-peer phone support from trained specialists with lived experience of mental-health or substance-use challenges and recovery. Call 711 for Maine Relay.", link: "https://www.maine.gov/dhhs/about/contact/hotlines", source: "Maine DHHS hotline directory", locationLine: "Maine statewide · 24 hours a day, 7 days a week" }),
  statewide({ id: "me-peer-recovery-supports", name: "Maine DHHS substance-use recovery supports", city: "Augusta", description: "Maine DHHS lists recovery support services and related state resources. Ask the Office of Behavioral Health or 211 for community recovery centers, peer groups, and current local schedules.", link: "https://www.maine.gov/dhhs/obh/get-support/substance-use-disorder/recovery-support-services", source: "Maine Department of Health and Human Services, Office of Behavioral Health", locationLine: "Maine statewide · ask for local peer and recovery-community options" }),
];

export const MAINE_BENEFITS = [
  statewide({ id: "me-snap-apply", name: "Maine SNAP / Food Supplement — apply or ask about a case", city: "Augusta", phone: "855-797-4357", description: "Apply online through My Maine Connection, by phone, or in person at a DHHS office. Interpretation is available on request. The state determines eligibility; call for current document requirements and application help.", link: "https://www.maine.gov/dhhs/ofi/programs-services/food-supplement", source: "Maine DHHS Office for Family Independence", locationLine: "Maine statewide · SNAP application and case support" }),
  statewide({ id: "me-general-assistance", name: "Maine General Assistance — local town office", city: "Augusta", description: "Maine's General Assistance program is administered locally. Contact the municipality where you live or call 211 to find the correct local office and ask about emergency eligibility, documents, and application steps.", link: "https://www.maine.gov/dhhs/ofi/programs-services/general-assistance", source: "Maine Department of Health and Human Services", locationLine: "Maine statewide · contact your municipality for intake" }),
];

export const MAINE_URGENT = [
  statewide({ id: "me-crisis-line", name: "Maine Crisis Line — behavioral-health crisis support", city: "Augusta", phone: "888-568-1112", description: "Free, confidential crisis telephone support and stabilization for people or families experiencing a behavioral-health crisis or thoughts of suicide or self-harm. Available 24/7; Maine Relay 711.", link: "https://www.maine.gov/dhhs/about/contact/hotlines", source: "Maine DHHS hotline directory", locationLine: "Maine statewide · call 24/7" }),
  statewide({ id: "me-988", name: "988 Suicide & Crisis Lifeline", city: "Augusta", phone: "988", description: "Call or text 988, or use the 988 chat, for free and confidential 24/7 crisis support. For immediate physical danger or urgent medical need, call 911.", link: "https://www.maine.gov/dhhs/about/contact/hotlines", source: "Maine DHHS hotline directory", locationLine: "Maine statewide · call, text or chat 24/7" }),
  statewide({ id: "me-domestic-violence-line", name: "Maine Domestic Violence Helpline", city: "Augusta", phone: "866-834-4357", description: "Connects callers with advocates at Maine domestic-violence resource centers for crisis counseling, emotional support, information, and advocacy. Call for confidential support and a safe next step.", link: "https://www.maine.gov/dhhs/about/contact/hotlines", source: "Maine DHHS hotline directory", locationLine: "Maine statewide · confidential support" }),
  statewide({ id: "me-211", name: "211 Maine — local support and service navigation", city: "Augusta", phone: "211", description: "Call 211 for help finding community services, including food, housing, behavioral health, and other local support. Available 24 hours; outside Maine call 1-877-463-6207.", link: "https://211maine.org/", source: "Maine DHHS and 211 Maine", locationLine: "Maine statewide · call 24/7" }),
  statewide({ id: "me-911", name: "Emergency services — immediate danger", city: "Augusta", phone: "911", description: "Call 911 for immediate physical danger, serious injury, or urgent medical need.", link: "https://www.911.gov/calling-911/", source: "U.S. National 911 Program", locationLine: "Maine statewide · emergency response" }),
];

export const MAINE_DIRECTORY_COUNT = MAINE_FOOD.length + MAINE_HOUSING.length + MAINE_TREATMENT.length + MAINE_PEER.length + MAINE_BENEFITS.length + MAINE_URGENT.length;
