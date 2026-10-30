// Source-reviewed local access expansion across five underbuilt states.
// These are published access points, not phone-confirmed or exhaustive coverage.
const checkedAt = "2026-10-30";
const record = ({ id, name, state, city, address, phone, description, url, source, serviceArea, resourceType, hours, coverageScope }) => ({
  id, name, state, city, address, phone, description, link: url, source, serviceArea,
  resourceType, hours, coverageScope: coverageScope || (city ? "city" : "region"),
  locationLine: [city, serviceArea, "contact to confirm current access"].filter(Boolean).join(" · "),
  verified: true, sourceReviewed: true, phoneConfirmed: false, exhaustiveCoverage: false, checkedAt,
});

const moBhccSource = "Missouri Behavioral Health Council, Behavioral Health Crisis Centers Locations";
const missouriCenters = [
  ["cape-girardeau", "Behavioral Health Crisis Center", "Cape Girardeau", "1112 Linden St., Cape Girardeau, MO 63703", "573-803-4155", "Cape Girardeau County", "18+", "24 hours daily"],
  ["sedalia", "Centerstone Behavioral Health Crisis Center", "Sedalia", "1795 W. Main St., Sedalia, MO 65301", "660-285-9280", "Pettis County", "18+", "24 hours daily"],
  ["st-louis-dunnica", "Centerstone St. Louis — Dunnica Avenue Crisis Center", "St. Louis", "4066 Dunnica Ave., St. Louis, MO 63116", "314-502-0444", "St. Louis City", "18+", "24 hours daily"],
  ["columbia", "Centerstone Behavioral Health Crisis Center and Rapid Access Unit", "Columbia", "1805 E. Walnut St., Columbia, MO 65201", "573-777-7522", "Boone County", "18+", "24 hours daily"],
  ["kirksville", "Centerstone Kirksville — LaHarpe Street Crisis Center", "Kirksville", "902 E. LaHarpe, Kirksville, MO 63501", "660-626-0407", "Adair County", "18+", "7 a.m.–7 p.m. daily"],
  ["springfield", "Centerstone Behavioral Crisis Center and Rapid Access Unit", "Springfield", "800 S. Park, Springfield, MO 65802", "417-893-7735", "Greene County", "18+", "24 hours daily"],
  ["independence", "Centerstone Behavioral Health Crisis Center", "Independence", "17421 Medical Center Parkway, Independence, MO 64057", "816-455-9975", "Jackson County", "18+", "24 hours daily"],
  ["festus", "Compass Health Behavioral Health Crisis Center", "Festus", "222 N. Mill St., Festus, MO 63028", "833-356-2427", "Jefferson County", "18+", "24 hours daily"],
  ["jefferson-city", "Compass Health Behavioral Health Crisis Center", "Jefferson City", "227 Metro Dr., Jefferson City, MO 65109", "833-356-2427", "Cole County", "18+", "24 hours daily"],
  ["raymore", "Compass Health Behavioral Health Crisis Center", "Raymore", "1010 Remington Plaza Ct., Raymore, MO 64083", "833-356-2427", "Cass County", "18+", "24 hours daily"],
  ["rolla", "Compass Health Behavioral Health Crisis Center", "Rolla", "1450 E. 10th St., Rolla, MO 65401", "833-356-2427", "Phelps County", "18+", "24 hours daily"],
  ["union", "Compass Health Behavioral Health Crisis Center", "Union", "1015 Paul Allen Dr., Union, MO 63084", "833-356-2427", "Franklin County", "18+", "24 hours daily"],
  ["wentzville", "Compass Health Behavioral Health Crisis Center", "Wentzville", "1032 Crosswinds Court, Wentzville, MO 63385", "833-356-2427", "St. Charles County", "18+", "24 hours daily"],
  ["st-peters-youth", "Compass Youth Behavioral Health Urgent Care", "St. Peters", "111 Mexico Court, St. Peters, MO 63376", "844-853-8937", "St. Charles County", "Ages 5–17 with parent or guardian", "9 a.m.–9 p.m. daily"],
  ["st-joseph-family-guidance", "Family Guidance Behavioral Health Urgent Care", "St. Joseph", "4906 Frederick Ave., St. Joseph, MO 64506", "816-676-7222", "Buchanan County", "Ages 5+", "Monday–Friday, 7 a.m.–7 p.m."],
  ["poplar-bluff", "FCC Behavioral Health Crisis Center", "Poplar Bluff", "686 Lester St., Poplar Bluff, MO 63901", "573-818-2642", "Butler County", "Ages 10+", "10 a.m.–8 p.m. daily"],
  ["kennett", "FCC Behavioral Health Crisis Center", "Kennett", "935 Highway VV, Kennett, MO 63857", "573-888-5925", "Dunklin County", "Ages 10+", "10 a.m.–8 p.m. daily; last client accepted at 7 p.m."],
  ["hannibal", "Mark Twain Behavioral Health Crisis Stabilization Unit (CSU@146)", "Hannibal", "146 Communication Dr., Hannibal, MO 63401", "573-600-9432", "Marion County", "18+", "24 hours daily; intake 8 a.m.–8 p.m."],
  ["trenton", "North Central Missouri Mental Health Center Behavioral Health Crisis Center", "Trenton", "2910 Oklahoma Ave., Trenton, MO 64683", "660-358-1585", "Grundy County", "18+", "Monday–Friday, 8 a.m.–8 p.m."],
  ["joplin", "Ozark Center Urgent Behavioral Solutions", "Joplin", "3230 Wisconsin Ave., Suite A, Joplin, MO 64804", "417-347-7800", "Jasper County", "16+", "Weekdays 11 a.m.–9 p.m.; weekends 1 p.m.–9 p.m."],
  ["west-plains", "Ozarks Healthcare Behavioral Health Crisis Stabilization Center", "West Plains", "1100 Kentucky Ave., West Plains, MO 65775", "417-505-7878", "Howell County", "18+", "8 a.m.–6 p.m. daily"],
  ["raytown", "ReDiscover Behavioral Health Urgent Care Clinic", "Raytown", "7001 Blue Ridge Blvd., Raytown, MO 64133", "816-988-2739", "Jackson County", "Ages 5+", "9 a.m.–9 p.m. daily"],
  ["kansas-city", "ReDiscover Kansas City Assessment & Triage Center", "Kansas City", "2600 E. 12th Street, Kansas City, MO 64127", "816-965-1100", "Jackson County", "18+", "24 hours daily"],
  ["st-louis-vista", "SSM Health Behavioral Health Urgent Care with Places for People", "St. Louis", "3635 Vista Ave., St. Louis, MO 63110", "314-257-7430", "St. Louis City", "18+", "Monday–Saturday, 9 a.m.–7 p.m."],
  ["bridgeton", "SSM Health Behavioral Health Urgent Care with BJC Behavioral Health", "Bridgeton", "12355 DePaul Drive, Suite 150, Bridgeton, MO 63044", "314-344-7200", "St. Louis County", "Ages 5+", "Monday–Saturday, 9 a.m.–7 p.m."],
];
export const MISSOURI_CRISIS_CENTERS = missouriCenters.map(([id, name, city, address, phone, county, age, hours]) => record({
  id: `mo-crisis-${id}`, name, state: "MO", city, address, phone,
  description: `${name} is listed by the Missouri Behavioral Health Council as a walk-in crisis access site in ${county}. Published age scope: ${age}; listed hours: ${hours}. Missouri says BHCCs provide short-term crisis care and do not turn people away solely for inability to pay or lack of insurance. Call first to confirm intake, age/medical fit, and current operating hours; this listing does not guarantee capacity. For immediate danger or medical emergency call 911.`,
  url: "https://www.mobhc.org/bhcc-locations", source: moBhccSource, serviceArea: county,
  resourceType: "behavioral-health crisis walk-in or urgent-care site", hours, coverageScope: "county",
}));

