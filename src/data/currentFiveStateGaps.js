// Source-reviewed contact and access-point additions for MT, NE, NV, NH and SC.
// These are published routes, not phone-confirmed services or exhaustive coverage.
const checkedAt = "2026-10-30";
const entry = ({ id, state, name, city, address, phone, email, hours, serviceArea, url, source, resourceType, description, coverageScope }) => ({
  id, state, name, city, address, phone, email, hours, serviceArea, link: url, source,
  resourceType, description, coverageScope: coverageScope || (city ? "city" : "state"),
  locationLine: [city, serviceArea, "contact to confirm current access"].filter(Boolean).join(" · "),
  verified: true, sourceReviewed: true, phoneConfirmed: false, exhaustiveCoverage: false, checkedAt,
});

const mtBenefitSource = "Montana DPHHS Field Offices of Public Assistance";
export const MONTANA_PUBLIC_ASSISTANCE = [
  ["anaconda", "Anaconda", "307 East Park, Room 305, Anaconda, MT 59711", "hhshcsopadeerlodge@mt.gov", "Deer Lodge County"],
  ["billings", "Billings", "111 North 31st Street, Billings, MT 59101", "hhshcsopayellowstone@mt.gov", "Yellowstone County"],
  ["bozeman", "Bozeman", "12 North 3rd, Bozeman, MT 59715", "hhshcsopagallatin@mt.gov", "Gallatin County"],
  ["browning", "Browning", "121 First Avenue NW, Browning, MT 59417", "hhshcsopaglacier@mt.gov", "Glacier County"],
  ["butte", "Butte", "700 Casey Street, Butte, MT 59701", "hhshcsopasilverbow@mt.gov", "Silver Bow County"],
  ["glasgow", "Glasgow", "630 2nd Avenue South, Suite C, Glasgow, MT 59230", "hhshcsopavalley@mt.gov", "Valley County"],
  ["great-falls", "Great Falls", "201 First Street South, Suite 1, Great Falls, MT 59403", "hhshcsopacascade@mt.gov", "Cascade County"],
  ["hamilton", "Hamilton", "310 North Third Street, Hamilton, MT 59840", "hhshcsoparavalli@mt.gov", "Ravalli County"],
  ["hardin", "Hardin", "410 North Center, Hardin, MT 59034", "hhshcsopabighorn@mt.gov", "Big Horn County"],
  ["havre", "Havre", "Ryan Building, 48 Second Avenue, Suite 200, Havre, MT 59501", "hhshcsopahill@mt.gov", "Hill County"],
  ["helena", "Helena", "2021 North Montana Avenue, Helena, MT 59601", "hhshcsopalewis&clark@mt.gov", "Lewis and Clark County"],
  ["kalispell", "Kalispell", "121 Financial Drive, Suite D, Kalispell, MT 59901", "hhshcsopaflathead@mt.gov", "Flathead County"],
  ["lame-deer", "Lame Deer", "228 Montana Avenue, Lame Deer, MT 59043", "hhshcsopalamedeer@mt.gov", "Northern Cheyenne service area"],
  ["lewistown", "Lewistown", "312 Birch Street, Suite 1, Lewistown, MT 59457", "hhshcsopafergus@mt.gov", "Fergus County"],
  ["libby", "Libby", "933 Farm to Market Road, Suite C, Libby, MT 59923", "hhshcsopalincoln@mt.gov", "Lincoln County"],
  ["miles-city", "Miles City", "219 North Merriam Avenue, Miles City, MT 59301-2700", "hhshcsopacuster@mt.gov", "Custer County"],
  ["missoula", "Missoula", "2677 Palmer, Suite 100, Missoula, MT 59808", "hhshcsopamissoula@mt.gov", "Missoula County"],
  ["polson", "Polson", "49627 Highway 93, Polson, MT 59860", "hhshcsopalake@mt.gov", "Lake County"],
  ["wolf-point", "Wolf Point", "131 Front Street, Suite B, Wolf Point, MT 59201", "hhshcsoparoosevelt@mt.gov", "Roosevelt County"],
].map(([id, city, address, email, serviceArea]) => entry({
  id: `mt-benefit-${id}`, state: "MT", name: `Montana Office of Public Assistance — ${city}`, city, address, email,
  phone: "1-888-706-1535", hours: "Monday–Friday, 8 a.m.–5 p.m.", serviceArea,
  url: "https://dphhs.mt.gov/HCSD/OfficeofPublicAssistance", source: mtBenefitSource,
  resourceType: "public assistance application and case-support office",
  description: `Montana DPHHS lists this local Office of Public Assistance serving ${serviceArea}. The statewide helpline is 1-888-706-1535; the published local contact is ${email}. Office hours are Monday–Friday, 8 a.m.–5 p.m. Contact DPHHS to confirm available programs, appointment or walk-in arrangements, required documents, and current access before traveling.`,
  coverageScope: "county",
}));

