// District of Columbia source-reviewed starting directory batch, 2026-10-30.
// Public listings reflect published routes only; details are not phone- or
// capacity-confirmed and do not constitute exhaustive District coverage.
const reviewed = (record) => ({
  ...record,
  state: "DC",
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const dbhProviderSource = "https://dbh.dc.gov/page/list-community-based-service-providers";
const dbhProviders = [
  ["a-health-solution", "A Health Solution", "1818 New York Avenue NE, Suite 203, Washington, DC 20002", "800-507-5550"],
  ["absolute-healthcare", "Absolute Healthcare Resources Community Services", "1039 Bladensburg Road NE, Washington, DC 20002", "202-899-4199"],
  ["aglow-recovery", "Aglow Recovery Healthcare Services", "1647 Benning Road NE, Suite 300A, Washington, DC 20002", "202-621-8713"],
  ["anchor-mental-health", "Anchor Mental Health", "1001 Lawrence Street NE, Washington, DC 20017", "202-635-5900"],
  ["better-morning", "Better Morning", "2041 Martin Luther King Jr. Avenue SE, Suite 109, Washington, DC 20020", "202-539-4414"],
  ["citycare-health", "CityCare Health Services", "502 Kennedy Street NW, Washington, DC 20011", "202-313-7283"],
  ["clarity-healthcare", "Clarity Healthcare Services", "6323 Georgia Avenue NW, Suite 350, Washington, DC 20011", "202-996-5445"],
  ["community-connections", "Community Connections", "801 Pennsylvania Avenue SE, Suite 201, Washington, DC 20003", "202-546-1512"],
  ["community-wellness-ventures", "Community Wellness Ventures", "1930 Martin Luther King Jr. Avenue SE, Washington, DC 20020", "202-450-5822"],
  ["district-healthcare", "District Healthcare Services", "2811 Pennsylvania Avenue SE, Washington, DC 20020", "202-255-2574"],
  ["doors-of-hope", "Doors of Hope", "1818 New York Avenue NE, Suite 221, Washington, DC 20002", "202-800-6440"],
  ["family-wellness", "Family Wellness", "2526 Pennsylvania Avenue SE, Washington, DC 20020", "202-748-5641"],
  ["frandy-healthcare", "Frandy Healthcare Services", "7826 Eastern Avenue NW, Suites 206/209, Washington, DC 20012", "202-810-5454"],
  ["hillcrest-children-family", "Hillcrest Children and Family Center", "915 Rhode Island Avenue NW, Washington, DC 20009", "202-232-6100 ext. 12"],
  ["kahak-health", "Kahak Health Services", "7826 Eastern Avenue NW, Washington, DC 20012", "202-722-1700"],
  ["kinara-health-home-care", "Kinara Health and Home Care Services", "7603 Georgia Avenue, Suite 301, Washington, DC 20012", "202-506-5529"],
  ["latin-american-youth-center", "Latin American Youth Center", "1419 Columbia Road NW, Washington, DC 20009", "202-319-2225"],
  ["life-care", "Life Care", "1427 Good Hope Road SE, Washington, DC 20020", "202-836-4841"],
  ["life-enhancement", "Life Enhancement Services", "1301 L'Enfant Square SE, Washington, DC 20020", "202-269-2401"],
  ["life-stride", "Life Stride", "3005 Bladensburg Road NE, Washington, DC 20018", "202-635-2320"],
  ["marys-center", "Mary's Center", "1707-B Kalorama Road NW, Washington, DC 20009", "202-483-8319"],
  ["mbi-health", "MBI Health Services", "2041 Martin Luther King Jr. Avenue SE, Washington, DC 20020", "202-547-8450"],
  ["mcclendon-center", "McClendon Center", "1629 K Street NW, Suite 1100, Washington, DC 20006", "202-745-0073"],
  ["mental-health-services-division", "Mental Health Services Division", "35 K Street NE, Washington, DC 20002", "202-442-4194"],
  ["neighbors", "Neighbors", "2041 Martin Luther King Jr. Avenue SE, Suite 244, Washington, DC 20032", "202-234-6855"],
  ["new-hope", "New Hope", "2759 Martin Luther King Jr. Avenue SE, Suite 301, Washington, DC 20032", "202-827-9961"],
  ["new-living-healthcare", "New Living Health Care Services", "350 Eastern Avenue NE, Washington, DC 20019", "202-254-1356"],
  ["nya-healthcare", "NYA Health Care Service", "1615 Rhode Island Avenue NE, Washington, DC 20018", "202-971-9070"],
  ["pg-behavioral-health", "P & G Behavioral Health Services", "2041 Martin Luther King Jr. Avenue SE, Washington, DC 20032", "202-717-9323"],
  ["prestige-healthcare", "Prestige Healthcare Resources", "1418 Marion Barry Avenue SE, Washington, DC 20020", "202-558-2448"],
  ["preventive-measures", "Preventive Measures", "2124 Martin Luther King Jr. Avenue SE, Washington, DC 20020", "202-563-7632"],
  ["psi", "PSI", "5820 Dix Street NE, Washington, DC 20019", "202-547-2277"],
  ["quality-healthcare", "Quality Health Care Services", "1818 New York Avenue NE, Washington, DC 20002", "202-516-5737"],
  ["restoration", "Restoration", "2918 Minnesota Avenue SE, Washington, DC 20002", "202-322-7242"],
  ["spring-leaf", "Spring Leaf Mental Health Services", "6323 Georgia Avenue NW, Suite 105, Washington, DC 20011", "202-525-3954"],
  ["umbrella-therapeutic", "Umbrella Therapeutic Services", "3300 Pennsylvania Avenue SE, First Floor, Washington, DC 20019", "202-878-6626"],
  ["universal-support-agency", "Universal Support Agency", "650 Pennsylvania Avenue SE, Suite 370, Washington, DC 20002", "202-280-7070"],
  ["wellness-health-services", "Wellness Health Services", "1818 New York Avenue NE, Suite 110, Washington, DC 20002", "202-978-1237"],
];

export const DISTRICT_OF_COLUMBIA_TREATMENT = dbhProviders.map(([id, name, address, phone]) => reviewed({
  id: `dc-program-${id}`,
  name: `${name} — community behavioral-health access`,
  city: "Washington",
  address,
  phone,
  link: dbhProviderSource,
  source: "DC Department of Behavioral Health, certified community-based core service provider list",
  serviceArea: "District of Columbia; ask provider about its catchment and service fit",
  coverageScope: "District-listed community behavioral-health provider",
  resourceType: "community behavioral-health assessment, counseling, medication, or support access",
  locationLine: `${address} · contact the provider to confirm services and intake`,
  description: `DC DBH lists ${name} as a core community-based service agency in its public behavioral-health system. The District describes core services as including diagnostic assessment, medication, counseling, and community support; the published provider record does not specify which services this particular office currently delivers. Call ${phone} to ask about the right intake route, age range, insurance or payment options, referral requirements, and current appointment availability. This is not an emergency department.`,
}));

const dcHousingProviders = [
  ["catholic-charities", "Catholic Charities Archdiocese of Washington", "https://www.catholiccharitiesdc.org/", "202-772-4300", "924 G Street NW, Washington, DC 20001", "Housing and shelter, family services, food, and health-care navigation"],
  ["community-connections", "Community Connections", "https://communityconnectionsdc.org/", "202-546-1512", "801 Pennsylvania Avenue SE, Washington, DC 20003", "Homelessness outreach, supportive housing, and behavioral-health care coordination"],
  ["community-of-hope", "Community of Hope", "https://www.communityofhopedc.org/", "202-407-7700", "Washington, DC; see provider location finder", "Homelessness prevention, temporary housing, rapid re-housing, and permanent supportive housing"],
  ["core-dc", "CORE DC", "https://coredc.org/", "", "Washington, DC; see provider contact page", "Permanent supportive-housing service provider named by DC DHS"],
  ["dc-doors", "DC Doors", "https://dcdoors.org/", "202-546-0447", "Washington, DC; youth program contact", "Housing and stabilization support for young people experiencing homelessness"],
  ["edgewood-brookland", "Edgewood/Brookland Family Support Collaborative", "https://ebfsc.org/", "202-832-9400", "Washington, DC; see provider location details", "Family support and permanent supportive-housing services listed by DC DHS"],
  ["everyone-home", "Everyone Home DC", "https://everyonehomedc.org/", "202-544-0631", "1338 G Street SE, Washington, DC 20003", "Homelessness prevention, family support, and housing services"],
  ["friendship-place", "Friendship Place", "https://friendshipplace.org/", "202-364-1419", "4713 Wisconsin Avenue NW, Washington, DC 20016", "Housing and supportive services for people experiencing homelessness"],
  ["housing-up", "Housing Up", "https://housingup.org/", "202-291-5535", "Washington, DC; see provider contact page", "Permanent supportive housing and family housing services"],
  ["kc-community-services", "KC Community Services", "https://kccsinc.com/", "202-722-2205", "Washington, DC; see provider contact page", "Permanent supportive-housing service provider listed by DC DHS"],
  ["mbi-health", "MBI Health Services", "https://mbihs.com/", "202-547-8450", "2041 Martin Luther King Jr. Avenue SE, Washington, DC 20020", "Behavioral-health and permanent supportive-housing services listed by DC DHS"],
  ["metropolitan-educational-solutions", "Metropolitan Educational Solutions", "https://www.metroedsolutions.com/", "202-657-4000", "Washington, DC; see provider contact page", "Permanent supportive housing and rapid re-housing placement with case management"],
  ["miriams-kitchen", "Miriam's Kitchen", "https://www.miriamskitchen.org/", "202-452-8926", "2401 Virginia Avenue NW, Washington, DC 20037", "Housing-focused services for people experiencing chronic homelessness"],
  ["n-street-village", "N Street Village", "https://www.nstreetvillage.org/", "202-939-2076", "1333 N Street NW, Washington, DC 20005", "Housing, shelter, meals, and support for women experiencing homelessness"],
  ["nccf", "National Center for Children and Families", "https://nccf-cares.org/", "301-365-4480", "Washington, DC service area; confirm the appropriate program contact", "Family and youth services; listed by DC DHS as a supportive-housing provider"],
  ["open-arms-housing", "Open Arms Housing", "https://www.openarmshousing.org/", "202-291-3900", "Washington, DC; see provider contact page", "Supportive housing provider listed by DC DHS; call to confirm intake route and program fit"],
  ["pathways-to-housing", "Pathways to Housing DC", "https://pathwaystohousingdc.org/", "202-529-2972", "Washington, DC; see provider contact page", "Housing First and supportive services for people experiencing chronic homelessness"],
  ["upo", "United Planning Organization", "https://www.upo.org/", "202-238-4600", "Washington, DC; see provider location finder", "District community-action and supportive-housing provider named by DC DHS"],
  ["wheeler-creek", "Wheeler Creek Community Development Corporation", "https://www.wheelercreekcdc.org/", "202-373-1050", "Washington, DC; see provider contact page", "Permanent supportive-housing provider listed by DC DHS"],
  ["woodley-house", "Woodley House", "https://www.woodleyhouse.org/", "202-671-2823", "Washington, DC; see provider contact page", "Supportive housing and recovery services listed by DC DHS"],
];
export const DISTRICT_OF_COLUMBIA_HOUSING = dcHousingProviders.map(([id, name, link, phone, address, scope]) => reviewed({
  id: `dc-housing-${id}`, name: `${name} — housing and stabilization support`, city: "Washington", address, phone: phone || undefined, link,
  source: "DC Department of Human Services, Permanent Supportive Housing Service Providers list; operator page for published contact and service details",
  serviceArea: "District of Columbia; confirm program catchment and eligibility with provider",
  coverageScope: "District-listed supportive-housing service provider", resourceType: "permanent supportive housing or homelessness service access",
  locationLine: `${address} · see provider website or call to ask about referrals and eligibility`,
  description: `DC DHS lists ${name} among providers offering housing supportive services to individuals and families in the District. The provider describes its service scope as ${scope.toLowerCase()}. Contact the organization using its published site or phone to ask whether referrals are open, who the program serves, required documentation, and the current intake route. A provider listing does not mean a shelter bed, housing unit, or financial assistance is immediately available.`,
}));

const dcPeerRows = [
  ["campbell-center", "The Campbell Center", "2759 Martin Luther King Jr. Avenue SE, Suite 201, Washington, DC 20032", "202-684-7015", "https://www.thecampbellcenter.org/", "Peer-run wellness, recovery, advocacy, leadership, and community activities for people living with mental-health challenges."],
  ["nami-dc", "NAMI DC", "422 8th Street SE, Second Floor, Washington, DC 20003", "202-546-0646", "https://www.namidc.org/", "Peer and family education, support, and advocacy; ask about current groups and schedules."],
  ["crossing-place", "Crossing Place crisis respite", "2731 Connecticut Avenue NW, Washington, DC 20008", "202-328-4070", "https://dbh.dc.gov/page/peer-support-and-behavioral-health-services", "DBH describes this as a step-down crisis-stabilization setting intended to avoid or delay hospitalization; referral is required or may come through DBH."],
];
export const DISTRICT_OF_COLUMBIA_PEER = dcPeerRows.map(([id, name, address, phone, link, details]) => reviewed({
  id: `dc-peer-${id}`, name, city: "Washington", address, phone, link,
  source: "DC Office of Disability Rights peer-support resources / DC Department of Behavioral Health",
  serviceArea: "District of Columbia; confirm participant criteria and current access",
  coverageScope: "District peer-support or peer-informed resource", resourceType: "peer and community recovery support",
  locationLine: `${address} · contact to confirm schedule, eligibility, or referral`,
  description: `${details} Contact the organization before visiting to confirm the appropriate entry route, current operating schedule, and accessibility.`,
}));
const dcPeerPartners = [
  ["consumer-action-network", "Consumer Action Network — peer advocacy and recovery education", "1300 L Street NW, Suite 1000, Washington, DC 20005", "202-842-0001", "https://www.can-dc.org/", "DC DBH names CAN among its consumer-led partners for education, training, and advocacy supporting recovery and resiliency. Contact the organization to ask which peer-led activities and current access options are available."],
  ["consumer-leadership-forum", "Consumer Leadership Forum — consumer-led support and advocacy", "1023 Fairmont Street NW, #101, Washington, DC 20001", "202-609-7451", "https://www.clfofdc.org/", "DC DBH lists the Consumer Leadership Forum as a consumer-led partner for education, training, and advocacy. Contact the group to confirm current peer activities, eligibility, and how to participate."],
  ["family-links", "Family Links — family and consumer peer-support contact", "Washington, DC; confirm current meeting location", "202-575-0590", "https://dbh.dc.gov/service/consumer-advocacy-and-peer-support", "DC DBH includes Family Links among consumer-led partners. The government directory publishes a phone contact but no street address; call to ask about current family or peer support activities and access."],
  ["recovery-group", "The Recovery Group — peer and recovery advocacy contact", "Washington, DC; mailing address listed by DBH", "202-758-5575", "https://dbh.dc.gov/service/consumer-advocacy-and-peer-support", "DC DBH includes The Recovery Group among consumer-led partners supporting recovery and resiliency. Call to confirm current activities, eligibility, and whether an in-person location is available; the listed address is a P.O. box."],
];
export const DISTRICT_OF_COLUMBIA_PEER_PARTNERS = dcPeerPartners.map(([id, name, address, phone, link, details]) => reviewed({
  id: `dc-peer-${id}`, name, city: "Washington", address, phone, link,
  source: "DC Department of Behavioral Health, Consumer Advocacy and Peer Support partner directory",
  serviceArea: "District of Columbia; confirm current participant criteria and access",
  coverageScope: "District consumer-led peer education, recovery, or advocacy partner", resourceType: "peer and community recovery support",
  locationLine: `${address} · call to confirm current activities, location, and schedule`,
  description: `${details} This is a source-listed partner, not phone-confirmed; confirm that the program is active and what support it currently provides before traveling.`,
}));

const dcFoodRows = [
  ["bread-for-city-se", "Bread for the City — Southeast Center", "1700 Marion Barry Avenue SE, Washington, DC 20020", "202-561-8587", "https://breadforthecity.org/", "The DC Health 2025 resource sheet lists grocery pantry access Monday–Thursday and on the second and fourth Friday of the month."],
  ["bread-for-city-nw", "Bread for the City — Northwest Center", "1525 7th Street NW, Washington, DC 20001", "202-265-2400", "https://breadforthecity.org/", "The DC Health 2025 resource sheet lists pantry access Monday–Thursday and on the first and third Friday of the month."],
  ["charlies-place", "Charlie's Place", "1830 Connecticut Avenue NW, Washington, DC 20009", "202-232-2995", "https://www.charliesplace.org/", "The DC Health 2025 resource sheet lists breakfast hours on Tuesday, Thursday, and Saturday; confirm current meal schedule."],
  ["marthas-table", "Martha's Table — food and family support", "1474 Columbia Road NW, Washington, DC 20009", "202-328-6608", "https://marthastable.org/", "The District resource sheet lists this community food resource. Contact the organization for current food distribution sites, hours, and eligibility."],
  ["mckennas-wagon-nj-i", "Martha's Table McKenna's Wagon — New Jersey Avenue and I Street", "New Jersey Avenue NW at I Street NW, Washington, DC", "202-328-6608", "https://marthastable.org/", "The DC Health 2025 resource sheet lists a brief daily evening meal stop at this intersection; verify the location and schedule before traveling."],
  ["mckennas-wagon-i9-h", "Martha's Table McKenna's Wagon — I and H Streets", "I Street NW at 9th Street NW / H Street NW, Washington, DC", "202-328-6608", "https://marthastable.org/", "The DC Health 2025 resource sheet lists a brief daily evening meal stop in this area; verify the exact stop and schedule before traveling."],
  ["miriams-kitchen-meals", "Miriam's Kitchen — breakfast and dinner meals", "2401 Virginia Avenue NW, Washington, DC 20037", "202-452-8926", "https://www.miriamskitchen.org/", "The DC Health 2025 resource sheet lists weekday breakfast and evening meal service; contact the organization to confirm current hours and meal access."],
  ["n-street-meals", "N Street Village — meals for women", "1333 N Street NW, Washington, DC 20005", "202-939-2076", "https://www.nstreetvillage.org/", "The DC Health 2025 resource sheet lists breakfast and lunch for women; contact N Street Village to confirm current eligibility and meal schedule."],
  ["sacred-heart-meals", "Sacred Heart Church — community meal", "16th Street NW at Park Road NW, Washington, DC", "202-234-8000", "https://www.sacredheartdc.org/", "The DC Health 2025 resource sheet lists an afternoon meal Monday–Saturday and Spanish-language access. Confirm the current serving point and schedule."],
  ["some-meals", "So Others Might Eat (SOME) — community meals", "71 O Street NW, Washington, DC 20001", "202-797-8806", "https://www.some.org/", "The DC Health 2025 resource sheet lists daily breakfast and lunch meal windows. Contact SOME to confirm current service location, hours, and access."],
  ["thrive-dc-meals", "Thrive DC — breakfast and grocery pantry", "1525 Newton Street NW, Washington, DC 20010", "202-737-9311", "https://www.thrivedc.org/", "The DC Health 2025 resource sheet lists weekday breakfast and a Thursday food pantry. Call to confirm current pantry hours, requirements, and distribution location."],
];
export const DISTRICT_OF_COLUMBIA_FOOD = dcFoodRows.map(([id, name, address, phone, link, detail]) => reviewed({
  id: `dc-food-${id}`, name, city: "Washington", address, phone, link,
  source: "DC Health, 2025 District Resource Guide, food and meal programs section",
  serviceArea: "District of Columbia; some providers have population-specific or appointment rules",
  coverageScope: "named District meal or food site", resourceType: "community meal, pantry, or food-support contact",
  locationLine: `${address} · listed hours are from the 2025 guide; confirm before travel`,
  description: `${detail} The District source is dated 2025 and is not a live inventory. Call the provider before traveling to confirm service today, current location and hours, access rules, and whether food remains available.`,
}));

const dcBenefitsRows = [
  ["anacostia", "Anacostia DHS Service Center", "2100 Martin Luther King Jr. Avenue SE, Washington, DC 20020"],
  ["fort-davis", "Fort Davis DHS Service Center", "3851 Alabama Avenue SE, Washington, DC 20020"],
  ["congress-heights", "Congress Heights DHS Service Center", "4049 South Capitol Street SW, Washington, DC 20032"],
  ["h-street", "H Street DHS Service Center", "645 H Street NE, Washington, DC 20002"],
  ["taylor-street", "Taylor Street DHS Service Center", "1207 Taylor Street NW, Washington, DC 20011"],
];
export const DISTRICT_OF_COLUMBIA_BENEFITS = dcBenefitsRows.map(([id, name, address]) => reviewed({
  id: `dc-benefits-${id}`, name: `${name} — SNAP, medical, and cash-assistance access`, city: "Washington", address,
  phone: "202-727-5355", link: "https://dhs.dc.gov/service/find-service-center-near-you",
  source: "DC Department of Human Services, Find a Service Center Near You",
  serviceArea: "District of Columbia; DHS says residents may visit any service center",
  coverageScope: "local District benefits access office", resourceType: "SNAP, Medicaid, TANF, and cash-assistance application support",
  locationLine: `${address} · Monday–Friday, 7:30 a.m.–4:45 p.m. per DHS; call before travel`,
  description: `DC DHS lists ${name} as an in-person public-assistance service center. Residents can apply for or manage food assistance, medical coverage, and cash assistance; DHS states customers may visit any of its centers. Call 202-727-5355 to confirm current hours, which services are offered at this site, appointment or document requirements, and access accommodations. Listing does not mean benefit eligibility or approval.`,
}));

const dcUrgentRows = [
  ["dbh-access", "DC DBH Access Helpline", "1-888-793-4357", "https://dbh.dc.gov/service/adult-services", "24/7 behavioral-health navigation and help choosing a community provider; a counselor can discuss crisis and service options."],
  ["community-response-team", "DC DBH Community Response Team", "202-673-6495", "https://dbh.dc.gov/", "Mental-health crisis response contact listed in the District's 2025 resource guide. Call 911 for immediate medical danger."],
  ["shelter-hotline", "DC Shelter Hotline", "202-399-7093", "https://dhs.dc.gov/page/homeless-services", "District route for emergency shelter access and transportation referrals. A call does not guarantee a placement or available bed."],
  ["youth-shelter-hotline", "Virginia Williams Family Resource Center — family and youth shelter access", "202-547-7777", "https://dhs.dc.gov/page/how-access-short-term-family-housing", "Family shelter intake and resource center. Call for current intake hours, documents, and referral steps; a shelter placement is not guaranteed."],
  ["dc-victim-hotline", "DC Victim Hotline — domestic violence and crime victim support", "1-844-443-5732", "https://dcvictim.org/", "Confidential 24/7 support and referrals for crime victims, including domestic violence. Contact the hotline for safety planning and local options."],
  ["accion-hotline", "Acción domestic violence hotline — Spanish language", "1-866-962-5048", "https://www.dccadv.org/", "Spanish-language support route listed by DC Health for people affected by domestic violence; ask about safe contact and referral options."],
  ["rape-crisis-center", "DC Rape Crisis Center hotline", "202-333-7273", "https://dcrcc.org/", "Crisis support and referrals for survivors of sexual violence. Contact the provider to confirm current hotline coverage and available services."],
];
export const DISTRICT_OF_COLUMBIA_URGENT = dcUrgentRows.map(([id, name, phone, link, detail]) => reviewed({
  id: `dc-urgent-${id}`, name, city: "Washington", phone, link,
  source: id.includes("hotline") || id.includes("rape-crisis") ? "DC Health 2025 District Resource Guide and named hotline operator" : "DC Department of Behavioral Health / DC Department of Human Services",
  serviceArea: "District of Columbia", coverageScope: "District urgent-support route", resourceType: "crisis, shelter-access, or victim-safety contact",
  locationLine: `${phone} · call to confirm the right response and current access`,
  description: `${detail} For immediate danger or urgent medical emergency, call 911.`,
}));