const mtCrisisSource = "Montana Mental Health Ombudsman, Crisis Phone Contacts and Crisis Centers";
const montanaHotlines = [
  ["eastern-north", "Eastern Montana Mental Health Center — regional crisis line", "Miles City", "800-597-6606", "Baker, Broadus, Ekalaka, Jordan, Miles City, and Terry"],
  ["eastern-northeast", "Eastern Montana Mental Health Center — regional crisis line", "Glasgow", "800-597-6608", "Glasgow, Malta, Plentywood, Scobey, and Wolf Point"],
  ["eastern-southeast", "Eastern Montana Mental Health Center — regional crisis line", "Glendive", "877-392-9767", "Circle, Glendive, and Wibaux"],
  ["eastern-northeast-river", "Eastern Montana Mental Health Center — regional crisis line", "Sidney", "877-392-9768", "Fairview and Sidney"],
  ["eastern-central", "Eastern Montana Mental Health Center — regional crisis line", "Forsyth", "877-392-9771", "Colstrip, Forsyth, and Hysham"],
  ["south-central", "South Central Montana Regional Mental Health Center — crisis line", "Billings", "800-266-7198", "Big Timber, Billings, Columbus, Hardin, Harlowton, Lewistown, Red Lodge, Roundup, Ryegate, Stanford, and Winnett"],
  ["many-rivers", "Many Rivers Whole Health — crisis contact", "Great Falls", "888-718-2100", "Montana communities served by Many Rivers Whole Health; ask the crisis line to confirm local response coverage"],
];
export const MONTANA_REGIONAL_CRISIS_LINES = montanaHotlines.map(([id, name, city, phone, serviceArea]) => record({
  id: `mt-crisis-${id}`, name, state: "MT", city, phone, serviceArea,
  description: `Montana's Mental Health Ombudsman publishes this provider crisis contact for ${serviceArea}. Call to discuss immediate options, local response, and whether a mobile or in-person service is available where you are. If there is immediate danger or an urgent medical emergency, call 911; Montana's 988 crisis line is also available statewide.`,
  url: "https://mhombudsman.mt.gov/resources/", source: mtCrisisSource,
  resourceType: "regional behavioral-health crisis phone support", coverageScope: "region",
}));
export const MONTANA_CRISIS_FACILITIES = [
  record({ id: "mt-crisis-billings-community-center", name: "Community Crisis Center — Billings crisis stabilization", state: "MT", city: "Billings", address: "704 N. 30th Street, Billings, MT 59101", phone: "406-259-8800", serviceArea: "Billings and Yellowstone County", description: "The Community Crisis Center describes itself as a 24-hour, open-door first point of access for mental-health, substance-use, and social-service crisis stabilization, regardless of ability to pay. Call or arrive to discuss immediate screening; confirm current services and capacity before travel when possible. For immediate danger or medical emergency call 911.", url: "https://www.crisiscenterbillings.org/", source: "Community Crisis Center Billings, official service and contact information", resourceType: "24-hour behavioral-health crisis stabilization facility", hours: "24 hours daily", coverageScope: "county" }),
  record({ id: "mt-crisis-missoula-dakota-place", name: "Western Montana Mental Health Center — Dakota Place Crisis Facility", state: "MT", city: "Missoula", address: "1273 Dakota St., Missoula, MT 59801", phone: "406-532-8949", serviceArea: "Missoula County and Western Montana referral region", description: "Western Montana Mental Health Center lists Dakota Place as a crisis facility at this Missoula address. Montana DPHHS identifies the provider as operating 24-hour crisis stabilization facilities in several western communities. Call to confirm current access, screening, and whether this site is appropriate; the listing does not guarantee a bed or acceptance.", url: "https://www.wmmhc.org/locations/missoula-county-missoula/236", source: "Western Montana Mental Health Center service locations; Montana DPHHS Crisis Services", resourceType: "behavioral-health crisis stabilization facility", coverageScope: "region" }),
  record({ id: "mt-crisis-hamilton-west-house", name: "Western Montana Mental Health Center — West House Crisis Facility", state: "MT", city: "Hamilton", address: "1404 Westwood Dr., Hamilton, MT 59840", phone: "406-532-8990", serviceArea: "Ravalli County and Western Montana referral region", description: "Western Montana Mental Health Center lists West House as a crisis facility in Hamilton. Montana DPHHS identifies the provider as operating 24-hour crisis stabilization facilities in several western communities. Call to confirm current access, screening, and whether this site is appropriate; the listing does not guarantee a bed or acceptance.", url: "https://www.wmmhc.org/locations/missoula-county-missoula/236", source: "Western Montana Mental Health Center service locations; Montana DPHHS Crisis Services", resourceType: "behavioral-health crisis stabilization facility", coverageScope: "region" }),
];