export const MONTANA_PEER_ACCESS = [
  ["recovery-point-bozeman", "Recovery Point — peer recovery resource center", "Bozeman", "2000 North 7th Avenue, Bozeman, MT 59715", "406-215-2707", "Monday–Friday, 9 a.m.–5 p.m.", "https://www.greaterimpact.us/recoverypoint", "Greater Impact / Recovery Point"],
  ["hrdc-drop-in-bozeman", "HRDC Drop-In Center — peer connection and stability support", "Bozeman", "208 East Griffin Drive, Bozeman, MT 59715", "406-585-4873", "Tuesday–Friday, 9 a.m.–noon walk-in; afternoons by appointment", "https://hrdc9.galaxydigital.com/agency/detail/?agency_id=150461", "HRDC Drop-In Center program page"],
  ["aware-peer-butte", "AWARE — community peer support service location", "Butte", undefined, "406-563-8117", undefined, "https://www.aware-inc.org/service/peer-support/", "AWARE Peer Support"],
  ["aware-peer-helena", "AWARE — community peer support service location", "Helena", undefined, "406-563-8117", undefined, "https://www.aware-inc.org/service/peer-support/", "AWARE Peer Support"],
  ["aware-peer-missoula", "AWARE — community peer support service location", "Missoula", undefined, "406-563-8117", undefined, "https://www.aware-inc.org/service/peer-support/", "AWARE Peer Support"],
  ["aware-peer-libby", "AWARE — community peer support service location", "Libby", undefined, "406-563-8117", undefined, "https://www.aware-inc.org/service/peer-support/", "AWARE Peer Support"],
  ["aware-peer-hamilton", "AWARE — community peer support service location", "Hamilton", undefined, "406-563-8117", undefined, "https://www.aware-inc.org/service/peer-support/", "AWARE Peer Support"],
  ["par-billings", "Power for Abundant Recovery — peer support center", "Billings", "2335 Lewis Avenue, Billings, MT 59101", undefined, undefined, "https://abundantrecovery.org/about-us/peer-support-center/", "Power for Abundant Recovery Peer Support Center"],
].map(([slug, name, city, address, phone, hours, url, source]) => entry({
  id: `mt-peer-${slug}`, state: "MT", name, city, address, phone, hours,
  serviceArea: city, url, source, resourceType: "peer and recovery-community support",
  description: `${source} identifies ${name} in ${city}${address ? ` at ${address}` : ""}${phone ? `, phone ${phone}` : ""}. ${slug.startsWith("aware-") ? "AWARE describes peer and natural-support services and lists this community among its service locations; call to ask how local support is delivered and whether appointments are available." : "Ask about current groups, eligibility, accessibility, appointment requirements, and schedule before visiting."} Peer support complements clinical care and is not an emergency response service.`,
}));

const neBenefitSource = "Nebraska DHHS ACCESSNebraska Kiosk Locations";
const neKiosks = [
  ["center", "Center", "309 Bazile Street, Center, NE"], ["chadron", "Chadron", "1033 East 3rd Street, Chadron, NE"],
  ["gering", "Gering", "1600 10th Street, Gering, NE"], ["lexington-dhhs", "Lexington", "200 West 7th Street, Suite 1, Lexington, NE"],
  ["lexington-community", "Lexington", "1501 Plum Creek Parkway, Suite 4, Lexington, NE"], ["north-platte", "North Platte", "200 South Silber Avenue, North Platte, NE"],
  ["ogallala", "Ogallala", "201 East 5th Street, Ogallala, NE"], ["sidney", "Sidney", "1000 10th Avenue, Sidney, NE"],
  ["scottsbluff", "Scottsbluff", "250114 Skyport Drive, Scottsbluff, NE"], ["broken-bow", "Broken Bow", "2475 South E Street, Broken Bow, NE"],
  ["geneva", "Geneva", "855 North First Street, Geneva, NE"], ["grand-island-pine", "Grand Island", "208 North Pine Street, Grand Island, NE"],
  ["grand-island-capital", "Grand Island", "2300 West Capital Avenue, Grand Island, NE"], ["hastings", "Hastings", "300 North St. Joseph Avenue, Hastings, NE"],
  ["kearney", "Kearney", "24 West 16th Street, Kearney, NE"], ["ord", "Ord", "801 South Street, Suite 2, Ord, NE"],
  ["ainsworth", "Ainsworth", "644 East 4th Street, Ainsworth, NE"], ["columbus", "Columbus", "2365 39th Street, Columbus, NE"],
  ["dakota-city", "Dakota City", "1401 Pine Street, Dakota City, NE"], ["fremont-military", "Fremont", "1959 East Military Avenue, Fremont, NE"],
  ["fremont-broad", "Fremont", "839 South Broad Street, Fremont, NE"], ["norfolk", "Norfolk", "209 North 5th Street, Norfolk, NE"],
  ["oneill", "O'Neill", "128 North 6th Street, O'Neill, NE"], ["pender", "Pender", "415 Main Street, Pender, NE"],
  ["lavista", "La Vista", "8044 South 84th Street, La Vista, NE"], ["omaha-42nd", "Omaha", "1215 South 42nd Street, Omaha, NE"],
  ["omaha-24th", "Omaha", "1500 North 24th Street, Suite 102, Omaha, NE"], ["omaha-ames", "Omaha", "5752 Ames Avenue, Omaha, NE"],
].map(([slug, city, address]) => entry({
  id: `ne-benefit-kiosk-${slug}`, state: "NE", name: `ACCESSNebraska public self-service kiosk — ${city}`, city, address,
  phone: "1-800-383-4278", serviceArea: city,
  url: "https://dhhs.ne.gov/Documents/ACCESSNebraskaKiosks.pdf", source: neBenefitSource,
  resourceType: "public benefits self-service kiosk location",
  description: `Nebraska DHHS lists this public kiosk location for ACCESSNebraska self-service. Residents can use the official portal to apply for or manage economic-assistance programs; the kiosk is not represented as a staffed intake office. Call 1-800-383-4278 or visit ACCESSNebraska to confirm the kiosk is available, what services it supports, and whether staff assistance is present before traveling.`,
}));

