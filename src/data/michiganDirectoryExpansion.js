// Michigan resources taken from state program/provider directories.
// Records are source-reviewed leads, not phone-confirmed or exhaustive coverage.
const reviewed = (record) => ({
  ...record,
  state: "MI",
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-30",
});

const SUD_SOURCE = "https://www.michigan.gov/mdhhs/-/media/Project/Websites/mdhhs/Assistance-Programs/Medicaid/Opioid-Health-Home/Substance_Use_Disorder_Health_Home_Directory.pdf";
const RCO_SOURCE = "https://www.michigan.gov/difs/consumers/insurance/health-insurance/mental-health-parity/opioid-use-disorder";
const CRISIS_SOURCE = "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties";
const MEAP_SOURCE = "https://www.michigan.gov/mpsc/consumer/get-help/utility-customers";

const treatmentSites = [
  ["great-lakes-marquette", "Great Lakes Recovery Center", "Marquette", "Marquette County", "1009 W. Ridge St., Suite C, Marquette, MI", "906-228-6545"],
  ["great-lakes-escanaba", "Great Lakes Recovery Center", "Escanaba", "Delta County", "1101 Ludington Street, Escanaba, MI", "906-789-3528"],
  ["upper-great-lakes-marquette", "Upper Great Lakes Family Health Center", "Marquette", "Marquette County", "1414 W. Fair Ave., Suite 242, Marquette, MI", "906-449-2900"],
  ["phoenix-house-calumet", "Phoenix House", "Calumet", "Houghton County", "57467 Waterworks Road, Calumet, MI", "906-337-0763"],
  ["centra-wellness-benzonia", "Centra Wellness Network", "Benzonia", "Benzie County", "6051 Frankfort Highway, Suite 800, Benzonia, MI", "877-398-2013"],
  ["addiction-treatment-traverse-city", "Addiction Treatment Services", "Traverse City", "Grand Traverse County", "1010 S. Garfield Avenue, Traverse City, MI", "231-346-5207"],
  ["munson-behavioral-traverse-city", "Munson Behavioral Health Services", "Traverse City", "Grand Traverse County", "4230 Copper Ridge Drive, Building E, Traverse City, MI", "231-935-6382"],
  ["midmichigan-houghton-lake", "MidMichigan Community Health Services", "Houghton Lake", "Roscommon County", "9249 W. Lake City Road, Houghton Lake, MI", "989-422-5689"],
  ["lifeways-jackson", "LifeWays", "Jackson", "Jackson County", "1200 N. West Avenue, Jackson, MI", "517-789-1209"],
  ["family-medical-adrian", "Family Medical Center of Michigan", "Adrian", "Lenawee County", "1200 N. Main Street, Adrian, MI", "517-263-1800"],
];

export const MICHIGAN_TREATMENT = treatmentSites.map(([id, name, city, county, address, phone]) => reviewed({
  id: `mi-sud-health-home-${id}`,
  name: `${name} — substance-use treatment access`,
  description: `The Michigan Department of Health and Human Services March 2026 Substance Use Disorder Health Home directory lists this provider location as a designated office-based SUD Health Home provider. Published location: ${address}; phone: ${phone}. Call to ask what treatment and care-coordination services are currently offered at this site, eligibility and insurance requirements, intake steps, wait time, and whether another location is more appropriate. This designation is not a promise of immediate admission or a specific treatment modality.`,
  city, county, address, phone, link: SUD_SOURCE,
  source: "Michigan MDHHS Substance Use Disorder Health Home — PIHP and Designated Providers (March 2026)",
  serviceArea: county, coverageScope: "named provider location; confirm intake and eligibility",
  resourceType: "substance-use treatment and care-coordination provider",
  locationLine: `${city}, ${county} · state-listed SUD Health Home provider · call to confirm intake`,
}));