const neFoodSource = "Local public agency and community food access directories";
export const NEBRASKA_LOCAL_FOOD = [
  ["center-for-people", "Center for People food pantry", "Lincoln", "3901 N. 27th Street, Lincoln, NE", "402-476-4357", "Monday–Thursday, 9 a.m.–1 p.m.; ask about current ID or Clarity Card requirements", "https://www.unitedwaylincoln.org/newsroom/resources-for-our-neighbors-facing-food-insecurity"],
  ["catholic-social-services", "Catholic Social Services food assistance", "Lincoln", "2241 O Street, Lincoln, NE", "402-327-6200", "Published access: call for an appointment; confirm current hours and eligibility", "https://www.unitedwaylincoln.org/newsroom/resources-for-our-neighbors-facing-food-insecurity"],
  ["asian-community-cultural-center", "Asian Community & Cultural Center food pantry", "Lincoln", "144 N. 44th Street, Lincoln, NE", "402-477-3446", "Published access: appointment required; confirm current eligibility and distribution", "https://www.unitedwaylincoln.org/newsroom/resources-for-our-neighbors-facing-food-insecurity"],
  ["bellevue-food-pantry", "Bellevue Food Pantry — ENCAP", "Bellevue", undefined, "402-292-2961", "Sarpy County resource guide lists this local pantry; call for address, hours, service area, and current intake before traveling", "https://www.schd.ne.gov/what-we-do/public-health-information/community-resource-guide.html"],
  ["tri-city-food-pantry", "Tri City Food Pantry", "Sarpy County", undefined, "402-552-7061", "Sarpy County resource guide lists this pantry contact; call to confirm location, hours, eligibility, and current distribution details", "https://www.schd.ne.gov/what-we-do/public-health-information/community-resource-guide.html"],
].map(([id, name, city, address, phone, access, url]) => record({
  id: `ne-food-${id}`, name, state: "NE", city, address, phone,
  description: `${name} is included in a Nebraska-area public resource listing. ${access}. Food sites can change hours and eligibility; confirm details before traveling.`,
  url, source: neFoodSource, serviceArea: city === "Sarpy County" ? "Sarpy County; confirm exact location" : city, resourceType: "community food pantry or food assistance contact", coverageScope: city === "Sarpy County" ? "region" : "city",
}));

