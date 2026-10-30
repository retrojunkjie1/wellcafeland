// Named peer and recovery-community access points for the active five-state
// directory slice. Source reviewed 2026-10-30; current schedules and intake
// are not phone-confirmed and the catalog is not exhaustive.
const peer = ({ id, name, state, city, address, phone, description, url, source, serviceArea, coverageScope = "city", locationLine }) => ({
  id, name, state, city, address, phone, description, link: url, source, serviceArea,
  coverageScope, resourceType: "peer and recovery-community support", locationLine,
  verified: true, sourceReviewed: true, phoneConfirmed: false, exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const moCenter = (slug, name, city, address, phone, url) => peer({
  id: `mo-peer-${slug}`, name: `${name} — recovery community center`, state: "MO", city, address, phone,
  description: `The Missouri Department of Mental Health's Recovery Community Centers map lists ${name} at this location as a peer-based supportive community for people seeking or sustaining recovery from substance use. Contact the center to confirm current hours, meeting schedule, accessibility, and available services before visiting.`,
  url, source: "Missouri Department of Mental Health, Recovery Community Centers map (revised May 5, 2025)",
  serviceArea: city, locationLine: `${city} · peer-led recovery community · confirm schedule before visiting`,
});

export const MISSOURI_PEER_CENTERS = [
  moCenter("beacon-sedalia", "Beacon of Hope Recovery Community Center", "Sedalia", "910 W. Main Street, Sedalia, MO 64093", "660-827-4357", "https://www.recoverylighthouse.org/"),
  moCenter("healing-house-kc", "Healing House Kansas City", "Kansas City", "112 N. Elmwood Avenue, Kansas City, MO 64123", "816-768-8005", "https://healinghousekc.org/"),
  moCenter("landmark-jefferson-city", "Landmark Recovery Center", "Jefferson City", "204 Metro Drive, Jefferson City, MO 65109", "573-635-3065", "https://www.landmarkrecoveryjcmo.com/"),
  moCenter("life-recovery-stl", "Life Recovery Community Center", "St. Louis", "4145 Kennerly Avenue, St. Louis, MO 63113", "314-802-2696", "https://www.cafestl.org/"),
  moCenter("monetwork-stl", "Missouri Network for Opiate Reform and Recovery (MoNetwork)", "St. Louis", "3431 Meramec Street, St. Louis, MO 63116", "844-732-3587", "https://www.monetwork.org/"),
  moCenter("empowerment-stl", "Saint Louis Empowerment Center", "St. Louis", "907 Dock Street, St. Louis, MO 63147", "314-652-6100", "https://www.dbsaempowerment.org/"),
  moCenter("springfield-rcc", "Springfield Recovery Community Center", "Springfield", "1925 E. Bennett Street, Suite J, Springfield, MO 65804", "417-368-0852", "https://www.betterlifeinrecovery.com/srcc"),
  moCenter("pier-warrensburg", "The Pier Recovery Community Center", "Warrensburg", "204 E. Market Street, Warrensburg, MO 64093", "660-429-2222", "https://www.recoverylighthouse.org/"),
  moCenter("roc-columbia", "The Reentry Opportunity Center (The ROC)", "Columbia", "1621 Towne Drive, Columbia, MO 65201", "573-607-9372", "https://www.comoroc.org/"),
  moCenter("rocc-joplin", "The ROCC (Recovery Outreach Community Center)", "Joplin", "1402 S. Main Street, Joplin, MO 64801", "417-552-0412", "https://www.roccjoplin.com/"),
  moCenter("we-do-cape", "We Do Recover Community Center — Cape Girardeau", "Cape Girardeau", "715 Broadway Street, Cape Girardeau, MO 63701", "573-803-0234", "https://www.gibson-center.com/services/we-do-recover-community-center/"),
  moCenter("we-do-sikeston", "We Do Recover Community Center — Sikeston", "Sikeston", "901 S. Kingshighway, Sikeston, MO 63801", "573-475-9108", "https://www.gibson-center.com/services/we-do-recover-community-center/"),
];

const nhSource = "New Hampshire DHHS, State-Funded Recovery Community Organizations referral guide (November 2023; locations listed by town)";
const nhRco = (slug, provider, city) => peer({
  id: `nh-peer-${slug}`, name: `${provider} — peer recovery support`, state: "NH", city,
  description: `New Hampshire DHHS's state-funded RCO guide lists ${provider} in ${city}. The guide describes its listed recovery centers as low-barrier and no-cost, with peer recovery coaching, telephone support, mutual-aid groups, and family support varying by organization. The guide is dated November 2023 and provides town-level locations; confirm the current address, hours, intake, and service availability with the organization before traveling.`,
  url: "https://www.nhrecovery.org/wp-content/uploads/2023/11/RCOReferralGuide_BDAS-Nov2023-1.pdf",
  source: nhSource, serviceArea: city, locationLine: `${city}, NH · low-barrier peer recovery lead · verify current site and hours`,
});

export const NEW_HAMPSHIRE_PEER = [
  nhRco("white-horse-littleton", "White Horse Recovery", "Littleton"),
  nhRco("white-horse-berlin", "White Horse Recovery", "Berlin"),
  nhRco("white-horse-north-conway", "White Horse Recovery", "North Conway"),
  nhRco("white-horse-center-ossipee", "White Horse Recovery", "Center Ossipee"),
  nhRco("archways-plymouth", "Archways", "Plymouth"),
  nhRco("archways-tilton", "Archways", "Tilton"),
  nhRco("archways-franklin", "Archways", "Franklin"),
  nhRco("archways-concord", "Archways", "Concord"),
  nhRco("mwv-supports-recovery-conway", "Mount Washington Valley Supports Recovery", "Conway"),
  nhRco("mwv-supports-recovery-center-conway", "Mount Washington Valley Supports Recovery", "Center Conway"),
  nhRco("sos-dover", "SOS Recovery Community Organization", "Dover"),
  nhRco("sos-rochester", "SOS Recovery Community Organization", "Rochester"),
  nhRco("sos-exeter", "SOS Recovery Community Organization", "Exeter"),
  nhRco("sos-hampton", "SOS Recovery Community Organization", "Hampton"),
  nhRco("navigating-recovery-laconia", "Navigating Recovery of the Lakes Region", "Laconia"),
  nhRco("hope-manchester", "HOPE for NH Recovery", "Manchester"),
  nhRco("safe-harbor-portsmouth", "Safe Harbor Recovery Center", "Portsmouth"),
  nhRco("tlc-claremont", "TLC Recovery Programs", "Claremont"),
  nhRco("keene-serenity", "Keene Serenity Center", "Keene"),
  nhRco("revive-derry", "Revive Recovery Resource Center", "Derry"),
  nhRco("revive-nashua", "Revive Recovery Resource Center", "Nashua"),
  nhRco("arcn-milford", "Alternative Recovery and Counseling Network (ARCNH)", "Milford"),
];

const narssSource = "Never Alone Recovery Support Services, current Programs and Contact pages";
export const MONTANA_PEER = [
  peer({ id: "mt-peer-narss-recovery-hall-ronan", name: "Never Alone Recovery Hall — peer drop-in and mutual support", state: "MT", city: "Ronan", address: "122 Main Street SE, Ronan, MT", phone: "406-676-2536", description: "Never Alone Recovery Support Services describes its Ronan Recovery Hall as a free, family-friendly community drop-in center offering individual and group peer support, educational groups, and mutual-support meetings. Ask about current activities, access, and any schedule changes before visiting.", url: "https://www.narssmontana.org/programs", source: narssSource, serviceArea: "Lake County and Flathead Indian Reservation", coverageScope: "region", locationLine: "Ronan · free community drop-in center · confirm current activities" }),
  peer({ id: "mt-peer-narss-recovery-village-pablo", name: "Never Alone Recovery Village Hub — peer groups and navigation", state: "MT", city: "Pablo", address: "42297 2nd Avenue E, Pablo, MT", phone: "406-332-1003", description: "Never Alone Recovery Support Services lists its Pablo Hub as a recovery community location offering individual support, groups, meetings, and peer-led resource linkage. The organization publishes changing weekly activities; contact it to confirm the current schedule, accessibility, and eligibility before visiting.", url: "https://www.narssmontana.org/programs", source: narssSource, serviceArea: "Lake County and Flathead Indian Reservation", coverageScope: "region", locationLine: "Pablo · peer-led hub · call to confirm schedule" }),
  peer({ id: "mt-peer-montanas-peer-network", name: "Montana's Peer Network — statewide peer support connections", state: "MT", city: "Ennis", address: "2 Hot Springs Loop, Ennis, MT 59729", phone: "406-551-1058", description: "Montana's Peer Network describes a statewide network of people in recovery from mental-health and substance-use challenges. It offers peer-support resources, advocacy, education, and connections across communities; it is a network and workforce organization rather than a walk-in clinical service. Contact it to locate a relevant peer option.", url: "https://www.mtpeernetwork.org/", source: "Montana's Peer Network official website", serviceArea: "Montana statewide", coverageScope: "state", locationLine: "Statewide peer network · Ennis office; call for community connections" }),
  peer({ id: "mt-peer-recovery-access-montana-directory", name: "Recovery Access Montana — peer and recovery services directory", state: "MT", description: "Recovery Access Montana publishes a searchable directory of certified recovery homes, peer-support programs, reentry services, and recovery-focused organizations. Use the directory filters to find options by location and service type; confirm certification status, intake, eligibility, and current capacity directly with each provider.", url: "https://www.rammontana.org/directory", source: "Recovery Access Montana directory", serviceArea: "Montana statewide", coverageScope: "state", locationLine: "Statewide searchable directory · confirm each provider's current intake" }),
];

const neSource = "Provider and service-owner peer-support program pages";
export const NEBRASKA_PEER = [
  peer({ id: "ne-peer-wellbeing-initiative-lincoln", name: "Wellbeing Initiative — Recovery Community Navigation", state: "NE", city: "Lincoln", address: "5530 O Street, Suite 2, Lincoln, NE 68510", phone: "531-254-5451", description: "Wellbeing Initiative's Recovery Community Navigation connects adults and youth affected by substance-use or mental-health challenges to peer recovery support, education, harm-reduction and overdose-prevention information, and community resources. It serves urban and rural Nebraska; ask about referral steps and whether in-person or virtual support is available.", url: "https://www.wellbeinginitiatives.org/recovery-community-navigation", source: "Wellbeing Initiative Recovery Community Navigation", serviceArea: "Urban and rural Nebraska", coverageScope: "state", locationLine: "Lincoln office · peer navigation for adults and youth statewide" }),
  peer({ id: "ne-peer-heartland-omaha", name: "Heartland Family Service Peer Support Center", state: "NE", city: "Omaha", address: "3300 N. 60th Street, Building B, Omaha, NE 68104", phone: "402-552-7496", description: "Heartland Family Service describes a free peer-run drop-in center with individual and group opportunities for people with a serious and persistent mental-health diagnosis. The published service area is Douglas County; the program page lists Monday–Thursday, 10 a.m.–3 p.m. Confirm eligibility, current hours, and accessibility before visiting.", url: "https://www.heartlandfamilyservice.org/services/peer-support-ne/", source: "Heartland Family Service Nebraska Peer Support program page", serviceArea: "Douglas County", locationLine: "Omaha · free peer drop-in · Douglas County eligibility; Mon–Thu hours listed" }),
  peer({ id: "ne-peer-va-omaha-veterans", name: "VA Nebraska-Western Iowa — in-person Veteran peer-support groups", state: "NE", city: "Omaha", description: "VA Nebraska-Western Iowa lists in-person peer-support groups at the Omaha VA Medical Center for Veterans with lived experience of mental illness or substance use. It also describes online groups through VA Video Connect. This is a Veteran-focused service; contact the VA to confirm eligibility, meeting schedule, location, and enrollment steps.", url: "https://www.va.gov/nebraska-western-iowa-health-care/programs/peer-support-groups/", source: "VA Nebraska-Western Iowa Health Care peer-support groups", serviceArea: "Omaha VA service area and online for eligible Veterans", coverageScope: "region", locationLine: "Omaha VA Medical Center · Veteran eligibility applies · verify schedule" }),
  peer({ id: "ne-peer-region-six-recovery-initiatives", name: "Region 6 Behavioral Healthcare — peer and recovery initiatives", state: "NE", city: "Lincoln", description: "Region 6 Behavioral Healthcare describes peer and recovery initiatives that connect people with lived experience to community education, recovery storytelling, and local behavioral-health resources. Contact Region 6 to ask which activities are open to the public and where current groups meet; the program page is not a meeting calendar.", url: "https://www.regionsix.com/how-we-help/peer-and-recovery-initiatives/", source: "Region 6 Behavioral Healthcare peer and recovery initiatives", serviceArea: "Region 6 Nebraska service area", coverageScope: "region", locationLine: "Region 6 · peer and recovery initiatives · ask for current local activities" }),
];

const nvPeerSource = "Foundation for Recovery, official peer-support and contact pages";
export const NEVADA_PEER = [
  peer({ id: "nv-peer-foundation-for-recovery-las-vegas", name: "Foundation for Recovery — Southern Nevada Recovery Community Center", state: "NV", city: "Las Vegas", address: "4800 Alpine Place, Suite 12, Las Vegas, NV 89107", phone: "702-257-8199", description: "Nevada's statewide recovery community organization lists one-to-one peer recovery support, mutual-aid meetings, support groups, sober-social events, overdose-prevention education and naloxone access at its Southern Nevada Recovery Community Center. Contact the center to confirm current open hours, group schedules, and available supports.", url: "https://forrecovery.org/", source: nvPeerSource, serviceArea: "Southern Nevada, with statewide peer-navigation information", coverageScope: "region", locationLine: "Las Vegas · peer recovery and groups · call to confirm schedule" }),
  peer({ id: "nv-peer-recovery-support-warmline", name: "Nevada Peer Recovery Support Warmline", state: "NV", phone: "1-800-509-7762", description: "Foundation for Recovery's peer warmline offers non-crisis peer support for people experiencing substance-use concerns or seeking support maintaining recovery. The organization also offers a web request for peer matching. This is a peer-support contact, not a crisis line or emergency-response service; call 911 for immediate danger and use 988 for a behavioral-health crisis.", url: "https://forrecovery.org/peer-recovery-support/", source: nvPeerSource, serviceArea: "Nevada statewide", coverageScope: "state", locationLine: "Statewide peer support · non-crisis warmline · 1-800-509-7762" }),
];
