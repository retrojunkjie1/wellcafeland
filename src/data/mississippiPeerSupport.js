// Mississippi DMH-certified Recovery Support Services (RSS) access routes.
// The state certifies the listed providers for RSS; current intake and availability are not phone-confirmed.
const RSS_SOURCE = "https://www.ospd.ms.gov/sites/ospd/files/Youth%20Defense/Alcohol-and-Drug-Services-Directory_2024-25.pdf";
const CONTACT_SOURCE = "https://www.dmh.ms.gov/service-options/community-services/";

const providers = [
  ["region-2", "Communicare", "Oxford", "Lafayette County", "662-234-7521", "152 Highway 7 South, Oxford, MS 38655", "https://www.communicarems.org/", "Calhoun, Lafayette, Marshall, Panola, Tate, and Yalobusha counties"],
  ["region-3", "LIFECORE Health Group", "Tupelo", "Lee County", "662-640-4595", "2434 South Eason Boulevard, Tupelo, MS 38801", "https://www.lifecorehealthgroup.com/", "Benton, Chickasaw, Itawamba, Lee, Monroe, Pontotoc, and Union counties"],
  ["region-4", "Region 4 Mental Health Services", "Corinth", "Alcorn County", "662-286-9883", "303 North Madison Street, Corinth, MS 38835", "https://www.regionivmhs.com/", "Alcorn, DeSoto, Prentiss, Tippah, and Tishomingo counties"],
  ["region-6", "Life Help", "Greenwood", "Leflore County", "662-453-6211", "101 Highway 7 South, Greenwood, MS 38935", "https://www.region6-lifehelp.org/", "Attala, Bolivar, Carroll, Coahoma, Grenada, Holmes, Humphreys, Issaquena, Leflore, Montgomery, Quitman, Sharkey, Sunflower, Tallahatchie, Tunica, and Washington counties"],
  ["region-7", "Community Counseling Services", "West Point", "Clay County", "662-524-4347", "1032 Highway 50, West Point, MS 39773", "https://www.ccsms.org/", "Choctaw, Clay, Lowndes, Noxubee, Oktibbeha, Webster, and Winston counties"],
  ["region-8", "Region 8 Mental Health Services", "Brandon", "Rankin County", "601-825-8800", "613 Marquette Road, Brandon, MS 39043", "https://www.region8mhs.org/", "Copiah, Lincoln, Madison, Rankin, and Simpson counties"],
  ["region-9", "Hinds Behavioral Health Services", "Jackson", "Hinds County", "601-321-2400", "3450 Highway 80 West, Jackson, MS 39284", "https://www.hbhs9.com/", "Hinds County"],
  ["region-10", "Weems Community Mental Health Center", "Meridian", "Lauderdale County", "601-483-4821", "1415 College Road, Meridian, MS 39304", "https://www.weemsmh.com/", "Clarke, Jasper, Kemper, Lauderdale, Leake, Neshoba, Newton, Scott, and Smith counties"],
  ["region-12", "Pine Belt Mental Healthcare Resources", "Hattiesburg", "Forrest County", "601-544-4641", "103 South 19th Avenue, Hattiesburg, MS 39404", "https://www.pbmhr.org/", "Amite, Covington, Forrest, Franklin, Greene, Hancock, Harrison, Jefferson Davis, Jones, Lamar, Lawrence, Marion, Pearl River, Perry, Pike, Stone, Walthall, and Wayne counties"],
  ["region-14", "Singing River Services", "Lucedale", "George County", "601-495-3010", "57 Industrial Park Road, Lucedale, MS 39452", "https://www.singingriverservices.com/", "George County"],
  ["region-15", "River Ridge Behavioral Health Services", "Vicksburg", "Warren County", "601-638-0031", "3444 Wisconsin Avenue, Vicksburg, MS 39182", "https://www.warren-yazoo.org/", "Adams, Claiborne, Jefferson, Warren, Wilkinson, and Yazoo counties"],
  ["region-16", "South Mississippi Mental Health Center", "Pascagoula", "Jackson County", "228-283-4140", "4211 Hospital Road, Pascagoula, MS 39581", "https://www.southmsmhc.org/", "Jackson County"],
];

const reviewed = (record) => ({
  ...record,
  state: "MS",
  source: record.source || "Mississippi Department of Mental Health 2024–25 Alcohol and Drug Treatment Services Directory (RSS certification)",
  sourceUrl: record.sourceUrl || RSS_SOURCE,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
  checkedAt: "2026-10-30",
});

export const MISSISSIPPI_PEER_SUPPORT = providers.map(([id, name, city, county, phone, address, link, counties]) => reviewed({
  id: `ms-peer-rss-${id}`,
  name: `${name} — certified recovery-support services`,
  description: `Mississippi DMH's 2024–25 directory lists ${name} as a certified provider of Recovery Support Services (RSS), which the directory describes as non-clinical support, peer and social connection, and linkage to other recovery resources. DMH's current community-services page publishes this center's phone and address. Call to ask about peer-support access, who can participate, referral or enrollment requirements, language/accessibility options, and the current schedule. The published service region is ${counties}; this does not imply a separate office in every county.`,
  city,
  county,
  address,
  phone,
  link,
  contactSourceUrl: CONTACT_SOURCE,
  serviceArea: counties,
  coverageScope: "regional DMH-certified recovery-support route",
  resourceType: "certified non-clinical recovery and peer-support services",
  locationLine: `${city} · peer/recovery support access · call for referral route, schedule, and eligibility`,
}));

export const MISSISSIPPI_PEER_COMMUNITY = reviewed({
  id: "ms-peer-mental-health-association-south-ms",
  name: "Mental Health Association of South Mississippi — peer support",
  description: "The association describes peer-support specialists who use lived experience to support recovery goals, advocacy, community connection, wellness planning, mental-health navigation, work or school goals, and housing navigation. Contact the Gulfport office to ask about current availability, referral or enrollment steps, eligibility, and the best local contact for your needs.",
  city: "Gulfport",
  county: "Harrison County",
  address: "4803 Harrison Circle, Gulfport, MS 39507",
  email: "info@msmentalhealth.org",
  phone: "228-864-6274",
  link: "https://msmentalhealth.org/programs/peer-support/",
  source: "Mental Health Association of South Mississippi Peer Support program and Mississippi MAMA directory contact listing",
  sourceUrl: "https://www.mama.ms.gov/service-directory?category=6",
  serviceArea: "South Mississippi; confirm where peer services are available",
  coverageScope: "local peer-support provider and regional service contact",
  resourceType: "peer-led mental wellness and recovery support",
  locationLine: "Gulfport · peer recovery and mental-health navigation · call to confirm availability",
});