export const NEBRASKA_KIOSK_BENEFITS = neKiosks;
export const NEBRASKA_CONSUMER_PEER = [entry({
  id: "ne-peer-office-consumer-affairs", state: "NE", name: "Nebraska DHHS Office of Consumer Affairs — peer support and advocacy", city: "Lincoln",
  address: "P.O. Box 95026, Lincoln, NE 68509-5026", phone: "402-471-7766", email: "dhhs.dbhoca@nebraska.gov",
  serviceArea: "Nebraska statewide", coverageScope: "state",
  url: "https://dhhs.ne.gov/Pages/Consumer-Advocacy.aspx", source: "Nebraska DHHS Office of Consumer Affairs",
  resourceType: "peer-support system navigation and consumer advocacy contact",
  description: "Nebraska DHHS says its Office of Consumer Affairs leads the Division of Behavioral Health's support of recovery and supports consumer participation, lived-experience leadership, peer-support certification, and advocacy. Contact the office to ask about current peer programs, local connections, and eligibility; it is a navigation and advocacy office, not a clinical crisis line.",
})];

const neUrgent = [
  ["988", "988 Suicide & Crisis Lifeline — Nebraska access", "Statewide", "988", "Call, text, or chat for 24/7 crisis support; local emergency services are separate."],
  ["rural-response", "Nebraska Rural Response Hotline", "Statewide", "1-800-464-0258", "Nebraska DHHS lists this support for farm, ranch, and rural callers; ask the responder about crisis support and referrals."],
  ["region1-mental-health", "Region 1 Western Nebraska mental-health crisis line", "Scottsbluff", "1-877-492-7001", "Region 1 Behavioral Health Authority publishes this 24/7 crisis contact for its Panhandle service area."],
  ["region1-substance", "Region 1 substance-use crisis line", "Scottsbluff", "1-833-789-7177", "Region 1 Behavioral Health Authority publishes this substance-use crisis line; contact to confirm current local response and services."],
].map(([slug, name, city, phone, detail]) => entry({
  id: `ne-urgent-${slug}`, state: "NE", name, city, phone, serviceArea: "Nebraska; confirm local response coverage",
  url: slug.startsWith("region1") ? "https://region1bhs.net/services.html" : "https://dhhs.ne.gov/Pages/Addiction-Treatment-and-Recovery.aspx",
  source: slug.startsWith("region1") ? "Region 1 Behavioral Health Authority Emergency and Crisis Services" : "Nebraska DHHS behavioral-health crisis and recovery resources",
  resourceType: "crisis support and service navigation",
  description: `${detail} The listing does not promise an in-person response or guarantee immediate availability. For immediate danger or urgent medical emergency, call 911.`,
  coverageScope: city === "Statewide" ? "state" : "region",
}));
export const NEBRASKA_URGENT_ACCESS = neUrgent;