const nvClinicSource = "Nevada Division of Public and Behavioral Health, 2026 Program Guide and SNAMHS Locations";
export const NEVADA_PUBLIC_CLINICS = [
  ["west-charleston", "West Charleston Med Clinic", "Las Vegas", "6161 W. Charleston Blvd. #1, Las Vegas, NV 89146", "702-486-6000", "Adults 18+ in Clark County; outpatient services"],
  ["east-las-vegas", "East Las Vegas Med Clinic", "Las Vegas", "4045 Spencer Street, Suite 300, Las Vegas, NV 89119", "702-486-6400", "Adults 18+ in Clark County; outpatient services"],
  ["laughlin", "Laughlin Behavioral Health Center", "Laughlin", "3650 South Pointe Circle, Suite 208, Laughlin, NV 89029", "702-298-5313", "Southern rural Nevada; adults, children, and adolescents"],
  ["mesquite", "Mesquite Behavioral Health Center", "Mesquite", "61 N. Willow Street, Suite 4, Mesquite, NV 89027", "702-346-4696", "Southern rural Nevada; adults, children, and adolescents"],
  ["rawson-neal", "Rawson-Neal Psychiatric Hospital", "Las Vegas", "1650 Community College Drive, Las Vegas, NV 89146", "702-486-4400", "State psychiatric hospital; call to establish the appropriate route and eligibility; not a general walk-in clinic"],
].map(([id, name, city, address, phone, scope]) => record({
  id: `nv-treatment-${id}`, name: `${name} — Nevada public behavioral-health services`, state: "NV", city, address, phone,
  description: `Nevada's Division of Public and Behavioral Health lists ${name} at this location. Published scope: ${scope}. Contact the clinic before visiting to ask about intake, referral steps, age range, payment, and current appointment availability. This listing does not confirm eligibility or an appointment.`,
  url: "https://prod.dpbh.nv.gov/programs/behavioral-health---inpatient-and-outpatient-services/clinical-behavioral-services-inpatient-snamhs-nnamhs-lakes-crossings/locations/southern-nevada-adult-mental-health-services-snamhs-locations/",
  source: nvClinicSource, serviceArea: scope, resourceType: "public behavioral-health clinic or psychiatric hospital", coverageScope: city === "Laughlin" || city === "Mesquite" ? "region" : "city",
}));