const peerOrganizations = [
  ["peer-360", "Peer 360 Recovery Alliance", "Bay City", "Bay County", "530 N. Euclid Ave., Suite 12, Bay City, MI", "989-778-3144", "https://www.peer360recovery.org/"],
  ["equip-for-freedom", "Equip for Freedom", "Petoskey", "Emmet County", "231 State Street, Suite 6, Petoskey, MI 49770", "906-298-1906", "https://equip4freedom.org/"],
  ["serenity-house-flint", "The Serenity House of Flint", "Flint", "Genesee County", "720 Ann Arbor Street, Flint, MI", "810-412-8241", "https://flintserenityhouse.org/"],
  ["wai-iam-rise", "WAI-IAM & Rise Recovery Community", "Lansing", "Ingham County", "217 N. Sycamore Street, Lansing, MI", "517-703-3389", "https://www.rrclansing.org/"],
  ["lifeboat-recovery", "Lifeboat Addiction Recovery Services", "Lansing", "Ingham County", "913 W. Holmes Road, Lansing, MI 48910", "517-977-1772; after-hours 517-488-8843", "https://lifeboataddictionrecovery.org/"],
  ["jarc", "Jackson Area Recovery Community (JARC)", "Jackson", "Jackson County", "407 W. Michigan Avenue, Jackson, MI 49201", "517-788-5596", "https://thejarc.org/"],
  ["recovery-allies", "Recovery Allies of West Michigan", "Grand Rapids", "Kent County", "1345 Monroe NW, Grand Rapids, MI", "616-226-6567", "https://www.recoveryallies.us/"],
  ["care-rucc", "CARE Recovery United Community Center", "Fraser", "Macomb County", "32577 Garfield Road, Fraser, MI 48026", "586-552-1120; main 586-541-2273", "https://www.careofsem.com/"],
  ["live-rite", "Live Rite Structured Recovery Corp.", "Roseville", "Macomb County", "27700 Gratiot Avenue, Roseville, MI 48066", "586-217-5899; after-hours 586-229-0798", "https://liveritestructuredcorp.com/"],
  ["raw-monroe", "Recovery Advocacy Warriors (RAW)", "Monroe", "Monroe County", "25 S. Monroe Street, Suite 205, Monroe, MI", "734-240-3850", ""],
];

export const MICHIGAN_PEER_SUPPORT = peerOrganizations.map(([id, name, city, county, address, phone, website]) => reviewed({
  id: `mi-peer-recovery-${id}`,
  name: `${name} — peer and recovery-community support`,
  description: `Michigan DIFS lists ${name} among recovery community organizations located in Michigan. Published contact: ${phone}; listed location: ${address}. Recovery community organizations can help people connect with peer-led recovery support. Contact the organization to ask what groups, peer services, family supports, accessibility options, and current meeting times are available. For treatment assessment or medication questions, ask a licensed provider.`,
  city, county, address, phone, link: website || RCO_SOURCE,
  source: "Michigan Department of Insurance and Financial Services — Recovery Community Organizations Located Throughout Michigan",
  sourceUrl: RCO_SOURCE,
  serviceArea: county, coverageScope: "named peer/recovery organization; confirm current programs",
  resourceType: "recovery community organization and peer support",
  locationLine: `${city}, ${county} · peer-led recovery connection · contact to confirm services`,
}));

const fundingProviders = [
  ["barry-united-way", "Barry County United Way", "Hastings", "Barry County", "269-945-4010", "MEAP household energy assistance provider", "https://www.barryunitedway.org/"],
  ["bcaeo", "Bureau of Community Action and Economic Opportunity", "Lansing", "Statewide", "517-321-7500", "State-listed MEAP provider and community-action agency locator", "https://www.micommunityaction.org/"],
  ["svdp-detroit", "Society of St. Vincent de Paul — Archdiocese of Detroit", "Detroit", "Southeast Michigan", "877-788-4623", "MEAP and utility-bill help contact", "https://svdpdetroit.org/helpwithmybill"],
  ["superior-watershed", "Superior Watershed Partnership", "Marquette", "Upper Peninsula", "906-273-2742", "State-listed MEAP provider", "https://superiorwatersheds.org/"],
  ["thaw", "The Heat and Warmth Fund (THAW)", "Detroit", "Statewide", "800-866-8429", "Energy bill assistance and MEAP provider", "https://thawfund.org/"],
  ["salvation-army-energy", "The Salvation Army — Great Lakes Energy Assistance", "Lansing", "Statewide / regional intake", "855-929-1640", "State-listed MEAP provider; ask about local eligibility and funding status", "https://centralusa.salvationarmy.org/greatlakes/energy-assistance-great-lakes-division/"],
  ["truenorth", "TrueNorth Community Services", "Fremont", "West Michigan", "231-355-5880", "State-listed MEAP provider", "https://truenorthservices.org/"],
  ["uw-sem", "United Way for Southeastern Michigan", "Detroit", "Southeast Michigan", "844-211-4994", "State-listed MEAP provider and utility-assistance navigation", "https://unitedwaysem.org/resources/utility-assistance/"],
  ["uw-jackson", "United Way of Jackson County", "Jackson", "Jackson County", "517-741-0202", "State-listed MEAP provider", "https://www.unitedwayjxn.org/"],
  ["ser-mibridges", "Michigan State Emergency Relief (SER) — utility and home-repair benefits", "", "Michigan statewide", "Apply through MI Bridges; call Michigan 2-1-1 for application navigation", "State benefit program for eligible households facing qualifying energy expenses or energy-related home repairs", "https://www.michigan.gov/mdhhs/assistance-programs/emergency-relief"],
];