const nhBenefitSource = "New Hampshire DHHS District Offices, as listed by New Hampshire Family Voices";
const nhOffices = [
  ["berlin", "Berlin", "650 Main Street, Suite 200, Berlin, NH 03570", "603-752-7800", "800-972-6111", "Coos County and northern communities"],
  ["claremont", "Claremont", "17 Water Street, Suite 301, Claremont, NH 03743", "603-542-9544", "800-982-1001", "Western Sullivan County and neighboring towns"],
  ["concord", "Concord", "40 Terrill Park Drive, Concord, NH 03301", "603-271-6201", "800-322-9191", "Concord and central New Hampshire towns"],
  ["conway", "Conway", "73 Hobbs Street, Conway, NH 03818", "603-447-3841", "800-552-4628", "Mount Washington Valley and eastern Carroll County"],
  ["keene", "Keene", "111 Key Road, Keene, NH 03431", "603-357-3510", "800-624-9700", "Monadnock region and western Cheshire County"],
  ["laconia", "Laconia", "65 Beacon Street West, Laconia, NH 03246", "603-524-4485", "800-322-2121", "Lakes Region and central Belknap County"],
  ["littleton", "Littleton", "80 North Littleton Road, Littleton, NH 03561", "603-444-6786", "800-552-8959", "Northern Grafton and western Coos communities"],
  ["manchester", "Manchester", "1050 Perimeter Road, Suite 501, Manchester, NH 03103", "603-668-2330", "800-852-7493", "Manchester and nearby Hillsborough County towns"],
  ["rochester", "Rochester", "150 Wakefield Street, Suite 22, Rochester, NH 03867", "603-332-9120", "800-862-5300", "Rochester and surrounding Strafford County towns"],
  ["seacoast", "Portsmouth", "19 Rye Street, Portsmouth, NH 03801", "603-433-8300", "800-821-0326", "Seacoast and eastern Rockingham County towns"],
  ["nashua", "Nashua", "26 Whipple Street, Nashua, NH 03060", "603-883-7726", "800-852-0632", "Nashua and southern Hillsborough County towns"],
].map(([slug, city, address, phone, tollFree, serviceArea]) => entry({
  id: `nh-benefit-${slug}`, state: "NH", name: `New Hampshire DHHS District Office — ${city}`, city, address, phone,
  serviceArea, url: "https://nhfv.org/resources/district-offices-dos/", source: nhBenefitSource,
  resourceType: "state benefits and family-services district office",
  description: `New Hampshire's District Office listing identifies this local office serving ${serviceArea}. Programs include financial assistance, food stamps, Medicaid and other medical assistance, child care, and family services. Main number: ${phone}; toll-free: ${tollFree}. Contact the office to confirm program eligibility, application steps, appointment or walk-in access, and required documents.`,
  coverageScope: "region",
}));
export const NEW_HAMPSHIRE_BENEFIT_OFFICES = nhOffices;

const nhCrisisSource = "New Hampshire Community Behavioral Health Association, Emergency and Key Services";
const nhCrisis = [
  ["berlin", "Berlin", "603-752-7404", "Berlin and northern Coos area"], ["claremont", "Claremont", "800-564-2578", "Claremont and western Sullivan County"],
  ["colebrook", "Colebrook", "603-237-4955", "Colebrook and northern Coos communities"], ["concord", "Concord", "844-753-5748", "Concord area"],
  ["conway", "Conway", "603-447-2111", "Conway and Mount Washington Valley"], ["derry", "Derry", "603-434-1577", "Derry area; press 1"],
  ["dover", "Dover", "603-516-9300", "Dover and Rochester area"], ["exeter", "Exeter", "603-772-2710", "Exeter and Seacoast area"],
  ["franklin", "Franklin", "844-753-5748", "Franklin and central New Hampshire"], ["groveton", "Groveton", "603-636-2555", "Groveton and northern Coos area"],
  ["keene", "Keene", "603-357-4400", "Keene, Jaffrey, Peterborough, and Winchester area"], ["laconia", "Laconia", "603-528-0305", "Laconia and Plymouth area"],
  ["lebanon", "Lebanon", "800-564-2578", "Lebanon and Newport area"], ["littleton", "Littleton", "603-444-5358", "Littleton and northern Grafton area"],
  ["manchester", "Manchester", "800-688-3544", "Manchester area"], ["nashua", "Nashua", "800-762-8191", "Nashua area"],
  ["portsmouth", "Portsmouth", "603-431-6703", "Portsmouth and Seacoast area"], ["rochester", "Rochester", "603-516-9300", "Rochester and Dover area"],
  ["salem", "Salem", "603-434-1577", "Salem area; press 1"], ["wolfeboro", "Wolfeboro", "603-569-1884", "Wolfeboro and eastern Carroll County"],
  ["woodsville", "Woodsville", "603-747-3658", "Woodsville and western Grafton County"],
].map(([slug, city, phone, serviceArea]) => entry({
  id: `nh-urgent-${slug}`, state: "NH", name: `New Hampshire community mental-health center — ${city} crisis access`, city, phone, serviceArea,
  url: "https://nhcbha.org/emergency-key-services/", source: nhCrisisSource,
  resourceType: "regional community mental-health crisis contact",
  description: `New Hampshire's community mental-health center crisis directory publishes this number for ${serviceArea}. Call to reach the listed regional crisis service and ask about clinical triage, mobile response, and local access. Confirm that the contact serves your location and current response options. For immediate danger or a medical emergency, call 911.`,
  coverageScope: "region",
}));
export const NEW_HAMPSHIRE_CRISIS_CONTACTS = nhCrisis;