const nhFoodSource = "City of Concord official Food Pantries & Soup Kitchens directory";
export const NEW_HAMPSHIRE_LOCAL_FOOD = [
  ["centerpoint-concord", "CenterPoint Church food pantry", "Concord", "20 N. State Street, Concord, NH 03301", "603-224-7427", "First and third Saturday, 7–9 a.m.; call for instructions"],
  ["community-action-concord", "Community Action Program food assistance", "Concord", "2 Industrial Park Drive, Building 2, Concord, NH 03301", "603-225-6880", "Monday–Friday, 9 a.m.–4 p.m.; city directory says once every 30 days"],
  ["friends-forgotten-children", "Friends of Forgotten Children food pantry", "Concord", "224 Bog Road, Concord, NH 03303", "603-753-4801", "Thursday pantry access; city directory lists 9 a.m.–7 p.m. with an 11 a.m.–noon closure; once per calendar month"],
  ["salvation-army-concord", "Salvation Army food pantry", "Concord", "58 Clinton Street, Concord, NH 03301", "603-225-5586", "Wednesday and Friday, 9:30 a.m.–1:30 p.m.; appointment required"],
  ["st-pauls-concord", "St. Paul's Church food pantry", "Concord", "21 Centre Street, Concord, NH 03301", "603-224-2523", "Tuesday and Thursday, 10 a.m.–noon; Wednesday, noon–2 p.m.; city directory lists a two-week interval between visits"],
].map(([id, name, city, address, phone, hours]) => record({
  id: `nh-food-${id}`, name, state: "NH", city, address, phone, hours,
  description: `Concord's official resource directory lists ${name} at this address and publishes the following access information: ${hours}. Call before traveling to confirm current hours, eligibility, appointment needs, and available food.`,
  url: "https://concordnh.gov/1034/Food-Pantries-Soup-Kitchens", source: nhFoodSource, serviceArea: "Concord-area residents; confirm any pantry-specific limits", resourceType: "community food pantry",
}));