export const MICHIGAN_BENEFITS = fundingProviders.map(([id, name, city, serviceArea, phone, service, website]) => reviewed({
  id: `mi-benefit-${id}`,
  name: `${name} — household energy assistance`,
  description: `Michigan Public Service Commission lists ${name} as a Michigan Energy Assistance Program (MEAP) provider. ${service}. Call before applying to confirm the service area, current funds, eligible bills, required documents, and whether applications are open. Assistance is eligibility- and funding-dependent; this listing does not guarantee a payment.`,
  city: city || undefined, county: serviceArea, phone, link: website,
  source: "Michigan Public Service Commission — Home Energy Assistance Information and MEAP Provider List",
  sourceUrl: MEAP_SOURCE,
  serviceArea, coverageScope: serviceArea === "Statewide" || serviceArea === "Michigan statewide" ? "statewide program / referral route" : "regional provider; confirm served ZIP codes",
  resourceType: "utility-bill assistance and household benefits navigation",
  locationLine: `${serviceArea} · utility and energy-bill assistance · confirm funds and eligibility`,
}));

const urgentProviders = [
  ["wayne", "Detroit Wayne Integrated Health Network", "Detroit", "Wayne County", "313-224-7000 or 800-241-4949", "707 West Milwaukee, Detroit, MI 48202", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/wayne-county"],
  ["kent", "network180", "Grand Rapids", "Kent County", "616-336-3909", "790 Fuller Avenue NE, Grand Rapids, MI 49503", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/kent-county"],
  ["oakland", "Oakland Community Health Network", "Troy", "Oakland County", "248-456-1991 or 800-231-1127", "5505 Corporate Drive, Troy, MI 48098", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/oakland-county"],
  ["lapeer", "Lapeer County Community Mental Health Services", "Lapeer", "Lapeer County", "888-225-4447", "1570 Suncrest Drive, Lapeer, MI 48446", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/lapeer-county"],
  ["gratiot", "Gratiot Integrated Health Network", "Alma", "Gratiot County", "989-463-4971 or 800-622-5583", "608 Wright Avenue, Alma, MI 48801-0069", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/gratiot-county"],
  ["midland", "Community Mental Health for Central Michigan", "Mount Pleasant", "Midland County", "800-317-0708", "The George Rouman Center, 301 S. Crapo Street, Suite 100, Mount Pleasant, MI 48858", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/midland-county"],
  ["jackson", "LifeWays Community Mental Health", "Jackson", "Jackson County", "517-789-1200 or 800-284-8288", "1200 N. West Avenue, Jackson, MI 49202", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/jackson-county"],
  ["cass", "Woodlands Behavioral Healthcare Network", "Cassopolis", "Cass County", "800-323-0335", "960 M-60 East, Cassopolis, MI 49031", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/cass-county"],
  ["eaton", "CMH Authority of Clinton-Eaton-Ingham Counties", "Lansing", "Eaton County", "800-372-8460", "812 E. Jolly Road, Suite G-10, Lansing, MI 48910", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/eaton-county"],
  ["huron", "Huron Behavioral Health", "Bad Axe", "Huron County", "800-356-5568", "1375 R. Dale Wertz Drive, Bad Axe, MI 48413", "https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties/huron-county"],
];

export const MICHIGAN_URGENT = urgentProviders.map(([id, name, city, county, phone, address, website]) => reviewed({
  id: `mi-crisis-${id}`,
  name: `${name} — 24-hour behavioral-health crisis line`,
  description: `Michigan MDHHS lists this county-based Community Mental Health Services Program and publishes ${phone} as its 24-hour crisis line. Call for urgent behavioral-health support and ask what response, mobile crisis, stabilization, or follow-up options are available in your area. The line is affiliated with the county CMH system; callers should ask about eligibility and service access. For immediate physical danger call 911; 988 is also available statewide for crisis counseling.`,
  city, county, address, phone, link: website,
  source: "Michigan MDHHS county Community Mental Health Services Program directory",
  sourceUrl: CRISIS_SOURCE,
  serviceArea: county, coverageScope: "county crisis route through regional CMHSP",
  resourceType: "24-hour behavioral-health crisis access",
  locationLine: `${county} · 24-hour CMH crisis response · call for urgent support`,
}));