const nvBenefitSource = "Nevada Division of Social Services, Social Services District Offices";
const nvNorth = [
  ["carson-city", "Carson City", "2533 North Carson Street, Suite 200, Carson City, NV 89706-0240", "775-684-0800", "7 a.m.–5 p.m."],
  ["elko", "Elko", "1020 Ruby Vista Drive, Suite 101, Elko, NV 89801", "775-753-1233", "8 a.m.–5 p.m."],
  ["ely", "Ely", "725 Avenue K, Ely, NV 89301", "775-289-1650", "8 a.m.–5 p.m."],
  ["fallon", "Fallon", "111 Industrial Way, Fallon, NV 89406-3116", "775-423-3161", "8 a.m.–5 p.m."],
  ["hawthorne", "Hawthorne", "1000 C Street, P.O. Box 1508, Hawthorne, NV 89415-1508", "775-945-3602", "8 a.m.–5 p.m."],
  ["reno", "Reno", "4055 South Virginia Street, Reno, NV 89502", "775-684-7200", "7 a.m.–5 p.m."],
  ["sparks", "Sparks", "630 Greenbrae Drive, Sparks, NV 89431-3139", "775-824-7400", "8 a.m.–5 p.m."],
  ["yerington", "Yerington", "215 West Bridge Street, Suite 6, Yerington, NV 89447", "775-684-0800", "8 a.m.–5 p.m."],
];
const nvSouth = [
  ["belrose", "Las Vegas", "700 Belrose Street, Las Vegas, NV 89107-2235", "702-486-1646", "7 a.m.–5 p.m."],
  ["cambridge", "Las Vegas", "3900 Cambridge Street, Suite 209, Las Vegas, NV 89119", "702-486-1646", "7:30 a.m.–4:30 p.m."],
  ["courtyard", "Las Vegas", "314 Foremaster Lane, Las Vegas, NV 89101", "702-486-1646", "7 a.m.–4 p.m."],
  ["craig-road", "North Las Vegas", "3223 West Craig Road, Suite 140, North Las Vegas, NV 89032", "702-631-3386", "7 a.m.–5 p.m."],
  ["durango", "Las Vegas", "3965 South Durango Drive, Las Vegas, NV 89147", "702-631-3212", "7 a.m.–5 p.m."],
  ["flamingo", "Las Vegas", "3330 East Flamingo Road, Suite 55, Las Vegas, NV 89121-4397", "702-486-9400", "7 a.m.–5 p.m."],
  ["henderson", "Henderson", "520 South Boulder Highway, Henderson, NV 89015-7512", "702-486-1001", "7 a.m.–5 p.m."],
  ["nellis", "Las Vegas", "611 North Nellis Boulevard, Las Vegas, NV 89110-5383", "702-486-4828", "7 a.m.–5 p.m."],
  ["owens", "Las Vegas", "1040 West Owens Avenue, Las Vegas, NV 89106-2520", "702-486-1899", "7 a.m.–5 p.m."],
  ["pahrump", "Pahrump", "1840 Pahrump Valley Road, Pahrump, NV 89048-6131", "775-751-7400", "8 a.m.–5 p.m."],
  ["spring-mountain", "Las Vegas", "3101 Spring Mountain Road, Suite 3, Las Vegas, NV 89102", "702-631-3077", "7 a.m.–5 p.m."],
];
export const NEVADA_BENEFIT_OFFICES = [...nvNorth, ...nvSouth].map(([slug, city, address, phone, hours]) => entry({
  id: `nv-benefit-${slug}`, state: "NV", name: `Nevada Social Services District Office — ${city} (${slug.replaceAll("-", " ")})`, city, address, phone, hours,
  serviceArea: "Nevada DSS district service area", url: nvSouth.some(([southSlug]) => southSlug === slug)
    ? "https://www.dss.nv.gov/contact/welfare-district-offices-south/"
    : "https://www.dss.nv.gov/contact/welfare-district-offices-north/",
  source: nvBenefitSource, resourceType: "public benefits and social-services district office",
  description: `Nevada DSS lists this district office at ${address}; published weekday hours are ${hours}, excluding state holidays unless otherwise noted. DSS offices support programs such as SNAP, TANF, Medicaid, energy assistance, and child-care assistance. Call to confirm which programs this office handles, application steps, documents, and current access before traveling.`,
  coverageScope: "region",
}));

const nvHousingSource = "Clark County Coordinated Entry Access Points flyer (August 2023) and Washoe County Coordinated Entry directory";
const nvSouthHousing = [
  ["courtyard", "Courtyard Homeless Resource Center — coordinated-entry assessment", "Las Vegas", "314 Foremaster Lane, Las Vegas, NV 89101", "702-229-6117", "Adults without children; Mon–Fri walk-in hours published in source; reconfirm before travel"],
  ["catholic-charities", "Catholic Charities of Southern Nevada — housing assessment", "Las Vegas", "1511 Las Vegas Boulevard North, Las Vegas, NV 89101", "702-387-2282", "Adults without children; weekday walk-in hours published in source; reconfirm before travel"],
  ["help-southern-nevada", "HELP of Southern Nevada — coordinated-entry assessment", "Las Vegas", "1640 East Flamingo Road, Las Vegas, NV 89119", "702-369-4357", "Phone assessment and limited walk-in schedule published; reconfirm before travel"],
  ["first-person", "First Person Care Clinic — housing assessment access", "Las Vegas", "1200 South 4th Street, Suite 111, Las Vegas, NV 89104", "702-617-6313", "Assessment access; source lists two possible locations; call to confirm current location and schedule"],
  ["el-shaddai", "El-Shaddai Refuge Homes CDC — coordinated-entry assessment", "Las Vegas", "901 South Rancho Drive, Suite 12, Las Vegas, NV 89106", "702-423-6458", "Published weekday walk-in hours; call to confirm current access and housing assessment process"],
  ["vegas-stronger", "Vegas Stronger — coordinated-entry assessment", "Las Vegas", "916 North Main Street, Las Vegas, NV 89101", "702-202-6647", "Adults without children; weekday hours listed in source; confirm current access"],
  ["sn-chips", "Southern Nevada CHIPs — housing and resource assessment", "Las Vegas", "3690 South Eastern Avenue, 2nd Floor, Las Vegas, NV 89169", "702-369-2500", "Appointment, walk-in, and phone assessment hours listed; confirm eligibility and current schedule"],
  ["ccss-cambridge", "Clark County Social Services — Cambridge Annex coordinated entry", "Las Vegas", "3885 South Maryland Parkway, Las Vegas, NV 89119", "702-455-4270", "County intake for single adults without children; call to schedule assessment"],
  ["ccss-pinto", "Clark County Social Services — Pinto Lane coordinated entry", "Las Vegas", "1600 Pinto Lane, Las Vegas, NV 89106", "702-455-4270", "County intake for single adults without children; call to schedule assessment"],
  ["ccss-henderson", "Clark County Social Services — Henderson coordinated entry", "Henderson", "1291 West Galleria Drive, Suite 170, Henderson, NV 89014", "702-455-4270", "County intake for single adults without children; call to schedule assessment"],
  ["ccss-north-las-vegas", "Clark County Social Services — Community Resource Center coordinated entry", "North Las Vegas", "2432 North Martin Luther King Boulevard, Suite D, North Las Vegas, NV 89032", "702-455-4270", "County intake for single adults without children; call to schedule assessment"],
  ["family-promise", "Family Promise of Las Vegas — family housing assessment", "Las Vegas", "3690 East Tropicana Avenue, Las Vegas, NV 89121", "702-638-8806", "Families with children; appointment-only weekday access listed; confirm eligibility"],
  ["lutheran-social-services", "Lutheran Social Services of Nevada — family housing assessment", "Las Vegas", "4323 Boulder Highway, Las Vegas, NV 89121", "702-639-1730", "Family coordinated-entry access; published walk-in hours; confirm current service"],
  ["hopelink", "HopeLink of Southern Nevada — family housing assessment", "Henderson", "178 Westminster Way, Henderson, NV 89015", "702-566-0576", "Family coordinated-entry access; limited walk-in schedule listed; confirm eligibility and hours"],
  ["shannon-west", "Shannon West Homeless Youth Center — youth housing access", "Las Vegas", "1650 East Flamingo Road, Las Vegas, NV 89119", "702-526-4990", "Young adults ages 18–24; assessment and shelter schedule listed; call to confirm eligibility"],
  ["st-judes-rainbow", "St. Jude's Ranch — young-adult housing assessment", "Las Vegas", "2685 South Rainbow Boulevard, Suites 108 and 112, Las Vegas, NV 89146", "702-436-1624", "Appointment-only youth and young-adult service; no walk-ins according to source; call first"],
  ["st-judes-mcleod", "St. Jude's Ranch — young-adult housing assessment", "Las Vegas", "5005 McLeod Drive, Las Vegas, NV 89120", "702-998-1992", "Appointment-only youth and young-adult service; no walk-ins according to source; call first"],
  ["nphy", "Nevada Partnership for Homeless Youth — youth housing navigation", "Las Vegas", "4981 Shirley Street, Las Vegas, NV 89119", "702-383-1332", "Youth ages 12–20; walk-ins listed by source; call to confirm current hours and eligibility"],
];
const nvWashoeHousing = [
  ["catholic-charities-reno", "Catholic Charities of Northern Nevada Resource Hub — coordinated entry", "Reno", "500 East 4th Street, Reno, NV 89512", "775-322-7073", "Mon–Fri, 9 a.m.–noon and 1–4 p.m.; assessment appointments available"],
  ["eddy-house", "Eddy House — youth housing assessment", "Reno", "888 Willow Street, Reno, NV", "775-384-1129", "Youth ages 18–24; weekday intake; youth services listed as 24/7"],
  ["cares-campus", "Nevada Cares Campus — drop-in housing assessment", "Reno", "1800 Threlkel Street, Reno, NV 89512", "775-329-4141", "Monday–Saturday, 8 a.m.–5 p.m.; closed Sunday per county source"],
  ["va-reno", "Northern Nevada VA — Veteran coordinated-entry assessment", "Reno", "350 Capitol Hill Avenue, Reno, NV 89502", "775-324-6600", "Veterans; Monday–Friday, 7:30 a.m.–3 p.m.; confirm VA eligibility"],
  ["our-place", "OUR Place Emergency Shelter — coordinated-entry assessment", "Sparks", "605 South 21st Street, Sparks, NV 89431", "775-327-7501", "Monday–Saturday, 8 a.m.–5 p.m.; closed Sunday per county source"],
  ["restart", "Restart Homeless Services — coordinated-entry assessment", "Reno", "1095 East Taylor Street, Reno, NV 89502", "775-324-2622", "Monday–Thursday, 8 a.m.–noon and 1–4 p.m.; drop-in or appointment per county source"],
  ["safe-embrace", "Safe Embrace — housing assessment and domestic-violence support", "Reno", undefined, "775-322-3466", "Monday–Friday office hours; 24/7 crisis hotline; ask about confidential safe access"],
  ["steps-new-freedom", "Steps to New Freedom — coordinated-entry assessment", "Reno", undefined, "775-322-4003", "Published drop-in assessment access; call to verify current address and schedule"],
  ["rise-outreach", "RISE Street Outreach — housing assessment and outreach", "Reno", undefined, "775-486-3041", "Monday–Friday 9 a.m.–5 p.m.; call to schedule assessment"],
  ["washoe-puf-830", "Washoe County Psychiatric Urgent Facility — Mill Street", "Reno", "830 Mill Street, Suites 100–101, Reno, NV 89502", "775-538-6700", "County lists drop-in coordinated-entry assessment access on weekdays; confirm current intake"],
  ["washoe-puf-155", "Washoe County Psychiatric Urgent Facility — West 2nd Street", "Reno", "155 West 2nd Street, Reno, NV 89503", "775-538-6700", "County lists drop-in coordinated-entry assessment access on weekdays; confirm current intake"],
];
export const NEVADA_PEER_ACCESS = [
  entry({ id: "nv-peer-ridge-house-bridge-reno", state: "NV", name: "Ridge House Bridge Walk-In Center — recovery and peer navigation", city: "Reno", serviceArea: "Northern Nevada", url: "https://www.ridgehouse.org/bridge", source: "Ridge House Bridge Walk-In Center", resourceType: "recovery peer-support and community navigation", description: "Ridge House describes Bridge as a walk-in starting point for recovery support, treatment and housing referrals, benefits navigation, food and basic-needs connections, and reentry support. It states that no appointment or formal intake is needed to receive information and resource connections. Confirm today's location and service hours before traveling; this is navigation, not a treatment appointment or shelter placement." }),
  entry({ id: "nv-peer-voices-of-valor-washoe", state: "NV", name: "Voices of Valor — Veteran peer recovery support", city: "Reno", email: "valor@veterans.nv.gov", serviceArea: "Washoe County; Veteran-focused", url: "https://veterans.nv.gov/recovery-and-behavioral-health-programs/peer-support-voices-of-valor/", source: "Nevada Department of Veterans Services, Voices of Valor", resourceType: "Veteran peer-to-peer recovery support", description: "Nevada Department of Veterans Services describes Voices of Valor as confidential Veteran peer-to-peer recovery support, with group and individual connection, lived-experience mutual support, self-care information, and resource navigation. The program is currently offered in Washoe County. Contact the state representative or referral partner to ask how to participate and confirm eligibility. For a crisis, dial 988 and press 1." }),
  entry({ id: "nv-peer-nvpsn-resiliency-reno", state: "NV", name: "Nevada Peer Support Network — Resiliency Center", city: "Reno", address: "330 East Liberty Street, Reno, NV 89501", phone: "775-464-1797", serviceArea: "Northern Nevada; first responders, Veterans, health-care professionals, and families", url: "https://nvpsn.org/about", source: "Nevada Peer Support Network, About and Resiliency Center information", resourceType: "specialized peer support and resiliency connection", description: "Nevada Peer Support Network describes confidential peer support, wellness programs, trusted resources, and community connection for first responders, Veterans, military personnel, health-care professionals, and their families. Its Resiliency Center provides a separate space for support and training. Contact the organization to confirm current access, intended participant eligibility, and whether appointments are needed." }),
];

export const NEVADA_HOUSING_ACCESS = [...nvSouthHousing.map(([slug, name, city, address, phone, access]) => ({ slug, name, city, address, phone, access, url: "https://www.clarkcountynv.gov/residents/assistance_programs/homeless-help", source: "Clark County Coordinated Entry Access Points flyer; August 2023" })), ...nvWashoeHousing.map(([slug, name, city, address, phone, access]) => ({ slug, name, city, address, phone, access, url: "https://www.washoecounty.gov/homeless/regional_governance_and_coordination/coc/coordinated_entry.php", source: "Washoe County Coordinated Entry and CHAT assessment directory" }))].map(({ slug, name, city, address, phone, access, url, source }) => entry({
  id: `nv-housing-entry-${slug}`, state: "NV", name, city, address, phone, serviceArea: city === "Reno" || city === "Sparks" ? "Washoe County coordinated-entry area" : "Clark County coordinated-entry area",
  hours: access, url, source, resourceType: "coordinated-entry housing assessment access point",
  description: `${source} lists ${name}${address ? ` at ${address}` : ""}${phone ? `, phone ${phone}` : ""}. Published access guidance: ${access}. Coordinated Entry is an assessment and referral route; it does not guarantee shelter placement, a housing match, or available capacity. Verify the current access location, eligibility, and schedule before traveling.`,
  coverageScope: "county",
}));

const nvCrisisSource = "Clark County Crisis Stabilization Center and Washoe County Coordinated Entry / Psychiatric Urgent Facilities";
export const NEVADA_LOCAL_CRISIS = [
  ["umc-stabilization", "UMC Crisis Stabilization Center — Southern Nevada", "Las Vegas", "5409 East Lake Mead Boulevard, Las Vegas, NV 89156", "702-383-6200", "Clark County describes 24/7 adult walk-in crisis services for mental-health and substance-use needs; confirm current access and medical fit"],
  ["washoe-puf-mill", "Northern Nevada Psychiatric Urgent Facility — Mill Street", "Reno", "830 Mill Street, Suites 100–101, Reno, NV 89502", "775-538-6700", "Washoe County lists this facility for drop-in urgent psychiatric access on weekdays; call to confirm hours, eligibility, and current intake"],
  ["washoe-puf-second", "Northern Nevada Psychiatric Urgent Facility — West 2nd Street", "Reno", "155 West 2nd Street, Reno, NV 89503", "775-538-6700", "Washoe County lists this facility for drop-in urgent psychiatric access on weekdays; call to confirm hours, eligibility, and current intake"],
  ["safe-embrace-reno", "Safe Embrace — 24-hour crisis and safety hotline", "Reno", undefined, "775-322-3466", "Washoe County lists a 24/7 hotline and coordinated-entry assessment by hotline; ask about confidential and safe contact options"],
].map(([slug, name, city, address, phone, access]) => entry({
  id: `nv-urgent-${slug}`, state: "NV", name, city, address, phone, serviceArea: city === "Reno" ? "Northern Nevada / Washoe County; confirm response limits" : "Southern Nevada / Clark County",
  url: slug.startsWith("washoe") || slug.startsWith("safe") ? "https://www.washoecounty.gov/homeless/regional_governance_and_coordination/coc/coordinated_entry.php" : "https://www.clarkcountynv.gov/residents/assistance_programs/crisis-stabilization-center",
  source: nvCrisisSource, resourceType: "local urgent behavioral-health or crisis access",
  description: `${access}. This listing does not guarantee immediate evaluation, mobile response, or capacity. Call to confirm current service fit. For immediate danger or urgent medical emergency, call 911.`,
  coverageScope: "county",
}));

const scUrgentSource = "South Carolina Department of Behavioral Health and Developmental Disabilities, Mental Health Crisis Resources";
export const SOUTH_CAROLINA_URGENT_CHANNELS = [
  ["deaf-services", "BHDD Deaf Services Hotline — accessible crisis support", "Statewide", "803-339-3339", "VP line and deafhotline@omh.bhdd.sc.gov", "24/7 crisis support for deaf or hard-of-hearing people, hospital consultation, interpreter requests, and mental-health referrals."],
  ["crisis-text", "Crisis Text Line — South Carolina HOPE4SC", "Statewide", "Text HOPE4SC to 741741", "24/7 text access", "State BHDD publishes this channel for people who need crisis support by text. Spanish-language AYUDA is also accepted at 741741."],
  ["988", "988 Suicide & Crisis Lifeline — South Carolina call or text", "Statewide", "988", "Call, text, or chat 24/7", "State BHDD directs South Carolina residents to 988 for crisis support; chat and Spanish-language options are available through the Lifeline website."],
  ["veterans", "Veterans Crisis Line — South Carolina access", "Statewide", "988, then press 1; or text 838255", "Veteran and military-community crisis support, 24/7", "Veterans and service members can reach the specialized Veterans Crisis Line by dialing 988 and pressing 1 or texting 838255."],
].map(([slug, name, city, phone, access, detail]) => entry({
  id: `sc-urgent-${slug}`, state: "SC", name, city, phone, serviceArea: "South Carolina statewide",
  url: "https://bhdd.sc.gov/office-mental-health/resources", source: scUrgentSource,
  resourceType: "specialized crisis support contact or communication channel",
  description: `${detail} Published access: ${access}. This channel complements South Carolina's statewide Mobile Crisis dispatcher at 1-833-364-2274; it is not a guarantee of an in-person response. In immediate danger or a medical emergency, call 911.`,
  coverageScope: "state",
}));
